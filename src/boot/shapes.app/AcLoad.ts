import * as joint from '@clientio/rappid'
import iconLoad1 from '../../assets/demoimg/icon-communication-load-1.png'
import iconLoad2 from '../../assets/demoimg/icon-communication-load-2.png'

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

    // 设备图片（代替手绘样式）；按组件类型区分：AcLoad2 用「交流负载#2」图标，AcLoad 用 #1
    // 图片区域高度 = h - 20：底部固定预留文字区，放大组件时图片与文字间距不随比例变化
    const labelText = model.attr('label/text') || 'AC Load'
    const imgHref = model.get('type') === 'app.AcLoad2' ? iconLoad2 : iconLoad1
    const img = document.createElementNS(svgNS, 'image')
    img.setAttribute('href', imgHref)
    img.setAttribute('x', '0')
    img.setAttribute('y', '0')
    img.setAttribute('width', String(w))
    img.setAttribute('height', String(h - 20))
    img.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    this.el.appendChild(img)

    // 设备名称
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
      label.setAttribute('class', 'ac-label')
      label.textContent = labelText
      this.el.appendChild(label)
    }

    this.translate()
  },

  updateAttrs() {
    // 设备图片固定，仅需刷新设备名称
    const label = this.el.querySelector('.ac-label') as Element | null
    if (label) {
      label.textContent = this.model.attr('label/text') || 'AC Load'
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

/**
 * 交流负载 #2：独立组件类型，复用 AcLoad 的渲染逻辑，
 * 仅由 render 中按 type 判断使用「交流负载#2」图标（icon-communication_load#2.png）
 */
export class AcLoad2 extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'app.AcLoad2',
      size: { width: 160, height: 110 }
    }
  }
}

export const AcLoad2View = AcLoadView.extend({})
