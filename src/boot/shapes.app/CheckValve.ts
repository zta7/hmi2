/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class CheckValve extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.CheckValve',
      size: { width: 50, height: 50 },
      attrs: {
        root: { magnet: false },
        body: {
          rx: 'calc(w / 2)',
          ry: 'calc(h / 2)',
          cx: 'calc(w / 2)',
          cy: 'calc(h / 2)',
          stroke: 'gray',
          strokeWidth: 2,
          fill: 'lightgray'
        },
        disc: {
          x1: 'calc(w / 2)',
          y1: 'calc(h / 2 - 13)',
          x2: 'calc(w / 2)',
          y2: 'calc(h / 2 + 13)',
          stroke: '#333',
          strokeWidth: 3
        },
        arrow: {
          d: 'M calc(w/2 + 4) calc(h/2) H calc(w/2 + 14) M calc(w/2 + 10) calc(h/2 - 5) L calc(w/2 + 14) calc(h/2) L calc(w/2 + 10) calc(h/2 + 5)',
          stroke: '#333',
          strokeWidth: 2,
          fill: 'none',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        },
        label: {
          text: '止回阀',
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
            markup: joint.util.svg`<rect @selector="pipeBody" /><rect @selector="pipeEnd" />`,
            size: { width: 50, height: 24 },
            attrs: {
              pipeBody: { width: 'calc(w)', height: 'calc(h)', y: 'calc(h / -2)', fill: '#ddd', stroke: 'gray', strokeWidth: 1 },
              pipeEnd: { magnet: true, width: 10, height: 'calc(h+6)', y: 'calc(h / -2 - 3)', stroke: 'gray', strokeWidth: 3, fill: 'white' }
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
      <ellipse @selector="body" />
      <line @selector="disc" />
      <path @selector="arrow" />
      <text @selector="label" />
    `
  }
}
