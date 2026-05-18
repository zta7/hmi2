import * as joint from '@clientio/rappid'

export class Light extends joint.shapes.standard.Rectangle {
  defaults () {
    return {
      ...super.defaults,
      fills: [],
      type: 'app.Light'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}

export const LightView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM', 'UPDATE_LIGHT'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    attrs: ['UPDATE_LIGHT'],
  },

  render () {
    const { model } = this
    const size = model.size()
    const cx = size.width / 2
    const cy = size.height / 2
    const r = Math.min(cx, cy) - 3
    const fill = model.attr('body/fill') || '#e15656'
    const stroke = model.attr('body/stroke') || '#3a3a60'
    const strokeWidth = model.attr('body/strokeWidth') || 2
    const labelText = model.attr('label/text') || ''
    const labelFill = model.attr('label/stroke') || model.attr('label/fill') || '#c0c0d0'
    const fontSize = model.attr('label/fontSize') || 11
    const svgNS = 'http://www.w3.org/2000/svg'

    this.el.innerHTML = ''

    // 透明点击区域
    const hitArea = document.createElementNS(svgNS, 'rect')
    hitArea.setAttribute('width', String(size.width))
    hitArea.setAttribute('height', String(size.height))
    hitArea.setAttribute('fill', 'transparent')
    hitArea.setAttribute('stroke', 'none')
    this.el.appendChild(hitArea)

    // 外圈 (深色底 + 边框)
    const outerCircle = document.createElementNS(svgNS, 'circle')
    outerCircle.setAttribute('cx', String(cx))
    outerCircle.setAttribute('cy', String(cy))
    outerCircle.setAttribute('r', String(r))
    outerCircle.setAttribute('fill', '#131320')
    outerCircle.setAttribute('stroke', stroke)
    outerCircle.setAttribute('stroke-width', String(strokeWidth + 1))
    this.el.appendChild(outerCircle)

    // 内圈 (绑定变量控制颜色)
    const innerR = Math.max(2, r - strokeWidth - 3)
    const innerCircle = document.createElementNS(svgNS, 'circle')
    innerCircle.setAttribute('cx', String(cx))
    innerCircle.setAttribute('cy', String(cy))
    innerCircle.setAttribute('r', String(innerR))
    innerCircle.setAttribute('fill', fill)
    innerCircle.setAttribute('class', 'light-inner')
    this.el.appendChild(innerCircle)

    // 标签文字 (居中显示)
    const text = document.createElementNS(svgNS, 'text')
    text.setAttribute('x', String(cx))
    text.setAttribute('y', String(cy))
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'central')
    text.setAttribute('fill', labelFill)
    text.setAttribute('font-size', String(fontSize))
    text.setAttribute('font-family', 'sans-serif')
    text.setAttribute('class', 'light-label')
    text.textContent = labelText
    this.el.appendChild(text)

    this.translate()
  },

  updateLight () {
    const fill = this.model.attr('body/fill') || '#e15656'
    const labelText = this.model.attr('label/text') || ''
    const labelFill = this.model.attr('label/stroke') || this.model.attr('label/fill') || '#c0c0d0'
    const fontSize = this.model.attr('label/fontSize') || 11

    const innerCircle = this.el.querySelector('.light-inner')
    if (innerCircle) innerCircle.setAttribute('fill', fill)

    const labelEl = this.el.querySelector('.light-label')
    if (labelEl) {
      labelEl.textContent = labelText
      labelEl.setAttribute('fill', labelFill)
      labelEl.setAttribute('font-size', String(fontSize))
    }
  },

  confirmUpdate (flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_LIGHT')) this.updateLight()
  }
})
