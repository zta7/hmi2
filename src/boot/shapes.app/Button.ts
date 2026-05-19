import * as joint from '@clientio/rappid'
import { get } from 'lodash'

export class Button extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Button',
      size: { width: 90, height: 30 },
      text: '按钮',
      background: '#ffffff'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
export const ButtonView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    text: ['RENDER'],
    background: ['RENDER']
  },

  render () {
    const { util } = joint
    const { model } = this
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
          tagName: 'button',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          selector: 'button',
          attributes: {
            'data-content': model.attributes.text,
            type: 'button'
          },
          style: {
            width: '100%',
            height: '100%',
            background: '#1a1a2e',
            border: '1px solid #4a9eff',
            borderRadius: '4px',
            color: '#4a9eff',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'sans-serif',
            cursor: 'pointer',
            outline: 'none',
            padding: '0 12px',
            boxSizing: 'border-box'
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
      const bindTarget = get(this, 'model.attributes.bind.onClick')
      this.paper.ws.send(`${window.prefix}.${bindTarget}`)
      console.log(`${window.prefix}.${bindTarget}`)
    }
  },

  onPointerdown (event: any) {
    if (window.online) {
      // const output = get(this, 'model.attributes.bind.output')
      // this.paper.ws.send(`${window.prefix}.${output} 1`)
    }
  },

  onPointerup (event: any) {
    if (window.online) {
      // const output = get(this, 'model.attributes.bind.output')
      // this.paper.ws.send(`${window.prefix}.${output} 0`)
    }
  }
})
