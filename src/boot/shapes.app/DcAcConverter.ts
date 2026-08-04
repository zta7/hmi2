import * as joint from '@clientio/rappid'

/**
 * 电气组件 双向 DC/AC 交换器（DcAcConverter）
 * 还原 demoimg/双向DCAC交换器.png 的扁平化示意图：
 *   - 灰白色矩形电气柜
 *   - 顶部三个圆形风扇罩（散热）
 *   - 中央文本 "DC ⇄ AC"
 *   - 左上角警示三角
 *   - 上 / 下端口圆点
 *   - 底部设备名称标签（默认 "DC/AC"）
 *
 * 风格与 DesignMotor / DesignTransformer 保持一致
 */
export class DcAcConverter extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.DcAcConverter',
      size: { width: 130, height: 110 },
    }
  }
}

export const DcAcConverterView = joint.dia.ElementView.extend({
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

    this.el.innerHTML = ''

    const gfxH = h * 0.78
    const cx = w / 2

    const termR = Math.min(w * 0.04, 3.5)

    const bodyStroke = model.attr('body/stroke') || '#4ade80'
    const bodyStrokeW = model.attr('body/strokeWidth') || 1.5
    const cabinetFill = model.attr('cabinet/fill') || '#e2e8f0'
    const cabinetStroke = model.attr('cabinet/stroke') || '#64748b'
    const termFill = model.attr('terminal/fill') || '#facc15'
    const termStroke = model.attr('terminal/stroke') || '#1f2937'
    const termStrokeW = model.attr('terminal/strokeWidth') || 1

    // ── 透明点击区 ──
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // ── 上引出线 + 上端口（DC 端） ──
    const topLine = document.createElementNS(svgNS, 'line')
    topLine.setAttribute('x1', String(cx))
    topLine.setAttribute('y1', '0')
    topLine.setAttribute('x2', String(cx))
    topLine.setAttribute('y2', String(gfxH * 0.18))
    topLine.setAttribute('stroke', bodyStroke)
    topLine.setAttribute('stroke-width', String(bodyStrokeW))
    topLine.setAttribute('class', 'dcac-line')
    this.el.appendChild(topLine)

    const topTerm = document.createElementNS(svgNS, 'circle')
    topTerm.setAttribute('cx', String(cx))
    topTerm.setAttribute('cy', '0')
    topTerm.setAttribute('r', String(termR))
    topTerm.setAttribute('fill', termFill)
    topTerm.setAttribute('stroke', termStroke)
    topTerm.setAttribute('stroke-width', String(termStrokeW))
    topTerm.setAttribute('class', 'dcac-terminal')
    this.el.appendChild(topTerm)

    // ── 柜体外形 ──
    const cabW = w * 0.82
    const cabH = gfxH * 0.78
    const cabX = (w - cabW) / 2
    const cabY = gfxH * 0.12

    const cabinet = document.createElementNS(svgNS, 'rect')
    cabinet.setAttribute('x', String(cabX))
    cabinet.setAttribute('y', String(cabY))
    cabinet.setAttribute('width', String(cabW))
    cabinet.setAttribute('height', String(cabH))
    cabinet.setAttribute('rx', '2')
    cabinet.setAttribute('ry', '2')
    cabinet.setAttribute('fill', cabinetFill)
    cabinet.setAttribute('stroke', cabinetStroke)
    cabinet.setAttribute('stroke-width', '1.5')
    cabinet.setAttribute('class', 'dcac-cabinet')
    this.el.appendChild(cabinet)

    // ── 顶部三个风扇罩 ──
    const fanY = cabY + cabH * 0.10
    const fanR = cabH * 0.10
    const fanGap = cabW / 4
    for (let i = 0; i < 3; i++) {
      const fx = cabX + fanGap * (i + 0.5)
      const fan = document.createElementNS(svgNS, 'circle')
      fan.setAttribute('cx', String(fx))
      fan.setAttribute('cy', String(fanY + fanR))
      fan.setAttribute('r', String(fanR))
      fan.setAttribute('fill', '#475569')
      fan.setAttribute('stroke', cabinetStroke)
      fan.setAttribute('stroke-width', '0.8')
      fan.setAttribute('class', 'dcac-fan')
      this.el.appendChild(fan)
      // 风扇叶片（十字）
      const blade1 = document.createElementNS(svgNS, 'line')
      blade1.setAttribute('x1', String(fx - fanR * 0.7))
      blade1.setAttribute('y1', String(fanY + fanR))
      blade1.setAttribute('x2', String(fx + fanR * 0.7))
      blade1.setAttribute('y2', String(fanY + fanR))
      blade1.setAttribute('stroke', '#94a3b8')
      blade1.setAttribute('stroke-width', '0.6')
      this.el.appendChild(blade1)
      const blade2 = document.createElementNS(svgNS, 'line')
      blade2.setAttribute('x1', String(fx))
      blade2.setAttribute('y1', String(fanY + fanR - fanR * 0.7))
      blade2.setAttribute('x2', String(fx))
      blade2.setAttribute('y2', String(fanY + fanR + fanR * 0.7))
      blade2.setAttribute('stroke', '#94a3b8')
      blade2.setAttribute('stroke-width', '0.6')
      this.el.appendChild(blade2)
    }

    // ── 中央文本 "DC ⇄ AC" ──
    const centerText = document.createElementNS(svgNS, 'text')
    centerText.setAttribute('x', String(cx))
    centerText.setAttribute('y', String(cabY + cabH * 0.65))
    centerText.setAttribute('text-anchor', 'middle')
    centerText.setAttribute('dominant-baseline', 'middle')
    centerText.setAttribute('fill', '#1e293b')
    centerText.setAttribute('font-size', '12')
    centerText.setAttribute('font-weight', 'bold')
    centerText.setAttribute('font-family', 'sans-serif')
    centerText.textContent = 'DC ⇄ AC'
    this.el.appendChild(centerText)

    // ── 左上角警示三角 ──
    const warnX = cabX + cabW * 0.10
    const warnY = cabY + cabH * 0.35
    const warnS = Math.min(cabW, cabH) * 0.08
    const triangle = document.createElementNS(svgNS, 'polygon')
    triangle.setAttribute('points',
      `${warnX},${warnY + warnS} ${warnX + warnS},${warnY + warnS} ${warnX + warnS / 2},${warnY}`)
    triangle.setAttribute('fill', '#facc15')
    triangle.setAttribute('stroke', '#1f2937')
    triangle.setAttribute('stroke-width', '0.6')
    this.el.appendChild(triangle)

    // ── 下引出线 + 下端口（AC 端） ──
    const botY = gfxH
    const botLine = document.createElementNS(svgNS, 'line')
    botLine.setAttribute('x1', String(cx))
    botLine.setAttribute('y1', String(botY))
    botLine.setAttribute('x2', String(cx))
    botLine.setAttribute('y2', String(botY - gfxH * 0.10))
    botLine.setAttribute('stroke', bodyStroke)
    botLine.setAttribute('stroke-width', String(bodyStrokeW))
    botLine.setAttribute('class', 'dcac-line')
    this.el.appendChild(botLine)

    const botTerm = document.createElementNS(svgNS, 'circle')
    botTerm.setAttribute('cx', String(cx))
    botTerm.setAttribute('cy', String(botY))
    botTerm.setAttribute('r', String(termR))
    botTerm.setAttribute('fill', termFill)
    botTerm.setAttribute('stroke', termStroke)
    botTerm.setAttribute('stroke-width', String(termStrokeW))
    botTerm.setAttribute('class', 'dcac-terminal')
    this.el.appendChild(botTerm)

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || 'DC/AC'
    const label = document.createElementNS(svgNS, 'text')
    label.setAttribute('x', String(w / 2))
    label.setAttribute('y', String(h * 0.92))
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'middle')
    label.setAttribute('fill', model.attr('label/fill') || '#e5e7eb')
    label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
    label.setAttribute('font-weight', String(model.attr('label/fontWeight') || 'bold'))
    label.setAttribute('font-family', 'sans-serif')
    label.setAttribute('class', 'dcac-label')
    label.textContent = labelText
    this.el.appendChild(label)

    this.translate()
  },

  updateAttrs() {
    const bodyStroke = this.model.attr('body/stroke') || '#4ade80'
    const lines = this.el.querySelectorAll('.dcac-line')
    lines.forEach((el: Element) => el.setAttribute('stroke', bodyStroke))
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
