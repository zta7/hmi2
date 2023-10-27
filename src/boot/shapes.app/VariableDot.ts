import * as joint from '@clientio/rappid'
import { V, VElement } from '@clientio/rappid'
import { cloneDeep, get } from 'lodash'
import { uid } from 'quasar'

export class VariableDot extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.VariableDot',
      value: 'text',
      variableType: 'String'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}

export const VariableDotView = joint.dia.ElementView.extend({

  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM', 'UPDATE_VALUE'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    value: ['UPDATE_VALUE']
  },

  render () {
    const { model, vel } = this
    const { value } = model.attributes
    const svg = this.paper.svg

    const measureBbox = (t: joint.VElement) => {
      t.appendTo(svg)
      const bbox = t.getBBox()
      t.remove()
      return bbox
    }
    const px = 14
    const py = 8
    const portSize = 10
    const vRect = V('rect').attr({ fill: '#ffffff', strokeWidth: 1, stroke: 'black' })
    const vPort = V('rect').attr({ fill: 'orange', port: '123', magnet: true, anchor: 'right', type: 'output', width: portSize, height: portSize })
    const vText = V('text').text(value).translate(px / 2, py / 2)
    const vTextBbox = measureBbox(vText)
    const width = vTextBbox.width + px + portSize
    const height = vTextBbox.height + py
    vRect.attr({ width, height })
    vPort.translate(width - portSize, (height - portSize) / 2)

    vel.empty().append([vRect, vText, vPort])
    this.resize({ width, height })
    this.model.prop('size', {
      width,
      height
    })
    this.translate()
  },

  confirmUpdate (flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER')) this.render()
    if (this.hasFlag(flags, 'RESIZE')) {
      // this.updateSize()
      console.log(this.model.size())
      this.resize(opt)
    }
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
  },
  // updateSize () {
  //   const foreignObject = this.vel.findOne('foreignObject')
  //   const size = this.model.size()
  //   foreignObject.setAttribute('width', size.width)
  //   foreignObject.setAttribute('height', size.height)
  // },

  events: {
    input: 'onInputChange'
  },

  onInputChange (evt: Event) {
    // const fn = debounce(() => {
    //   const input = evt.target as any
    //   this.model.attr(input.name + '/value', input.value)
    //   console.log('Input Change', input.value)
    //   const bindTarget = get(this, 'model.attributes.bind.onChange')
    //   const value = input.value
    //   this.paper.ws.send(`${window.prefix}.${bindTarget} ${value}`)
    // }, 500)
    // fn()
  }
})
