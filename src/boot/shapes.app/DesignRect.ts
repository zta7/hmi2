import * as joint from '@clientio/rappid'

/** 信号行高度（px） */
const SIGNAL_ROW_H = 16

/** 信号类型 → 标签配色（深色主题） */
const TYPE_BADGE: Record<string, { bg: string; text: string }> = {
  遥信: { bg: '#1e3a5f', text: '#93c5fd' },
  遥测: { bg: '#713f12', text: '#fcd34d' },
  遥控: { bg: '#14532d', text: '#86efac' },
  遥调: { bg: '#581c87', text: '#c4b5fd' },
}

const DEFAULT_BADGE = { bg: '#374151', text: '#d1d5db' }

/**
 * 方案设计 矩形组件（DesignRect）
 *
 * 还原 GoJS 设计画布中电力组件的视觉效果：
 *   - 圆角矩形主体（深灰底 + 绿色描边）
 *   - 顶部 header 色条 + 文字 + 展开/折叠按钮
 *   - 动态信号行列表（每条信号一行：名称 + 类型标签）
 *   - 折叠时只显示第 1 条信号 + "还有 N 个信号" 提示
 *
 * 外部 property（gojsToJoint 写入）：
 *   signals: [{ name, signalType }, ...]  — 信号列表
 *   attrs.expanded: true|false              — 展开/折叠状态
 *
 * attrs 来源：
 *   body:       { fill, stroke, strokeWidth, rx, ry }
 *   header:     { fill, height }
 *   headerText: { text, fill, fontSize, fontWeight }
 *   label:      { text, fill, fontSize, fontWeight, refY }
 */
export class DesignRect extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.DesignRect',
      size: { width: 180, height: 100 },
      signals: [],
    }
  }
}

export const DesignRectView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM', 'UPDATE_ATTRS'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    attrs: ['UPDATE_ATTRS'],
  },

  events: {
    'click .design-rect-toggle-btn': 'onToggleExpand',
  },

  onToggleExpand(e: MouseEvent) {
    e.stopPropagation()
    const current = this.model.attr('expanded') !== false
    const newExpanded = !current
    this.model.attr('expanded', newExpanded)

    // 重新计算组件高度，让边框跟随内容变化
    const allSignals: Array<unknown> = this.model.get('signals') || []
    const hasHeader = this.model.attr('header/fill')
    const headerH = hasHeader ? (Number(this.model.attr('header/height')) || 18) : 0
    const w = this.model.size().width
    const rows = newExpanded
      ? allSignals.length // 展开：全部信号行
      : allSignals.length > 0
        ? allSignals.length > 1 ? 2 : 1 // 折叠：1 信号行 + 1 提示行
        : 0
    const newH = headerH + rows * SIGNAL_ROW_H + 6
    this.model.resize(w, newH)
    this.render()
  },

  render() {
    const { model } = this
    const size = model.size()
    const svgNS = 'http://www.w3.org/2000/svg'
    const w = size.width
    const h = size.height
    const expanded = model.attr('expanded') !== false

    this.el.innerHTML = ''

    // ── 主体圆角矩形 ──
    {
      const rect = document.createElementNS(svgNS, 'rect')
      rect.setAttribute('x', '0')
      rect.setAttribute('y', '0')
      rect.setAttribute('width', String(w))
      rect.setAttribute('height', String(h))
      rect.setAttribute('fill', model.attr('body/fill') || '#1f2937')
      rect.setAttribute('stroke', model.attr('body/stroke') || '#4ade80')
      rect.setAttribute('stroke-width', String(model.attr('body/strokeWidth') || 1.5))
      rect.setAttribute('rx', String(model.attr('body/rx') || 6))
      rect.setAttribute('ry', String(model.attr('body/ry') || 6))
      rect.setAttribute('class', 'design-rect-body')
      this.el.appendChild(rect)
    }

    // ── Header 色条 + 文字 + 折叠按钮 ──
    const hasHeader = model.attr('header/fill')
    const headerH = hasHeader
      ? Number(model.attr('header/height')) || 18
      : 0

    if (headerH > 0) {
      this._renderHeader(svgNS, w, headerH, expanded)
    }

    // ── 分隔线 ──
    {
      const line = document.createElementNS(svgNS, 'line')
      line.setAttribute('x1', '0')
      line.setAttribute('y1', String(headerH))
      line.setAttribute('x2', String(w))
      line.setAttribute('y2', String(headerH))
      line.setAttribute('stroke', model.attr('body/stroke') || '#4ade80')
      line.setAttribute('stroke-width', '1')
      this.el.appendChild(line)
    }

    // ── 信号行区域 ──
    const allSignals: Array<{ name: string; signalType: string }> =
      model.prop('signals') || model.get('signals') || []

    const visibleSignals = expanded ? allSignals : allSignals.slice(0, 1)
    const rowStartY = headerH + 2

    visibleSignals.forEach((sig, index) => {
      const rowY = rowStartY + index * SIGNAL_ROW_H
      this._renderSignalRow(svgNS, w, rowY, sig)
    })

    // 折叠时提示剩余信号数
    if (!expanded && allSignals.length > 1) {
      const moreY = rowStartY + SIGNAL_ROW_H
      const more = document.createElementNS(svgNS, 'text')
      more.setAttribute('x', String(w / 2))
      more.setAttribute('y', String(moreY))
      more.setAttribute('text-anchor', 'middle')
      more.setAttribute('dominant-baseline', 'central')
      more.setAttribute('fill', '#6b7280')
      more.setAttribute('font-size', '10')
      more.setAttribute('font-style', 'italic')
      more.setAttribute('font-family', 'sans-serif')
      more.setAttribute('class', 'design-rect-more-hint')
      more.textContent = `... 还有 ${allSignals.length - 1} 个信号`
      this.el.appendChild(more)
    }

    this.translate()
  },

  // ── header 色条 + 文字 + 折叠按钮 ──
  _renderHeader(svgNS: string, w: number, headerH: number, expanded: boolean) {
    const { model } = this

    // clip-path（切平底部圆角）
    const clipId = `dr-clip-${model.id || '0'}`
    {
      const defs = document.createElementNS(svgNS, 'defs')
      const cp = document.createElementNS(svgNS, 'clipPath')
      cp.setAttribute('id', clipId)
      const cr = document.createElementNS(svgNS, 'rect')
      cr.setAttribute('x', '0')
      cr.setAttribute('y', '0')
      cr.setAttribute('width', String(w))
      cr.setAttribute('height', String(headerH))
      cr.setAttribute('rx', '6')
      cr.setAttribute('ry', '6')
      cp.appendChild(cr)
      defs.appendChild(cp)
      this.el.appendChild(defs)
    }

    // 色条背景
    {
      const hdr = document.createElementNS(svgNS, 'rect')
      hdr.setAttribute('x', '0')
      hdr.setAttribute('y', '0')
      hdr.setAttribute('width', String(w))
      hdr.setAttribute('height', String(headerH))
      hdr.setAttribute('fill', model.attr('header/fill') || '#111827')
      hdr.setAttribute('clip-path', `url(#${clipId})`)
      hdr.setAttribute('class', 'design-rect-header')
      this.el.appendChild(hdr)
    }

    // header 文字
    if (model.attr('headerText/text')) {
      const ht = document.createElementNS(svgNS, 'text')
      ht.setAttribute('x', String(w / 2))
      ht.setAttribute('y', String(headerH / 2))
      ht.setAttribute('text-anchor', 'middle')
      ht.setAttribute('dominant-baseline', 'central')
      ht.setAttribute('fill', model.attr('headerText/fill') || '#f9fafb')
      ht.setAttribute('font-size', String(model.attr('headerText/fontSize') || 10))
      ht.setAttribute('font-weight', String(model.attr('headerText/fontWeight') || '600'))
      ht.setAttribute('font-family', 'sans-serif')
      ht.setAttribute('class', 'design-rect-headerText')
      ht.textContent = model.attr('headerText/text') || ''
      this.el.appendChild(ht)
    }

    // 折叠按钮（header 右侧）
    {
      const btnSize = headerH - 4
      const btnX = w - btnSize - 3
      const btnY = 2

      const btn = document.createElementNS(svgNS, 'rect')
      btn.setAttribute('x', String(btnX))
      btn.setAttribute('y', String(btnY))
      btn.setAttribute('width', String(btnSize))
      btn.setAttribute('height', String(btnSize))
      btn.setAttribute('rx', '3')
      btn.setAttribute('ry', '3')
      btn.setAttribute('fill', 'rgba(255,255,255,0.12)')
      btn.setAttribute('cursor', 'pointer')
      btn.setAttribute('class', 'design-rect-toggle-btn')
      this.el.appendChild(btn)

      const arrow = document.createElementNS(svgNS, 'text')
      arrow.setAttribute('x', String(btnX + btnSize / 2))
      arrow.setAttribute('y', String(btnY + btnSize / 2))
      arrow.setAttribute('text-anchor', 'middle')
      arrow.setAttribute('dominant-baseline', 'central')
      arrow.setAttribute('fill', '#f9fafb')
      arrow.setAttribute('font-size', '10')
      arrow.setAttribute('font-family', 'sans-serif')
      arrow.setAttribute('pointer-events', 'none')
      arrow.setAttribute('class', 'design-rect-toggle-arrow')
      arrow.textContent = expanded ? '\u25BC' : '\u25B6'
      this.el.appendChild(arrow)
    }
  },

  // ── 单条信号行：名称 + 类型标签 ──
  _renderSignalRow(
    svgNS: string,
    w: number,
    rowY: number,
    sig: { name: string; signalType: string },
  ) {
    const badge = TYPE_BADGE[sig.signalType] || DEFAULT_BADGE
    const padH = 5
    const badgeW = 18
    const badgeH = SIGNAL_ROW_H - 2
    const gap = 6
    const badgeX = padH
    const badgeY = rowY + (SIGNAL_ROW_H - badgeH) / 2

    // 六遥标签（左侧，按类型分色）
    const badgeRect = document.createElementNS(svgNS, 'rect')
    badgeRect.setAttribute('x', String(badgeX))
    badgeRect.setAttribute('y', String(badgeY))
    badgeRect.setAttribute('width', String(badgeW))
    badgeRect.setAttribute('height', String(badgeH))
    badgeRect.setAttribute('rx', '3')
    badgeRect.setAttribute('ry', '3')
    badgeRect.setAttribute('fill', badge.bg)
    badgeRect.setAttribute('class', 'design-rect-sig-badge')
    this.el.appendChild(badgeRect)

    const badgeText = document.createElementNS(svgNS, 'text')
    badgeText.setAttribute('x', String(badgeX + badgeW / 2))
    badgeText.setAttribute('y', String(badgeY + badgeH / 2))
    badgeText.setAttribute('text-anchor', 'middle')
    badgeText.setAttribute('dominant-baseline', 'central')
    badgeText.setAttribute('fill', badge.text)
    badgeText.setAttribute('font-size', '9')
    badgeText.setAttribute('font-family', 'sans-serif')
    badgeText.setAttribute('class', 'design-rect-sig-badge-text')
    badgeText.textContent = sig.signalType || '—'
    this.el.appendChild(badgeText)

    // 信号名称文本（右侧，按可用像素宽度动态截断防溢出）
    const nameX = badgeX + badgeW + gap
    const maxNamePx = Math.max(20, w - nameX - 6) // 右侧留6px内边距
    const fontSize = 10
    // 估算字符宽度：中文≈10px，英文≈6px，取平均7px
    const estCharW = 7
    const maxChars = Math.floor(maxNamePx / estCharW)

    const nameText = document.createElementNS(svgNS, 'text')
    nameText.setAttribute('x', String(nameX))
    nameText.setAttribute('y', String(rowY + SIGNAL_ROW_H / 2))
    nameText.setAttribute('dominant-baseline', 'central')
    nameText.setAttribute('fill', '#e5e7eb')
    nameText.setAttribute('font-size', String(fontSize))
    nameText.setAttribute('font-family', 'sans-serif')
    nameText.setAttribute('class', 'design-rect-sig-name')

    const rawName = sig.name || '—'
    if (rawName.length > maxChars) {
      nameText.textContent = rawName.slice(0, maxChars - 1) + '\u2026'
    } else {
      nameText.textContent = rawName
    }
    this.el.appendChild(nameText)
  },

  // ── 运行时更新 attrs ──
  updateAttrs() {
    const body = this.el.querySelector('.design-rect-body') as Element | null
    if (body) {
      body.setAttribute('stroke', this.model.attr('body/stroke') || '#4ade80')
      body.setAttribute('fill', this.model.attr('body/fill') || '#1f2937')
    }
    const headerText = this.el.querySelector('.design-rect-headerText') as Element | null
    if (headerText) {
      headerText.textContent = this.model.attr('headerText/text') || ''
      headerText.setAttribute('fill', this.model.attr('headerText/fill') || '#f9fafb')
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
