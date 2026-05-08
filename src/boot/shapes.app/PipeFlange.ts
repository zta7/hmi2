/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class PipeFlange extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.PipeFlange',
      size: { width: 80, height: 30 },
      attrs: {
        root: { magnet: false },
        body: {
          x: 14,
          y: 'calc(h/2 - 8)',
          width: 'calc(w - 28)',
          height: 16,
          fill: '#ddd',
          stroke: 'gray',
          strokeWidth: 1
        },
        flangeLeft: {
          x: 0,
          y: 0,
          width: 14,
          height: 'calc(h)',
          rx: 2,
          ry: 2,
          fill: '#bbb',
          stroke: 'gray',
          strokeWidth: 2
        },
        flangeRight: {
          x: 'calc(w - 14)',
          y: 0,
          width: 14,
          height: 'calc(h)',
          rx: 2,
          ry: 2,
          fill: '#bbb',
          stroke: 'gray',
          strokeWidth: 2
        },
        boltL1: { cx: 7, cy: 8, r: 2.5, fill: '#888', stroke: 'none' },
        boltL2: { cx: 7, cy: 'calc(h - 8)', r: 2.5, fill: '#888', stroke: 'none' },
        boltR1: { cx: 'calc(w - 7)', cy: 8, r: 2.5, fill: '#888', stroke: 'none' },
        boltR2: { cx: 'calc(w - 7)', cy: 'calc(h - 8)', r: 2.5, fill: '#888', stroke: 'none' },
        label: {
          text: '法兰',
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
            position: { name: 'absolute', args: { x: 'calc(w / 2)', y: 'calc(h / 2)' } },
            markup: joint.util.svg`<rect @selector="pipeEnd" />`,
            size: { width: 10, height: 30 },
            attrs: {
              pipeEnd: { magnet: true, width: 10, height: 'calc(h)', y: 'calc(h / -2)', stroke: 'gray', strokeWidth: 3, fill: 'white' }
            }
          }
        },
        items: [
          { id: 'left', group: 'pipes', z: 0, args: { x: 0, y: 'calc(h/2)' } },
          { id: 'right', group: 'pipes', z: 0, args: { x: 'calc(w)', y: 'calc(h/2)' } }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg`
      <rect @selector="flangeLeft" />
      <rect @selector="flangeRight" />
      <rect @selector="body" />
      <circle @selector="boltL1" />
      <circle @selector="boltL2" />
      <circle @selector="boltR1" />
      <circle @selector="boltR2" />
      <text @selector="label" />
    `
  }
}
