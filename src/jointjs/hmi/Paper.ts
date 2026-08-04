import * as joint from "@clientio/rappid";
import Backbone from "backbone";
import { getInspectorConfig } from "./inspector";
import { debounce, get } from "lodash";
import { getSelectionHandles, HANDLES, getSelectionConfig } from "./selection";
import { getStencilConfig, getStencilLoad } from "./stencil";
import { getToolbarConfig } from "./toolbar";
import { getTooltipConfig } from "./tooltip";

const namespace = joint.shapes;
const app = namespace.app as any;

// 鼠标滚轮缩放步长与边界
const WHEEL_ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 5;
// 画布自动扩展时的最小留白（避免组件紧贴纸面边缘）
const AUTO_RESIZE_MARGIN = 300;

export class Paper {
  graph: joint.dia.Graph;
  paper: joint.dia.Paper;
  paperScroller: joint.ui.PaperScroller;
  commandManager: joint.dia.CommandManager;
  clipboard: joint.ui.Clipboard;
  selection: joint.ui.Selection;
  keyboard: joint.ui.Keyboard;
  snaplines: joint.ui.Snaplines;
  toolbar: joint.ui.Toolbar;
  stencil: joint.ui.Stencil;
  tooltip: joint.ui.Tooltip;
  bindOptions: object;
  navigator: joint.ui.Navigator | null = null;
  navigatorContainer: HTMLElement | null = null;
  // 画布底层标识线框尺寸（参考设备屏幕，不参与交互）
  referenceSize: { width: number; height: number } = { width: 1920, height: 1080 };
  // 交互模式：'select' = 多选组件，'pan' = 拖拽画布
  panMode = false;
  // 画布底层标识线框（SVG 节点，位于 viewport 最底层，不进入 graph/不参与保存）
  private _frameRect: SVGRectElement | null = null;
  private _frameLabel: SVGTextElement | null = null;
  private _frameResync: (() => void) | null = null;
  private _frameVisible = true;
  // Navigator 缩略图显示范围（画布坐标，= 线框尺寸），用于限制蓝色可视线框最大尺寸
  private _navCanvasBox: { x: number; y: number; width: number; height: number } | null = null;

  constructor(
    el: HTMLElement,
    panel: any,
    lang?: string,
    stencilEl?: HTMLElement,
    inspectorEl?: HTMLElement,
    toolbarEl?: HTMLElement,
  ) {
    const g = Object.assign({ cells: [] }, get(panel, "graph"));
    const p = get(panel, "paper") || {};

    this.graph = new joint.dia.Graph(
      {},
      {
        cellNamespace: namespace,
      },
    );
    this.paper = new joint.dia.Paper({
      model: this.graph,
      interactive: window.online
        ? false
        : {
            stopDelegation: false,
          },
      // 组件拖拽限制在边框线（参考线框）内：移动/框选拖拽超出边框线时自动还原到边界
      restrictTranslate: (elementView: any) => this.getRestrictArea(elementView),
      gridSize: 10,
      drawGrid: !window.online ? {
        name: 'dot',
        args: {
          color: '#4a4a5a',
          thickness: 1
        }
      } : false,
      background: {
        color: '#2c2c3a',
      },
      async: true,
      clickThreshold: 10,
      cellViewNamespace: namespace,
      guard: function (evt) {
        return (
          Boolean(window.online) &&
          (evt.target instanceof HTMLInputElement ||
            evt.target instanceof HTMLSelectElement ||
            evt.target instanceof HTMLButtonElement)
        );
      },
    });

    el.append(this.paper.el);
    this.paper.render();

    // 纸面初始尺寸 = 标识线框尺寸（参考设备屏幕尺寸），之后由 autoResizePaper 按需扩展
    this.referenceSize = {
      width: Math.round((p.width as number) || 1920),
      height: Math.round((p.height as number) || 1080),
    };
    this.paper.setDimensions(this.referenceSize.width, this.referenceSize.height);

    // ---------- 调试日志：打印 filter 前后的 cells ----------
    console.log(`[HMI2-Paper] cells BEFORE filter: count=${g.cells.length}`);
    g.cells.forEach((c: any) => {
      if (c.type?.endsWith('Link')) return;
      console.log(
        `  [FILTER-PRE] id=${c.id?.slice(-8)}, type=${c.type}, ` +
        `parent=${c.parent ? c.parent.slice(-8) : '-'}, ` +
        `position=(${c.position?.x}, ${c.position?.y})`
      );
    });
    g.cells = g.cells.filter((e: any) => get(namespace, get(e, "type")));
    console.log(`[HMI2-Paper] cells AFTER filter: count=${g.cells.length}`);
    g.cells.forEach((c: any) => {
      if (c.type?.endsWith('Link')) return;
      console.log(
        `  [FILTER-POST] id=${c.id?.slice(-8)}, type=${c.type}, ` +
        `parent=${c.parent ? c.parent.slice(-8) : '-'}, ` +
        `position=(${c.position?.x}, ${c.position?.y})`
      );
    });
    this.graph.fromJSON(g);
    // ---------- 调试日志：验证 fromJSON 后 bind 是否在 attrs 内部 ----------
    this.graph.getElements().forEach((el: any) => {
      const attrsBind = el.get('attrs')?.bind;
      console.log(
        `[HMI2:Paper.fromJSON] id=${el.id?.slice(-8)}, type=${el.get('type')}, ` +
        `hasAttrsBind=${!!attrsBind}, bindKeys=${JSON.stringify(Object.keys(attrsBind || {}))}`
      );
    });
    console.log('============================================================');
    // ---------- 调试日志结束 ----------
    // 确保嵌入关系建立（JointJS fromJSON 可能不自动处理 embeds）
    this.graph.getElements().forEach((el: any) => {
      const embeds = el.get('embeds');
      if (embeds && embeds.length > 0) {
        embeds.forEach((childId: string) => {
          const child = this.graph.getCell(childId);
          if (child && !el.getEmbeddedCells().includes(child)) {
            el.embed(child);
          }
        });
      }
    });
    // 处理初始折叠状态：隐藏子节点 + 重路由连线到父节点
    this.graph.getElements().forEach((el: any) => {
      if (el.get('collapsed')) {
        // 优先从属性读取 expandedSize（fromJSON 自动恢复），不存在时用当前尺寸兜底（兼容老数据）
        if (!el.get('expandedSize')) {
          el.set('expandedSize', { width: el.size().width, height: el.size().height });
        }
        el.set('size', { width: 160, height: 36 });
        const children = el.getEmbeddedCells() || [];
        const childIdSet = new Set(children.map((c: any) => c.id));
        const rerouted: Record<string, { source: any; target: any }> = {};
        children.forEach((child: any) => {
          const childView = this.paper.findViewByModel(child);
          if (childView) childView.el.style.display = 'none';
          const links = this.graph.getConnectedLinks(child);
          links.forEach((link: any) => {
            if (rerouted[link.id]) return;
            const src = link.get('source');
            const tgt = link.get('target');
            const srcId = (typeof src === 'string' ? src : src?.id) || '';
            const tgtId = (typeof tgt === 'string' ? tgt : tgt?.id) || '';
            const otherId = srcId === child.id ? tgtId : srcId;
            rerouted[link.id] = { source: src, target: tgt };
            if (childIdSet.has(otherId)) {
              const linkView = this.paper.findViewByModel(link);
              if (linkView) linkView.el.style.display = 'none';
            } else {
              if (srcId === child.id) {
                link.set('source', { id: el.id });
              } else {
                link.set('target', { id: el.id });
              }
            }
          });
        });
        el.prop('reroutedLinks', rerouted);
      }
    });
    // ---------- 调试日志 ----------
    console.log(`[HMI2-Paper] graph cells after fromJSON: count=${this.graph.getCells().length}`);
    this.graph.getElements().forEach((el: any) => {
      const embeds = el.getEmbeddedCells ? el.getEmbeddedCells().map((c: any) => c.id?.slice(-8)) : [];
      console.log(
        `  [GRAPH] id=${el.id?.slice(-8)}, type=${el.get('type')}, ` +
        `parent=${el.get('parent') || '-'}, embeds=[${embeds.join(',')}]`
      );
    });
    // ---------- 调试日志结束 ----------

    this.paperScroller = new joint.ui.PaperScroller({
      paper: this.paper,
      // 纸面由 expandPaperForContent / fitPaperToReference 手动控制：
      // fitToContent 的 allowNewOrigin 会把纸面原点偏移，导致线框(0,0)起点被裁剪
      scrollWhileDragging: true,
      cursor: 'grab',
    });
    const scrollerEl = this.paperScroller.render().el;
    // 确保 PaperScroller 填满容器，滚动条由 PaperScroller 自身管理
    scrollerEl.style.width = '100%';
    scrollerEl.style.height = '100%';
    scrollerEl.style.overflow = 'auto';
    // 建立层叠上下文，让 overlay（标识线框/Navigator）在画布上层
    scrollerEl.style.position = 'relative';
    scrollerEl.style.zIndex = '0';
    el.append(scrollerEl);

    // 初始把 PaperScroller 缩放到 1，初始化标识线框、滚轮缩放和 Navigator
    this.initReferenceFrame();
    // 运行时（online 模式）不显示参考线框，仅编辑模式显示
    if (window.online) {
      this.setReferenceFrameVisible(false);
    }
    this.initWheelZoom();
    this.initPaperScrollerPan();
    this.initNavigator();
    this.initPaperAutoResize();
    this.initRuntimeResizeAdapter();
    this.initFrameViewConstraints();

    // 初始化视口：
    //  - 编辑模式：默认 100% 缩放 + 线框左上角，可视范围在线框内部（显示一部分，可拖拽/缩放查看剩余）
    //  - 运行时：整屏等比缩放居中（完整显示设备屏幕）
    // 必须等布局稳定后执行（编辑模式 splitter/样式未完成时 clientWidth 不准），
    // 否则 fit 缩放按错误视口尺寸计算；运行时 initRuntimeResizeAdapter 的首次回调也会兜底。
    const doInitialFit = () => {
      if (window.online) {
        this.fitScreenToViewport();
      } else {
        this.zoomToFitReferenceFrame();
      }
    };
    if (window.online) {
      requestAnimationFrame(doInitialFit);
    } else {
      const fitOnce = new ResizeObserver(() => {
        fitOnce.disconnect();
        doInitialFit();
      });
      fitOnce.observe(scrollerEl);
    }

    if (!window.online) {
      this.commandManager = new joint.dia.CommandManager({ graph: this.graph });
      this.clipboard = new joint.ui.Clipboard();
      this.keyboard = new joint.ui.Keyboard();
      this.snaplines = new joint.ui.Snaplines({ paper: this.paper });

      const selectionConfig = getSelectionConfig(this.paper);
      this.selection = new joint.ui.Selection(selectionConfig);

      const toolbarConfig = getToolbarConfig(
        this.paper,
        this.commandManager,
        this.paperScroller,
        this.referenceSize,
      );
      this.toolbar = new joint.ui.Toolbar(toolbarConfig);

      const StencilConfig = getStencilConfig(
        this.paper,
        this.snaplines,
        lang || "",
      );
      this.stencil = new joint.ui.Stencil(StencilConfig);

      const tooltipConfig = getTooltipConfig();
      this.tooltip = new joint.ui.Tooltip(tooltipConfig);

      this.initGraphEvents();
      this.initStencilEvents();
      this.initPaperEvents();
      this.initKeyboardEvents();
      this.initSelectionEvents(inspectorEl);

      // render toolbar（必须先 render，之后 getWidgetByName 才能拿到按钮实例）
      toolbarEl && toolbarEl.append(this.toolbar.render().el);
      stencilEl && stencilEl.append(this.stencil.render().el);
      this.initToolbarEvents();

      console.log(this.bindOptions);
      const stencilLoad = getStencilLoad(lang || "");
      this.stencil.load(stencilLoad);

      // Dynamic stencil columns based on container width (iframe responsive)
      if (stencilEl) {
        let resizeTimer: ReturnType<typeof setTimeout>;
        const colWidth = 58; // ELEM_W(52) + 6 gap
        const relayoutStencil = () => {
          const width = stencilEl.clientWidth;
          const padding = 16;
          const cols = Math.max(2, Math.floor((width - padding) / colWidth));
          (this.stencil as any).options.layout = {
            columns: cols,
            columnWidth: colWidth,
            rowHeight: 48,
            resizeToFit: true
          };
          this.stencil.load(stencilLoad);
        };
        const resizeObserver = new ResizeObserver(() => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(relayoutStencil, 200);
        });
        resizeObserver.observe(stencilEl);
      }
    }
  }

  /**
   * 增量更新：把父系统回传的 panel 与本地 graph 对比，按 cell id 维度做 add/update/remove，
   * 避免 fromJSON 全量重建导致的 selection/命令栈丢失、视口跳动、组件引用错乱。
   * 仅当差异很大（cell 数量差超过阈值或 id 集合重合度低）时才退化到 reset 全量重建。
   */
  applyChanges(panel: any) {
    const incoming = (panel && panel.graph && panel.graph.cells) || [];
    const incomingIds = new Set<string>();
    incoming.forEach((c: any) => c && c.id && incomingIds.add(c.id));

    const existing = this.graph.getCells();
    const existingIds = new Set<string>();
    existing.forEach((c: any) => c.id && existingIds.add(c.id));

    // 计算需要新增/移除的 cell
    const toAdd: any[] = [];
    const toRemove: Backbone.Collection | any[] = [];
    incoming.forEach((c: any) => {
      if (!c || !c.id) return;
      if (!existingIds.has(c.id)) {
        // 同时检查 namespace 过滤（与 reset 行为保持一致）
        if (!get(namespace, get(c, "type"))) return;
        toAdd.push(c);
      }
    });
    existing.forEach((c: any) => {
      if (!c.id) return;
      if (!incomingIds.has(c.id)) toRemove.push(c);
    });

    // 退化条件：差异过大或几乎全部是新增（避免被反复退化到全量重建）
    const overlap =
      existing.length === 0
        ? 0
        : Array.from(existingIds).filter((id) => incomingIds.has(id as string)).length /
          existing.length;
    if (
      existing.length > 0 &&
      overlap < 0.3 &&
      toAdd.length > existing.length * 0.7
    ) {
      // 大幅变更：退化到全量 reset，保证嵌入关系/折叠状态正确建立
      return this.reset(panel);
    }

    // 先删后增：避免删除一个 cell 时其嵌入关系残留
    if (toRemove.length > 0) {
      this.graph.removeCells(toRemove);
    }
    if (toAdd.length > 0) {
      const filtered = toAdd.filter((e: any) => get(namespace, get(e, "type")));
      if (filtered.length > 0) this.graph.addCells(filtered);
    }

    // 对已存在的 cell 做属性差异更新（仅同步几何属性）
    // 关键：attrs 绝对不能反向写入。父系统保存的 attrs 是 JointJS toJSON 序列化的结果，
    // 会丢失 markup 里的 SVG 计算字段（transform / xlinkHref / text 等），
    // 反向写入会让元素渲染变形、selection 控制框与组件视觉尺寸不一致。
    // attrs 由 JointJS 渲染层自己管理，父子同步走 position/size/angle 就足够。
    //
    // 此外：必须用 element.position() / element.resize() 而不是 cell.prop({size}, rewrite)。
    // standard shape（如 Circle）的视觉尺寸由 attrs.body.cx/cy/r 表达，resize() 会自动同步 size↔attrs.body；
    // prop({size}, rewrite) 走原子路径会绕开联动，导致 size 变了但 attrs.body.r 没变，
    // 出现「控制框偏小、圆按旧 r 渲染」的不一致。
    // ui: true 抑制 change 事件冒泡，避免回灌循环。
    existing.forEach((cell: any) => {
      const id = cell.id;
      if (!id) return;
      const incomingCell = incoming.find((c: any) => c && c.id === id);
      if (!incomingCell) return; // 已在 toRemove 处理
      const current = cell.toJSON();
      if (
        !shallowEqualPosSize(current.position, incomingCell.position) &&
        incomingCell.position
      ) {
        // position() 内部用 ui:true 抑制回环
        cell.position(incomingCell.position.x, incomingCell.position.y, { ui: true });
      }
      if (
        !shallowEqualSize(current.size, incomingCell.size) &&
        incomingCell.size &&
        typeof cell.resize === 'function'
      ) {
        // resize() 内部会触发 standard shape 的 size↔attrs.body 联动，保证视觉尺寸与 bbox 一致
        cell.resize(incomingCell.size.width, incomingCell.size.height, { ui: true });
      }
      if (incomingCell.angle != null && current.angle !== incomingCell.angle) {
        cell.rotate(incomingCell.angle, { ui: true });
      }
    });

    // paper 尺寸字段（参考线框）刷新
    const p = get(panel, "paper") || {};
    if (p.width && p.height) {
      this.referenceSize = {
        width: Math.round(p.width as number),
        height: Math.round(p.height as number),
      };
      this.initReferenceFrame();
    }
  }

  reset(panel: any) {
    const g = Object.assign({ cells: [] }, get(panel, "graph"));
    const p = get(panel, "paper") || {};

    // 更新纸面尺寸为参考线框尺寸，autoResizePaper 后续按需扩展
    if (p.width && p.height) {
      this.referenceSize = {
        width: Math.round(p.width as number),
        height: Math.round(p.height as number),
      };
    }
    this.initReferenceFrame();

    g.cells = g.cells.filter((e: any) => get(namespace, get(e, "type")));
    this.graph.fromJSON(g);
    this.graph.getElements().forEach((el: any) => {
      const embeds = el.get('embeds');
      if (embeds && embeds.length > 0) {
        embeds.forEach((childId: string) => {
          const child = this.graph.getCell(childId);
          if (child && !el.getEmbeddedCells().includes(child)) {
            el.embed(child);
          }
        });
      }
    });
    // 处理初始折叠状态：隐藏子节点 + 重路由连线到父节点
    this.graph.getElements().forEach((el: any) => {
      if (el.get('collapsed')) {
        // 优先从属性读取 expandedSize（fromJSON 自动恢复），不存在时用当前尺寸兜底（兼容老数据）
        if (!el.get('expandedSize')) {
          el.set('expandedSize', { width: el.size().width, height: el.size().height });
        }
        el.set('size', { width: 160, height: 36 });
        const children = el.getEmbeddedCells() || [];
        const childIdSet = new Set(children.map((c: any) => c.id));
        const rerouted: Record<string, { source: any; target: any }> = {};
        children.forEach((child: any) => {
          const childView = this.paper.findViewByModel(child);
          if (childView) childView.el.style.display = 'none';
          const links = this.graph.getConnectedLinks(child);
          links.forEach((link: any) => {
            if (rerouted[link.id]) return;
            const src = link.get('source');
            const tgt = link.get('target');
            const srcId = (typeof src === 'string' ? src : src?.id) || '';
            const tgtId = (typeof tgt === 'string' ? tgt : tgt?.id) || '';
            const otherId = srcId === child.id ? tgtId : srcId;
            rerouted[link.id] = { source: src, target: tgt };
            if (childIdSet.has(otherId)) {
              const linkView = this.paper.findViewByModel(link);
              if (linkView) linkView.el.style.display = 'none';
            } else {
              if (srcId === child.id) {
                link.set('source', { id: el.id });
              } else {
                link.set('target', { id: el.id });
              }
            }
          });
        });
        el.prop('reroutedLinks', rerouted);
      }
    });
    // 纸面与参考线框对齐（基于新加载的内容），缩小/放大都生效。
    // 父页面实时同步 panel 时（组件增删改 → reset），保持当前视角：
    // fitPaperToReference 内部已走 zoomToFitReferenceFrame，会把视口强制对齐线框中心。
    // 此处不再做"保存/恢复 scroll"的旧自救，否则会覆盖新逻辑的视角同步。
    this.fitPaperToReference();
  }

  initToolbarEvents() {
    this.toolbar.on({
      "reference-width:change": (width: number) => {
        // 中央标识线框宽度跟随调整，并同步纸面最小尺寸
        this.referenceSize.width = Math.round(width);
        this.syncPaperToReference(true);
        this.initReferenceFrame();
        this.postWindowTop();
      },
      "reference-height:change": (height: number) => {
        // 中央标识线框高度跟随调整，并同步纸面最小尺寸
        this.referenceSize.height = Math.round(height);
        this.syncPaperToReference(true);
        this.initReferenceFrame();
        this.postWindowTop();
      },
      "copy:pointerclick": () => {
        console.log("fasfas");
        this.clipboard.copyElements(this.selection.collection, this.graph);
      },
      "paste:pointerclick": () => {
        this.pasteAndSelect();
      },
    });

    // 抓手模式 / 选择模式：通过 toolbar.on 绑定，避免与 autoToggle 冲突
    const selectBtn = (this.toolbar as any).getWidgetByName?.('select-mode');
    const panBtn = (this.toolbar as any).getWidgetByName?.('pan-mode');
    const setActive = (btn: any, active: boolean) => {
      if (!btn || !btn.el) return;
      btn.el.setAttribute('data-active', active ? 'true' : 'false');
      btn.el.classList.toggle('active', active);
    };
    const switchMode = (mode: 'select' | 'pan') => {
      setActive(selectBtn, mode === 'select');
      setActive(panBtn, mode === 'pan');
      this.setPanMode(mode === 'pan');
    };
    this.toolbar.on({
      'select-mode:pointerclick': () => switchMode('select'),
      'pan-mode:pointerclick': () => switchMode('pan'),
      // "重置视角"按钮：缩放到参考线框，并把视口中心对齐线框中心
      'reset-view:pointerclick': () => {
        this.zoomToFitReferenceFrame()
      },
      'navigator-toggle:pointerclick': () => {
        const btn = (this.toolbar as any).getWidgetByName?.('navigator-toggle');
        if (!btn || !btn.el) return;
        const enabled = btn.el.getAttribute('data-active') !== 'true';
        btn.el.setAttribute('data-active', enabled ? 'true' : 'false');
        btn.el.classList.toggle('active', enabled);
        this.setNavigatorVisible(enabled);
      },
      'reference-toggle:pointerclick': () => {
        const btn = (this.toolbar as any).getWidgetByName?.('reference-toggle');
        if (!btn || !btn.el) return;
        const enabled = btn.el.getAttribute('data-active') !== 'true';
        btn.el.setAttribute('data-active', enabled ? 'true' : 'false');
        btn.el.classList.toggle('active', enabled);
        this.setReferenceFrameVisible(enabled);
      },
    });
    // 初始默认选择模式，Navigator 默认显示，参考线框默认显示
    switchMode('select');
    this.setNavigatorVisible(
      (this.toolbar as any).getWidgetByName?.('navigator-toggle')
        ?.el?.getAttribute('data-active') === 'true'
    );
    this.setReferenceFrameVisible(
      (this.toolbar as any).getWidgetByName?.('reference-toggle')
        ?.el?.getAttribute('data-active') === 'true'
    );

    // 工具栏内宽度/高度 input 同步更新参考线框（输入过程中只扩不缩纸面）
    this.toolbar.on({
      "reference-width:inputchange": (width: number) => {
        this.referenceSize.width = Math.round(width);
        this.syncPaperToReference(false);
        this.initReferenceFrame();
      },
      "reference-height:inputchange": (height: number) => {
        this.referenceSize.height = Math.round(height);
        this.syncPaperToReference(false);
        this.initReferenceFrame();
      },
    });
  }

  initStencilEvents() {
    this.stencil.on("element:dragend", (el, _evt, cloneArea, validDropTarget) => {
      const { shape } = el.model.attributes;
      if (shape) {
        if (!shape.isElement()) {
          if (shape.attributes.type === "app.Link") {
            // 单击 stencil 项（未拖到画布有效区域）时，validDropTarget 为 false。
            // 此时若仍创建连线，cloneArea 是 stencil 坐标映射到主 paper 的结果，
            // 会创建在屏幕线框外不可见的位置。这里直接返回，交给 Stencil 默认的
            // onDropInvalid 清理拖拽副本，不创建连线。
            if (!validDropTarget) return;
            this.stencil.cancelDrag({ dropAnimation: false });
            const link = new app.Link({
              attrs: {
                line: {
                  sourceMarker: {
                    // if no fill or stroke specified, marker inherits the line color
                    d: "M 0 -5 L -10 0 L 0 5 Z",
                  },
                  targetMarker: {
                    d: "M 0 -5 L -10 0 L 0 5 Z",
                  },
                },
              },
            });

            const { x: x1, y: y1 } = cloneArea.bottomLeft();
            const { x: x2, y: y2 } = cloneArea.topRight();
            // 钳制到参考线框内，避免连线创建在屏幕线框外导致看不到
            const margin = 20;
            const minX = margin;
            const minY = margin;
            const maxX = Math.max(minX + 1, this.referenceSize.width - margin);
            const maxY = Math.max(minY + 1, this.referenceSize.height - margin);
            const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));
            const p1 = { x: clamp(x1, minX, maxX), y: clamp(y1, minY, maxY) };
            const p2 = { x: clamp(x2, minX, maxX), y: clamp(y2, minY, maxY) };
            link.source(p1);
            link.target(p2);
            if (shape.attributes.vertice === true) { link.vertices([{ x: p1.x, y: p2.y }]); }
            link.addTo(this.graph);
          }
        }
      }
    });
  }

  initSelectionEvents(inspectorEl?: HTMLElement) {
    this.selection.on("action:clone:pointerdown", (evt) => {
      evt.stopPropagation();
      this.clipboard.copyElements(this.selection.collection, this.graph);
      this.clipboard.pasteCells(this.graph);
    });

    this.selection.collection.on(
      "reset add remove",
      (collection: Backbone.Collection) => {
        this.paper.removeTools();
        joint.ui.Inspector.close();
        const copyTool = this.toolbar.getWidgetByName("copy");
        // 删除所有handles
        HANDLES.forEach((e) => this.selection.removeHandle(e.name));
        // 添加handles
        const handles = getSelectionHandles(collection);
        handles.forEach((e) => this.selection.addHandle(e));
        // 添加inspector
        // ---------- 调试日志：点击组件后 ----------
        console.log(`[HMI2:Paper:inspector] selected type=${collection.first()?.get('type')}, count=${collection.length}`);
        const inspectorConfig = getInspectorConfig(
          collection,
          this.bindOptions,
        );
        console.log(`[HMI2:Paper:inspector] config null? ${inspectorConfig == null}`);
        // ---------- 调试日志结束 ----------
        inspectorEl &&
          inspectorConfig &&
          joint.ui.Inspector.create(inspectorEl, inspectorConfig);
        // this.selection
        if (collection.length === 1) {
          copyTool.enable();
          const cell = collection.first() as joint.dia.Cell;
          if (!cell.isElement()) {
            const view = this.paper.findViewByModel(cell);
            const ns = joint.linkTools;
            const toolsView = new joint.dia.ToolsView({
              name: "link-pointerdown",
              tools: [
                new ns.Vertices(),
                new ns.SourceAnchor(),
                new ns.TargetAnchor(),
                new ns.SourceArrowhead(),
                new ns.TargetArrowhead(),
                new ns.Segments(),
                new ns.Remove({ offset: -20, distance: 40 }),
              ],
            });
            view.addTools(toolsView);
          }
        } else if (collection.length > 1) {
          copyTool.enable();
        } else if (collection.length === 0) {
          copyTool.disable();
        }
      },
    );
  }

  initPaperEvents() {
    this.paper.on("blank:pointerdown", (evt) => {
      // 抓手模式：空白处按下并拖动 = 平移画布，不进入框选
      if (this.panMode) {
        this.paper.removeTools();
        this.paperScroller.startPanning(evt);
        return;
      }
      this.selection.startSelecting(evt);
      this.paper.removeTools();
    });

    this.paper.on("blank:pointerdown cell:pointerdown", () => {
      const el = document.activeElement as HTMLElement;
      if (el) {
        el.blur();
      }
    });

    this.paper.on("cell:pointerclick", (elementView) => {
      const element = elementView.model;
      const [group = element] = element.getAncestors().reverse();
      if (!this.selection.collection.has(group)) {
        this.selection.collection.reset([group]);
      }
    });

    this.paper.on("link:mouseenter", (linkView) => {
      if (linkView.hasTools()) {
        return;
      }

      const ns = joint.linkTools;
      const toolsView = new joint.dia.ToolsView({
        name: "link-hover",
        tools: [
          new ns.Vertices({ vertexAdding: false }),
          new ns.SourceArrowhead(),
          new ns.TargetArrowhead(),
        ],
      });

      linkView.addTools(toolsView);
    });
    this.paper.on("link:mouseleave", function (linkView) {
      if (linkView.hasTools("link-hover")) {
        linkView.removeTools();
      }
    });

    // this.paper.on('paper', () => {
    //   console.log(111)
    // })
  }

  initKeyboardEvents() {
    this.keyboard.on({
      "ctrl+c": () => {
        this.clipboard.copyElements(this.selection.collection, this.graph);
      },

      "ctrl+v": () => {
        this.pasteAndSelect();
      },

      "delete backspace": () => {
        this.graph.removeCells(this.selection.collection.toArray());
      },

      "ctrl+z": () => {
        this.commandManager.undo();
        this.selection.cancelSelection();
      },

      "ctrl+y": () => {
        this.commandManager.redo();
        this.selection.cancelSelection();
      },

      // 'ctrl+plus': (evt: Event) => {
      //   evt.preventDefault()
      //   this.paperScroller.zoom(0.2, { max: 5, grid: 0.2 })
      // },

      // 'ctrl+minus': (evt: Event) => {
      //   evt.preventDefault()
      //   this.paperScroller.zoom(-0.2, { min: 0.2, grid: 0.2 })
      // }
    });
  }

  initGraphEvents() {
    // 同步频率控制：拖动过程中 JointJS 会高频触发 change 事件（每像素多次），
    // 直接 postMessage 会导致父→子回灌循环把中间状态反复回写、出现"位置被还原"。
    // 这里按事件类型分组去抖：
    //  - position/size/attrs（高频拖动/调整）合并为一次同步（250ms）
    //  - add/remove（低频结构性变化）立即同步，避免拖入组件后被后续 change 合并覆盖
    const debouncedSync = debounce(() => this.postWindowTop(), 250);
    this.graph.on("change", (_cell: any, opt: any) => {
      // 拖动/调整产生的中间步骤用 debounce；命令栈（CommandManager）触发的最终落点也走这里，
      // 但会在 debounce 周期结束后一次性提交，符合"只在稳定状态同步"的预期
      void opt;
      debouncedSync();
    });
    this.graph.on("add remove", () => {
      // 立即 flush 掉等待中的 debounce，避免拖入新组件后被后续 change 延迟发送
      debouncedSync.flush();
    });
    // 命令栈执行结束后（拖动/缩放/调整完成）主动同步一次，规避拖动结束 vs debounce 周期错位的边界情况
    if (this.commandManager) {
      this.commandManager.on("stack:did-update", () => {
        debouncedSync.flush();
      });
    }
  }

  /**
   * 组件拖拽的受限区域 = 参考线框（边框线）所在区域。
   * 元素移动/框选拖拽超出边框线时，JointJS 会自动把元素还原到边界内（含其嵌入的子元素）。
   * 嵌入子元素的位置是相对父级的，需把画布坐标系下的线框换算成被拖元素的局部坐标系。
   */
  private getRestrictArea(
    elementView: any,
  ): { x: number; y: number; width: number; height: number } {
    const w = this.referenceSize.width;
    const h = this.referenceSize.height;
    // 累加父级在画布坐标系中的位置偏移（嵌入子元素的位置相对父级）
    let ox = 0;
    let oy = 0;
    let parent = elementView?.model?.getParentCell?.();
    while (parent && parent.isElement()) {
      const pos = parent.get("position") || { x: 0, y: 0 };
      ox += pos.x;
      oy += pos.y;
      parent = parent.getParentCell?.();
    }
    return { x: -ox, y: -oy, width: w, height: h };
  }

  /**
   * 绘制画布底层标识线框（画布坐标，随画布缩放/平移）
   * 线框大小 = panel.paper.width/height，置于 viewport 最底层，绝不遮挡任何组件
   */
  initReferenceFrame() {
    const svg = (this.paper as any).svg as SVGSVGElement | undefined;
    const viewport = (this.paper as any).viewport as SVGGElement | undefined;
    if (!svg || !viewport) return;

    const NS = 'http://www.w3.org/2000/svg';
    // 线框矩形：透明填充 + 蓝色虚线描边
    if (!this._frameRect) {
      this._frameRect = document.createElementNS(NS, 'rect');
      this._frameRect.setAttribute('fill', 'none');
      this._frameRect.setAttribute('stroke', '#5a8dee');
      this._frameRect.setAttribute('stroke-width', '2');
      this._frameRect.setAttribute('stroke-dasharray', '8 4');
      this._frameRect.setAttribute('pointer-events', 'none');
      viewport.insertBefore(this._frameRect, viewport.firstChild);
    }
    // 尺寸标签
    if (!this._frameLabel) {
      this._frameLabel = document.createElementNS(NS, 'text');
      this._frameLabel.setAttribute('fill', '#5a8dee');
      this._frameLabel.setAttribute('font-size', '14');
      this._frameLabel.setAttribute('font-family', 'monospace');
      this._frameLabel.setAttribute('pointer-events', 'none');
      viewport.insertBefore(this._frameLabel, viewport.firstChild);
    }

    const w = this.referenceSize.width;
    const h = this.referenceSize.height;
    this._frameRect.setAttribute('x', '0');
    this._frameRect.setAttribute('y', '0');
    this._frameRect.setAttribute('width', String(w));
    this._frameRect.setAttribute('height', String(h));
    this._frameLabel.setAttribute('x', '12');
    this._frameLabel.setAttribute('y', '24');
    this._frameLabel.textContent = `Reference ${w} × ${h}`;

    // joint 每次渲染完成后把线框重新插回 viewport 最底层，保证始终位于所有组件之下
    if (!this._frameResync) {
      this._frameResync = () => {
        if (this._frameRect && viewport.contains(this._frameRect)) {
          viewport.insertBefore(this._frameRect, viewport.firstChild);
        }
        if (this._frameLabel && viewport.contains(this._frameLabel)) {
          viewport.insertBefore(this._frameLabel, viewport.firstChild);
        }
      };
      this.paper.on('render:done', this._frameResync);
    }
    // 应用当前可见状态
    this.setReferenceFrameVisible(this._frameVisible);
  }

  /**
   * 显示/隐藏画布底层标识线框（线框不进入 graph，导出数据时天然不包含）
   */
  setReferenceFrameVisible(visible: boolean) {
    this._frameVisible = !!visible;
    if (this._frameRect) {
      this._frameRect.style.display = this._frameVisible ? '' : 'none';
    }
    if (this._frameLabel) {
      this._frameLabel.style.display = this._frameVisible ? '' : 'none';
    }
  }

  /**
   * 参考线框尺寸变化后，重新计算纸面尺寸，保证线框区域完整显示
   * @param align true：立即按线框尺寸对齐纸面并聚焦（change 时）；
   *              false：只扩不缩，避免输入过程中视口跳动（inputchange/reset 时）
   */
  syncPaperToReference(align: boolean) {
    if (align) {
      // fitPaperToReference 内部已经走 zoomToFitReferenceFrame（含 scrollToPoint 线框中心 + navigator 同步）
      this.fitPaperToReference();
    } else {
      this.expandPaperForContent();
    }
  }

  /**
   * 内容变化时自动扩展纸面（替代 autoResizePaper）：只扩不缩、不跳动
   */
  private initPaperAutoResize() {
    const schedule = debounce(() => this.expandPaperForContent(), 80);
    this.graph.on('add remove reset', () => this.expandPaperForContent());
    this.graph.on('change', schedule);
    this.paper.on('render:done', schedule);
  }

  /**
   * 纸面只扩不缩：保持当前原点，把纸面扩展到容纳「内容 + 参考线框」（SVG 坐标计算）
   * 用于内容变化时（组件拖动/增删），不引起视口跳动
   */
  private expandPaperForContent() {
    const s = this.paper.scale();
    const sx = s.sx || 1;
    const sy = s.sy || 1;
    const origin = this.paper.options.origin || { x: 0, y: 0 };
    const ox = origin.x || 0;
    const oy = origin.y || 0;
    let content: any = null;
    try {
      content = this.paper.getContentBBox();
    } catch (_e) { /* 忽略异常 */ }
    const pad = AUTO_RESIZE_MARGIN;
    const hasContent = !!content && (content.width || 0) > 0 && (content.height || 0) > 0;
    const contentMaxX = hasContent ? (content.x + content.width) * sx + ox : ox;
    const contentMaxY = hasContent ? (content.y + content.height) * sy + oy : oy;
    const frameMaxX = this.referenceSize.width * sx + ox;
    const frameMaxY = this.referenceSize.height * sy + oy;
    // 与 fitPaperToReference 保持一致：内容需要留白，线框（参考边界）不需要。
    // 纸面左缘(0)固定：原点为负时需向左延伸
    const needW = Math.max(contentMaxX + pad, frameMaxX, 0) - Math.min(ox, 0);
    const needH = Math.max(contentMaxY + pad, frameMaxY, 0) - Math.min(oy, 0);
    const curW = Number(this.paper.options.width) || 0;
    const curH = Number(this.paper.options.height) || 0;
    // PaperScroller 在 paper resize 时会 restoreCenter 把视口跳回缓存中心，
    // 这里在 setDimensions 前后保存/恢复滚动位置，保证内容扩展（放置/拖动组件）时视口保持不动
    const scrollerEl = this.paperScroller.el as HTMLElement;
    const prevScrollLeft = scrollerEl.scrollLeft;
    const prevScrollTop = scrollerEl.scrollTop;
    this.paper.setDimensions(Math.max(curW, Math.ceil(needW)), Math.max(curH, Math.ceil(needH)));
    scrollerEl.scrollLeft = prevScrollLeft;
    scrollerEl.scrollTop = prevScrollTop;
  }

  /**
   * 纸面与参考线框对齐：原点重置为 0（线框从 (0,0) 开始，完整显示），
   * 尺寸 = max(内容右/下边界 + 留白, 线框尺寸)，缩放/放大都生效。
   *
   * 末尾强制 zoomToRect(线框)，保证视口中心和线框中心一致，
   * 避免 PaperScroller 把视口跳到内容 bbox 中心导致线框看不见。
   */
  private fitPaperToReference() {
    const s = this.paper.scale();
    const sx = s.sx || 1;
    const sy = s.sy || 1;
    let content: any = null;
    try {
      content = this.paper.getContentBBox();
    } catch (_e) { /* 忽略异常 */ }
    const pad = AUTO_RESIZE_MARGIN;
    const hasContent = !!content && (content.width || 0) > 0 && (content.height || 0) > 0;
    const contentMaxX = hasContent ? (content.x + content.width) * sx : 0;
    const contentMaxY = hasContent ? (content.y + content.height) * sy : 0;
    const w = Math.max(contentMaxX + pad, this.referenceSize.width * sx);
    const h = Math.max(contentMaxY + pad, this.referenceSize.height * sy);
    this.paper.setOrigin(0, 0);
    this.paper.setDimensions(Math.ceil(w), Math.ceil(h));
    // 编辑模式：100% 缩放 + 左上角（默认显示线框一部分）；
    // 运行时：整屏等比缩放居中（完整显示设备屏幕）
    if (window.online) {
      this.fitScreenToViewport();
    } else {
      this.zoomToFitReferenceFrame();
    }
  }

  /**
   * "重置视角"（编辑模式）：默认以 100% 缩放显示，视口左上角对齐线框左上角。
   * - 默认可视范围在线框内部（线框通常大于视口），只显示左上部分，
   *   剩余部分通过拖拽画布或放大/缩小查看。
   * - 缩放比例固定为 1（100%），不再 fit 整个线框。
   *
   * navigator 在 updatePaper 中订阅 paper.scale()，会自动跟随。
   */
  zoomToFitReferenceFrame() {
    // 100% 缩放（绝对值，不基于当前）
    this.paperScroller.zoom(1, { absolute: true });
    // 视口左上角对齐线框左上角（线框从 paper (0,0) 起）
    try {
      (this.paperScroller as any).scrollToPoint(0, 0, { animation: false });
    } catch (_e) { /* 忽略异常 */ }
    // 同步 navigator
    if (this.navigator) {
      try {
        (this.navigator as any).updatePaper?.();
      } catch (_e) { /* 忽略异常 */ }
    }
  }

  /**
   * "整屏适配"（运行时 online）：等比缩放居中，让整个参考线框（设备屏幕）
   * 完整显示在视口内（非 16:9 屏幕保留黑边）。运行时固定视角、禁用缩放。
   */
  fitScreenToViewport() {
    const scrollerEl = this.paperScroller?.el as HTMLElement | undefined;
    const targetW = this.referenceSize.width;
    const targetH = this.referenceSize.height;
    if (scrollerEl) {
      // 用实测视口尺寸算缩放（spacer/padding 可能改变可用区域）
      const clientW = scrollerEl.clientWidth;
      const clientH = scrollerEl.clientHeight;
      const scale = Math.min(clientW / targetW, clientH / targetH);
      const clampedScale = Math.max(ZOOM_MIN, Math.min(scale, ZOOM_MAX));
      // 把 paper 缩放到该比例（绝对值，不基于当前）
      this.paperScroller.zoom(clampedScale, { absolute: true });
    }
    // 视口左上角对齐线框左上角（线框从 paper (0,0) 起）
    try {
      (this.paperScroller as any).scrollToPoint(0, 0, { animation: false });
    } catch (_e) { /* 忽略异常 */ }
    // 同步 navigator
    if (this.navigator) {
      try {
        (this.navigator as any).updatePaper?.();
      } catch (_e) { /* 忽略异常 */ }
    }
  }

  /**
   * 滚轮缩放：直接在 PaperScroller 滚轮事件中触发 zoom。
   * 运行时（online 模式）禁用，避免操作员误滚轮缩放画面。
   */
  initWheelZoom() {
    if (window.online) return;
    const scrollerEl = this.paperScroller?.el as HTMLElement | undefined;
    if (!scrollerEl) return;
    scrollerEl.addEventListener(
      'wheel',
      (evt: WheelEvent) => {
        // 阻止默认滚动行为，改由 PaperScroller.zoom 控制
        evt.preventDefault();
        const direction = evt.deltaY < 0 ? 1 : -1;
        const step = WHEEL_ZOOM_STEP * direction;
        this.paperScroller.zoom(step, {
          min: ZOOM_MIN,
          max: ZOOM_MAX,
          grid: 0.05,
        });
      },
      { passive: false },
    );
  }

  /**
   * 运行时（online 模式）视口尺寸适配：设备/iframe 尺寸变化时重新等比缩放居中，
   * 保证不同设备尺寸下整个边框线区域完整显示（等比缩放居中，非 16:9 屏保留黑边）。
   * 编辑模式不干预用户视角，故不监听。
   */
  private initRuntimeResizeAdapter() {
    if (!window.online) return;
    const scrollerEl = this.paperScroller?.el as HTMLElement | undefined;
    if (!scrollerEl) return;
    const refit = debounce(() => {
      // 运行时固定视角：整屏等比缩放居中，保证任何时候设备屏幕完整显示
      this.fitScreenToViewport();
    }, 100);
    const resizeObserver = new ResizeObserver(refit);
    resizeObserver.observe(scrollerEl);
  }

  /**
   * 主视口约束在设备尺寸线框内（编辑模式）：
   * 1. 最小缩放 = 线框完整显示 —— 缩略图中蓝色视口框最多与设备线框一样大；
   * 2. 滚动范围限制在线框区域 —— 蓝色视口框移动不超出设备线框。
   * 运行时已 zoomToRect 固定视角且禁用缩放，无需约束。
   */
  private initFrameViewConstraints() {
    if (window.online) return;
    const scrollerEl = this.paperScroller?.el as HTMLElement | undefined;
    if (!scrollerEl) return;
    scrollerEl.addEventListener('scroll', () => this.clampViewToFrame());
    this.paper.on('scale', () => this.clampViewToFrame());
  }

  /**
   * 把主视口钳制在线框内：滚动位置限制在线框区域，缩放不小于「蓝色框=线框」所需缩放。
   * 任何滚动/缩放入口（滚动条、抓手拖拽、缩略图拖拽、滚轮、工具栏按钮）都会经过这里兜底。
   * 注意：线框从 paper 本地 (0,0) 画起，但 paper 在滚动容器中可能有偏移
   * （zoomToRect 居中、纸面扩展等），必须用实测的线框滚动坐标范围做钳制。
   */
  private clampViewToFrame() {
    const scrollerEl = this.paperScroller?.el as HTMLElement | undefined;
    if (!scrollerEl) return;
    const { sx, sy } = this.paper.scale();
    // 实测线框在滚动坐标中的范围：线框左上角 = paper 元素左上角（线框从 paper (0,0) 画）
    const paperEl = this.paper.el as HTMLElement;
    const scrollerRect = scrollerEl.getBoundingClientRect();
    const paperRect = paperEl.getBoundingClientRect();
    const frameLeft = paperRect.left - scrollerRect.left + scrollerEl.scrollLeft;
    const frameTop = paperRect.top - scrollerRect.top + scrollerEl.scrollTop;
    const minLeft = frameLeft;
    const minTop = frameTop;
    const maxLeft = frameLeft + this.referenceSize.width * sx - scrollerEl.clientWidth;
    const maxTop = frameTop + this.referenceSize.height * sy - scrollerEl.clientHeight;
    // 视口只能在尺寸线框区域内滚动（线框显示小于视口时固定在线框起点）
    const clampAxis = (value: number, min: number, max: number) =>
      max >= min ? Math.min(Math.max(value, min), max) : min;
    if (scrollerEl.scrollLeft !== clampAxis(scrollerEl.scrollLeft, minLeft, maxLeft)) {
      scrollerEl.scrollLeft = clampAxis(scrollerEl.scrollLeft, minLeft, maxLeft);
    }
    if (scrollerEl.scrollTop !== clampAxis(scrollerEl.scrollTop, minTop, maxTop)) {
      scrollerEl.scrollTop = clampAxis(scrollerEl.scrollTop, minTop, maxTop);
    }
    // 最小缩放：保证「可见范围」不超出参考线框（缩略图中蓝色视口框不超出线框范围）。
    // 用 max：视口任一边看到的画布范围都不能大于线框对应边。
    // 例：1980×1080 线框 + 500×500 视口 → 最小缩放 = max(500/1980, 500/1080) ≈ 0.463，
    // 最大可见范围 = 500 / 0.463 = 1080×1080（蓝色框刚好贴满线框高度，不越界）。
    const minScale = Math.max(
      ZOOM_MIN,
      scrollerEl.clientWidth / this.referenceSize.width,
      scrollerEl.clientHeight / this.referenceSize.height,
    );
    if (sx < minScale - 1e-9 || sy < minScale - 1e-9) {
      // 以当前视口中心为锚点恢复到最小缩放，幂等（恢复后不再触发）
      this.paperScroller.zoom(minScale, { absolute: true });
    }
  }

  /**
   * 把手抓模式工具栏切换：panMode 启用时，空白处按下 = 拖拽画布
   * PaperScroller 默认行为：在空白处按下并拖动时若移动足够距离，
   * 会自动平移。我们通过拦截 blank:pointerdown 阻止框选以兼容逻辑。
   */
  initPaperScrollerPan() {
    // panMode 切换后由 toolbar 事件触发
  }

  /**
   * 切换拖拽 / 选择模式
   */
  setPanMode(enabled: boolean) {
    this.panMode = !!enabled;
    // 在抓手模式下，PaperScroller 拖拽时不会清除 selection（不会触发空白点击 → 不会进入框选）
    // 选择模式下保持默认 joint.ui.Selection.startSelecting 行为
    if (this.paperScroller) {
      (this.paperScroller as any).options.scrollWhileDragging = true;
    }
  }

  /**
   * 初始化 Navigator 缩略图组件
   * 绑定到 PaperScroller，提供画布整体视图与视口定位
   */
  initNavigator() {
    // 使用模板中预置的 navigator-container（位于 canvas-area，paper-container 之外）
    this.navigatorContainer = document.getElementById('navigator-container');
    if (!this.navigatorContainer) {
      console.warn('[HMI2] navigator-container not found in DOM');
      return;
    }
    // 创建 Navigator 实例并绑定到 PaperScroller
    if (!this.navigator) {
      this.navigator = new joint.ui.Navigator({
        paperScroller: this.paperScroller,
        theme: 'dark',
        // 范围由下方覆盖的 updatePaper 固定为参考线框，不使用默认的内容/纸面范围
        paperOptions: {
          theme: 'dark',
          background: { color: '#2c2c3a' },
          drawGrid: false,
          // 关键：与主画布使用同一套自定义 View（cellViewNamespace），
          // 否则默认 ElementView 渲染 app.Button 等无 markup 的裸 Element 形状会抛
          // 'dia.ElementView: markup required'
          cellViewNamespace: namespace,
        },
        width: 200,
        height: 140,
        padding: 4,
      });
      // 覆盖 Navigator 的 updatePaper：缩略图范围 = 屏幕线框尺寸（仅显示线框内部内容）。
      // 蓝色可视线框（current-view）受 updateCurrentView 限制，最大不超过线框范围。
      // updatePaperWithBBox 内部会除以源 paper 缩放，故传入缩放后的尺寸
      const navigator = this.navigator as any;
      navigator.updatePaper = () => {
        const sourcePaper = this.paper as any;
        // 注意：必须用 paper.scale() 而不是 matrix().a / d。
        //   - matrix().a / d 是 paper 自带 transform 矩阵的缩放分量
        //   - paperScroller.zoom() 走 scroller 内部缩放，不修改 paper transform
        //   - 两种缩放不一致：用 matrix.a 算 bbox 会错位，导致缩略图视口框错位
        const s = sourcePaper.scale();
        const sx = s.sx || 1;
        const sy = s.sy || 1;
        const refW = this.referenceSize.width;
        const refH = this.referenceSize.height;
        const bbox = {
          x: 0,
          y: 0,
          width: refW * sx,
          height: refH * sy,
        };
        // 保存画布坐标系下的线框范围（未缩放），供 updateCurrentView 限制蓝色框大小
        this._navCanvasBox = { x: 0, y: 0, width: refW, height: refH };
        if (bbox.width > 0 && bbox.height > 0) {
          navigator.updatePaperWithBBox(bbox);
          navigator.updateCurrentView();
        }
      };
      // 覆盖 Navigator 的 updateCurrentView：把蓝色可视线框完全 clamp 在缩略图的线框范围内。
      // 缩放/拖动时视口可能超出线框边界，需同时限制尺寸和位置。
      // 注意：蓝色框是 <div>（navigator.$currentView），用 CSS left/top/width/height 定位，
      // 不能用 SVG 的 setAttribute('x'/'width') 修改（旧实现是无效代码，从未生效）。
      const origUpdateCurrentView = navigator.updateCurrentView.bind(navigator);
      navigator.updateCurrentView = () => {
        origUpdateCurrentView();
        const $cv = navigator.$currentView;
        const ratio = navigator.ratio;
        if (!$cv || !this._navCanvasBox || !ratio) return;
        const navBox = this._navCanvasBox;
        if (!navBox.width || !navBox.height) return;
        // 线框（参考屏幕）在缩略图中的像素尺寸（= mini paper 尺寸）
        const maxW = navBox.width * ratio;
        const maxH = navBox.height * ratio;
        // mini paper（线框）在缩略图中的实际区域：含 table-cell 居中偏移与内容平移
        const $paper = navigator.targetPaper.$el;
        const paperPos = $paper.position();
        const paperTrans = navigator.targetPaper.translate();
        const regionLeft = (paperPos.left || 0) + (paperTrans.tx || 0);
        const regionTop = (paperPos.top || 0) + (paperTrans.ty || 0);
        const regionW = $paper.outerWidth() || maxW;
        const regionH = $paper.outerHeight() || maxH;
        let x = parseFloat($cv.css('left')) || 0;
        let y = parseFloat($cv.css('top')) || 0;
        let w = parseFloat($cv.css('width')) || 0;
        let h = parseFloat($cv.css('height')) || 0;
        // 保持中心不变收缩尺寸，再 clamp 位置到线框范围内
        const cx = x + w / 2;
        const cy = y + h / 2;
        if (w > maxW) w = maxW;
        if (h > maxH) h = maxH;
        x = Math.max(regionLeft, Math.min(cx - w / 2, regionLeft + regionW - w));
        y = Math.max(regionTop, Math.min(cy - h / 2, regionTop + regionH - h));
        $cv.css({ left: x, top: y, width: w, height: h });
      };
      this.navigatorContainer.appendChild(this.navigator.el);
      this.navigator.render();

      // 缩略图区域滚轮缩放主画布（编辑模式）：与主画布滚轮缩放共用步长/边界。
      // 运行时禁用，避免操作员误缩放。
      if (!window.online && this.navigatorContainer) {
        this.navigatorContainer.addEventListener(
          'wheel',
          (evt: WheelEvent) => {
            evt.preventDefault();
            const direction = evt.deltaY < 0 ? 1 : -1;
            const step = WHEEL_ZOOM_STEP * direction;
            this.paperScroller.zoom(step, {
              min: ZOOM_MIN,
              max: ZOOM_MAX,
              grid: 0.05,
            });
          },
          { passive: false },
        );
      }
    }
    // 默认隐藏，等 toolbar 初始化后根据按钮状态决定是否显示
    this.navigatorContainer.style.display = 'none';

    // 画布内容变化时同步缩略图：调用 updatePaper（而非 render，
    // render 每次会重建 current-view 造成累积）
    const syncNavigator = () => {
      if (this.navigator) {
        try {
          (this.navigator as any).updatePaper();
        } catch (_e) { /* 忽略异常 */ }
      }
    };
    this.graph.on('add remove reset change', syncNavigator);
    this.paper.on('render:done', syncNavigator);
  }

  /**
   * 显示/隐藏 Navigator 缩略图
   */
  setNavigatorVisible(visible: boolean) {
    if (!this.navigatorContainer) return;
    this.navigatorContainer.style.display = visible ? 'block' : 'none';
  }

  postWindowTop() {
    const data = this.toJSON();
    console.log("HMI WEBSOCKET DATA", data);
    if (window.top) {
      window.top.postMessage(
        {
          target: "fbb",
          data,
        },
        "*",
      );
    }
  }

  toJSON() {
    const graph = this.graph.toJSON();
    // 保存标识线框尺寸（参考设备屏幕），而非 autoResizePaper 后的物理纸面尺寸
    const paper = {
      background: this.paper.options.background,
      width: this.referenceSize.width,
      height: this.referenceSize.height,
    };

    return {
      graph,
      paper,
    };
  }

  /**
   * 粘贴并选中：粘贴完成后 selection 立即 reset 会拿到 stale bbox
   * （element view 用 async: true 渲染，bbox 依赖 attrs 通过 ref* 链式计算的视图尺寸，
   *  在 view 完成首次渲染前算出的 bbox 是默认值或非常小）。
   * 这里把 selection reset 延迟到下一帧，确保 view 完成首次渲染后再算 bbox，
   * 控制框（selection frame）就能贴合组件真实视觉尺寸。
   */
  pasteAndSelect() {
    const pastedCells = this.clipboard.pasteCells(this.graph);
    const elements = pastedCells.filter((cell) => cell.isElement());
    if (elements.length === 0) return;
    // 先把 elements 加入 selection collection，但用 silent 模式避免立即触发 bbox 计算
    this.selection.collection.reset(elements, { silent: true });
    // 下一帧再触发一次 update，强制 selection 重新读取 bbox
    requestAnimationFrame(() => {
      // 重新 reset（不带 silent）触发 selection view 的 update，重新计算所有 element 的 bbox
      this.selection.collection.reset(elements);
      // 再补一刀：直接调用 selection 的 updateBoundingBox，让控制框按最新 view 尺寸重画
      // （部分 jointjs 版本 collection reset 后不会自动刷新 bbox，需要显式调用）
      if (typeof (this.selection as any).update === 'function') {
        (this.selection as any).update();
      }
    });
  }
}

// ----------------- applyChanges 辅助工具 -----------------
// 位置浅比较：x/y 数值
function shallowEqualPosSize(a: any, b: any): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}

// 尺寸浅比较：width/height 数值
function shallowEqualSize(a: any, b: any): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.width === b.width && a.height === b.height;
}

// （applyChanges 不再反向写入 attrs，原 shallowEqualAttrs / stripInternalAttrs 已删除）
