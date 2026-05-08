/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

const POWER_FLAG = 'POWER'

export class Fan extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Fan',
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
          stroke: '#666',
          strokeWidth: 3,
          fill: {
            type: 'radialGradient',
            stops: [
              { offset: '0%', color: '#eee' },
              { offset: '100%', color: '#bbb' }
            ]
          }
        },
        bladeWrapper: {
          transform: 'translate(calc(w/2),calc(h/2))'
        },
        bladeGroup: {
          cursor: 'pointer',
          event: 'element:power:click'
        },
        hub: {
          r: 7,
          fill: '#555',
          stroke: '#333',
          strokeWidth: 2
        },
        blade1: {
          d: 'M 0 -5 Q 8 -14 4 -24 Q 0 -26 -4 -24 Q -8 -14 0 -5 Z',
          fill: '#777',
          stroke: '#555',
          strokeWidth: 1
        },
        blade2: {
          d: 'M 0 -5 Q 8 -14 4 -24 Q 0 -26 -4 -24 Q -8 -14 0 -5 Z',
          fill: '#777',
          stroke: '#555',
          strokeWidth: 1,
          transform: 'rotate(120)'
        },
        blade3: {
          d: 'M 0 -5 Q 8 -14 4 -24 Q 0 -26 -4 -24 Q -8 -14 0 -5 Z',
          fill: '#777',
          stroke: '#555',
          strokeWidth: 1,
          transform: 'rotate(240)'
        },
        label: {
          text: 'Fan',
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
            args: { x: -10, y: 'calc(h / 2)' }
          },
          {
            id: 'right',
            group: 'pipes',
            z: 0,
            args: { x: 'calc(w)', y: 'calc(h / 2)' }
          }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg/* xml */`
      <ellipse @selector="body" />
      <g @selector="bladeWrapper">
        <g @selector="bladeGroup">
          <path @selector="blade1" />
          <path @selector="blade2" />
          <path @selector="blade3" />
        </g>
        <circle @selector="hub" />
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

export const FanView = joint.dia.ElementView.extend({
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
    const [bladeGroup] = this.findBySelector('bladeGroup')
    const keyframes = { transform: ['rotate(0deg)', 'rotate(360deg)'] }
    spinAnimation = bladeGroup.animate(keyframes, {
      fill: 'forwards',
      duration: 800,
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
