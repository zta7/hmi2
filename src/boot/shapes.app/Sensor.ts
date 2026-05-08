/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

const VALUE_FLAG = 'VALUE_UPDATE'

export class Sensor extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Sensor',
      size: {
        width: 60,
        height: 60
      },
      value: 0,
      unit: '°C',
      sensorType: 'T',
      attrs: {
        root: {
          magnet: false
        },
        body: {
          rx: 'calc(w / 2)',
          ry: 'calc(h / 2)',
          cx: 'calc(w / 2)',
          cy: 'calc(h / 2)',
          stroke: 'gray',
          strokeWidth: 2,
          fill: '#eee'
        },
        sensorIcon: {
          text: 'T',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: 'calc(w / 2)',
          y: 'calc(h / 2 - 6)',
          fontSize: 20,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          fill: '#ffffff',
          stroke: '#555555',
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
          // fill: '#333',
          stroke: '#555555',
          strokeWidth: 1
        },
        stem: {
          x: 'calc(w / 2 - 4)',
          y: 'calc(h)',
          width: 8,
          height: 20,
          stroke: 'gray',
          strokeWidth: 1,
          fill: '#bbb'
        },
        label: {
          text: '传感器',
          textAnchor: 'middle',
          textVerticalAnchor: 'top',
          x: 'calc(0.5*w)',
          y: 'calc(h + 25)',
          fontSize: 14,
          fontFamily: 'sans-serif',
          fill: '#350100'
        }
      },
      ports: {
        groups: {
          pipes: {
            position: {
              name: 'absolute',
              args: {
                x: 'calc(w / 2)',
                y: 'calc(h + 20)'
              }
            },
            markup: joint.util.svg`
              <rect @selector="pipeEnd" />
            `,
            size: { width: 10, height: 10 },
            attrs: {
              pipeEnd: {
                magnet: true,
                width: 10,
                height: 10,
                x: -5,
                y: 0,
                stroke: 'gray',
                strokeWidth: 2,
                fill: 'white'
              }
            }
          }
        },
        items: [
          {
            id: 'bottom',
            group: 'pipes',
            z: 0
          }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg/* xml */`
      <rect @selector="stem" />
      <ellipse @selector="body" />
      <text @selector="sensorIcon" />
      <text @selector="valueText" />
      <text @selector="label" />
    `
  }
}

export const SensorView = joint.dia.ElementView.extend({
  presentationAttributes: joint.dia.ElementView.addPresentationAttributes({
    value: [VALUE_FLAG],
    unit: [VALUE_FLAG],
    sensorType: [VALUE_FLAG]
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
    const sensorType = model.get('sensorType') || 'T'
    const [iconEl] = this.findBySelector('sensorIcon')
    const [valueEl] = this.findBySelector('valueText')
    if (iconEl) iconEl.textContent = sensorType
    if (valueEl) valueEl.textContent = `${value}${unit}`
  }
})
