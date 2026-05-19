/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class ThreeWayValve extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.ThreeWayValve',
      size: { width: 60, height: 60 },
      attrs: {
        root: { magnet: false },
        body: {
          rx: 'calc(w / 2)',
          ry: 'calc(h / 2)',
          cx: 'calc(w / 2)',
          cy: 'calc(h / 2)',
          stroke: '#00c4b4',
          strokeWidth: 2,
          fill: '#1a1a2e'
        },
        crossH: {
          d: 'M calc(w/2 - 16) calc(h/2) H calc(w/2 + 16)',
          stroke: '#00c4b4',
          strokeWidth: 3,
          fill: 'none',
          strokeLinecap: 'round'
        },
        crossV: {
          d: 'M calc(w/2) calc(h/2) V calc(h/2 + 16)',
          stroke: '#00c4b4',
          strokeWidth: 3,
          fill: 'none',
          strokeLinecap: 'round'
        },
        hub: {
          cx: 'calc(w / 2)',
          cy: 'calc(h / 2)',
          r: 5,
          fill: '#008077',
          stroke: '#00c4b4',
          strokeWidth: 1
        },
        label: {
          text: '三通阀',
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
          pipesH: {
            position: { name: 'absolute', args: { x: 'calc(w / 2)', y: 'calc(h / 2)' } },
            markup: joint.util.svg`<rect @selector="pipeBody" /><rect @selector="pipeEnd" />`,
            size: { width: 50, height: 24 },
            attrs: {
              pipeBody: { width: 'calc(w)', height: 'calc(h)', y: 'calc(h / -2)', fill: '#2a2a40', stroke: '#00c4b4', strokeWidth: 1 },
              pipeEnd: { magnet: true, width: 10, height: 'calc(h+6)', y: 'calc(h / -2 - 3)', stroke: '#00c4b4', strokeWidth: 3, fill: '#2a2a40' }
            }
          },
          pipesV: {
            position: { name: 'absolute', args: { x: 'calc(w / 2)', y: 'calc(h / 2)' } },
            markup: joint.util.svg`<rect @selector="pipeBody" /><rect @selector="pipeEnd" />`,
            size: { width: 24, height: 40 },
            attrs: {
              pipeBody: { width: 'calc(w)', height: 'calc(h)', x: 'calc(w / -2)', fill: '#2a2a40', stroke: '#00c4b4', strokeWidth: 1 },
              pipeEnd: { magnet: true, width: 'calc(w+6)', height: 10, x: 'calc(w / -2 - 3)', stroke: '#00c4b4', strokeWidth: 3, fill: '#2a2a40' }
            }
          }
        },
        items: [
          { id: 'left', group: 'pipesH', z: 0, attrs: { pipeBody: { x: 'calc(-1 * w)' }, pipeEnd: { x: 'calc(-1 * w)' } } },
          { id: 'right', group: 'pipesH', z: 0, attrs: { pipeEnd: { x: 'calc(w - 10)' } } },
          { id: 'bottom', group: 'pipesV', z: 0, attrs: { pipeEnd: { y: 'calc(h - 10)' } } }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg`
      <ellipse @selector="body" />
      <path @selector="crossH" />
      <path @selector="crossV" />
      <circle @selector="hub" />
      <text @selector="label" />
    `
  }
}
