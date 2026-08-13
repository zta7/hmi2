import * as joint from '@clientio/rappid'
import iconAc from '../../assets/demoimg/icon-AC-charging-pile.png'
import iconDc from '../../assets/demoimg/icon-DC-charging-pile.png'
import iconDataCenter from '../../assets/demoimg/icon-data-center.png'
import iconCompressor from '../../assets/demoimg/icon-compressor.png'
import iconBuilding from '../../assets/demoimg/icon-residential-building.png'

/**
 * 电气方案新增的 5 个图片型组件：
 *   - 交流充电桩 app.AcChargingPile（icon-AC_charging_pile.png）
 *   - 直流充电桩 app.DcChargingPile（icon-DC_charging_pile.png）
 *   - 数据中心 app.DataCenter（icon-data_center.png）
 *   - 压缩机 app.Compressor（icon-compressor.png）
 *   - 居民楼 app.ResidentialBuilding（icon-residential_building.png）
 *
 * 渲染结构：透明点击区 + 设备图片（等比居中）+ 底部名称标签，
 * 与 AcLoad 等图片组件的实现保持一致。
 */

// 元素类工厂：仅定义 type 与默认尺寸
const createElement = (type: string, width: number, height: number) =>
  class extends joint.dia.Element {
    defaults() {
      return { ...super.defaults, type, size: { width, height } }
    }
  }

// 视图工厂：透明点击区 + 图片 + 名称标签，共用同一套渲染逻辑
const createView = (img: string, defaultLabel: string) =>
  joint.dia.ElementView.extend({
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

      // 设备图片：底部预留文字区域，图片与下方名称之间加大间距
      const labelZone = 20
      const image = document.createElementNS(svgNS, 'image')
      image.setAttribute('href', img)
      image.setAttribute('x', '0')
      image.setAttribute('y', '0')
      image.setAttribute('width', String(w))
      image.setAttribute('height', String(Math.max(h - labelZone, 10)))
      image.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      this.el.appendChild(image)

      // 设备名称
      const labelText = model.attr('label/text') || defaultLabel
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
        label.setAttribute('class', 'ic-label')
        label.textContent = labelText
        this.el.appendChild(label)
      }

      this.translate()
    },

    updateAttrs() {
      // 图片固定，仅需刷新设备名称
      const label = this.el.querySelector('.ic-label') as Element | null
      if (label) {
        label.textContent = this.model.attr('label/text') || defaultLabel
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

// 交流充电桩
export class AcChargingPile extends createElement('app.AcChargingPile', 90, 130) {}
export const AcChargingPileView = createView(iconAc, 'AC Charging')

// 直流充电桩
export class DcChargingPile extends createElement('app.DcChargingPile', 90, 130) {}
export const DcChargingPileView = createView(iconDc, 'DC Charging')

// 数据中心
export class DataCenter extends createElement('app.DataCenter', 150, 110) {}
export const DataCenterView = createView(iconDataCenter, 'Data Center')

// 压缩机
export class Compressor extends createElement('app.Compressor', 130, 110) {}
export const CompressorView = createView(iconCompressor, 'Compressor')

// 居民楼
export class ResidentialBuilding extends createElement('app.ResidentialBuilding', 150, 130) {}
export const ResidentialBuildingView = createView(iconBuilding, 'Building')
