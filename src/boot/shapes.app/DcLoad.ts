import * as joint from '@clientio/rappid'

/**
 * 电气组件 直流负载（DcLoad）
 * 还原 demoimg/直流负载.png 的扁平化示意图：
 *   - 高柜外形（窄高比例）
 *   - 顶部铭牌 "DC"
 *   - 上部显示屏窗口（与并网点相似但带 DC 标识）
 *   - 中部警示三角
 *   - 柜门分隔竖线
 *   - 上 / 下端口圆点
 *   - 底部设备名称（默认 "DC Load"）
 *
 * 风格与 DesignMotor / DesignTransformer 保持一致
 */
export class DcLoad extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.DcLoad',
      size: { width: 90, height: 120 },
    }
  }
}

export const DcLoadView = joint.dia.ElementView.extend({
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

    const gfxH = h * 0.82
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

    // ── 上引出线 + 上端口 ──
    const topLine = document.createElementNS(svgNS, 'line')
    topLine.setAttribute('x1', String(cx))
    topLine.setAttribute('y1', '0')
    topLine.setAttribute('x2', String(cx))
    topLine.setAttribute('y2', String(gfxH * 0.06))
    topLine.setAttribute('stroke', bodyStroke)
    topLine.setAttribute('stroke-width', String(bodyStrokeW))
    topLine.setAttribute('class', 'dcl-line')
    this.el.appendChild(topLine)

    const topTerm = document.createElementNS(svgNS, 'circle')
    topTerm.setAttribute('cx', String(cx))
    topTerm.setAttribute('cy', '0')
    topTerm.setAttribute('r', String(termR))
    topTerm.setAttribute('fill', termFill)
    topTerm.setAttribute('stroke', termStroke)
    topTerm.setAttribute('stroke-width', String(termStrokeW))
    topTerm.setAttribute('class', 'dcl-terminal')
    this.el.appendChild(topTerm)

    // ── 顶部铭牌 DC ──
    const plateY = gfxH * 0.05
    const plateH = gfxH * 0.08
    const plateW = w * 0.60
    const plateX = (w - plateW) / 2
    const plate = document.createElementNS(svgNS, 'rect')
    plate.setAttribute('x', String(plateX))
    plate.setAttribute('y', String(plateY))
    plate.setAttribute('width', String(plateW))
    plate.setAttribute('height', String(plateH))
    plate.setAttribute('rx', '1')
    plate.setAttribute('fill', '#0ea5e9')
    plate.setAttribute('stroke', cabinetStroke)
    plate.setAttribute('stroke-width', '0.6')
    this.el.appendChild(plate)
    const plateText = document.createElementNS(svgNS, 'text')
    plateText.setAttribute('x', String(cx))
    plateText.setAttribute('y', String(plateY + plateH / 2))
    plateText.setAttribute('text-anchor', 'middle')
    plateText.setAttribute('dominant-baseline', 'central')
    plateText.setAttribute('fill', '#ffffff')
    plateText.setAttribute('font-size', '11')
    plateText.setAttribute('font-weight', 'bold')
    plateText.setAttribute('font-family', 'sans-serif')
    plateText.textContent = 'DC'
    this.el.appendChild(plateText)

    // ── 柜体外形 ──
    const cabW = w * 0.86
    const cabH = gfxH * 0.92
    const cabX = (w - cabW) / 2
    const cabY = gfxH * 0.06

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
    cabinet.setAttribute('class', 'dcl-cabinet')
    this.el.appendChild(cabinet)

    // ── 柜门分隔竖线 ──
    const doorLine = document.createElementNS(svgNS, 'line')
    doorLine.setAttribute('x1', String(cx))
    doorLine.setAttribute('y1', String(cabY))
    doorLine.setAttribute('x2', String(cx))
    doorLine.setAttribute('y2', String(cabY + cabH))
    doorLine.setAttribute('stroke', cabinetStroke)
    doorLine.setAttribute('stroke-width', '0.8')
    doorLine.setAttribute('stroke-dasharray', '3,2')
    this.el.appendChild(doorLine)

    // ── 中部显示屏 ──
    const displayY = cabY + cabH * 0.30
    const displayW = cabW * 0.32
    const displayH = cabH * 0.12
    const displayX = (w - displayW) / 2

    const display = document.createElementNS(svgNS, 'rect')
    display.setAttribute('x', String(displayX))
    display.setAttribute('y', String(displayY))
    display.setAttribute('width', String(displayW))
    display.setAttribute('height', String(displayH))
    display.setAttribute('rx', '1')
    display.setAttribute('fill', '#0f172a')
    display.setAttribute('stroke', cabinetStroke)
    display.setAttribute('stroke-width', '0.8')
    this.el.appendChild(display)
    const dataLine = document.createElementNS(svgNS, 'line')
    dataLine.setAttribute('x1', String(displayX + displayW * 0.12))
    dataLine.setAttribute('y1', String(displayY + displayH * 0.5))
    dataLine.setAttribute('x2', String(displayX + displayW * 0.70))
    dataLine.setAttribute('y2', String(displayY + displayH * 0.5))
    dataLine.setAttribute('stroke', '#22d3ee')
    dataLine.setAttribute('stroke-width', '1')
    this.el.appendChild(dataLine)

    // ── 警示三角（中部偏下） ──
    const warnX = cx
    const warnY = cabY + cabH * 0.62
    const warnS = Math.min(cabW, cabH) * 0.08
    const triangle = document.createElementNS(svgNS, 'polygon')
    triangle.setAttribute('points',
      `${warnX - warnS / 2},${warnY + warnS} ${warnX + warnS / 2},${warnY + warnS} ${warnX},${warnY}`)
    triangle.setAttribute('fill', '#facc15')
    triangle.setAttribute('stroke', '#1f2937')
    triangle.setAttribute('stroke-width', '0.6')
    this.el.appendChild(triangle)

    // ── 下端口引出线 + 下端口 ──
    const botY = gfxH
    const botLine = document.createElementNS(svgNS, 'line')
    botLine.setAttribute('x1', String(cx))
    botLine.setAttribute('y1', String(botY))
    botLine.setAttribute('x2', String(cx))
    botLine.setAttribute('y2', String(botY - gfxH * 0.04))
    botLine.setAttribute('stroke', bodyStroke)
    botLine.setAttribute('stroke-width', String(bodyStrokeW))
    botLine.setAttribute('class', 'dcl-line')
    this.el.appendChild(botLine)

    const botTerm = document.createElementNS(svgNS, 'circle')
    botTerm.setAttribute('cx', String(cx))
    botTerm.setAttribute('cy', String(botY))
    botTerm.setAttribute('r', String(termR))
    botTerm.setAttribute('fill', termFill)
    botTerm.setAttribute('stroke', termStroke)
    botTerm.setAttribute('stroke-width', String(termStrokeW))
    botTerm.setAttribute('class', 'dcl-terminal')
    this.el.appendChild(botTerm)

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || 'DC Load'
    const label = document.createElementNS(svgNS, 'text')
    label.setAttribute('x', String(w / 2))
    label.setAttribute('y', String(h * 0.93))
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'middle')
    label.setAttribute('fill', model.attr('label/fill') || '#e5e7eb')
    label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
    label.setAttribute('font-weight', String(model.attr('label/fontWeight') || 'bold'))
    label.setAttribute('font-family', 'sans-serif')
    label.setAttribute('class', 'dcl-label')
    label.textContent = labelText
    this.el.appendChild(label)

    this.translate()
  },

  updateAttrs() {
    const bodyStroke = this.model.attr('body/stroke') || '#4ade80'
    const lines = this.el.querySelectorAll('.dcl-line')
    lines.forEach((el: Element) => el.setAttribute('stroke', bodyStroke))
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
