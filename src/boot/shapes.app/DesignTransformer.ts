import * as joint from '@clientio/rappid'

/**
 * 方案设计 变压器（DesignTransformer）
 * 对应 GoJS HmiCanvas.vue buildTransformerTemplate — IEC 60617 双绕组变压器符号：
 *   - 上下接线端圆点（黄色 fill）
 *   - 上下引出线
 *   - 一次绕组（上半圆弧 + 中心点）
 *   - 二次绕组（下半圆弧 + 中心点）
 *   - 铁芯竖线
 *   - 左上角型号标签（subType，如 'T'）
 *   - 底部设备名称标签
 *
 * attrs 来源（gojsToJoint buildTransformerCell 写入）：
 *   terminal: { fill, stroke, strokeWidth }   — 接线端样式
 *   winding:  { stroke, strokeWidth }          — 绕组圆弧样式
 *   core:     { stroke, strokeWidth }          — 铁芯线样式
 *   subType:  { text, fill, fontSize }         — 型号文字
 *   label:    { text, fill, fontSize, fontWeight }
 */
export class DesignTransformer extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.DesignTransformer',
      size: { width: 90, height: 120 },
    }
  }
}

export const DesignTransformerView = joint.dia.ElementView.extend({
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

    // 图形区占节点上部约 65%，底部给标签
    const gfxH = h * 0.65
    const cx = w / 2
    const cy = gfxH / 2

    const arcR = Math.min(w * 0.20, gfxH * 0.22, 18)
    const arcGap = arcR * 0.25 // 上下圆弧间距
    const dotR = 1.5 // 绕组中心点半径

    const wStroke = model.attr('winding/stroke') || '#4ade80'
    const wStrokeW = model.attr('winding/strokeWidth') || 2.5
    const coreStroke = model.attr('core/stroke') || '#4ade80'
    const coreStrokeW = model.attr('core/strokeWidth') || 1

    // ── 透明点击区 ──
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // ── 一次绕组（上半圆弧）──
    const primaryArc = document.createElementNS(svgNS, 'path')
    const arcY1 = cy - arcGap
    const arcX1 = cx - arcR
    const arcX2 = cx + arcR
    primaryArc.setAttribute('d', `M ${arcX1} ${arcY1} A ${arcR} ${arcR} 0 0 1 ${arcX2} ${arcY1}`)
    primaryArc.setAttribute('fill', 'transparent')
    primaryArc.setAttribute('stroke', wStroke)
    primaryArc.setAttribute('stroke-width', String(wStrokeW))
    primaryArc.setAttribute('class', 'design-transformer-winding')
    this.el.appendChild(primaryArc)

    // ── 一次绕组中心点 ──
    const primaryDot = document.createElementNS(svgNS, 'circle')
    primaryDot.setAttribute('cx', String(cx))
    primaryDot.setAttribute('cy', String(arcY1 + arcR * 0.55))
    primaryDot.setAttribute('r', String(dotR))
    primaryDot.setAttribute('fill', wStroke)
    primaryDot.setAttribute('class', 'design-transformer-dot')
    this.el.appendChild(primaryDot)

    // ── 铁芯竖线 ──
    // (叠在圆弧之间，从一次绕组底部到二次绕组顶部)
    const coreTop = arcY1 + arcR // 一次绕组底部 ≈ arcY1 + arcR
    const coreBot = cy + arcGap - arcR // 二次绕组顶部 ≈ cy + arcGap - arcR
    const coreLine = document.createElementNS(svgNS, 'line')
    coreLine.setAttribute('x1', String(cx))
    coreLine.setAttribute('y1', String(coreTop))
    coreLine.setAttribute('x2', String(cx))
    coreLine.setAttribute('y2', String(coreBot + arcR)) // 延伸到二次绕组中心点处
    coreLine.setAttribute('stroke', coreStroke)
    coreLine.setAttribute('stroke-width', String(coreStrokeW))
    coreLine.setAttribute('class', 'design-transformer-core')
    this.el.appendChild(coreLine)

    // ── 二次绕组（下半圆弧）──
    const arcY2 = cy + arcGap
    const secondaryArc = document.createElementNS(svgNS, 'path')
    secondaryArc.setAttribute('d', `M ${arcX2} ${arcY2} A ${arcR} ${arcR} 0 0 1 ${arcX1} ${arcY2}`)
    secondaryArc.setAttribute('fill', 'transparent')
    secondaryArc.setAttribute('stroke', wStroke)
    secondaryArc.setAttribute('stroke-width', String(wStrokeW))
    secondaryArc.setAttribute('class', 'design-transformer-winding')
    this.el.appendChild(secondaryArc)

    // ── 二次绕组中心点 ──
    const secDot = document.createElementNS(svgNS, 'circle')
    secDot.setAttribute('cx', String(cx))
    secDot.setAttribute('cy', String(arcY2 - arcR * 0.55))
    secDot.setAttribute('r', String(dotR))
    secDot.setAttribute('fill', wStroke)
    secDot.setAttribute('class', 'design-transformer-dot')
    this.el.appendChild(secDot)

    // ── 型号标签（左上角）──
    const subText = model.attr('subType/text') || 'T'
    if (subText) {
      const subLabel = document.createElementNS(svgNS, 'text')
      subLabel.setAttribute('x', String(w * 0.08))
      subLabel.setAttribute('y', String(gfxH * 0.05))
      subLabel.setAttribute('text-anchor', 'start')
      subLabel.setAttribute('dominant-baseline', 'hanging')
      subLabel.setAttribute('fill', model.attr('subType/fill') || '#facc15')
      subLabel.setAttribute('font-size', String(model.attr('subType/fontSize') || 9))
      subLabel.setAttribute('font-weight', 'bold')
      subLabel.setAttribute('font-family', 'sans-serif')
      subLabel.setAttribute('class', 'design-transformer-subtype')
      subLabel.textContent = subText
      this.el.appendChild(subLabel)
    }

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || ''
    if (labelText) {
      const label = document.createElementNS(svgNS, 'text')
      label.setAttribute('x', String(w / 2))
      label.setAttribute('y', String(h * 0.88))
      label.setAttribute('text-anchor', 'middle')
      label.setAttribute('dominant-baseline', 'middle')
      label.setAttribute('fill', model.attr('label/fill') || '#e5e7eb')
      label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
      label.setAttribute('font-weight', String(model.attr('label/fontWeight') || 'bold'))
      label.setAttribute('font-family', 'sans-serif')
      label.setAttribute('class', 'design-transformer-label')
      label.textContent = labelText
      this.el.appendChild(label)
    }

    this.translate()
  },

  updateAttrs() {
    const wStroke = this.model.attr('winding/stroke') || '#4ade80'
    // 更新绕组颜色
    const windings = this.el.querySelectorAll('.design-transformer-winding')
    windings.forEach((el: Element) => {
      el.setAttribute('stroke', wStroke)
    })
    // 更新引出线颜色
    const lines = this.el.querySelectorAll('.design-transformer-line')
    lines.forEach((el: Element) => {
      el.setAttribute('stroke', wStroke)
    })
    // 更新绕组中心点颜色
    const dots = this.el.querySelectorAll('.design-transformer-dot')
    dots.forEach((el: Element) => {
      el.setAttribute('fill', wStroke)
    })
    // 更新铁芯颜色
    const core = this.el.querySelector('.design-transformer-core') as Element
    if (core) {
      core.setAttribute('stroke', this.model.attr('core/stroke') || '#4ade80')
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
