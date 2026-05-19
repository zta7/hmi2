import * as joint from '@clientio/rappid'
import { get } from 'lodash'

export class LightButton extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.LightButton',
      size: { width: 90, height: 30 },
      text: '按钮',
      background: '#ffffff'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
export const LightButtonView = joint.dia.ElementView.extend({
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
            border: '2px solid #e15656',
            borderRadius: '50%',
            color: '#e15656',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'sans-serif',
            cursor: 'pointer',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
      console.log('Button Click')
    }
  }

  // onPointerdown (event: any) {
  //   if (window.online) {
  //     const output = get(this, 'model.attributes.bind.output')
  //     this.paper.ws.send(`${window.prefix}.${output} 1`)
  //   }
  // },

  // onPointerup (event: any) {
  //   if (window.online) {
  //     const output = get(this, 'model.attributes.bind.output')
  //     this.paper.ws.send(`${window.prefix}.${output} 0`)
  //   }
  // }
})
