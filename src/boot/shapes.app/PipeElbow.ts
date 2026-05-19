/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class PipeElbow extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.PipeElbow',
      size: { width: 50, height: 50 },
      attrs: {
        root: { magnet: false },
        body: {
          d: 'M 0 calc(h/2 - 12) H calc(w/2 - 12) Q calc(w/2 + 12) calc(h/2 - 12) calc(w/2 + 12) calc(h/2 + 12) V calc(h)',
          fill: 'none',
          stroke: '#2a2a40',
          strokeWidth: 24,
          strokeLinecap: 'square',
          strokeLinejoin: 'round'
        },
        outline: {
          d: 'M 0 calc(h/2 - 12) H calc(w/2 - 12) Q calc(w/2 + 12) calc(h/2 - 12) calc(w/2 + 12) calc(h/2 + 12) V calc(h)',
          fill: 'none',
          stroke: '#a0a0c0',
          strokeWidth: 28,
          strokeLinecap: 'square',
          strokeLinejoin: 'round'
        },
        label: {
          text: '弯头',
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
          pipe: {
            position: { name: 'absolute', args: {} },
            markup: joint.util.svg`<rect @selector="pipeEnd" />`,
            size: { width: 10, height: 28 },
            attrs: {
              pipeEnd: { magnet: true, width: 10, height: 28, y: -14, stroke: '#a0a0c0', strokeWidth: 3, fill: '#2a2a40' }
            }
          }
        },
        items: [
          { id: 'left', group: 'pipe', z: 0, args: { x: 0, y: 'calc(h/2)' } },
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
