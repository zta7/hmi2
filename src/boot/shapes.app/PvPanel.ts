import * as joint from '@clientio/rappid'
import iconPv from '../../assets/demoimg/icon-photovoltaic.png'

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

    // 透明点击区
    const hitRect = document.createElementNS(svgNS, 'rect')
    hitRect.setAttribute('x', '0')
    hitRect.setAttribute('y', '0')
    hitRect.setAttribute('width', String(w))
    hitRect.setAttribute('height', String(h))
    hitRect.setAttribute('fill', 'transparent')
    hitRect.setAttribute('stroke', 'none')
    this.el.appendChild(hitRect)

    // 设备图片（代替手绘样式）；底部固定预留 20px 文字区，放大组件时间距不随比例变化
    const img = document.createElementNS(svgNS, 'image')
    img.setAttribute('href', iconPv)
    img.setAttribute('x', '0')
    img.setAttribute('y', '0')
    img.setAttribute('width', String(w))
    img.setAttribute('height', String(h - 20))
    img.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    this.el.appendChild(img)

    // 设备名称
    const labelText = model.attr('label/text') || 'PV'
    if (labelText) {
      const label = document.createElementNS(svgNS, 'text')
      label.setAttribute('x', String(w / 2))
      label.setAttribute('y', String(h - 4))
      label.setAttribute('text-anchor', 'middle')
      label.setAttribute('dominant-baseline', 'baseline')
      label.setAttribute('fill', model.attr('label/fill') || '#e5e7eb')
      label.setAttribute('font-size', String(model.attr('label/fontSize') || 11))
      label.setAttribute('font-weight', 'bold')
      label.setAttribute('font-family', 'sans-serif')
      label.setAttribute('class', 'pv-label')
      label.textContent = labelText
      this.el.appendChild(label)
    }

    this.translate()
  },

  updateAttrs() {
    // 设备图片固定，仅需刷新设备名称
    const label = this.el.querySelector('.pv-label') as Element | null
    if (label) {
      label.textContent = this.model.attr('label/text') || 'PV'
      label.setAttribute('fill', this.model.attr('label/fill') || '#e5e7eb')
      label.setAttribute('font-size', String(this.model.attr('label/fontSize') || 11))
    }
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER') || this.hasFlag(flags, 'RESIZE')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'UPDATE_ATTRS')) this.updateAttrs()
  },
})
