import * as joint from '@clientio/rappid'

/**
 * 方案设计 隔离开关（DesignSwitch）- 垂直布局（向右旋转90°）
 * 对应 GoJS HmiCanvas.vue buildSwitchTemplate：
 *   - 上下两个端子圆（深灰填充 + 灰蓝描边）
 *   - 刀闸垂直连线（合闸0° / 分闸+30°顺时针翘起）
 *   - 上下进出线
 *   - 底部设备名称标签（文字方向不变）
 *
 * attrs 来源（gojsToJoint buildSwitchCell 写入）：
 *   portL:     { fill, stroke, strokeWidth }     — 上端子圆样式
 *   portR:     { fill, stroke, strokeWidth }     — 下端子圆样式
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
      size: { width: 40, height: 80 },
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

    // 图形区高度：占节点上部约 75%（给底部标签留空间）
    const gfxH = h * 0.75
    const cx = w * 0.5 // 水平中心 X
    const tr = Math.min(w * 0.1, gfxH * 0.06, 4.5) // 端子半径
    const topY = gfxH * 0.18 // 上端子圆心 Y
    const bottomY = gfxH * 0.80 // 下端子圆心 Y

    const portFill = model.attr('portL/fill') || '#334155'
    const portStroke = model.attr('portL/stroke') || '#94a3b8'
    const portStrokeW = model.attr('portL/strokeWidth') || 1.5
    const bladeStroke = model.attr('blade/stroke') || '#94a3b8'
    const bladeStrokeW = model.attr('blade/strokeWidth') || 2
    const lineStroke = model.attr('lineStyle/stroke') || '#94a3b8'
    const lineStrokeW = model.attr('lineStyle/strokeWidth') || 2
    const on = model.attr('on') !== '0' && model.attr('on') !== false && model.attr('on') != null

    // ── 透明点击区 ──
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // ── 上进线（从上边缘到上端子）──
    const lineT = document.createElementNS(svgNS, 'line')
    lineT.setAttribute('x1', String(cx))
    lineT.setAttribute('y1', '0')
    lineT.setAttribute('x2', String(cx))
    lineT.setAttribute('y2', String(topY - tr))
    lineT.setAttribute('stroke', lineStroke)
    lineT.setAttribute('stroke-width', String(lineStrokeW))
    lineT.setAttribute('class', 'design-switch-line')
    this.el.appendChild(lineT)

    // ── 上端子圆 ──
    const portT = document.createElementNS(svgNS, 'circle')
    portT.setAttribute('cx', String(cx))
    portT.setAttribute('cy', String(topY))
    portT.setAttribute('r', String(tr))
    portT.setAttribute('fill', portFill)
    portT.setAttribute('stroke', portStroke)
    portT.setAttribute('stroke-width', String(portStrokeW))
    portT.setAttribute('class', 'design-switch-port')
    this.el.appendChild(portT)

    // ── 刀闸（垂直线，绕上端子圆心旋转）──
    const bladeAngle = on ? 0 : 30
    const bladeLen = bottomY - topY

    const bladeGroup = document.createElementNS(svgNS, 'g')
    bladeGroup.setAttribute('transform', `translate(${cx},${topY}) rotate(${bladeAngle})`)
    bladeGroup.setAttribute('data-cx', String(cx))
    bladeGroup.setAttribute('data-top-y', String(topY))
    bladeGroup.setAttribute('class', 'design-switch-blade-group')

    const blade = document.createElementNS(svgNS, 'line')
    blade.setAttribute('x1', '0')
    blade.setAttribute('y1', '0')
    blade.setAttribute('x2', '0')
    blade.setAttribute('y2', String(bladeLen))
    blade.setAttribute('stroke', bladeStroke)
    blade.setAttribute('stroke-width', String(bladeStrokeW))
    blade.setAttribute('stroke-linecap', 'round')
    blade.setAttribute('class', 'design-switch-blade')
    bladeGroup.appendChild(blade)
    this.el.appendChild(bladeGroup)

    // ── 下端子圆 ──
    const portB = document.createElementNS(svgNS, 'circle')
    portB.setAttribute('cx', String(cx))
    portB.setAttribute('cy', String(bottomY))
    portB.setAttribute('r', String(tr))
    portB.setAttribute('fill', portFill)
    portB.setAttribute('stroke', portStroke)
    portB.setAttribute('stroke-width', String(portStrokeW))
    portB.setAttribute('class', 'design-switch-port')
    this.el.appendChild(portB)

    // ── 下出线（从下端子到下边缘）──
    const lineB = document.createElementNS(svgNS, 'line')
    lineB.setAttribute('x1', String(cx))
    lineB.setAttribute('y1', String(bottomY + tr))
    lineB.setAttribute('x2', String(cx))
    lineB.setAttribute('y2', String(gfxH))
    lineB.setAttribute('stroke', lineStroke)
    lineB.setAttribute('stroke-width', String(lineStrokeW))
    lineB.setAttribute('class', 'design-switch-line')
    this.el.appendChild(lineB)

    // ── 设备名称（文字方向不变，在图形区下方）──
    const labelText = model.attr('label/text') || ''
    if (labelText) {
      const label = document.createElementNS(svgNS, 'text')
      label.setAttribute('x', String(w / 2))
      label.setAttribute('y', String(h * 0.92))
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
      const newText = this.model.attr('label/text') || ''
      if (label.textContent !== newText) label.textContent = newText
    }
    // 更新刀闸角度（运行时 on 属性变化）
    const bladeGroup = this.el.querySelector('.design-switch-blade-group') as Element
    if (bladeGroup) {
      const on = this.model.attr('on') !== '0' && this.model.attr('on') !== false && this.model.attr('on') != null
      const bladeAngle = on ? 0 : 30
      const cx = bladeGroup.getAttribute('data-cx') || '0'
      const topY = bladeGroup.getAttribute('data-top-y') || '0'
      bladeGroup.setAttribute('transform', `translate(${cx},${topY}) rotate(${bladeAngle})`)
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
