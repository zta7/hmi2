/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

const POWER_FLAG = 'POWER'

export class Mixer extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Mixer',
      size: {
        width: 120,
        height: 160
      },
      power: 0,
      attrs: {
        root: {
          magnet: false
        },
        tank: {
          x: 0,
          y: 40,
          width: 'calc(w)',
          height: 'calc(h - 40)',
          rx: 4,
          ry: 4,
          stroke: 'gray',
          strokeWidth: 2,
          fill: 'lightgray'
        },
        motorBox: {
          x: 'calc(w / 2 - 15)',
          y: 0,
          width: 30,
          height: 25,
          rx: 2,
          ry: 2,
          stroke: '#333',
          strokeWidth: 2,
          fill: '#777'
        },
        motorLabel: {
          text: 'M',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: 'calc(w / 2)',
          y: 12,
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          fill: '#fff',
        },
        shaftLine: {
          x1: 'calc(w / 2)',
          y1: 25,
          x2: 'calc(w / 2)',
          y2: 'calc(h / 2 + 30)',
          stroke: '#333',
          strokeWidth: 3
        },
        blade1: {
          d: 'M -20 0 H 20',
          transform: 'translate(calc(w/2), calc(h/2 + 15))',
          stroke: '#333',
          strokeWidth: 4,
          strokeLinecap: 'round'
        },
        blade2: {
          d: 'M -15 -10 H 15',
          transform: 'translate(calc(w/2), calc(h/2 + 30))',
          stroke: '#333',
          strokeWidth: 4,
          strokeLinecap: 'round'
        },
        label: {
          text: '搅拌器',
          textAnchor: 'middle',
          textVerticalAnchor: 'top',
          x: 'calc(0.5*w)',
          y: 'calc(h+10)',
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
                y: 'calc(h / 2 + 20)'
              }
            },
            markup: joint.util.svg`
              <rect @selector="pipeBody" />
              <rect @selector="pipeEnd" />
            `,
            size: { width: 60, height: 24 },
            attrs: {
              pipeBody: {
                width: 'calc(w)',
                height: 'calc(h)',
                y: 'calc(h / -2)',
                fill: '#ddd',
                stroke: 'gray',
                strokeWidth: 1
              },
              pipeEnd: {
                magnet: true,
                width: 10,
                height: 'calc(h+6)',
                y: 'calc(h / -2 - 3)',
                stroke: 'gray',
                strokeWidth: 3,
                fill: 'white'
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
      <rect @selector="tank" />
      <rect @selector="motorBox" />
      <text @selector="motorLabel" />
      <line @selector="shaftLine" />
      <path @selector="blade1" />
      <path @selector="blade2" />
      <text @selector="label" />
    `
  }

  get power () {
    return this.get('power') || 0
  }

  set power (value) {
    this.set('power', value)
  }
}

export const MixerView = joint.dia.ElementView.extend({
  presentationAttributes: joint.dia.ElementView.addPresentationAttributes({
    power: [POWER_FLAG]
  }),

  initFlag: [joint.dia.ElementView.Flags.RENDER, POWER_FLAG],

  bladeAnimation: null,

  confirmUpdate (_flags: number, opt: any) {
    let flags = joint.dia.ElementView.prototype.confirmUpdate.call(this, _flags, opt)
    if (this.hasFlag(flags, POWER_FLAG)) {
      this.togglePower()
      flags = this.removeFlag(flags, POWER_FLAG)
    }
    return flags
  },

  getBladeAnimation () {
    let { bladeAnimation } = this
    if (bladeAnimation) return bladeAnimation
    const [blade1] = this.findBySelector('blade1')
    bladeAnimation = blade1.animate(
      { opacity: [1, 0.3, 1] },
      { fill: 'forwards', duration: 500, iterations: Infinity }
    )
    this.bladeAnimation = bladeAnimation
    return bladeAnimation
  },

  togglePower () {
    const { model } = this
    const power = model.power
    const [motorBox] = this.findBySelector('motorBox')
    motorBox.setAttribute('fill', power ? '#0EAD69' : '#777')
    this.getBladeAnimation().playbackRate = power
  }
})
