import * as joint from '@clientio/rappid'

/**
 * 方案设计 隔离开关（DesignSwitch）
 * 对应 GoJS HmiCanvas.vue buildSwitchTemplate：
 *   - 左右两个端子圆（深灰填充 + 灰蓝描边）
 *   - 刀闸水平连线（合闸0° / 分闸-30°）
 *   - 左右进出线
 *   - 底部设备名称标签
 *
 * attrs 来源（gojsToJoint buildSwitchCell 写入）：
 *   portL:     { fill, stroke, strokeWidth }     — 左端子圆样式
 *   portR:     { fill, stroke, strokeWidth }     — 右端子圆样式
 *   blade:     { stroke, strokeWidth }            — 刀闸样式
 *   lineStyle: { stroke, strokeWidth }            — 进出线样式
 *   label:     { text, fill, fontSize }           — 设备名称
 *   on:        boolean                            — 合闸(true) / 分闸(false)
 */
export class DesignSwitch extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.DesignSwitch',
      size: { width: 70, height: 100 },
    }
  }
}

export const DesignSwitchView = joint.dia.ElementView.extend({
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

    // 图形区高度：占节点上部约 55%（给底部标签留空间）
    const gfxH = h * 0.55
    const cy = gfxH * 0.50 // 图形区中心 Y
    const tr = Math.min(w * 0.06, gfxH * 0.12, 4.5) // 端子半径
    const leftX = w * 0.08 // 左端子圆心 X
    const rightX = w * 0.92 // 右端子圆心 X

    const portFill = model.attr('portL/fill') || '#334155'
    const portStroke = model.attr('portL/stroke') || '#94a3b8'
    const portStrokeW = model.attr('portL/strokeWidth') || 1.5
    const bladeStroke = model.attr('blade/stroke') || '#94a3b8'
    const bladeStrokeW = model.attr('blade/strokeWidth') || 2
    const lineStroke = model.attr('lineStyle/stroke') || '#94a3b8'
    const lineStrokeW = model.attr('lineStyle/strokeWidth') || 2
    const on = model.attr('on') !== false // 默认 true（合闸）

    // ── 透明点击区 ──
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // ── 左进线（从左边缘到左端子）──
    const lineL = document.createElementNS(svgNS, 'line')
    lineL.setAttribute('x1', '0')
    lineL.setAttribute('y1', String(cy))
    lineL.setAttribute('x2', String(leftX - tr))
    lineL.setAttribute('y2', String(cy))
    lineL.setAttribute('stroke', lineStroke)
    lineL.setAttribute('stroke-width', String(lineStrokeW))
    lineL.setAttribute('class', 'design-switch-line')
    this.el.appendChild(lineL)

    // ── 左端子圆 ──
    const portL = document.createElementNS(svgNS, 'circle')
    portL.setAttribute('cx', String(leftX))
    portL.setAttribute('cy', String(cy))
    portL.setAttribute('r', String(tr))
    portL.setAttribute('fill', portFill)
    portL.setAttribute('stroke', portStroke)
    portL.setAttribute('stroke-width', String(portStrokeW))
    portL.setAttribute('class', 'design-switch-port')
    this.el.appendChild(portL)

    // ── 刀闸（水平线，绕左端子圆心旋转）──
    const bladeAngle = on ? 0 : -30
    const bladeLen = rightX - leftX

    const bladeGroup = document.createElementNS(svgNS, 'g')
    bladeGroup.setAttribute('transform', `translate(${leftX},${cy}) rotate(${bladeAngle})`)
    bladeGroup.setAttribute('class', 'design-switch-blade-group')

    const blade = document.createElementNS(svgNS, 'line')
    blade.setAttribute('x1', '0')
    blade.setAttribute('y1', '0')
    blade.setAttribute('x2', String(bladeLen))
    blade.setAttribute('y2', '0')
    blade.setAttribute('stroke', bladeStroke)
    blade.setAttribute('stroke-width', String(bladeStrokeW))
    blade.setAttribute('stroke-linecap', 'round')
    blade.setAttribute('class', 'design-switch-blade')
    bladeGroup.appendChild(blade)
    this.el.appendChild(bladeGroup)

    // ── 右端子圆 ──
    const portR = document.createElementNS(svgNS, 'circle')
    portR.setAttribute('cx', String(rightX))
    portR.setAttribute('cy', String(cy))
    portR.setAttribute('r', String(tr))
    portR.setAttribute('fill', portFill)
    portR.setAttribute('stroke', portStroke)
    portR.setAttribute('stroke-width', String(portStrokeW))
    portR.setAttribute('class', 'design-switch-port')
    this.el.appendChild(portR)

    // ── 右出线（从右端子到右边缘）──
    const lineR = document.createElementNS(svgNS, 'line')
    lineR.setAttribute('x1', String(rightX + tr))
    lineR.setAttribute('y1', String(cy))
    lineR.setAttribute('x2', String(w))
    lineR.setAttribute('y2', String(cy))
    lineR.setAttribute('stroke', lineStroke)
    lineR.setAttribute('stroke-width', String(lineStrokeW))
    lineR.setAttribute('class', 'design-switch-line')
    this.el.appendChild(lineR)

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || ''
    if (labelText) {
      const label = document.createElementNS(svgNS, 'text')
      label.setAttribute('x', String(w / 2))
      label.setAttribute('y', String(h * 0.85))
      label.setAttribute('text-anchor', 'middle')
      label.setAttribute('dominant-baseline', 'middle')
      label.setAttribute('fill', model.attr('label/fill') || '#cbd5e1')
      label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
      label.setAttribute('font-family', 'sans-serif')
      label.setAttribute('class', 'design-switch-label')
      label.textContent = labelText
      this.el.appendChild(label)
    }

    this.translate()
  },

  updateAttrs() {
    // 更新刀闸颜色
    const blade = this.el.querySelector('.design-switch-blade') as Element
    if (blade) {
      blade.setAttribute('stroke', this.model.attr('blade/stroke') || '#94a3b8')
    }
    // 更新端子颜色
    const ports = this.el.querySelectorAll('.design-switch-port')
    ports.forEach((p: Element) => {
      p.setAttribute('fill', this.model.attr('portL/fill') || '#334155')
      p.setAttribute('stroke', this.model.attr('portL/stroke') || '#94a3b8')
    })
    // 更新连线颜色
    const lines = this.el.querySelectorAll('.design-switch-line')
    lines.forEach((l: Element) => {
      l.setAttribute('stroke', this.model.attr('lineStyle/stroke') || '#94a3b8')
    })
    // 更新标签
    const label = this.el.querySelector('.design-switch-label') as Element
    if (label) {
      label.setAttribute('fill', this.model.attr('label/fill') || '#cbd5e1')
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
