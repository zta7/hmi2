import * as joint from '@clientio/rappid'
import { get } from 'lodash'

export class Slider extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Slider',
      size: { width: 90, height: 30 },
      min: 0,
      max: 100,
      step: 1,
      value: 50
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
export const SliderView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    min: ['RENDER'],
    max: ['RENDER'],
    step: ['RENDER'],
    value: ['RENDER']
  },

  render () {
    const { model } = this
    const { util } = joint
    const online = !window.online
    const rect = {
      tagName: 'rect',
      selector: 'body',
      attributes: {
        stroke: 'transparent',
        fill: 'transparent',
        strokeWidth: 2
      }
    }
    const foreignObject = {
      tagName: 'foreignObject',
      selector: 'foreignObject',
      attributes: {
        overflow: 'hidden',
        width: 120,
        height: 120
      },
      children: [
        {
          tagName: 'input',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          selector: 'slider',
          style: {
            width: '100%',
            height: '100%'
          },
          attributes: {
            type: 'range',
            name: 'slider',
            min: model.attributes.min,
            max: model.attributes.max,
            step: model.attributes.step,
            value: model.attributes.value
          }
        }
      ]
    }

    const markup = online ? [foreignObject, rect] : [rect, foreignObject]

    const doc = util.parseDOMJSON(markup)
    this.body = doc.selectors.body
    this.el.innerHTML = ''
    this.el.appendChild(doc.fragment)
    this.updateSize()
    this.translate()
  },
  confirmUpdate (flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER')) this.render()
    if (this.hasFlag(flags, 'RESIZE')) {
      this.updateSize()
      this.resize(opt)
    }
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
  },
  updateSize () {
    const foreignObject = this.vel.findOne('foreignObject')
    const size = this.model.size()
    foreignObject.setAttribute('width', size.width)
    foreignObject.setAttribute('height', size.height)
    this.body.setAttribute('width', size.width)
    this.body.setAttribute('height', size.height)
  },

  events: {
    'change input': 'onInputChange'
  },

  onInputChange (evt: Event) {
    const input = evt.target as any
    const value = input.value
    this.model.attr(input.name + '/value', input.value)
    const bindTarget = get(this, 'model.attributes.bind.onChange')
    const bindEvent = get(this, 'model.attributes.bind.event')
    let t = `${window.prefix}.${bindTarget} ${value}`
    if (bindEvent) t += `,${window.prefix}.${bindEvent}`
    console.log('Input Change', input.value)
    this.paper.ws.send(t)
  }
})
