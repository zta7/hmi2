import * as joint from '@clientio/rappid'
import { get } from 'lodash'

// MultiStateButton: cycles through states on click, writes value to output variable
export class MultiStateButton extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.MultiStateButton',
      size: { width: 90, height: 36 },
      currentIndex: 0,
      states: [
        { value: 0, label: 'OFF', color: '#555577', textColor: '#e0e0e0' },
        { value: 1, label: 'ON', color: '#4a9eff', textColor: '#ffffff' }
      ]
    }
  }
}

export const MultiStateButtonView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    currentIndex: ['RENDER'],
    states: ['RENDER']
  },

  render () {
    const { model } = this
    const { util } = joint
    const { currentIndex, states } = model.attributes
    const current = states[currentIndex % states.length]
    const { label, color, textColor } = current

    const markup = [
      {
        tagName: 'rect',
        selector: 'body',
        attributes: { stroke: 'transparent', fill: 'transparent' }
      },
      {
        tagName: 'foreignObject',
        selector: 'foreignObject',
        attributes: { overflow: 'hidden', width: 90, height: 36 },
        children: [{
          tagName: 'button',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          selector: 'button',
          attributes: {
            'data-content': label,
            style: `width:100%;height:100%;background:${color};color:${textColor};border:1px solid #555577;border-radius:4px;font-size:12px;font-family:sans-serif;font-weight:600;cursor:pointer;box-sizing:border-box;`
          }
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
  },

  events: { click: 'onClick' },

  onClick () {
    if (window.online) {
      const { states, currentIndex } = this.model.attributes
      const nextIndex = (currentIndex + 1) % states.length
      this.model.prop('currentIndex', nextIndex)
      const nextState = states[nextIndex]
      const bindTarget = get(this, 'model.attributes.bind.onChange')
      if (bindTarget) {
        this.paper.ws.send(`${window.prefix}.${bindTarget} ${nextState.value}`)
      }
    }
  }
})
