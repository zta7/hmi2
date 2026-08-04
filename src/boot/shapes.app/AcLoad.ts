import * as joint from '@clientio/rappid'

/**
 * 电气组件 交流负载 / 三相电机（AcLoad）
 * 还原 demoimg/交流负载.png 的扁平化示意图 —— 横向三相异步电机形态：
 *   - 左侧圆形端盖（轴伸端 + 散热风扇叶）
 *   - 中部机壳（横向矩形 + 多道横向散热筋）
 *   - 顶部接线盒（小方块 + 吊环）
 *   - 底部安装脚（左 / 右两块梯形底座）
 *   - 右侧圆形端盖
 *   - 上 / 下端口圆点（左右各一：L1 / L2）
 *   - 底部设备名称标签（默认 "AC Load"）
 *
 * 注意：之前版本设计成"中宽柜 + 散热孔"，跟并网点视觉相似；
 * 现按图片改为电机形态，与并网点（窄高柜）形成差异。
 *
 * 风格与 DesignMotor / DesignTransformer 保持一致
 */
export class AcLoad extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.AcLoad',
      size: { width: 160, height: 110 },
    }
  }
}

export const AcLoadView = joint.dia.ElementView.extend({
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
    const cy = gfxH * 0.50

    const termR = Math.min(w * 0.03, 3)

    const bodyStroke = model.attr('body/stroke') || '#4ade80'
    const bodyStrokeW = model.attr('body/strokeWidth') || 1.5
    const housingFill = model.attr('housing/fill') || '#cbd5e1'
    const housingStroke = model.attr('housing/stroke') || '#475569'
    const fanFill = model.attr('fan/fill') || '#94a3b8'
    const fanStroke = model.attr('fan/stroke') || '#1e293b'
    const finStroke = model.attr('fin/stroke') || '#64748b'
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

    // ── 总体布局尺寸 ──
    // 左端盖（轴伸端）圆心 / 半径
    const leftCapCx = w * 0.20
    const capR = Math.min(gfxH * 0.40, w * 0.12)
    // 右端盖圆心
    const rightCapCx = w * 0.85
    // 机壳矩形（连接左右两个端盖）
    const housingX = leftCapCx
    const housingY = cy - capR * 0.95
    const housingW = rightCapCx - leftCapCx
    const housingH = capR * 1.90

    // ── 机壳主体（圆角矩形） ──
    const housing = document.createElementNS(svgNS, 'rect')
    housing.setAttribute('x', String(housingX))
    housing.setAttribute('y', String(housingY))
    housing.setAttribute('width', String(housingW))
    housing.setAttribute('height', String(housingH))
    housing.setAttribute('rx', String(capR * 0.20))
    housing.setAttribute('ry', String(capR * 0.20))
    housing.setAttribute('fill', housingFill)
    housing.setAttribute('stroke', housingStroke)
    housing.setAttribute('stroke-width', '1.4')
    housing.setAttribute('class', 'ac-housing')
    this.el.appendChild(housing)

    // ── 散热筋（机壳内部的横向细线） ──
    const finCount = 12
    const finGap = housingW / (finCount + 1)
    for (let i = 1; i <= finCount; i++) {
      const fx = housingX + finGap * i
      const fin = document.createElementNS(svgNS, 'line')
      fin.setAttribute('x1', String(fx))
      fin.setAttribute('y1', String(housingY + housingH * 0.18))
      fin.setAttribute('x2', String(fx))
      fin.setAttribute('y2', String(housingY + housingH * 0.82))
      fin.setAttribute('stroke', finStroke)
      fin.setAttribute('stroke-width', '0.8')
      fin.setAttribute('class', 'ac-fin')
      this.el.appendChild(fin)
    }

    // ── 左端盖（轴伸端：外圆 + 内风扇圆 + 转轴） ──
    const leftCap = document.createElementNS(svgNS, 'circle')
    leftCap.setAttribute('cx', String(leftCapCx))
    leftCap.setAttribute('cy', String(cy))
    leftCap.setAttribute('r', String(capR))
    leftCap.setAttribute('fill', fanFill)
    leftCap.setAttribute('stroke', fanStroke)
    leftCap.setAttribute('stroke-width', '1.4')
    leftCap.setAttribute('class', 'ac-cap-left')
    this.el.appendChild(leftCap)

    // 内风扇圆
    const innerFanR = capR * 0.55
    const innerFan = document.createElementNS(svgNS, 'circle')
    innerFan.setAttribute('cx', String(leftCapCx))
    innerFan.setAttribute('cy', String(cy))
    innerFan.setAttribute('r', String(innerFanR))
    innerFan.setAttribute('fill', 'none')
    innerFan.setAttribute('stroke', '#1e293b')
    innerFan.setAttribute('stroke-width', '0.8')
    this.el.appendChild(innerFan)

    // 内风扇叶片（3 条扇骨，120° 等分）
    for (let i = 0; i < 3; i++) {
      const angle = (i * 120 - 90) * Math.PI / 180
      const ex = leftCapCx + innerFanR * 0.95 * Math.cos(angle)
      const ey = cy + innerFanR * 0.95 * Math.sin(angle)
      const blade = document.createElementNS(svgNS, 'line')
      blade.setAttribute('x1', String(leftCapCx))
      blade.setAttribute('y1', String(cy))
      blade.setAttribute('x2', String(ex))
      blade.setAttribute('y2', String(ey))
      blade.setAttribute('stroke', '#1e293b')
      blade.setAttribute('stroke-width', '1.2')
      blade.setAttribute('stroke-linecap', 'round')
      this.el.appendChild(blade)
    }

    // 转轴（向左伸出的小圆柱）
    const shaftW = capR * 0.45
    const shaftH = capR * 0.20
    const shaftX = leftCapCx - capR - shaftW * 0.30
    const shaftY = cy - shaftH / 2
    const shaft = document.createElementNS(svgNS, 'rect')
    shaft.setAttribute('x', String(shaftX))
    shaft.setAttribute('y', String(shaftY))
    shaft.setAttribute('width', String(shaftW))
    shaft.setAttribute('height', String(shaftH))
    shaft.setAttribute('fill', '#94a3b8')
    shaft.setAttribute('stroke', '#1e293b')
    shaft.setAttribute('stroke-width', '1')
    this.el.appendChild(shaft)
    // 轴端帽
    const shaftTip = document.createElementNS(svgNS, 'circle')
    shaftTip.setAttribute('cx', String(shaftX))
    shaftTip.setAttribute('cy', String(cy))
    shaftTip.setAttribute('r', String(shaftH * 0.55))
    shaftTip.setAttribute('fill', '#64748b')
    shaftTip.setAttribute('stroke', '#1e293b')
    shaftTip.setAttribute('stroke-width', '0.8')
    this.el.appendChild(shaftTip)

    // ── 右端盖 ──
    const rightCap = document.createElementNS(svgNS, 'circle')
    rightCap.setAttribute('cx', String(rightCapCx))
    rightCap.setAttribute('cy', String(cy))
    rightCap.setAttribute('r', String(capR))
    rightCap.setAttribute('fill', fanFill)
    rightCap.setAttribute('stroke', fanStroke)
    rightCap.setAttribute('stroke-width', '1.4')
    rightCap.setAttribute('class', 'ac-cap-right')
    this.el.appendChild(rightCap)

    // ── 顶部接线盒 + 吊环 ──
    const jbW = capR * 1.10
    const jbH = capR * 0.55
    const jbX = housingX + housingW * 0.45 - jbW / 2
    const jbY = housingY - jbH - 2
    const jb = document.createElementNS(svgNS, 'rect')
    jb.setAttribute('x', String(jbX))
    jb.setAttribute('y', String(jbY))
    jb.setAttribute('width', String(jbW))
    jb.setAttribute('height', String(jbH))
    jb.setAttribute('fill', '#cbd5e1')
    jb.setAttribute('stroke', '#1e293b')
    jb.setAttribute('stroke-width', '1')
    this.el.appendChild(jb)
    // 接线盒上的小条（分隔线，模拟盒盖）
    const jbLine = document.createElementNS(svgNS, 'line')
    jbLine.setAttribute('x1', String(jbX))
    jbLine.setAttribute('y1', String(jbY + jbH * 0.5))
    jbLine.setAttribute('x2', String(jbX + jbW))
    jbLine.setAttribute('y2', String(jbY + jbH * 0.5))
    jbLine.setAttribute('stroke', '#1e293b')
    jbLine.setAttribute('stroke-width', '0.6')
    this.el.appendChild(jbLine)
    // 吊环（小圆环）
    const ringX = jbX + jbW + jbW * 0.10
    const ringY = jbY + jbH * 0.5
    const ringR = Math.min(jbW * 0.18, 4)
    const ring = document.createElementNS(svgNS, 'circle')
    ring.setAttribute('cx', String(ringX))
    ring.setAttribute('cy', String(ringY))
    ring.setAttribute('r', String(ringR))
    ring.setAttribute('fill', 'none')
    ring.setAttribute('stroke', '#1e293b')
    ring.setAttribute('stroke-width', '1.2')
    this.el.appendChild(ring)

    // ── 底部安装脚（左右两段梯形 / 小矩形底座） ──
    const footW = capR * 0.55
    const footH = gfxH - (housingY + housingH)
    if (footH > 1) {
      const leftFoot = document.createElementNS(svgNS, 'rect')
      leftFoot.setAttribute('x', String(housingX + housingW * 0.10 - footW / 2))
      leftFoot.setAttribute('y', String(housingY + housingH))
      leftFoot.setAttribute('width', String(footW))
      leftFoot.setAttribute('height', String(footH))
      leftFoot.setAttribute('fill', '#94a3b8')
      leftFoot.setAttribute('stroke', '#1e293b')
      leftFoot.setAttribute('stroke-width', '1')
      this.el.appendChild(leftFoot)
      const rightFoot = document.createElementNS(svgNS, 'rect')
      rightFoot.setAttribute('x', String(housingX + housingW * 0.90 - footW / 2))
      rightFoot.setAttribute('y', String(housingY + housingH))
      rightFoot.setAttribute('width', String(footW))
      rightFoot.setAttribute('height', String(footH))
      rightFoot.setAttribute('fill', '#94a3b8')
      rightFoot.setAttribute('stroke', '#1e293b')
      rightFoot.setAttribute('stroke-width', '1')
      this.el.appendChild(rightFoot)
    }

    // ── 上引出线 + 上端口 ──
    const topX = leftCapCx
    const topY = jbY - 4
    const topLine = document.createElementNS(svgNS, 'line')
    topLine.setAttribute('x1', String(topX))
    topLine.setAttribute('y1', '0')
    topLine.setAttribute('x2', String(topX))
    topLine.setAttribute('y2', String(Math.max(topY, 0)))
    topLine.setAttribute('stroke', bodyStroke)
    topLine.setAttribute('stroke-width', String(bodyStrokeW))
    topLine.setAttribute('class', 'ac-line')
    this.el.appendChild(topLine)

    const topTerm = document.createElementNS(svgNS, 'circle')
    topTerm.setAttribute('cx', String(topX))
    topTerm.setAttribute('cy', '0')
    topTerm.setAttribute('r', String(termR))
    topTerm.setAttribute('fill', termFill)
    topTerm.setAttribute('stroke', termStroke)
    topTerm.setAttribute('stroke-width', String(termStrokeW))
    topTerm.setAttribute('class', 'ac-terminal')
    this.el.appendChild(topTerm)

    // ── 下引出线 + 下端口 ──
    const botY = housingY + housingH + (footH > 1 ? footH : 0)
    const botLine = document.createElementNS(svgNS, 'line')
    botLine.setAttribute('x1', String(topX))
    botLine.setAttribute('y1', String(botY))
    botLine.setAttribute('x2', String(topX))
    botLine.setAttribute('y2', String(gfxH))
    botLine.setAttribute('stroke', bodyStroke)
    botLine.setAttribute('stroke-width', String(bodyStrokeW))
    botLine.setAttribute('class', 'ac-line')
    this.el.appendChild(botLine)

    const botTerm = document.createElementNS(svgNS, 'circle')
    botTerm.setAttribute('cx', String(topX))
    botTerm.setAttribute('cy', String(gfxH))
    botTerm.setAttribute('r', String(termR))
    botTerm.setAttribute('fill', termFill)
    botTerm.setAttribute('stroke', termStroke)
    botTerm.setAttribute('stroke-width', String(termStrokeW))
    botTerm.setAttribute('class', 'ac-terminal')
    this.el.appendChild(botTerm)

    // ── 设备名称 ──
    const labelText = model.attr('label/text') || 'AC Load'
    const label = document.createElementNS(svgNS, 'text')
    label.setAttribute('x', String(w / 2))
    label.setAttribute('y', String(h * 0.92))
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'middle')
    label.setAttribute('fill', model.attr('label/fill') || '#e5e7eb')
    label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
    label.setAttribute('font-weight', String(model.attr('label/fontWeight') || 'bold'))
    label.setAttribute('font-family', 'sans-serif')
    label.setAttribute('class', 'ac-label')
    label.textContent = labelText
    this.el.appendChild(label)

    this.translate()
  },

  updateAttrs() {
    const bodyStroke = this.model.attr('body/stroke') || '#4ade80'
    const lines = this.el.querySelectorAll('.ac-line')
    lines.forEach((el: Element) => el.setAttribute('stroke', bodyStroke))
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
