import * as joint from '@clientio/rappid'

/** 母线（Bus）：水平绿色粗线 + 上方标签文字 */
export class Bus extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.Bus',
      size: { width: 200, height: 8 }
    }
  }
}

export const BusView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM', 'UPDATE_BUS'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    attrs: ['UPDATE_BUS'],
  },

  render() {
    const { model } = this
    const size = model.size()
    const svgNS = 'http://www.w3.org/2000/svg'

    // 读取 gojsToJoint 写入的 attrs
    const bodyStroke = model.attr('body/stroke') || '#22c55e'
    const bodyStrokeWidth = model.attr('body/strokeWidth') || 3
    const labelText = model.attr('label/text') || ''
    const labelFill = model.attr('label/fill') || '#9ca3af'
    const labelFontSize = model.attr('label/fontSize') || 11

    this.el.innerHTML = ''

    // 透明点击区域
    const hitArea = document.createElementNS(svgNS, 'rect')
    hitArea.setAttribute('width', String(size.width))
    hitArea.setAttribute('height', String(Math.max(size.height, 20)))
    hitArea.setAttribute('fill', 'transparent')
    hitArea.setAttribute('stroke', 'none')
    this.el.appendChild(hitArea)

    // 母线主线（水平绿线，居中）
    const line = document.createElementNS(svgNS, 'line')
    line.setAttribute('x1', '0')
    line.setAttribute('y1', String(size.height / 2))
    line.setAttribute('x2', String(size.width))
    line.setAttribute('y2', String(size.height / 2))
    line.setAttribute('stroke', bodyStroke)
    line.setAttribute('stroke-width', String(bodyStrokeWidth))
    line.setAttribute('stroke-linecap', 'round')
    this.el.appendChild(line)

    // 标签文字（节点上方固定偏移）
    if (labelText) {
      const text = document.createElementNS(svgNS, 'text')
      text.setAttribute('x', String(size.width / 2))
      text.setAttribute('y', '-4')
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'baseline')
      text.setAttribute('fill', labelFill)
      text.setAttribute('font-size', String(labelFontSize))
      text.setAttribute('font-family', 'sans-serif')
      text.textContent = labelText
      this.el.appendChild(text)
    }

    this.translate()
  },

  updateBus() {
    const bodyStroke = this.model.attr('body/stroke') || '#22c55e'
    const bodyStrokeWidth = this.model.attr('body/strokeWidth') || 3
    const line = this.el.querySelector('line')
    if (line) {
      line.setAttribute('stroke', bodyStroke)
      line.setAttribute('stroke-width', String(bodyStrokeWidth))
    }
    const labelText = this.model.attr('label/text') || ''
    const labelFill = this.model.attr('label/fill') || '#9ca3af'
    const labelFontSize = this.model.attr('label/fontSize') || 11
    const text = this.el.querySelector('text')
    if (text) {
      text.textContent = labelText
      text.setAttribute('fill', labelFill)
      text.setAttribute('font-size', String(labelFontSize))
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_BUS')) this.updateBus()
  }
})
