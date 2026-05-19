/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class Heater extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Heater',
      size: { width: 120, height: 80 },
      attrs: {
        root: { magnet: false },
        body: {
          x: 0,
          y: 0,
          width: 'calc(w)',
          height: 'calc(h)',
          rx: 4,
          ry: 4,
          fill: '#1a1a2e',
          stroke: '#ff8c42',
          strokeWidth: 3
        },
        coil: {
          d: 'M 15 20 H calc(w - 15) M 15 32 H calc(w - 15) M 15 44 H calc(w - 15) M 15 56 H calc(w - 15)',
          fill: 'none',
          stroke: '#c0392b',
          strokeWidth: 3,
          strokeLinecap: 'round'
        },
        coilVL: {
          d: 'M 15 20 V 32 M 15 44 V 56',
          fill: 'none',
          stroke: '#c0392b',
          strokeWidth: 3,
          strokeLinecap: 'round'
        },
        coilVR: {
          d: 'M calc(w-15) 32 V 44',
          fill: 'none',
          stroke: '#c0392b',
          strokeWidth: 3,
          strokeLinecap: 'round'
        },
        label: {
          text: '加热器',
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
            position: { name: 'absolute', args: { x: 'calc(w / 2)', y: 'calc(h / 2)' } },
            markup: joint.util.svg`<rect @selector="pipeBody" /><rect @selector="pipeEnd" />`,
            size: { width: 50, height: 24 },
            attrs: {
              pipeBody: { width: 'calc(w)', height: 'calc(h)', y: 'calc(h / -2)', fill: '#2a2a40', stroke: '#ff8c42', strokeWidth: 1 },
              pipeEnd: { magnet: true, width: 10, height: 'calc(h+6)', y: 'calc(h / -2 - 3)', stroke: '#ff8c42', strokeWidth: 3, fill: '#2a2a40' }
            }
          }
        },
        items: [
          { id: 'left', group: 'pipes', z: 0, attrs: { pipeBody: { x: 'calc(-1 * w)' }, pipeEnd: { x: 'calc(-1 * w)' } } },
          { id: 'right', group: 'pipes', z: 0, attrs: { pipeEnd: { x: 'calc(w - 10)' } } }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg`
      <rect @selector="body" />
      <path @selector="coil" />
      <path @selector="coilVL" />
      <path @selector="coilVR" />
      <text @selector="label" />
    `
  }
}
