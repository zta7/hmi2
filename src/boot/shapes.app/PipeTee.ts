/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class PipeTee extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.PipeTee',
      size: { width: 60, height: 50 },
      attrs: {
        root: { magnet: false },
        outline: {
          d: 'M 0 calc(h/2) H calc(w) M calc(w/2) calc(h/2) V calc(h)',
          fill: 'none',
          stroke: 'gray',
          strokeWidth: 28,
          strokeLinecap: 'square',
          strokeLinejoin: 'round'
        },
        body: {
          d: 'M 0 calc(h/2) H calc(w) M calc(w/2) calc(h/2) V calc(h)',
          fill: 'none',
          stroke: '#ddd',
          strokeWidth: 24,
          strokeLinecap: 'square',
          strokeLinejoin: 'round'
        },
        label: {
          text: '三通',
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
          pipe: {
            position: { name: 'absolute', args: {} },
            markup: joint.util.svg`<rect @selector="pipeEnd" />`,
            size: { width: 10, height: 28 },
            attrs: {
              pipeEnd: { magnet: true, width: 10, height: 28, y: -14, stroke: 'gray', strokeWidth: 3, fill: 'white' }
            }
          }
        },
        items: [
          { id: 'left', group: 'pipe', z: 0, args: { x: 0, y: 'calc(h/2)' } },
          { id: 'right', group: 'pipe', z: 0, args: { x: 'calc(w)', y: 'calc(h/2)' } },
          { id: 'bottom', group: 'pipe', z: 0, args: { x: 'calc(w/2)', y: 'calc(h)' }, attrs: { pipeEnd: { width: 28, height: 10, x: -14, y: 0 } } }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg`
      <path @selector="outline" />
      <path @selector="body" />
      <text @selector="label" />
    `
  }
}
