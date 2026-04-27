import * as joint from "@clientio/rappid";
import Backbone from "backbone";
import { getInspectorConfig } from "./inspector";
import { get } from "lodash";
import { getSelectionHandles, HANDLES, getSelectionConfig } from "./selection";
import { getStencilConfig, getStencilLoad } from "./stencil";
import { getToolbarConfig } from "./toolbar";
import { getTooltipConfig } from "./tooltip";

const namespace = joint.shapes;
const app = namespace.app as any;

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
      gridSize: 10,
      drawGrid: !window.online ? {
        name: 'dot',
        args: {
          color: '#4a4a5a',
          thickness: 1
        }
      } : false,
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

    if (p.width && p.height) {
      this.paper.setDimensions(p.width as number, p.height as number);
    }

    g.cells = g.cells.filter((e: any) => get(namespace, get(e, "type")));
    this.graph.fromJSON(g);

    this.paperScroller = new joint.ui.PaperScroller({
      paper: this.paper,
    });
    el.append(this.paperScroller.render().el);

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
      this.initToolbarEvents();

      // render toolbar
      toolbarEl && toolbarEl.append(this.toolbar.render().el);
      stencilEl && stencilEl.append(this.stencil.render().el);

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

  reset(panel: any) {
    const g = Object.assign({ cells: [] }, get(panel, "graph"));
    const p = get(panel, "paper") || {};

    if (p.width && p.height) {
      this.paper.setDimensions(p.width as number, p.height as number);
    }

    g.cells = g.cells.filter((e: any) => get(namespace, get(e, "type")));
    this.graph.fromJSON(g);
  }

  initToolbarEvents() {
    this.toolbar.on({
      "paper-width:change": (width: number) => {
        // console.log('1')
        this.paper.setDimensions(width, this.paper.options.height as number);
        this.postWindowTop();
      },
      "paper-height:change": (height: number) => {
        this.paper.setDimensions(this.paper.options.width as number, height);
        this.postWindowTop();
      },
      "copy:pointerclick": () => {
        console.log("fasfas");
        this.clipboard.copyElements(this.selection.collection, this.graph);
      },
      "paste:pointerclick": () => {
        const pastedCells = this.clipboard.pasteCells(this.graph);
        const elements = pastedCells.filter((cell) => cell.isElement());
        this.selection.collection.reset(elements);
      },
    });
  }

  initStencilEvents() {
    this.stencil.on("element:dragend", (el, _evt, cloneArea) => {
      const { shape } = el.model.attributes;
      if (shape) {
        if (!shape.isElement()) {
          if (shape.attributes.type === "app.Link") {
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
            link.source({ x: x1, y: y1 });
            link.target({ x: x2, y: y2 });
            if (shape.attributes.vertice === true) { link.vertices([{ x: x1, y: y2 }]); }
            // link.vertices([{ x: cloneArea.bottomLeft() / 2, y: cloneArea.topRight() / 2}])
            // console.log({ x: cloneArea.bottomLeft() / 2, y: cloneArea.topRight() / 2 })
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
        const inspectorConfig = getInspectorConfig(
          collection,
          this.bindOptions,
        );
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
        const pastedCells = this.clipboard.pasteCells(this.graph);
        const elements = pastedCells.filter((cell) => cell.isElement());
        this.selection.collection.reset(elements);
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
    this.graph.on("change add remove", () => {
      this.postWindowTop();
    });
  }

  postWindowTop() {
    const data = this.toJSON();
    console.log(data);
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
    const paper = {
      background: this.paper.options.background,
      width: this.paper.options.width,
      height: this.paper.options.height,
    };

    return {
      graph,
      paper,
    };
  }
}
