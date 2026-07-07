import * as joint from '@clientio/rappid'

/**
 * 方案设计 电机/发电机（DesignMotor）
 * 对应 GoJS HmiCanvas.vue buildMotorTemplate：
 *   - 圆形主体（绿色描边，透明填充）
 *   - 中心字母（subType，如 'G' 发电机/'M' 电动机）
 *   - 上下接线端圆点（黄色 fill）
 *   - 上下引出线
 *   - 底部设备名称标签
 *
 * attrs 来源（gojsToJoint buildMotorCell 写入）：
 *   body:     { stroke, strokeWidth }         — 主体圆样式
 *   terminal: { fill, stroke, strokeWidth }   — 接线端样式
 *   subType:  { text, stroke, fontSize, fontWeight }  — 中心字母
 *   label:    { text, fill, fontSize, fontWeight }
 */
export class DesignMotor extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.DesignMotor',
      size: { width: 80, height: 110 },
    }
  }
}

export const DesignMotorView = joint.dia.ElementView.extend({
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

    // 图形区占节点上部约 65%，底部给标签
    const gfxH = h * 0.65
    const cx = w / 2
    const cy = gfxH / 2

    // 主体圆半径
    const bodyR = Math.min(w * 0.30, gfxH * 0.38, 22)
    const termR = Math.min(w * 0.04, 3.5)

    const bodyStroke = model.attr('body/stroke') || '#4ade80'
    const bodyStrokeW = model.attr('body/strokeWidth') || 2
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

    // ── 上接线端圆点 ──
    const topTerm = document.createElementNS(svgNS, 'circle')
    topTerm.setAttribute('cx', String(cx))
    topTerm.setAttribute('cy', '0')
    topTerm.setAttribute('r', String(termR))
    topTerm.setAttribute('fill', termFill)
    topTerm.setAttribute('stroke', termStroke)
    topTerm.setAttribute('stroke-width', String(termStrokeW))
    topTerm.setAttribute('class', 'design-motor-terminal')
    this.el.appendChild(topTerm)

    // ── 上引出线 ──
    const topLine = document.createElementNS(svgNS, 'line')
    topLine.setAttribute('x1', String(cx))
    topLine.setAttribute('y1', String(termR))
    topLine.setAttribute('x2', String(cx))
    topLine.setAttribute('y2', String(cy - bodyR))
    topLine.setAttribute('stroke', bodyStroke)
    topLine.setAttribute('stroke-width', String(bodyStrokeW))
    topLine.setAttribute('class', 'design-motor-line')
    this.el.appendChild(topLine)

    // ── 主体圆 ──
    const body = document.createElementNS(svgNS, 'circle')
    body.setAttribute('cx', String(cx))
    body.setAttribute('cy', String(cy))
    body.setAttribute('r', String(bodyR))
    body.setAttribute('fill', 'transparent')
    body.setAttribute('stroke', bodyStroke)
    body.setAttribute('stroke-width', String(bodyStrokeW))
    body.setAttribute('class', 'design-motor-body')
    this.el.appendChild(body)

    // ── 中心字母 ──
    const subText = model.attr('subType/text') || 'G'
    if (subText) {
      const centerLetter = document.createElementNS(svgNS, 'text')
      centerLetter.setAttribute('x', String(cx))
      centerLetter.setAttribute('y', String(cy))
      centerLetter.setAttribute('text-anchor', 'middle')
      centerLetter.setAttribute('dominant-baseline', 'central')
      centerLetter.setAttribute('fill', model.attr('subType/stroke') || '#4ade80')
      centerLetter.setAttribute('font-size', String(model.attr('subType/fontSize') || 18))
      centerLetter.setAttribute('font-weight', String(model.attr('subType/fontWeight') || 'bold'))
      centerLetter.setAttribute('font-family', 'sans-serif')
      centerLetter.setAttribute('class', 'design-motor-subtype')
      centerLetter.textContent = subText
      this.el.appendChild(centerLetter)
    }

    // ── 下引出线 ──
    const botLine = document.createElementNS(svgNS, 'line')
    botLine.setAttribute('x1', String(cx))
    botLine.setAttribute('y1', String(cy + bodyR))
    botLine.setAttribute('x2', String(cx))
    botLine.setAttribute('y2', String(gfxH - termR))
    botLine.setAttribute('stroke', bodyStroke)
    botLine.setAttribute('stroke-width', String(bodyStrokeW))
    botLine.setAttribute('class', 'design-motor-line')
    this.el.appendChild(botLine)

    // ── 下接线端圆点 ──
    const botTerm = document.createElementNS(svgNS, 'circle')
    botTerm.setAttribute('cx', String(cx))
    botTerm.setAttribute('cy', String(gfxH))
    botTerm.setAttribute('r', String(termR))
    botTerm.setAttribute('fill', termFill)
    botTerm.setAttribute('stroke', termStroke)
    botTerm.setAttribute('stroke-width', String(termStrokeW))
    botTerm.setAttribute('class', 'design-motor-terminal')
    this.el.appendChild(botTerm)

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
      label.setAttribute('class', 'design-motor-label')
      label.textContent = labelText
      this.el.appendChild(label)
    }

    this.translate()
  },

  updateAttrs() {
    const bodyStroke = this.model.attr('body/stroke') || '#4ade80'
    // 更新主体圆
    const body = this.el.querySelector('.design-motor-body') as Element
    if (body) {
      body.setAttribute('stroke', bodyStroke)
    }
    // 更新引出线
    const lines = this.el.querySelectorAll('.design-motor-line')
    lines.forEach((el: Element) => {
      el.setAttribute('stroke', bodyStroke)
    })
    // 更新中心字母
    const sub = this.el.querySelector('.design-motor-subtype') as Element
    if (sub) {
      sub.setAttribute('fill', this.model.attr('subType/stroke') || '#4ade80')
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
