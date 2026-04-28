import * as joint from '@clientio/rappid'

// StateDisplay: shows different color/text based on a numeric/boolean variable value
export class StateDisplay extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.StateDisplay',
      size: { width: 80, height: 40 },
      value: 0,
      states: [
        { value: 0, label: 'OFF', color: '#555577', textColor: '#8888a0' },
        { value: 1, label: 'ON', color: '#21BA45', textColor: '#ffffff' },
        { value: 2, label: 'FAULT', color: '#C10015', textColor: '#ffffff' }
      ]
    }
  }
}

export const StateDisplayView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    value: ['RENDER'],
    states: ['RENDER']
  },

  render () {
    const { model } = this
    const { util } = joint
    const { value, states } = model.attributes

    const current = states.find((s: any) => s.value === value) || states[0]
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
        attributes: { overflow: 'hidden', width: 80, height: 40 },
        children: [{
          tagName: 'div',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          attributes: {
            style: `width:100%;height:100%;background:${color};border-radius:4px;display:flex;align-items:center;justify-content:center;border:1px solid #555577;box-sizing:border-box;`
          },
          children: [{
            tagName: 'span',
            attributes: {
              'data-content': label,
              style: `color:${textColor};font-size:12px;font-family:sans-serif;font-weight:600;`
            }
          }]
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
