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
            style: 'width: 100%;height: 100%; position: relative'
          },
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          children: [
            {
              attributes: {
                overflow: 'hidden',
                style: 'width: 100%; height: 100%;',
                // 'data-content': model.attributes.text,
                type: 'button'
              },
              tagName: 'button',
              selector: 'button'
              // textContent: 'Button'
            },
            {
              tagName: 'img',
              attributes: {
                style: `position: absolute; left: 0; right: 0; top: 0; bottom: 0; width: 100%; height: 100%; rotate: ${model.attributes.on ? '0deg' : '30deg'}`,
                src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjgwNTk0MzI0MDA5IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI4NDIiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxwYXRoIGQ9Ik02NDAgMTQ2LjU5MlYyODIuNTZhMzIwIDMyMCAwIDAgMSA5OC4yNzIgNjcuMTY4Qzc5OC43MiA0MTAuMTc2IDgzMiA0OTAuNTI4IDgzMiA1NzZzLTMzLjI4IDE2NS44MjQtOTMuNzI4IDIyNi4yNzJDNjc3LjgyNCA4NjIuNzIgNTk3LjQ3MiA4OTYgNTEyIDg5NnMtMTY1LjgyNC0zMy4yOC0yMjYuMjcyLTkzLjcyOEMyMjUuMjggNzQxLjgyNCAxOTIgNjYxLjQ3MiAxOTIgNTc2czMzLjI4LTE2NS44MjQgOTMuNzI4LTIyNi4yNzJBMzE5LjQyNCAzMTkuNDI0IDAgMCAxIDM4NCAyODIuNTZWMTQ2LjU5MkMxOTguOTQ0IDIwMS42NjQgNjQgMzczLjA1NiA2NCA1NzZjMCAyNDcuNDI0IDIwMC41NzYgNDQ4IDQ0OCA0NDhzNDQ4LTIwMC41NzYgNDQ4LTQ0OGMwLTIwMi45NDQtMTM0Ljk0NC0zNzQuMzM2LTMyMC00MjkuNDA4ek00NDggMGgxMjh2NTEyaC0xMjh6IiBwLWlkPSIyODQzIj48L3BhdGg+PC9zdmc+'
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
