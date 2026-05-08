/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class Silo extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Silo',
      size: { width: 100, height: 200 },
      attrs: {
        root: { magnet: false },
        body: {
          x: 0,
          y: 0,
          width: 'calc(w)',
          height: 'calc(h - 60)',
          fill: 'lightgray',
          stroke: 'gray',
          strokeWidth: 3
        },
        hopper: {
          d: 'M 0 0 L calc(w) 0 L calc(w/2 + 12) 60 H calc(w/2 - 12) Z',
          transform: 'translate(0, calc(h - 60))',
          fill: '#ddd',
          stroke: 'gray',
          strokeWidth: 3,
          strokeLinejoin: 'round'
        },
        spout: {
          x: 'calc(w/2 - 8)',
          y: 'calc(h - 8)',
          width: 16,
          height: 12,
          fill: '#bbb',
          stroke: 'gray',
          strokeWidth: 2
        },
        lid: {
          x: 0,
          y: 0,
          width: 'calc(w)',
          height: 14,
          fill: '#bbb',
          stroke: 'gray',
          strokeWidth: 2
        },
        ventPipe: {
          x: 'calc(w/2 - 5)',
          y: -20,
          width: 10,
          height: 20,
          fill: '#bbb',
          stroke: 'gray',
          strokeWidth: 2
        },
        label: {
          text: '料仓',
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
            position: { name: 'absolute', args: {} },
            markup: joint.util.svg`<rect @selector="pipeEnd" />`,
            size: { width: 10, height: 24 },
            attrs: {
              pipeEnd: { magnet: true, width: 10, height: 24, y: -12, stroke: 'gray', strokeWidth: 3, fill: 'white' }
            }
          }
        },
        items: [
          { id: 'top', group: 'pipes', z: 0, args: { x: 'calc(w/2)', y: 0 }, attrs: { pipeEnd: { width: 16, height: 10, x: -8, y: 0 } } },
          { id: 'bottom', group: 'pipes', z: 0, args: { x: 'calc(w/2)', y: 'calc(h)' }, attrs: { pipeEnd: { width: 18, height: 10, x: -9, y: 0 } } }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg`
      <rect @selector="ventPipe" />
      <rect @selector="body" />
      <path @selector="hopper" />
      <rect @selector="spout" />
      <rect @selector="lid" />
      <text @selector="label" />
    `
  }
}
