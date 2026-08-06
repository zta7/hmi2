import * as joint from '@clientio/rappid'

/**
 * 电气组件 并网接入点（GridPoint）
 * 还原 demoimg/并网接入点10kV380V.png 的扁平化示意图：
 *   - 高柜外形（高度大于宽度的窄高柜）
 *   - 柜门分隔线（中部一道竖线）
 *   - 上部显示屏窗口（含两条数据条）
 *   - 中部警示三角
 *   - 顶部铭牌 "10kV / 380V"
 *   - 上 / 下端口圆点
 *   - 底部设备名称（默认 "Grid"）
 *
 * 风格与 DesignMotor / DesignTransformer 保持一致
 */
export class GridPoint extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.GridPoint',
      size: { width: 90, height: 130 },
    }
  }
}

export const GridPointView = joint.dia.ElementView.extend({
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

    const gfxH = h * 0.85
    const cx = w / 2

    const bodyStroke = model.attr('body/stroke') || '#4ade80'
    const bodyStrokeW = model.attr('body/strokeWidth') || 1.5
    const cabinetFill = model.attr('cabinet/fill') || '#e2e8f0'
    const cabinetStroke = model.attr('cabinet/stroke') || '#64748b'

    // ── 透明点击区 ──
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // ── 顶部铭牌 10kV / 380V ──
    const plateY = gfxH * 0.06
    const plateH = gfxH * 0.08
    const plateW = w * 0.78
    const plateX = (w - plateW) / 2
    const plate = document.createElementNS(svgNS, 'rect')
    plate.setAttribute('x', String(plateX))
    plate.setAttribute('y', String(plateY))
    plate.setAttribute('width', String(plateW))
    plate.setAttribute('height', String(plateH))
    plate.setAttribute('rx', '1')
    plate.setAttribute('fill', '#1e293b')
    plate.setAttribute('stroke', cabinetStroke)
    plate.setAttribute('stroke-width', '0.6')
    this.el.appendChild(plate)
    const plateText = document.createElementNS(svgNS, 'text')
    plateText.setAttribute('x', String(cx))
    plateText.setAttribute('y', String(plateY + plateH / 2))
    plateText.setAttribute('text-anchor', 'middle')
    plateText.setAttribute('dominant-baseline', 'central')
    plateText.setAttribute('fill', '#facc15')
    plateText.setAttribute('font-size', '9')
    plateText.setAttribute('font-weight', 'bold')
    plateText.setAttribute('font-family', 'sans-serif')
    plateText.textContent = '10kV / 380V'
    this.el.appendChild(plateText)

    // ── 柜体外形 ──
    const cabW = w * 0.84
    const cabH = gfxH * 0.92
    const cabX = (w - cabW) / 2
    const cabY = gfxH * 0.08

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
    cabinet.setAttribute('class', 'grid-cabinet')
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

    // ── 上部显示屏 ──
    const displayY = cabY + cabH * 0.30
    const displayW = cabW * 0.36
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
    // 显示屏内数据条
    const dataLine1 = document.createElementNS(svgNS, 'line')
    dataLine1.setAttribute('x1', String(displayX + displayW * 0.1))
    dataLine1.setAttribute('y1', String(displayY + displayH * 0.35))
    dataLine1.setAttribute('x2', String(displayX + displayW * 0.85))
    dataLine1.setAttribute('y2', String(displayY + displayH * 0.35))
    dataLine1.setAttribute('stroke', '#22d3ee')
    dataLine1.setAttribute('stroke-width', '1')
    this.el.appendChild(dataLine1)
    const dataLine2 = document.createElementNS(svgNS, 'line')
    dataLine2.setAttribute('x1', String(displayX + displayW * 0.1))
    dataLine2.setAttribute('y1', String(displayY + displayH * 0.65))
    dataLine2.setAttribute('x2', String(displayX + displayW * 0.65))
    dataLine2.setAttribute('y2', String(displayY + displayH * 0.65))
    dataLine2.setAttribute('stroke', '#22d3ee')
    dataLine2.setAttribute('stroke-width', '1')
    this.el.appendChild(dataLine2)

    // ── 警示三角（中部偏上） ──
    const warnX = cx
    const warnY = cabY + cabH * 0.55
    const warnS = Math.min(cabW, cabH) * 0.08
    const triangle = document.createElementNS(svgNS, 'polygon')
    triangle.setAttribute('points',
      `${warnX - warnS / 2},${warnY + warnS} ${warnX + warnS / 2},${warnY + warnS} ${warnX},${warnY}`)
    triangle.setAttribute('fill', '#facc15')
    triangle.setAttribute('stroke', '#1f2937')
    triangle.setAttribute('stroke-width', '0.6')
    this.el.appendChild(triangle)

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || 'Grid'
    const label = document.createElementNS(svgNS, 'text')
    label.setAttribute('x', String(w / 2))
    label.setAttribute('y', String(h * 0.94))
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'middle')
    label.setAttribute('fill', model.attr('label/fill') || '#e5e7eb')
    label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
    label.setAttribute('font-weight', String(model.attr('label/fontWeight') || 'bold'))
    label.setAttribute('font-family', 'sans-serif')
    label.setAttribute('class', 'grid-label')
    label.textContent = labelText
    this.el.appendChild(label)

    this.translate()
  },

  updateAttrs() {
    const bodyStroke = this.model.attr('body/stroke') || '#4ade80'
    const lines = this.el.querySelectorAll('.grid-line')
    lines.forEach((el: Element) => el.setAttribute('stroke', bodyStroke))
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
