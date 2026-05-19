/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

const POWER_FLAG = 'POWER'

export class Motor extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Motor',
      size: {
        width: 80,
        height: 80
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
          stroke: '#4a9eff',
          strokeWidth: 2,
          fill: '#1a1a2e'
        },
        motorText: {
          text: 'M',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: 'calc(w / 2)',
          y: 'calc(h / 2)',
          fontSize: 28,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          fill: '#4a9eff',
          stroke: '#2d6bc9',
          strokeWidth: 2
        },
        statusRing: {
          rx: 'calc(w / 2 - 5)',
          ry: 'calc(h / 2 - 5)',
          cx: 'calc(w / 2)',
          cy: 'calc(h / 2)',
          stroke: '#0EAD69',
          strokeWidth: 2,
          fill: 'none',
          strokeDasharray: '4,3'
        },
        label: {
          text: '电机',
          textAnchor: 'middle',
          textVerticalAnchor: 'top',
          x: 'calc(0.5*w)',
          y: 'calc(h+10)',
          fontSize: 14,
          fontFamily: 'sans-serif',
          fill: '#a0a0c0'
        },
        shaft: {
          x: 'calc(w)',
          y: 'calc(h / 2 - 6)',
          width: 30,
          height: 12,
          fill: '#3d3d60',
          stroke: '#4a9eff',
          strokeWidth: 1
        }
      },
      ports: {
        groups: {
          pipes: {
            position: {
              name: 'absolute',
              args: {
                x: 'calc(w + 30)',
                y: 'calc(h / 2)'
              }
            },
            markup: joint.util.svg`
              <rect @selector="pipeEnd" />
            `,
            size: { width: 10, height: 30 },
            attrs: {
              pipeEnd: {
                magnet: true,
                width: 10,
                height: 'calc(h)',
                y: 'calc(h / -2)',
                stroke: '#4a9eff',
                strokeWidth: 3,
                fill: '#2a2a40'
              }
            }
          }
        },
        items: [
          {
            id: 'out',
            group: 'pipes',
            z: 0
          }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg/* xml */`
      <ellipse @selector="body" />
      <ellipse @selector="statusRing" />
      <text @selector="motorText" />
      <rect @selector="shaft" />
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

export const MotorView = joint.dia.ElementView.extend({
  presentationAttributes: joint.dia.ElementView.addPresentationAttributes({
    power: [POWER_FLAG]
  }),

  initFlag: [joint.dia.ElementView.Flags.RENDER, POWER_FLAG],

  spinAnimation: null,

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
    const [ringEl] = this.findBySelector('statusRing')
    const keyframes = { strokeDashoffset: ['0', '14'] }
    spinAnimation = ringEl.animate(keyframes, {
      fill: 'forwards',
      duration: 600,
      iterations: Infinity
    })
    this.spinAnimation = spinAnimation
    return spinAnimation
  },

  togglePower () {
    const { model } = this
    const power = model.power
    const [ringEl] = this.findBySelector('statusRing')
    ringEl.setAttribute('stroke', power ? '#0EAD69' : 'gray')
    this.getSpinAnimation().playbackRate = power
  }
})
