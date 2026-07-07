import * as joint from '@clientio/rappid'

/** 指示灯（Indicator）：圆形灯体外圈 + 内灯 + 高光 + 下方标签 */
export class Indicator extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.Indicator',
      size: { width: 40, height: 48 }
    }
  }
}

export const IndicatorView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM', 'UPDATE_INDICATOR'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    attrs: ['UPDATE_INDICATOR'],
  },

  render() {
    const { model } = this
    const size = model.size()
    const svgNS = 'http://www.w3.org/2000/svg'
    const cx = size.width / 2
    const cy = size.height / 2 - 6

    // 读取 gojsToJoint 写入的 attrs
    const bodyFill = model.attr('body/fill') || '#1f2937'
    const bodyStroke = model.attr('body/stroke') || '#4ade80'
    const bodyStrokeWidth = model.attr('body/strokeWidth') || 1.5
    const bodyR = model.attr('body/r') || Math.min(cx, cy) - 2
    const lampFill = model.attr('lamp/fill') || '#6b7280'
    const lampR = model.attr('lamp/r') || Math.max(2, bodyR - 4)
    const highlightFill = model.attr('highlight/fill') || 'rgba(255,255,255,0.15)'
    const highlightR = model.attr('highlight/r') || Math.max(1, bodyR * 0.25)
    const labelText = model.attr('label/text') || ''
    const labelFill = model.attr('label/fill') || '#e5e7eb'
    const labelFontSize = model.attr('label/fontSize') || 11

    this.el.innerHTML = ''

    // 透明点击区域
    const hitArea = document.createElementNS(svgNS, 'rect')
    hitArea.setAttribute('width', String(size.width))
    hitArea.setAttribute('height', String(size.height))
    hitArea.setAttribute('fill', 'transparent')
    hitArea.setAttribute('stroke', 'none')
    this.el.appendChild(hitArea)

    // 外圈（深色底 + 边框）
    const outerCircle = document.createElementNS(svgNS, 'circle')
    outerCircle.setAttribute('cx', String(cx))
    outerCircle.setAttribute('cy', String(cy))
    outerCircle.setAttribute('r', String(bodyR))
    outerCircle.setAttribute('fill', bodyFill)
    outerCircle.setAttribute('stroke', bodyStroke)
    outerCircle.setAttribute('stroke-width', String(bodyStrokeWidth))
    outerCircle.setAttribute('class', 'indicator-body')
    this.el.appendChild(outerCircle)

    // 内灯（绑定变量控制颜色）
    const innerCircle = document.createElementNS(svgNS, 'circle')
    innerCircle.setAttribute('cx', String(cx))
    innerCircle.setAttribute('cy', String(cy))
    innerCircle.setAttribute('r', String(lampR))
    innerCircle.setAttribute('fill', lampFill)
    innerCircle.setAttribute('class', 'indicator-lamp')
    this.el.appendChild(innerCircle)

    // 高光点（左上角光辉）
    const highlight = document.createElementNS(svgNS, 'circle')
    highlight.setAttribute('cx', String(cx - bodyR * 0.25))
    highlight.setAttribute('cy', String(cy - bodyR * 0.25))
    highlight.setAttribute('r', String(highlightR))
    highlight.setAttribute('fill', highlightFill)
    highlight.setAttribute('class', 'indicator-highlight')
    this.el.appendChild(highlight)

    // 标签文字（底部居中）
    if (labelText) {
      const text = document.createElementNS(svgNS, 'text')
      text.setAttribute('x', String(cx))
      text.setAttribute('y', String(cy + bodyR + 14))
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'hanging')
      text.setAttribute('fill', labelFill)
      text.setAttribute('font-size', String(labelFontSize))
      text.setAttribute('font-family', 'sans-serif')
      text.textContent = labelText
      this.el.appendChild(text)
    }

    this.translate()
  },

  updateIndicator() {
    const lampFill = this.model.attr('lamp/fill') || '#6b7280'
    const lampEl = this.el.querySelector('.indicator-lamp')
    if (lampEl) lampEl.setAttribute('fill', lampFill)

    const bodyFill = this.model.attr('body/fill') || '#1f2937'
    const bodyStroke = this.model.attr('body/stroke') || '#4ade80'
    const bodyEl = this.el.querySelector('.indicator-body')
    if (bodyEl) {
      bodyEl.setAttribute('fill', bodyFill)
      bodyEl.setAttribute('stroke', bodyStroke)
    }

    const labelText = this.model.attr('label/text') || ''
    const labelFill = this.model.attr('label/fill') || '#e5e7eb'
    const labelFontSize = this.model.attr('label/fontSize') || 11
    const textEl = this.el.querySelector('text')
    if (textEl) {
      textEl.textContent = labelText
      textEl.setAttribute('fill', labelFill)
      textEl.setAttribute('font-size', String(labelFontSize))
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_INDICATOR')) this.updateIndicator()
  }
})
