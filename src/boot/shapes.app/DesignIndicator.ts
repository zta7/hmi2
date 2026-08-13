import * as joint from '@clientio/rappid'

/**
 * 方案设计 指示灯（DesignIndicator）
 * 对应 GoJS HmiCanvas.vue buildIndicatorTemplate：
 *   - 外圈（绿色描边，透明填充）
 *   - 内灯面（颜色可绑定 lampColor，默认灰 #6b7280）
 *   - 高光点（白色半透明，偏左上）
 *   - 底部设备名称标签
 *
 * attrs 来源（gojsToJoint buildIndicatorCell 写入）：
 *   outer:  { stroke, strokeWidth }    — 外圈样式
 *   lamp:   { fill }                    — 灯面填充色（运行时绑定更新）
 *   label:  { text, fill, fontSize }    — 设备名称
 */
export class DesignIndicator extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.DesignIndicator',
      size: { width: 70, height: 90 },
    }
  }
}

export const DesignIndicatorView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM', 'UPDATE_ATTRS'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    attrs: ['UPDATE_ATTRS'],
  },

  render() {
    const { model } = this
    const size = model.size()
    const svgNS = 'http://www.w3.org/2000/svg'
    const w = size.width
    const h = size.height

    this.el.innerHTML = ''

    // 图形区高度：底部固定预留 20px 文字区，放大组件时图形与文字间距不随比例变化
    const gfxH = h - 20
    const cx = w / 2
    const cy = gfxH * 0.50

    // 尺寸按节点宽度等比例计算
    const outerR = Math.min(w * 0.22, gfxH * 0.35)
    const lampR = Math.min(w * 0.16, gfxH * 0.25)
    const highlightR = Math.min(lampR * 0.36, 5)

    const outerStroke = model.attr('outer/stroke') || '#4ade80'
    const outerStrokeW = model.attr('outer/strokeWidth') || 1.5
    const lampFill = model.attr('lamp/fill') || '#6b7280'

    // ── 透明点击区 ──
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // ── 外圈 ──
    const outer = document.createElementNS(svgNS, 'circle')
    outer.setAttribute('cx', String(cx))
    outer.setAttribute('cy', String(cy))
    outer.setAttribute('r', String(outerR))
    outer.setAttribute('fill', 'transparent')
    outer.setAttribute('stroke', outerStroke)
    outer.setAttribute('stroke-width', String(outerStrokeW))
    outer.setAttribute('class', 'design-indicator-outer')
    this.el.appendChild(outer)

    // ── 灯面 ──
    const lamp = document.createElementNS(svgNS, 'circle')
    lamp.setAttribute('cx', String(cx))
    lamp.setAttribute('cy', String(cy))
    lamp.setAttribute('r', String(lampR))
    lamp.setAttribute('fill', lampFill)
    lamp.setAttribute('stroke', 'none')
    lamp.setAttribute('class', 'design-indicator-lamp')
    this.el.appendChild(lamp)

    // ── 高光 ──
    const hlx = cx - lampR * 0.30
    const hly = cy - lampR * 0.30
    const highlight = document.createElementNS(svgNS, 'circle')
    highlight.setAttribute('cx', String(hlx))
    highlight.setAttribute('cy', String(hly))
    highlight.setAttribute('r', String(highlightR))
    highlight.setAttribute('fill', 'rgba(255,255,255,0.3)')
    highlight.setAttribute('stroke', 'none')
    highlight.setAttribute('class', 'design-indicator-highlight')
    this.el.appendChild(highlight)

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || ''
    if (labelText) {
      const label = document.createElementNS(svgNS, 'text')
      label.setAttribute('x', String(w / 2))
      label.setAttribute('y', String(h - 4))
      label.setAttribute('text-anchor', 'middle')
      label.setAttribute('dominant-baseline', 'baseline')
      label.setAttribute('fill', model.attr('label/fill') || '#e5e7eb')
      label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
      label.setAttribute('font-family', 'sans-serif')
      label.setAttribute('class', 'design-indicator-label')
      label.textContent = labelText
      this.el.appendChild(label)
    }

    this.translate()
  },

  updateAttrs() {
    // 更新灯面颜色（运行时绑定）
    const lamp = this.el.querySelector('.design-indicator-lamp') as Element
    if (lamp) {
      lamp.setAttribute('fill', this.model.attr('lamp/fill') || '#6b7280')
    }
    // 更新外圈颜色
    const outer = this.el.querySelector('.design-indicator-outer') as Element
    if (outer) {
      outer.setAttribute('stroke', this.model.attr('outer/stroke') || '#4ade80')
    }
    // 更新标签文本
    const label = this.el.querySelector('.design-indicator-label') as Element
    if (label) {
      const newText = this.model.attr('label/text') || ''
      if (label.textContent !== newText) label.textContent = newText
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
