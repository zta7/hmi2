import * as joint from '@clientio/rappid'
import { get } from 'lodash'

export class Slider extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Slider',
      size: { width: 90, height: 30 },
      min: 0,
      max: 100,
      step: 1,
      value: 50
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
export const SliderView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    min: ['RENDER'],
    max: ['RENDER'],
    step: ['RENDER'],
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
          tagName: 'div',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          attributes: {
            style: 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px;'
          },
          children: [
            {
              tagName: 'input',
              namespaceURI: 'http://www.w3.org/1999/xhtml',
              selector: 'slider',
              style: {
                width: '100%',
                height: '6px',
                appearance: 'none',
                background: 'transparent',
                cursor: 'pointer'
              },
              attributes: {
                type: 'range',
                name: 'slider',
                min: model.attributes.min,
                max: model.attributes.max,
                step: model.attributes.step,
                value: model.attributes.value
              }
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
    const sliderInput = this.el.querySelector('input[type="range"]')
    if (sliderInput) {
      const style = document.createElement('style')
      style.textContent = `
        input[type="range"]::-webkit-slider-track {
          width: 100%;
          height: 6px;
          background: #1a1a2e;
          border-radius: 3px;
          border: 1px solid #3d3d60;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: #ffffff;
          border-radius: 50%;
          cursor: pointer;
          margin-top: -5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-track {
          width: 100%;
          height: 6px;
          background: #1a1a2e;
          border-radius: 3px;
          border: 1px solid #3d3d60;
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #ffffff;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          background: linear-gradient(to right, #4a9eff 0%, #4a9eff ${((model.attributes.value - model.attributes.min) / (model.attributes.max - model.attributes.min)) * 100}%, #1a1a2e ${((model.attributes.value - model.attributes.min) / (model.attributes.max - model.attributes.min)) * 100}%, #1a1a2e 100%);
          border-radius: 3px;
          border: 1px solid #3d3d60;
        }
      `
      this.el.appendChild(style)
    }
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
    'change input': 'onInputChange'
  },

  onInputChange (evt: Event) {
    const input = evt.target as any
    const value = input.value
    this.model.attr(input.name + '/value', input.value)
    const bindTarget = get(this, 'model.attributes.bind.onChange')
    const bindEvent = get(this, 'model.attributes.bind.event')
    let t = `${window.prefix}.${bindTarget} ${value}`
    if (bindEvent) t += `,${window.prefix}.${bindEvent}`
    console.log('Input Change', input.value)
    this.paper.ws.send(t)
  }
})
