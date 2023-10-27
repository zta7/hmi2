import * as joint from '@clientio/rappid'
import { V, VElement } from '@clientio/rappid'
import { cloneDeep, get } from 'lodash'
import { uid } from 'quasar'

export class EccState extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.EccState',
      name: 'FB'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}

export const EccStateView = joint.dia.ElementView.extend({

  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM', 'UPDATE_NAME', 'UPDATE_RESOURCE'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    name: ['UPDATE_NAME'],
    resource: ['UPDATE_RESOURCE']
  },

  render () {
    const { vel, model } = this
    const { inputEvents, outputEvents, inputs, outputs, internals, resource, name } = model.attributes
    const { util } = joint
    const svg = this.paper.svg

    const measureBbox = (t: joint.VElement) => {
      t.appendTo(svg)
      const bbox = t.getBBox()
      t.remove()
      return bbox
    }

    const vName = V('g')
    const vNameRect = V('rect')
    const vNameText = V('text').text(name)
    const vNameTextBbox = measureBbox(vNameText)

    vName.append(vNameRect).append(vNameText)

    vel.empty().append([vName])

    // this.resize({
    //   width,
    //   height
    // })
    // this.model.prop('size', {
    //   width,
    //   height
    // })
    this.translate()
  },

  updateName () {
    const vBody = this.vBody as joint.VElement
    const e = vBody.node.querySelector('#' + this.inputId) as HTMLElement
    e.setAttribute('value', `${this.model.attributes.name}`)
  },
  updateResource () {
    const vBody = this.vBody as joint.VElement
    const e = vBody.node.querySelector('#' + this.selectId) as HTMLElement
    const options = Array.from(e.children)
    const t = options.find(e => e.getAttribute('value') === this.model.attributes.resource) as HTMLOptionElement
    t && t.setAttribute('selected', 'true')
  },
  confirmUpdate (flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER')) this.render()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
    if (this.hasFlag(flags, 'RESIZE')) {
      // this.updateSize()
      this.resize(opt)
    } else if (this.hasFlag(flags, 'UPDATE_NAME')) this.updateName()
    else if (this.hasFlag(flags, 'UPDATE_RESOURCE')) this.updateResource()
  },

  events: {
    input: 'onInputChange'
  },

  onInputChange (evt: Event) {
    const target = evt.target as HTMLInputElement | HTMLSelectElement
    const value = target.value
    const id = target.getAttribute('id')
    if (id === this.selectId) {
      this.model.prop('resource', value)
    } else if (id === this.inputId) {
      this.model.prop('name', value)
    }
  }

})
