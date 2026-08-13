import * as joint from '@clientio/rappid'

/**
 * 电气组件 变压器（Transformer）
 * 双绕组变压器简化符号：
 *   - 上下两个等大圆环（水平居中、垂直排列，共用同一圆心 x 坐标）作为一次 / 二次绕组
 *   - 底部设备名称（默认 "Transformer"）
 *
 * 与 DesignTransformer 区别：
 *   DesignTransformer 用 IEC 60617 双绕组符号（上下两个半圆 + 铁芯竖线）；
 *   本组件用两个独立圆环的简化符号。
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

    // 图形区高度：底部固定预留 20px 文字区，放大组件时图形与文字间距不随比例变化
    const gfxH = h - 20
    const cx = w / 2
    const cy = gfxH * 0.72

    const bodyStroke = model.attr('body/stroke') || '#4ade80'
    const bodyStrokeW = model.attr('body/strokeWidth') || 1.5
    const windingStroke = model.attr('winding/stroke') || '#4ade80'
    const windingStrokeW = model.attr('winding/strokeWidth') || 2

    // 两个圆环上下排列、水平居中：下圆顶部与上圆圆心重合
    const r = Math.min(w * 0.3, gfxH * 0.14)
    const topCy = cy - r / 2 // 上圆圆心（整体垂直居中）
    const botCy = topCy + r // 下圆顶部落在上圆圆心处

    // ── 透明点击区 ──
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // ── 上绕组圆环（一次） ──
    const topCircle = document.createElementNS(svgNS, 'circle')
    topCircle.setAttribute('cx', String(cx))
    topCircle.setAttribute('cy', String(topCy))
    topCircle.setAttribute('r', String(r))
    topCircle.setAttribute('fill', 'transparent')
    topCircle.setAttribute('stroke', windingStroke)
    topCircle.setAttribute('stroke-width', String(windingStrokeW))
    topCircle.setAttribute('class', 'xfmr-winding')
    this.el.appendChild(topCircle)

    // ── 下绕组圆环（二次） ──
    const botCircle = document.createElementNS(svgNS, 'circle')
    botCircle.setAttribute('cx', String(cx))
    botCircle.setAttribute('cy', String(botCy))
    botCircle.setAttribute('r', String(r))
    botCircle.setAttribute('fill', 'transparent')
    botCircle.setAttribute('stroke', windingStroke)
    botCircle.setAttribute('stroke-width', String(windingStrokeW))
    botCircle.setAttribute('class', 'xfmr-winding')
    this.el.appendChild(botCircle)

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || 'Transformer'
    const label = document.createElementNS(svgNS, 'text')
    label.setAttribute('x', String(w / 2))
    label.setAttribute('y', String(h - 4))
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'baseline')
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
    const windingStrokeW = this.model.attr('winding/strokeWidth') || 2
    const lines = this.el.querySelectorAll('.xfmr-line')
    lines.forEach((el: Element) => el.setAttribute('stroke', bodyStroke))
    const windings = this.el.querySelectorAll('.xfmr-winding')
    windings.forEach((el: Element) => {
      el.setAttribute('stroke', windingStroke)
      el.setAttribute('stroke-width', String(windingStrokeW))
    })
    // 更新组件名称
    const label = this.el.querySelector('.xfmr-label') as Element | null
    if (label) {
      label.textContent = this.model.attr('label/text') || 'Transformer'
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
