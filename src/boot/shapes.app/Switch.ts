import * as joint from '@clientio/rappid'
import { get } from 'lodash'

export class Switch extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Switch',
      size: { width: 45, height: 45 },
      on: false
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
export const SwitchView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    on: ['RENDER']
  },

  render () {
    const { util } = joint
    const { model } = this
    const online = !window.online
    const isOn = model.attributes.on

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
          attributes: {
            style: `width: 100%; height: 100%; border-radius: 50%; background: ${isOn ? '#4a9eff' : '#1a1a2e'}; border: 2px solid ${isOn ? '#4a9eff' : '#3d3d60'}; display: flex; align-items: center; justify-content: center; cursor: pointer;`
          },
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          children: [
            {
              tagName: 'div',
              attributes: {
                style: `width: 55%; height: 55%; border-radius: 50%; background: ${isOn ? '#ffffff' : '#3d3d60'};`
              },
              namespaceURI: 'http://www.w3.org/1999/xhtml'
            }
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
    // if (this.hasFlag(flags, 'UPDATE')) {
    //   this.update(this.model, null, opt)
    // }
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
    click: 'onClick',
    pointerdown: 'onPointerdown',
    pointerup: 'onPointerup'

  },

  onClick () {
    if (window.online) {
      const bindTarget = get(this, 'model.attributes.bind.onChange')
      const value = !this.model.prop('on')
      this.model.prop('on', value)
      // const bindEvent = get(this, 'model.attributes.bind.event')
      const t = `${window.prefix}.${bindTarget} ${value}`
      // if (bindEvent) t += `,${window.prefix}.${bindEvent}`
      this.paper.ws.send(t)
      // const bindTarget = get(this, 'model.attributes.bind.onClick')
      // this.paper.ws.send(`${window.prefix}.${bindTarget}`)
      // console.log('Button Click')
    }
  }
})
