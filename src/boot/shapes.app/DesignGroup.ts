import * as joint from '@clientio/rappid'

/**
 * 方案设计 分组形状（DesignGroup）
 * 半透明蓝色虚线圆角矩形 + 左上角标签
 *
 * attrs 来源（gojsToJoint 写入）：
 *   body:    { fill, stroke, strokeWidth, strokeDasharray, rx, ry }
 *   label:   { text, fill, fontSize, fontWeight }
 *   labelBg: { fill, stroke, rx, ry }
 */
export class DesignGroup extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.DesignGroup',
      size: { width: 200, height: 120 },
    }
  }
}

export const DesignGroupView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM', 'UPDATE_ATTRS'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    attrs: ['UPDATE_ATTRS'],
  },

  events: {
    'click .design-group-collapse-btn': 'onToggleCollapse',
  },

  onToggleCollapse(evt: Event) {
    evt.stopPropagation();
    const model = this.model;
    const collapsed = model.get('collapsed');
    const paper = (this as any).paper;
    const graph = paper?.model;
    const parentId = model.id;

    console.log(`[DesignGroup] onToggleCollapse START | id=${model.id?.slice(-8)} | collapsed=${collapsed} | currentSize=(${model.size().width}, ${model.size().height})`);

    if (collapsed) {
      // ========== 展开 ==========
      console.log(`[DesignGroup] => 进入【展开】分支`);
      model.set('collapsed', false);
      const expandedSize = model.get('expandedSize');
      console.log(`[DesignGroup] expandedSize from get =`, JSON.stringify(expandedSize));

      if (expandedSize) {
        console.log(`[DesignGroup] 调用 model.resize(${expandedSize.width}, ${expandedSize.height})`);
        model.resize(expandedSize.width, expandedSize.height);
        console.log(`[DesignGroup] resize后 model.size() = (${model.size().width}, ${model.size().height})`);
        // 强制立即渲染，确保异步 paper 模式下尺寸正确更新
        this.render();
        console.log(`[DesignGroup] render()后 model.size() = (${model.size().width}, ${model.size().height})`);
      } else {
        console.warn(`[DesignGroup] ⚠️ expandedSize 为空！无法恢复尺寸`);
      }
      // 恢复原始连线连接
      const rerouted = model.prop('reroutedLinks') || {};
      console.log(`[DesignGroup] 恢复连线数 = ${Object.keys(rerouted).length}`);
      Object.keys(rerouted).forEach(linkId => {
        const link = graph?.getCell(linkId);
        if (link) {
          link.set('source', rerouted[linkId].source);
          link.set('target', rerouted[linkId].target);
          const linkView = paper?.findViewByModel(link);
          if (linkView) linkView.el.style.display = '';
        }
      });
      model.prop('reroutedLinks', null);
      // 显示子节点
      const embeddedChildren = model.getEmbeddedCells();
      console.log(`[DesignGroup] 显示子节点数 = ${embeddedChildren.length}`);
      embeddedChildren.forEach((child: any) => {
        const childView = paper?.findViewByModel(child);
        if (childView) childView.el.style.display = '';
      });
    } else {
      // ========== 折叠 ==========
      console.log(`[DesignGroup] => 进入【折叠】分支`);
      const sizeBefore = { width: model.size().width, height: model.size().height };
      console.log(`[DesignGroup] 折叠前尺寸 = (${sizeBefore.width}, ${sizeBefore.height})`);

      model.set('collapsed', true);
      model.set('expandedSize', sizeBefore);
      console.log(`[DesignGroup] 已保存 expandedSize = (${sizeBefore.width}, ${sizeBefore.height})`);

      model.resize(160, 36);
      console.log(`[DesignGroup] resize(160, 36)后 model.size() = (${model.size().width}, ${model.size().height})`);
      // 强制立即渲染，确保异步 paper 模式下尺寸正确更新
      this.render();
      console.log(`[DesignGroup] render()后 model.size() = (${model.size().width}, ${model.size().height})`);

      const children = model.getEmbeddedCells() || [];
      console.log(`[DesignGroup] 折叠子节点数 = ${children.length}`);

      const childIdSet = new Set(children.map((c: any) => c.id));
      const rerouted: Record<string, { source: any; target: any }> = {};

      children.forEach((child: any) => {
        // 隐藏子节点
        const childView = paper?.findViewByModel(child);
        if (childView) childView.el.style.display = 'none';

        // 重路由子节点的连线到父节点
        const links = graph?.getConnectedLinks(child) || [];
        links.forEach((link: any) => {
          const linkId = link.id;
          if (rerouted[linkId]) return; // 已处理过

          const src = link.get('source');
          const tgt = link.get('target');
          const srcId = (typeof src === 'string' ? src : src?.id) || '';
          const tgtId = (typeof tgt === 'string' ? tgt : tgt?.id) || '';
          const otherId = srcId === child.id ? tgtId : srcId;

          // 保存原始连接信息
          rerouted[linkId] = { source: src, target: tgt };

          if (childIdSet.has(otherId)) {
            // 两端都在同一个分组内 → 隐藏连线
            const linkView = paper?.findViewByModel(link);
            if (linkView) linkView.el.style.display = 'none';
          } else {
            // 子节点端 → 重路由到父节点
            if (srcId === child.id) {
              link.set('source', { id: parentId });
            } else {
              link.set('target', { id: parentId });
            }
          }
        });
      });

      model.prop('reroutedLinks', rerouted);
      console.log(`[DesignGroup] 已重路由连线数 = ${Object.keys(rerouted).length}`);
    }
    console.log(`[DesignGroup] onToggleCollapse END | collapsed=${model.get('collapsed')} | finalSize=(${model.size().width}, ${model.size().height})`);
  },

  render() {
    const { model } = this
    const size = model.size()
    console.log(`[DesignGroup] render() 被调用 | id=${model.id?.slice(-8)} | collapsed=${model.get('collapsed')} | size=(${size.width}, ${size.height})`)
    const svgNS = 'http://www.w3.org/2000/svg'
    const w = size.width
    const h = size.height

    this.el.innerHTML = ''

    // 主体矩形（半透明蓝色虚线）
    const body = document.createElementNS(svgNS, 'rect')
    body.setAttribute('x', '0')
    body.setAttribute('y', '0')
    body.setAttribute('width', String(w))
    body.setAttribute('height', String(h))
    body.setAttribute('fill', model.attr('body/fill') || 'rgba(59, 130, 246, 0.06)')
    body.setAttribute('stroke', model.attr('body/stroke') || '#3B82F6')
    body.setAttribute('stroke-width', String(model.attr('body/strokeWidth') || 1.5))
    body.setAttribute('stroke-dasharray', model.attr('body/strokeDasharray') || '6,3')
    body.setAttribute('rx', String(model.attr('body/rx') || 8))
    body.setAttribute('ry', String(model.attr('body/ry') || 8))
    body.setAttribute('class', 'design-group-body')
    this.el.appendChild(body)

    // 标签背景
    const labelText = model.attr('label/text') || '分组'
    const tagW = labelText.length * 10 + 20 // 估算标签宽度

    const labelBg = document.createElementNS(svgNS, 'rect')
    labelBg.setAttribute('x', '6')
    labelBg.setAttribute('y', '4')
    labelBg.setAttribute('width', String(tagW))
    labelBg.setAttribute('height', '20')
    labelBg.setAttribute('fill', model.attr('labelBg/fill') || '#3B82F6')
    labelBg.setAttribute('rx', '4')
    labelBg.setAttribute('ry', '4')
    labelBg.setAttribute('class', 'design-group-label-bg')
    this.el.appendChild(labelBg)

    // 标签文字
    const label = document.createElementNS(svgNS, 'text')
    label.setAttribute('x', String(6 + tagW / 2))
    label.setAttribute('y', '14')
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'central')
    label.setAttribute('fill', model.attr('label/fill') || '#ffffff')
    label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
    label.setAttribute('font-weight', String(model.attr('label/fontWeight') || 'bold'))
    label.setAttribute('font-family', 'sans-serif')
    label.setAttribute('class', 'design-group-label')
    label.textContent = labelText
    this.el.appendChild(label)

    // 折叠/展开按钮（右上角）
    const isCollapsed = model.get('collapsed');
    const btn = document.createElementNS(svgNS, 'g');
    btn.setAttribute('class', 'design-group-collapse-btn');
    btn.setAttribute('cursor', 'pointer');

    const btnX = w - 24;
    const btnY = 6;
    const btnRect = document.createElementNS(svgNS, 'rect');
    btnRect.setAttribute('x', String(btnX));
    btnRect.setAttribute('y', String(btnY));
    btnRect.setAttribute('width', '16');
    btnRect.setAttribute('height', '16');
    btnRect.setAttribute('rx', '3');
    btnRect.setAttribute('fill', '#3B82F6');
    btnRect.setAttribute('opacity', '0.7');

    const btnText = document.createElementNS(svgNS, 'text');
    btnText.setAttribute('x', String(btnX + 8));
    btnText.setAttribute('y', String(btnY + 9));
    btnText.setAttribute('text-anchor', 'middle');
    btnText.setAttribute('dominant-baseline', 'central');
    btnText.setAttribute('fill', '#ffffff');
    btnText.setAttribute('font-size', '10');
    btnText.setAttribute('font-weight', 'bold');
    btnText.setAttribute('pointer-events', 'none');
    btnText.textContent = isCollapsed ? '+' : '−';

    btn.appendChild(btnRect);
    btn.appendChild(btnText);
    this.el.appendChild(btn);

    this.translate()
  },

  updateAttrs() {
    const body = this.el.querySelector('.design-group-body') as Element | null
    if (body) {
      body.setAttribute('stroke', this.model.attr('body/stroke') || '#3B82F6')
      body.setAttribute('stroke-width', String(this.model.attr('body/strokeWidth') || 1.5))
    }
    // 更新组件名称
    const label = this.el.querySelector('.design-group-label') as Element | null
    if (label) {
      label.textContent = this.model.attr('label/text') || '分组'
    }
  },

  confirmUpdate(flags: number, opt: any) {
    const flagNames = []; if (this.hasFlag(flags, 'RENDER')) flagNames.push('RENDER'); if (this.hasFlag(flags, 'RESIZE')) flagNames.push('RESIZE'); if (this.hasFlag(flags, 'TRANSFORM')) flagNames.push('TRANSFORM'); if (this.hasFlag(flags, 'UPDATE_ATTRS')) flagNames.push('UPDATE_ATTRS');
    console.log(`[DesignGroup] confirmUpdate | id=${this.model.id?.slice(-8)} | flags=[${flagNames.join(',')}] | size=(${this.model.size().width}, ${this.model.size().height})`)
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
