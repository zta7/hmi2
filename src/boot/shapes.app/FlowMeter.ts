/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

const VALUE_FLAG = 'VALUE_UPDATE'

export class FlowMeter extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.FlowMeter',
      size: {
        width: 60,
        height: 60
      },
      value: 0,
      unit: 'm³/h',
      attrs: {
        root: {
          magnet: false
        },
        body: {
          rx: 'calc(w / 2)',
          ry: 'calc(h / 2)',
          cx: 'calc(w / 2)',
          cy: 'calc(h / 2)',
          stroke: '#e15656',
          strokeWidth: 2,
          fill: '#1a1a2e'
        },
        flowIcon: {
          text: 'F',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: 'calc(w / 2)',
          y: 'calc(h / 2 - 6)',
          fontSize: 20,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          fill: '#e15656',
          stroke: '#b03a3a',
          strokeWidth: 2
        },
        valueText: {
          text: '0',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: 'calc(w / 2)',
          y: 'calc(h / 2 + 12)',
          fontSize: 10,
          fontFamily: 'sans-serif',
          fill: '#a0a0c0',
          stroke: '#a0a0c0',
          strokeWidth: 1
        },
        label: {
          text: '流量计',
          textAnchor: 'middle',
          textVerticalAnchor: 'top',
          x: 'calc(0.5*w)',
          y: 'calc(h+10)',
          fontSize: 14,
          fontFamily: 'sans-serif',
          fill: '#a0a0c0'
        }
      },
      ports: {
        groups: {
          pipes: {
            position: {
              name: 'absolute',
              args: {
                x: 'calc(w / 2)',
                y: 'calc(h / 2)'
              }
            },
            markup: joint.util.svg`
              <rect @selector="pipeBody" />
              <rect @selector="pipeEnd" />
            `,
            size: { width: 50, height: 24 },
            attrs: {
              pipeBody: {
                width: 'calc(w)',
                height: 'calc(h)',
                y: 'calc(h / -2)',
                fill: '#2a2a40',
                stroke: '#e15656',
                strokeWidth: 1
              },
              pipeEnd: {
                magnet: true,
                width: 10,
                height: 'calc(h+6)',
                y: 'calc(h / -2 - 3)',
                stroke: '#e15656',
                strokeWidth: 3,
                fill: '#2a2a40'
              }
            }
          }
        },
        items: [
          {
            id: 'left',
            group: 'pipes',
            z: 0,
            attrs: {
              pipeBody: { x: 'calc(-1 * w)' },
              pipeEnd: { x: 'calc(-1 * w)' }
            }
          },
          {
            id: 'right',
            group: 'pipes',
            z: 0,
            attrs: {
              pipeEnd: { x: 'calc(w - 10)' }
            }
          }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg/* xml */`
      <ellipse @selector="body" />
      <text @selector="flowIcon" />
      <text @selector="valueText" />
      <text @selector="label" />
    `
  }
}

export const FlowMeterView = joint.dia.ElementView.extend({
  presentationAttributes: joint.dia.ElementView.addPresentationAttributes({
    value: [VALUE_FLAG],
    unit: [VALUE_FLAG]
  }),

  initFlag: [joint.dia.ElementView.Flags.RENDER, VALUE_FLAG],

  confirmUpdate (_flags: number, opt: any) {
    let flags = joint.dia.ElementView.prototype.confirmUpdate.call(this, _flags, opt)
    if (this.hasFlag(flags, VALUE_FLAG)) {
      this.updateDisplay()
      flags = this.removeFlag(flags, VALUE_FLAG)
    }
    return flags
  },

  updateDisplay () {
    const { model } = this
    const value = model.get('value') || 0
    const unit = model.get('unit') || ''
    const [valueEl] = this.findBySelector('valueText')
    if (valueEl) valueEl.textContent = `${value}${unit}`
  }
})
