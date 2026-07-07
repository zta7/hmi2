import * as joint from '@clientio/rappid'

/**
 * 方案设计 母线（DesignBus）
 * 还原 GoJS 设计画布中母线的视觉效果：
 *   - 水平绿色粗线
 *   - 上方灰色标签文字
 * attrs 来源（gojsToJoint 写入）：
 *   body: { stroke, strokeWidth, x1, y1, x2, y2 }  — 绿色主线
 *   label: { text, fill, fontSize, refX, refY }      — 标签文字
 */
export class DesignBus extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.DesignBus',
      size: { width: 200, height: 6 },
    }
  }
}

export const DesignBusView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM', 'UPDATE_ATTRS'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    attrs: ['UPDATE_ATTRS'],
  },

  render() {
    const { model } = this
    const size = model.size()
    const svgNS = 'http://www.w3.org/2000/svg'
    const w = size.width
    const h = size.height

    const stroke = model.attr('body/stroke') || '#22c55e'
    const strokeWidth = Number(model.attr('body/strokeWidth')) || 4
    const labelText = model.attr('label/text') || 'Bus'
    const labelFill = model.attr('label/fill') || '#9ca3af'
    const labelFontSize = model.attr('label/fontSize') || 11

    this.el.innerHTML = ''

    // 绿色主线（节点高度中心，即连线吸附位置）
    const lineY = h / 2
    const line = document.createElementNS(svgNS, 'line')
    line.setAttribute('x1', '0')
    line.setAttribute('y1', String(lineY))
    line.setAttribute('x2', String(w))
    line.setAttribute('y2', String(lineY))
    line.setAttribute('stroke', stroke)
    line.setAttribute('stroke-width', String(strokeWidth))
    line.setAttribute('stroke-linecap', 'round')
    line.setAttribute('class', 'design-bus-line')
    this.el.appendChild(line)

    // 透明点击区域（覆盖线段上下各 8px）
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', String(lineY - 8))
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', '16')
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // 标签（线段上方偏移）
    const text = document.createElementNS(svgNS, 'text')
    text.setAttribute('x', String(w / 2))
    text.setAttribute('y', String(lineY - strokeWidth / 2 - 6))
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'baseline')
    text.setAttribute('fill', labelFill)
    text.setAttribute('font-size', String(labelFontSize))
    text.setAttribute('font-family', 'sans-serif')
    text.setAttribute('class', 'design-bus-label')
    text.textContent = labelText
    this.el.appendChild(text)

    this.translate()
  },

  updateAttrs() {
    const line = this.el.querySelector('.design-bus-line')
    if (line) {
      line.setAttribute('stroke', this.model.attr('body/stroke') || '#22c55e')
      line.setAttribute('stroke-width', String(this.model.attr('body/strokeWidth') || 3))
    }
    const text = this.el.querySelector('.design-bus-label')
    if (text) {
      text.textContent = this.model.attr('label/text') || 'Bus'
      text.setAttribute('fill', this.model.attr('label/fill') || '#9ca3af')
      text.setAttribute('font-size', String(this.model.attr('label/fontSize') || 11))
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
