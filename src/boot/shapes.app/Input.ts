import * as joint from '@clientio/rappid'
import { debounce, get } from 'lodash'
import $ from 'jquery'
import { uid } from 'quasar'

export class Input extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Input',
      size: { width: 90, height: 30 },
      value: '',
      color: 'black',
      fontSize: 14
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}

export const InputView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    value: ['RENDER'],
    color: ['RENDER'],
    fontSize: ['RENDER']
  },

  render () {
    const { model } = this
    const { util } = joint
    const online = !window.online
    const inputId = 'input'
    const buttonId = 'button'

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
            style: 'width: 100%; height: 100%; display: flex; border-radius: 4px; background: #1a1a2e; border: 1px solid #3d3d60; overflow: hidden;'
          },
          children: [
            {
              tagName: 'div',
              namespaceURI: 'http://www.w3.org/1999/xhtml',
              attributes: {
                style: `width: 3px; background: ${model.attributes.color}; margin: 4px; border-radius: 1.5px;`
              }
            },
            {
              tagName: 'input',
              namespaceURI: 'http://www.w3.org/1999/xhtml',
              selector: 'input',
              attributes: {
                autocomplete: 'off',
                type: 'text',
                name: 'input',
                placeholder: '输入',
                id: inputId,
                value: model.attributes.value
              },
              style: {
                fontSize: model.attributes.fontSize,
                width: 'calc(100% - 48px)',
                height: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: model.attributes.color,
                padding: '0 6px',
                fontFamily: 'sans-serif'
              }
            },
            {
              tagName: 'button',
              namespaceURI: 'http://www.w3.org/1999/xhtml',
              selector: 'button',
              attributes: {
                'data-content': 'OK',
                id: buttonId
              },
              style: {
                padding: '0 8px',
                margin: 0,
                border: 'none',
                borderLeft: '1px solid #3d3d60',
                background: '#2a2a40',
                color: model.attributes.color,
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '35px',
                height: '100%'
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
    this.updateSize()
    this.translate()

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this

    const $input = $(this.el.querySelector('#' + inputId))
    const $button = $(this.el.querySelector('#' + buttonId))
    // $input.on('blur', function (evt, p) {
    //   if (p === true) that.sendWs(evt)
    // })
    $input.on('keyup', function (evt) {
      if (evt.code === 'Enter' || evt.code === 'NumpadEnter') {
        const t = $(evt.target)
        t.trigger('blur', [true])
        that.sendWs(evt.target)
      }
    })

    $button.on('click', function (evt) {
      that.sendWs($input[0])
      // if (evt.code === 'Enter' || evt.code === 'NumpadEnter') {
      //   const t = $(evt.target)
      //   t.trigger('blur', [true])
      //   that.sendWs(evt)
      // }
    })
  },
  confirmUpdate (flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER')) this.render()
    if (this.hasFlag(flags, 'RESIZE')) {
      console.log(this.model.size())
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

  // events: {
  //   input: 'onChange',
  //   // blur: 'onBlur',
  //   keyup: 'onKeyup'
  // },
  sendWs (target: any) {
    const input = target as any
    this.model.attr(input.name + '/value', input.value)
    console.log('Input Change', input.value)
    const bindTarget = get(this, 'model.attributes.bind.onChange')
    const bindEvent = get(this, 'model.attributes.bind.event')
    const value = input.value
    let t = `${window.prefix}.${bindTarget} ${value.replace(/ /g, '+%20+').replace(/,/g, '+%2C+')}`
    if (bindEvent) t += `,${window.prefix}.${bindEvent}`
    this.paper.ws.send(t)
  }
})
