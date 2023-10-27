import * as joint from '@clientio/rappid'
import { get } from 'lodash'

export class Select extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Select',
      size: { width: 90, height: 30 },
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' }
      ],
      value: '4'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
export const SelectView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    options: ['RENDER'],
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
          tagName: 'select',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          selector: 'select',
          attributes: {
            name: 'select'
          },
          style: {
            width: '100%',
            height: '100%'
          },
          children: [
            ...model.attributes.options.map((e: any) => ({
              tagName: 'option',
              attributes: {
                value: e.value,
                label: e.label,
                selected: e.value === model.attributes.value
              }
            }))
          ]
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
    change: 'onInputChange'
  },

  onInputChange (evt: Event) {
    const input = evt.target as HTMLSelectElement
    // console.log(select)
    const bindTarget = get(this, 'model.attributes.bind.onChange')
    const bindEvent = get(this, 'model.attributes.bind.event')
    const value = input.value
    let t = `${window.prefix}.${bindTarget} ${value}`
    if (bindEvent) t += `,${window.prefix}.${bindEvent}`
    console.log('Input Change', input.value)
    this.paper.ws.send(t)

    // this.model.attr(input.name + '/value', input.value)
  }
})
