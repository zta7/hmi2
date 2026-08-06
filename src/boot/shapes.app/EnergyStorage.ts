import * as joint from '@clientio/rappid'

/**
 * 电气组件 储能系统（EnergyStorage）
 * 还原 demoimg/储能系统.png 的扁平化示意图：
 *   - 灰白色储能集装箱外形
 *   - 内部电池模组（4×3 单元网格）
 *   - 上方 HVAC / 控制柜斜线条
 *   - 左上角警示三角
 *   - 顶部设备名称（默认 "Battery"）
 *
 * 风格与 DesignMotor / DesignTransformer 保持一致
 */
export class EnergyStorage extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.EnergyStorage',
      size: { width: 150, height: 110 },
    }
  }
}

export const EnergyStorageView = joint.dia.ElementView.extend({
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

    // 图形区（不含顶部 / 底部标签）
    const topLabelH = 0 // 顶部留白
    const gfxH = h * 0.78
    const cx = w / 2

    const bodyStroke = model.attr('body/stroke') || '#94a3b8'
    const bodyStrokeW = model.attr('body/strokeWidth') || 1.5
    const cabinetFill = model.attr('cabinet/fill') || '#e2e8f0'
    const cabinetStroke = model.attr('cabinet/stroke') || '#64748b'
    const cellFill = model.attr('cell/fill') || '#475569'
    const cellStroke = model.attr('cell/stroke') || '#1e293b'

    // ── 透明点击区 ──
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // ── 储能集装箱外形 ──
    const cabW = w * 0.86
    const cabH = gfxH * 0.62
    const cabX = (w - cabW) / 2
    const cabY = topLabelH + gfxH * 0.12

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
    cabinet.setAttribute('class', 'es-cabinet')
    this.el.appendChild(cabinet)

    // ── 集装箱顶部 HVAC（简化：上沿两条斜线表示设备） ──
    const hvacLine1 = document.createElementNS(svgNS, 'line')
    hvacLine1.setAttribute('x1', String(cabX + cabW * 0.20))
    hvacLine1.setAttribute('y1', String(cabY))
    hvacLine1.setAttribute('x2', String(cabX + cabW * 0.30))
    hvacLine1.setAttribute('y2', String(cabY - 4))
    hvacLine1.setAttribute('stroke', cabinetStroke)
    hvacLine1.setAttribute('stroke-width', '1.5')
    this.el.appendChild(hvacLine1)
    const hvacLine2 = document.createElementNS(svgNS, 'line')
    hvacLine2.setAttribute('x1', String(cabX + cabW * 0.70))
    hvacLine2.setAttribute('y1', String(cabY))
    hvacLine2.setAttribute('x2', String(cabX + cabW * 0.80))
    hvacLine2.setAttribute('y2', String(cabY - 4))
    hvacLine2.setAttribute('stroke', cabinetStroke)
    hvacLine2.setAttribute('stroke-width', '1.5')
    this.el.appendChild(hvacLine2)

    // ── 电池模组网格 4×3 ──
    const cols = 4
    const rows = 3
    const padX = cabW * 0.08
    const padY = cabH * 0.10
    const cellW = (cabW - padX * 2) / cols
    const cellH = (cabH - padY * 2) / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElementNS(svgNS, 'rect')
        cell.setAttribute('x', String(cabX + padX + c * cellW))
        cell.setAttribute('y', String(cabY + padY + r * cellH))
        cell.setAttribute('width', String(cellW * 0.86))
        cell.setAttribute('height', String(cellH * 0.78))
        cell.setAttribute('rx', '1')
        cell.setAttribute('ry', '1')
        cell.setAttribute('fill', cellFill)
        cell.setAttribute('stroke', cellStroke)
        cell.setAttribute('stroke-width', '0.6')
        cell.setAttribute('class', 'es-cell')
        this.el.appendChild(cell)
        // 电池中心小点（电芯指示）
        const dot = document.createElementNS(svgNS, 'circle')
        dot.setAttribute('cx', String(cabX + padX + c * cellW + cellW * 0.43))
        dot.setAttribute('cy', String(cabY + padY + r * cellH + cellH * 0.39))
        dot.setAttribute('r', String(Math.min(cellW, cellH) * 0.10))
        dot.setAttribute('fill', '#94a3b8')
        dot.setAttribute('class', 'es-cell-dot')
        this.el.appendChild(dot)
      }
    }

    // ── 左上门（模拟图中左侧箱门分隔线）──
    const doorLine = document.createElementNS(svgNS, 'line')
    doorLine.setAttribute('x1', String(cabX + cabW * 0.18))
    doorLine.setAttribute('y1', String(cabY))
    doorLine.setAttribute('x2', String(cabX + cabW * 0.18))
    doorLine.setAttribute('y2', String(cabY + cabH))
    doorLine.setAttribute('stroke', cabinetStroke)
    doorLine.setAttribute('stroke-width', '0.8')
    doorLine.setAttribute('stroke-dasharray', '3,2')
    this.el.appendChild(doorLine)

    // ── 左上角警示三角 ──
    const warnX = cabX + cabW * 0.10
    const warnY = cabY + cabH * 0.12
    const warnS = Math.min(cabW, cabH) * 0.08
    const triangle = document.createElementNS(svgNS, 'polygon')
    triangle.setAttribute('points',
      `${warnX},${warnY + warnS} ${warnX + warnS},${warnY + warnS} ${warnX + warnS / 2},${warnY}`)
    triangle.setAttribute('fill', '#facc15')
    triangle.setAttribute('stroke', '#1f2937')
    triangle.setAttribute('stroke-width', '0.6')
    triangle.setAttribute('class', 'es-warn')
    this.el.appendChild(triangle)

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || 'Battery'
    const label = document.createElementNS(svgNS, 'text')
    label.setAttribute('x', String(w / 2))
    label.setAttribute('y', String(h * 0.92))
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'middle')
    label.setAttribute('fill', model.attr('label/fill') || '#e5e7eb')
    label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
    label.setAttribute('font-weight', String(model.attr('label/fontWeight') || 'bold'))
    label.setAttribute('font-family', 'sans-serif')
    label.setAttribute('class', 'es-label')
    label.textContent = labelText
    this.el.appendChild(label)

    this.translate()
  },

  updateAttrs() {
    const bodyStroke = this.model.attr('body/stroke') || '#94a3b8'
    const lines = this.el.querySelectorAll('.es-line')
    lines.forEach((el: Element) => el.setAttribute('stroke', bodyStroke))
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
