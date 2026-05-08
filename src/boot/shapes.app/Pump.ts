/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

// Custom view flags
const POWER_FLAG = 'POWER'

const r = 30
const d = 10
const l = (3 * r) / 4

export class Pump extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Pump',
      size: {
        width: 100,
        height: 100
      },
      power: 0,
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
          fill: 'lightgray'
        },
        label: {
          text: 'Pump',
          textAnchor: 'middle',
          textVerticalAnchor: 'top',
          x: 'calc(0.5*w)',
          y: 'calc(h+10)',
          fontSize: 14,
          fontFamily: 'sans-serif',
          fill: '#350100'
        },
        rotorGroup: {
          transform: 'translate(calc(w/2),calc(h/2))',
          event: 'element:power:click',
          cursor: 'pointer'
        },
        rotorFrame: {
          r: 40,
          fill: '#eee',
          stroke: '#666',
          strokeWidth: 2
        },
        rotorBackground: {
          r: 34,
          fill: '#777',
          stroke: '#222',
          strokeWidth: 1,
          style: {
            transition: 'fill 0.5s ease-in-out'
          }
        },
        rotor: {
          // d: `M ${a} ${a} ${b} ${r} -${b} ${r} -${a} ${a} -${r} ${b} -${r} -${b} -${a} -${a} -${b} -${r} ${b} -${r} ${a} -${a} ${r} -${b} ${r} ${b} Z`,
          d: `M 0 0 V ${r} l ${-d} ${-l} Z M 0 0 V ${-r} l ${d} ${l} Z M 0 0 H ${r} l ${-l} ${d} Z M 0 0 H ${-r} l ${l} ${-d} Z`,
          stroke: '#222',
          strokeWidth: 3,
          fill: '#bbb'
        }
      },
      ports: {
        groups: {
          pipes: {
            position: {
              name: 'line',
              args: {
                start: { x: 'calc(w / 2)', y: 'calc(h)' },
                end: { x: 'calc(w / 2)', y: 0 }
              }
            },
            markup: joint.util.svg`
                            <rect @selector="pipeBody" />
                            <rect @selector="pipeEnd" />
                        `,
            size: { width: 80, height: 30 },
            attrs: {
              // portRoot: {
              //   magnetSelector: 'pipeEnd'
              // },
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
            z: 1,
            attrs: {
              pipeBody: {
                x: 'calc(-1 * w)'
              },
              pipeEnd: {
                x: 'calc(-1 * w)'
              }
            }
          },
          {
            id: 'right',
            group: 'pipes',
            z: 0,
            attrs: {
              pipeEnd: {
                x: 'calc(w - 10)'
              }
            }
          }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg/* xml */`
            <ellipse @selector="body" />
            <g @selector="rotorGroup">
                <circle @selector="rotorFrame" />
                <circle @selector="rotorBackground" />
                <path @selector="rotor" />
            </g>
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

export const PumpView = joint.dia.ElementView.extend({
  presentationAttributes: joint.dia.ElementView.addPresentationAttributes({
    power: [POWER_FLAG]
  }),

  initFlag: [joint.dia.ElementView.Flags.RENDER, POWER_FLAG],

  powerAnimation: null,

  confirmUpdate (_flags: number, opt: any) {
    let flags = joint.dia.ElementView.prototype.confirmUpdate.call(this, _flags, opt)
    if (this.hasFlag(flags, POWER_FLAG)) {
      this.togglePower()
      flags = this.removeFlag(flags, POWER_FLAG)
    }
    return flags
  },

  getSpinAnimation () {
    let { spinAnimation } = this
    if (spinAnimation) return spinAnimation
    const [rotorEl] = this.findBySelector('rotor')
    // It's important to use start and end frames to make it work in Safari.
    const keyframes = { transform: ['rotate(0deg)', 'rotate(360deg)'] }
    spinAnimation = rotorEl.animate(keyframes, {
      fill: 'forwards',
      duration: 1000,
      iterations: Infinity
    })
    this.spinAnimation = spinAnimation
    return spinAnimation
  },

  togglePower () {
    const { model } = this
    this.getSpinAnimation().playbackRate = model.power
  }
})
