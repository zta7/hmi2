import * as joint from '@clientio/rappid'
import { get } from 'lodash'
export class Checkbox extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Checkbox',
      size: { width: 30, height: 30 },
      checked: true
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
export const CheckboxView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    checked: ['RENDER']
  },

  render () {
    const { model } = this
    const { util } = joint
    const online = !window.online
    const isChecked = model.attributes.checked

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
          tagName: 'div',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          attributes: {
            style: `width: 100%; height: 100%; border-radius: 4px; background: ${isChecked ? '#4a9eff' : '#1a1a2e'}; border: 2px solid ${isChecked ? '#4a9eff' : '#3d3d60'}; display: flex; align-items: center; justify-content: center; cursor: pointer;`
          },
          children: isChecked ? [
            {
              tagName: 'svg',
              namespaceURI: 'http://www.w3.org/2000/svg',
              attributes: {
                width: '16',
                height: '16',
                viewBox: '0 0 24 24'
              },
              children: [
                {
                  tagName: 'path',
                  namespaceURI: 'http://www.w3.org/2000/svg',
                  attributes: {
                    d: 'M5 13l4 4L19 7',
                    fill: 'none',
                    stroke: '#ffffff',
                    'stroke-width': '3',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                  }
                }
              ]
            }
          ] : []
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
    // click: 'onClick',
    change: 'onChange'
  },

  // onClick ( ) {
  //   console.log('onClick')
  // },

  onChange (evt: Event) {
    const input = evt.target as any
    const bindTarget = get(this, 'model.attributes.bind.onChange')
    const value = input.checked
    const bindEvent = get(this, 'model.attributes.bind.event')
    let t = `${window.prefix}.${bindTarget} ${value}`
    if (bindEvent) t += `,${window.prefix}.${bindEvent}`
    console.log('Input Change', evt)
    this.paper.ws.send(t)
    // this.model.attr(input.name + '/value', input.value)
  }
})
