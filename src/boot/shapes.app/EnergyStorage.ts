import * as joint from '@clientio/rappid'
import iconEs from '../../assets/demoimg/icon-energy_ storage_system.png'

/**
 * 电气组件 储能系统（EnergyStorage）
 * 还原 demoimg/储能系统.png 的扁平化示意图：
 *   - 灰白色储能集装箱外形
 *   - 内部电池模组（4×3 单元网格）
 *   - 上方 HVAC / 控制柜斜线条
 *   - 左上角警示三角
 *   - 顶部设备名称（默认 "Battery"）
 *
 * 风格与 DesignMotor / DesignTransformer 保持一致
 */
export class EnergyStorage extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.EnergyStorage',
      size: { width: 150, height: 110 },
    }
  }
}

export const EnergyStorageView = joint.dia.ElementView.extend({
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

    // 设备图片（代替手绘样式）
    const img = document.createElementNS(svgNS, 'image')
    img.setAttribute('href', iconEs)
    img.setAttribute('x', '0')
    img.setAttribute('y', '0')
    img.setAttribute('width', String(w))
    img.setAttribute('height', String(h))
    img.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    this.el.appendChild(img)

    // 设备名称
    const labelText = model.attr('label/text') || 'Battery'
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
      label.setAttribute('class', 'es-label')
      label.textContent = labelText
      this.el.appendChild(label)
    }

    this.translate()
  },

  updateAttrs() {
    // 设备图片固定，仅需刷新设备名称
    const label = this.el.querySelector('.es-label') as Element | null
    if (label) {
      label.textContent = this.model.attr('label/text') || 'Battery'
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
