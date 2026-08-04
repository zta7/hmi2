import * as joint from '@clientio/rappid'

/**
 * 电气组件 变压器（Transformer）
 * 还原 demoimg/变压器.png —— 两个圆相切的简化符号：
 *   - 上面两个独立的圆（不同轴心）作为一次 / 二次绕组（IEEE / ANSI 双绕组表示）
 *   - 上 / 下端口圆点 + 引出线
 *   - 底部设备名称（默认 "Transformer"）
 *
 * 与 DesignTransformer 区别：
 *   DesignTransformer 用 IEC 60617 双绕组符号（上下两个半圆 + 铁芯竖线）；
 *   本组件用 ANSI / 简化符号（两个独立的相切圆），与 demoimg/变压器.png 完全一致。
 *
 * 风格与 DesignMotor / DesignTransformer 保持一致
 */
export class Transformer extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.Transformer',
      size: { width: 100, height: 110 },
    }
  }
}

export const TransformerView = joint.dia.ElementView.extend({
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

    const gfxH = h * 0.80
    const cx = w / 2
    const cy = gfxH * 0.55

    const termR = Math.min(w * 0.04, 3.5)

    const bodyStroke = model.attr('body/stroke') || '#4ade80'
    const bodyStrokeW = model.attr('body/strokeWidth') || 1.5
    const windingStroke = model.attr('winding/stroke') || '#4ade80'
    const windingStrokeW = model.attr('winding/strokeWidth') || 2
    const termFill = model.attr('terminal/fill') || '#facc15'
    const termStroke = model.attr('terminal/stroke') || '#1f2937'
    const termStrokeW = model.attr('terminal/strokeWidth') || 1

    // 圆半径 / 偏移：两个圆等大，半径以 gfxH 比例为基准
    const r = Math.min(gfxH * 0.30, w * 0.32, 28)
    // 两个圆沿横向错开，左圆偏左 + 右圆偏右
    const dx = r * 0.85 // 横向偏移量
    const dy = r * 0.55 // 纵向偏移量（右圆下移，制造"咬合"感）
    const leftCx = cx - dx
    const leftCy = cy - dy * 0.5
    const rightCx = cx + dx
    const rightCy = cy + dy * 0.5

    // ── 透明点击区 ──
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // ── 左绕组圆（一次） ──
    const leftCircle = document.createElementNS(svgNS, 'circle')
    leftCircle.setAttribute('cx', String(leftCx))
    leftCircle.setAttribute('cy', String(leftCy))
    leftCircle.setAttribute('r', String(r))
    leftCircle.setAttribute('fill', 'transparent')
    leftCircle.setAttribute('stroke', windingStroke)
    leftCircle.setAttribute('stroke-width', String(windingStrokeW))
    leftCircle.setAttribute('class', 'xfmr-winding')
    this.el.appendChild(leftCircle)

    // ── 右绕组圆（二次） ──
    const rightCircle = document.createElementNS(svgNS, 'circle')
    rightCircle.setAttribute('cx', String(rightCx))
    rightCircle.setAttribute('cy', String(rightCy))
    rightCircle.setAttribute('r', String(r))
    rightCircle.setAttribute('fill', 'transparent')
    rightCircle.setAttribute('stroke', windingStroke)
    rightCircle.setAttribute('stroke-width', String(windingStrokeW))
    rightCircle.setAttribute('class', 'xfmr-winding')
    this.el.appendChild(rightCircle)

    // ── 上端口 1（左上角，连接左圆顶部） ──
    const topLine = document.createElementNS(svgNS, 'line')
    topLine.setAttribute('x1', String(leftCx))
    topLine.setAttribute('y1', String(leftCy - r))
    topLine.setAttribute('x2', String(leftCx))
    topLine.setAttribute('y2', '0')
    topLine.setAttribute('stroke', bodyStroke)
    topLine.setAttribute('stroke-width', String(bodyStrokeW))
    topLine.setAttribute('class', 'xfmr-line')
    this.el.appendChild(topLine)

    const topTerm = document.createElementNS(svgNS, 'circle')
    topTerm.setAttribute('cx', String(leftCx))
    topTerm.setAttribute('cy', '0')
    topTerm.setAttribute('r', String(termR))
    topTerm.setAttribute('fill', termFill)
    topTerm.setAttribute('stroke', termStroke)
    topTerm.setAttribute('stroke-width', String(termStrokeW))
    topTerm.setAttribute('class', 'xfmr-terminal')
    this.el.appendChild(topTerm)

    // ── 下端口 2（右圆底部） ──
    const botLine = document.createElementNS(svgNS, 'line')
    botLine.setAttribute('x1', String(rightCx))
    botLine.setAttribute('y1', String(gfxH))
    botLine.setAttribute('x2', String(rightCx))
    botLine.setAttribute('y2', String(rightCy + r))
    botLine.setAttribute('stroke', bodyStroke)
    botLine.setAttribute('stroke-width', String(bodyStrokeW))
    botLine.setAttribute('class', 'xfmr-line')
    this.el.appendChild(botLine)

    const botTerm = document.createElementNS(svgNS, 'circle')
    botTerm.setAttribute('cx', String(rightCx))
    botTerm.setAttribute('cy', String(gfxH))
    botTerm.setAttribute('r', String(termR))
    botTerm.setAttribute('fill', termFill)
    botTerm.setAttribute('stroke', termStroke)
    botTerm.setAttribute('stroke-width', String(termStrokeW))
    botTerm.setAttribute('class', 'xfmr-terminal')
    this.el.appendChild(botTerm)

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || 'Transformer'
    const label = document.createElementNS(svgNS, 'text')
    label.setAttribute('x', String(w / 2))
    label.setAttribute('y', String(h * 0.92))
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'middle')
    label.setAttribute('fill', model.attr('label/fill') || '#e5e7eb')
    label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
    label.setAttribute('font-weight', String(model.attr('label/fontWeight') || 'bold'))
    label.setAttribute('font-family', 'sans-serif')
    label.setAttribute('class', 'xfmr-label')
    label.textContent = labelText
    this.el.appendChild(label)

    this.translate()
  },

  updateAttrs() {
    const bodyStroke = this.model.attr('body/stroke') || '#4ade80'
    const windingStroke = this.model.attr('winding/stroke') || '#4ade80'
    const lines = this.el.querySelectorAll('.xfmr-line')
    lines.forEach((el: Element) => el.setAttribute('stroke', bodyStroke))
    const windings = this.el.querySelectorAll('.xfmr-winding')
    windings.forEach((el: Element) => el.setAttribute('stroke', windingStroke))
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
