import * as joint from '@clientio/rappid'
import { V, VElement } from '@clientio/rappid'
import { cloneDeep, get } from 'lodash'
import { uid } from 'quasar'

export class FunctionBlock extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.FunctionBlock',
      name: 'FB',
      inputEvents: Array.from({ length: 5 }, (e, i) => ({ id: uid(), name: `inputEvents${i}` })),
      outputEvents: Array.from({ length: 8 }, (e, i) => ({ id: uid(), name: `outputEvents${i}` })),
      inputs: Array.from({ length: 5 }, (e, i) => ({ id: uid(), name: `inputs${i}` })),
      outputs: Array.from({ length: 5 }, (e, i) => ({ id: uid(), name: `outputs${i}` })),
      internals: Array.from({ length: 5 }, (e, i) => ({ id: uid(), name: `internals${i}` })),
      label: 'ADD'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}

export const FunctionBlockView = joint.dia.ElementView.extend({

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
    this.inputForeignObjectId = 'inputForeignObjectId'
    this.selectForeignObjectId = 'selectForeignObjectId'
    this.inputId = 'inputId'
    this.selectId = 'selectId'

    const svg = this.paper.svg

    const bodyAttr = {
      fill: '#ffffff',
      stroke: 'black',
      strokeWidth: 1
    }

    const portBodyAttr = {
      height: 24,
      width: 1,
      fill: 'transparent',
      'stroke-width': 0
    }

    const portAttr = {
      width: 10,
      height: 10,
      px: 5,
      y: 5.5
    }
    const portLabelAttr = {
      'font-size': 14,
      'font-weight': 500,
      'dominant-baseline': 'middle'
    }

    const LabelAttr = {
      'font-size': 14,
      'font-weight': 500,
      fill: '#ffffff'
    }

    const measureBbox = (t: joint.VElement) => {
      t.appendTo(svg)
      const bbox = t.getBBox()
      t.remove()
      return bbox
    }

    const vBody = V('g')
    this.vBody = vBody
    // const vName = V('text').attr(nameAttr).text(name)
    // const vNameBbox = measureBbox(vName)
    const nameHeight = 24
    const inputForeignObject = {
      tagName: 'foreignObject',
      attributes: {
        id: this.inputForeignObjectId,
        overflow: 'hidden',
        y: 0,
        height: nameHeight,
        class: 'row'
      },
      children: [
        {
          tagName: 'input',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          attributes: {
            value: name,
            id: this.inputId
          },
          style: {
            width: '80%',
            height: '100%',
            margin: '0 auto',
            'text-align': 'center',
            border: 0,
            outline: 0,
            background: 'transparent',
            'font-weight': 500
          }
        }
      ]
    }
    const vName = V(util.parseDOMJSON([inputForeignObject]).fragment as any) as any
    let height = 0
    vBody.append(vName)

    const vEventsBody = V('g').translate(0, height += nameHeight)
    const vEventsBodyRect = V('rect').attr(bodyAttr)
    const vInputEventsBody = V('g')
    const vOutputEventsBody = V('g')

    inputEvents.forEach((e: any, i: number) => {
      const body = V('g').translate(0, i * 20)
      const bodyRect = V('rect').attr(portBodyAttr)
      const port = V('rect').attr({ ...portAttr, fill: 'green', port: e.id, magnet: true, anchor: 'left', type: 'inputEvent' })
      const label = V('text').text(e.name).attr({ ...portLabelAttr, x: portAttr.width + portAttr.px })
      body.append(bodyRect).append(port).append(label)
      vInputEventsBody.append(body)
    })

    const vInputEventsBodyBbox = measureBbox(vInputEventsBody)

    const portRefs:Array<joint.VElement> = []
    outputEvents.forEach((e: any, i: number) => {
      const body = V('g').translate(0, i * 20)
      const port = V('rect').attr({ ...portAttr, fill: 'green', port: e.id, magnet: true, anchor: 'right', type: 'outputEvent' })
      const bodyRect = V('rect').attr(portBodyAttr)
      portRefs.push(port)
      const label = V('text').text(e.name).attr({ ...portLabelAttr })
      body.append(bodyRect).append(label).append(port)
      vOutputEventsBody.append(body)
    })

    let vOutputEventsBodyBbox = measureBbox(vOutputEventsBody)
    portRefs.forEach((e: joint.VElement) => {
      e.attr({ x: vOutputEventsBodyBbox.width + portAttr.px })
    })
    vOutputEventsBodyBbox = measureBbox(vOutputEventsBody)
    vEventsBody.append(vEventsBodyRect).append(vInputEventsBody).append(vOutputEventsBody)
    vBody.append(vEventsBody)

    const vLabelPaddingX = 10
    const vLabelPaddingY = 10
    const vLabel = V('g').translate(0, height += Math.max(vInputEventsBodyBbox.height, vOutputEventsBodyBbox.height))
    const vLabelText = V('text').text('label').attr(LabelAttr).translate(vLabelPaddingX / 2, vLabelPaddingY / 2)
    const vLabelTextBbox = measureBbox(vLabelText)
    const vLabelRect = V('rect')
      .attr({
        width: vLabelTextBbox.width + vLabelPaddingX,
        height: vLabelTextBbox.height + vLabelPaddingY,
        'stroke-dasharray': `0 ${vLabelTextBbox.width + vLabelPaddingX} ${vLabelTextBbox.height + vLabelPaddingY} 0`,
        stroke: 'black',
        strokeWidth: 1,
        fill: '#1976D2'
      })
    vLabel.append(vLabelRect).append(vLabelText)
    const vLabelBbox = measureBbox(vLabel)
    vBody.append(vLabel)

    const vIoBody = V('g').translate(0, height += vLabelBbox.height)
    const vIoBodyRect = V('rect').attr(bodyAttr)
    const vInputsBody = V('g')
    const vOutputsBody = V('g')

    inputs.forEach((e: any, i: number) => {
      const body = V('g').translate(0, i * 20)
      const bodyRect = V('rect').attr(portBodyAttr)
      const port = V('rect').attr({ ...portAttr, fill: 'orange', port: e.id, anchor: 'left', magnet: true, type: 'input' })
      const label = V('text').text(e.name).attr({ ...portLabelAttr, x: portAttr.width + portAttr.px })

      body.append(bodyRect).append(port).append(label)
      vInputsBody.append(body)
    })

    const vInputsBodyBbox = measureBbox(vInputsBody)

    const portRefs2:Array<joint.VElement> = []
    outputs.forEach((e: any, i: number) => {
      const body = V('g').translate(0, i * 20)
      const bodyRect = V('rect').attr(portBodyAttr)
      const port = V('rect').attr({ ...portAttr, fill: 'orange', port: e.id, anchor: 'right', magnet: true, type: 'output' })
      portRefs2.push(port)
      const label = V('text').text(e.name).attr({ ...portLabelAttr })
      body.append(bodyRect).append(label).append(port)
      vOutputsBody.append(body)
    })

    let vOutputsBodyBbox = measureBbox(vOutputsBody)
    portRefs2.forEach((e: joint.VElement) => {
      e.attr({ x: vOutputsBodyBbox.width + portAttr.px })
    })
    vOutputsBodyBbox = measureBbox(vOutputsBody)

    vIoBody.append(vIoBodyRect).append(vInputsBody).append(vOutputsBody)
    vBody.append(vIoBody)

    const vLine = V('rect').attr({
      width: 1, height: 10
    }).translate(0, height += Math.max(vInputsBodyBbox.height, vOutputsBodyBbox.height))
    const vLineBbox = measureBbox(vLine)
    vBody.append(vLine)

    const resourceOptions = get(this, 'paper.meta.resourceOptions', [])
    const selectForeignObject = {
      tagName: 'foreignObject',
      attributes: {
        overflow: 'hidden',
        id: this.selectForeignObjectId,
        y: height += vLineBbox.height,
        width: 200,
        height: 24,
        class: 'row'
      },
      children: [
        {
          tagName: 'select',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          attributes: {
            id: this.selectId
          },
          style: {
            width: '80%',
            height: '100%',
            margin: '0 auto'
          },
          children: [
            ...resourceOptions.map((e: any) => ({
              tagName: 'option',
              attributes: {
                value: e.value,
                label: e.content,
                selected: e.value === resource
              }
            }))
          ]
        }
      ]
    }
    height += 24
    const { fragment } = util.parseDOMJSON([selectForeignObject])
    const vResource = V(fragment as any) as any
    vBody.append(vResource)

    // const vResource = V('text').text(resource).attr({ y: vBodyBbox.height })
    // vBody.append(vResource)
    // height = Math.ceil(height / 10) * 10

    const width = Math.max(vInputEventsBodyBbox.width + vOutputEventsBodyBbox.width, vInputsBodyBbox.width + vOutputEventsBodyBbox.width) + 10
    // vName.attr({ x: width / 2 })
    vLine.attr({ x: width / 2 - vLineBbox.width / 2 })
    vLabel.translate((width - vLabelBbox.width) / 2)
    vOutputEventsBody.translate(width - vOutputEventsBodyBbox.width)
    vOutputsBody.translate(width - vOutputsBodyBbox.width)
    vEventsBodyRect.attr({
      width,
      height: Math.max(vInputEventsBodyBbox.height, vOutputEventsBodyBbox.height),
      'stroke-dasharray': `${width + Math.max(vInputEventsBodyBbox.height, vOutputEventsBodyBbox.height) + (width - vLabelBbox.width) / 2} ${vLabelBbox.width} ${width + Math.max(vInputEventsBodyBbox.height, vOutputEventsBodyBbox.height) + (width - vLabelBbox.width) / 2}`
    })

    vIoBodyRect.attr({
      width,
      height: Math.max(vInputsBodyBbox.height, vOutputsBodyBbox.height),
      'stroke-dasharray': `${(width - vLabelBbox.width) / 2} ${vLabelBbox.width} ${(width - vLabelBbox.width) / 2 + Math.max(vInputsBodyBbox.height, vOutputsBodyBbox.height) * 2 + width}`
    })

    const c1 = vBody.node.querySelector('#' + this.inputForeignObjectId) as HTMLElement
    const c2 = vBody.node.querySelector('#' + this.selectForeignObjectId) as HTMLElement
    c1.setAttribute('width', `${width}`)
    c2.setAttribute('width', `${width}`)

    const bg = V('rect').attr({ width, height, fill: 'transparent', stroke: 'transparent', strokeWidth: 0 })
    vel.empty().append([bg, vBody])

    this.resize({
      width,
      height
    })
    this.model.prop('size', {
      width,
      height
    })
    // this.model.prop('height', height)
    // console.log(this.model.size())
    // this.updateSize()
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
