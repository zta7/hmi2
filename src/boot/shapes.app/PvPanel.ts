import * as joint from '@clientio/rappid'

/**
 * 电气组件 光伏板（PvPanel）
 * 还原 demoimg/光伏.png 的扁平化示意图：
 *   - 主色 蓝灰（光伏电池的视觉颜色）
 *   - 上方倾斜面板（2 列多晶单元）
 *   - 下方支架（左右两根支柱 + 底座）
 *   - 上 / 下端口圆点（接入直流母线）
 *   - 底部设备名称标签（默认 "PV"）
 *
 * 风格与 DesignMotor / DesignTransformer 保持一致：
 *   - 透明点击区 + 端口圆点 + 引出线
 *   - 主体圆 / 矩形 + 中心文本
 *   - 默认色：#4ade80 主色 / #facc15 端口 / #e5e7eb 标签
 */
export class PvPanel extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.PvPanel',
      size: { width: 130, height: 110 },
    }
  }
}

export const PvPanelView = joint.dia.ElementView.extend({
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

    // 图形区（不含底部标签）
    const gfxH = h * 0.78
    const cx = w / 2

    const bodyStroke = model.attr('body/stroke') || '#4ade80'
    const bodyStrokeW = model.attr('body/strokeWidth') || 1.5
    const panelFill = model.attr('panel/fill') || '#3b82f6'
    const panelStroke = model.attr('panel/stroke') || '#1d4ed8'

    // ── 透明点击区 ──
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // ── 光伏面板（向左上方倾斜的矩形，模拟图中支架效果） ──
    const panelW = w * 0.78
    const panelH = gfxH * 0.50
    const panelX = (w - panelW) / 2
    const panelY = gfxH * 0.22
    const tilt = 8 // 倾斜角度

    const panelGroup = document.createElementNS(svgNS, 'g')
    panelGroup.setAttribute('transform', `rotate(${-tilt} ${cx} ${panelY + panelH / 2})`)
    panelGroup.setAttribute('class', 'pv-panel-group')

    // 面板底
    const panel = document.createElementNS(svgNS, 'rect')
    panel.setAttribute('x', String(panelX))
    panel.setAttribute('y', String(panelY))
    panel.setAttribute('width', String(panelW))
    panel.setAttribute('height', String(panelH))
    panel.setAttribute('rx', '2')
    panel.setAttribute('ry', '2')
    panel.setAttribute('fill', panelFill)
    panel.setAttribute('stroke', panelStroke)
    panel.setAttribute('stroke-width', '1.5')
    panel.setAttribute('class', 'pv-panel')
    panelGroup.appendChild(panel)

    // 面板上的电池网格（3×2）
    const cols = 3
    const rows = 2
    const padX = panelW * 0.05
    const padY = panelH * 0.10
    const cellW = (panelW - padX * 2) / cols
    const cellH = (panelH - padY * 2) / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElementNS(svgNS, 'rect')
        cell.setAttribute('x', String(panelX + padX + c * cellW))
        cell.setAttribute('y', String(panelY + padY + r * cellH))
        cell.setAttribute('width', String(cellW * 0.88))
        cell.setAttribute('height', String(cellH * 0.78))
        cell.setAttribute('fill', 'rgba(255,255,255,0.10)')
        cell.setAttribute('stroke', 'rgba(255,255,255,0.35)')
        cell.setAttribute('stroke-width', '0.5')
        panelGroup.appendChild(cell)
      }
    }
    this.el.appendChild(panelGroup)

    // ── 支架（左右两根短柱 + 水平底座） ──
    const standY = panelY + panelH
    const baseY = gfxH * 0.85
    const standW = Math.max(2, panelStroke ? 2 : 2)

    const leftStand = document.createElementNS(svgNS, 'line')
    leftStand.setAttribute('x1', String(panelX + panelW * 0.15))
    leftStand.setAttribute('y1', String(standY))
    leftStand.setAttribute('x2', String(panelX + panelW * 0.15))
    leftStand.setAttribute('y2', String(baseY))
    leftStand.setAttribute('stroke', '#94a3b8')
    leftStand.setAttribute('stroke-width', '2')
    leftStand.setAttribute('stroke-linecap', 'round')
    leftStand.setAttribute('class', 'pv-stand')
    this.el.appendChild(leftStand)

    const rightStand = document.createElementNS(svgNS, 'line')
    rightStand.setAttribute('x1', String(panelX + panelW * 0.85))
    rightStand.setAttribute('y1', String(standY))
    rightStand.setAttribute('x2', String(panelX + panelW * 0.85))
    rightStand.setAttribute('y2', String(baseY))
    rightStand.setAttribute('stroke', '#94a3b8')
    rightStand.setAttribute('stroke-width', '2')
    rightStand.setAttribute('stroke-linecap', 'round')
    rightStand.setAttribute('class', 'pv-stand')
    this.el.appendChild(rightStand)

    // 底座横线
    const base = document.createElementNS(svgNS, 'line')
    base.setAttribute('x1', String(panelX + panelW * 0.10))
    base.setAttribute('y1', String(baseY))
    base.setAttribute('x2', String(panelX + panelW * 0.90))
    base.setAttribute('y2', String(baseY))
    base.setAttribute('stroke', '#94a3b8')
    base.setAttribute('stroke-width', '3')
    base.setAttribute('stroke-linecap', 'round')
    base.setAttribute('class', 'pv-base')
    this.el.appendChild(base)

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || 'PV'
    const label = document.createElementNS(svgNS, 'text')
    label.setAttribute('x', String(w / 2))
    label.setAttribute('y', String(h * 0.92))
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'middle')
    label.setAttribute('fill', model.attr('label/fill') || '#e5e7eb')
    label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
    label.setAttribute('font-weight', String(model.attr('label/fontWeight') || 'bold'))
    label.setAttribute('font-family', 'sans-serif')
    label.setAttribute('class', 'pv-label')
    label.textContent = labelText
    this.el.appendChild(label)

    this.translate()
  },

  updateAttrs() {
    const bodyStroke = this.model.attr('body/stroke') || '#4ade80'
    const lines = this.el.querySelectorAll('.pv-line')
    lines.forEach((el: Element) => el.setAttribute('stroke', bodyStroke))
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
