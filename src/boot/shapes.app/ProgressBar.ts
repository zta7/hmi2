import * as joint from '@clientio/rappid'
import { get } from 'lodash'

export class ProgressBar extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.ProgressBar',
      size: { width: 160, height: 30 },
      min: 0,
      max: 100,
      value: 60,
      barColor: '#4a9eff',
      bgColor: '#2a2a3e',
      showLabel: true,
      direction: 'horizontal' // 'horizontal' | 'vertical'
    }
  }
}

export const ProgressBarView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    value: ['RENDER'],
    min: ['RENDER'],
    max: ['RENDER'],
    barColor: ['RENDER'],
    bgColor: ['RENDER'],
    showLabel: ['RENDER'],
    direction: ['RENDER']
  },

  render () {
    const { model } = this
    const { util } = joint
    const { value, min, max, barColor, bgColor, showLabel, direction } = model.attributes
    const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
    const isVertical = direction === 'vertical'

    const barStyle = isVertical
      ? `width:100%;height:${pct}%;background:${barColor};position:absolute;bottom:0;left:0;transition:height 0.3s;border-radius:2px;`
      : `height:100%;width:${pct}%;background:${barColor};position:absolute;top:0;left:0;transition:width 0.3s;border-radius:2px;`

    const markup = [
      {
        tagName: 'rect',
        selector: 'body',
        attributes: { stroke: 'transparent', fill: 'transparent' }
      },
      {
        tagName: 'foreignObject',
        selector: 'foreignObject',
        attributes: { overflow: 'hidden', width: 160, height: 30 },
        children: [{
          tagName: 'div',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          attributes: {
            style: `width:100%;height:100%;background:${bgColor};border-radius:4px;position:relative;overflow:hidden;border:1px solid #555577;box-sizing:border-box;`
          },
          children: [
            {
              tagName: 'div',
              attributes: { style: barStyle }
            },
            ...(showLabel ? [{
              tagName: 'div',
              attributes: {
                style: 'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#e0e0e0;font-size:11px;font-family:sans-serif;pointer-events:none;'
              },
              children: [{
                tagName: 'span',
                attributes: { 'data-content': `${value}` }
              }]
            }] : [])
          ]
        }]
      }
    ]

    const doc = util.parseDOMJSON(markup)
    this.body = doc.selectors.body
    this.el.innerHTML = ''
    this.el.appendChild(doc.fragment)
    this.updateSize()
    this.translate()
  },

  confirmUpdate (flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER')) this.render()
    if (this.hasFlag(flags, 'RESIZE')) { this.updateSize(); this.resize(opt) }
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
  },

  updateSize () {
    const fo = this.vel.findOne('foreignObject')
    const { width, height } = this.model.size()
    fo.setAttribute('width', width)
    fo.setAttribute('height', height)
    this.body.setAttribute('width', width)
    this.body.setAttribute('height', height)
  }
})
