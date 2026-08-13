import * as joint from '@clientio/rappid'
import iconGrid from '../../assets/demoimg/icon-grid_connection_point.png'

/**
 * 电气组件 并网接入点（GridPoint）
 * 还原 demoimg/并网接入点10kV380V.png 的扁平化示意图：
 *   - 高柜外形（高度大于宽度的窄高柜）
 *   - 柜门分隔线（中部一道竖线）
 *   - 上部显示屏窗口（含两条数据条）
 *   - 中部警示三角
 *   - 顶部铭牌 "10kV / 380V"
 *   - 上 / 下端口圆点
 *   - 底部设备名称（默认 "Grid"）
 *
 * 风格与 DesignMotor / DesignTransformer 保持一致
 */
export class GridPoint extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.GridPoint',
      size: { width: 90, height: 130 },
    }
  }
}

export const GridPointView = joint.dia.ElementView.extend({
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
    img.setAttribute('href', iconGrid)
    img.setAttribute('x', '0')
    img.setAttribute('y', '0')
    img.setAttribute('width', String(w))
    img.setAttribute('height', String(h - 20))
    img.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    this.el.appendChild(img)

    // 设备名称
    const labelText = model.attr('label/text') || 'Grid'
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
      label.setAttribute('class', 'grid-label')
      label.textContent = labelText
      this.el.appendChild(label)
    }

    this.translate()
  },

  updateAttrs() {
    // 设备图片固定，仅需刷新设备名称
    const label = this.el.querySelector('.grid-label') as Element | null
    if (label) {
      label.textContent = this.model.attr('label/text') || 'Grid'
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
