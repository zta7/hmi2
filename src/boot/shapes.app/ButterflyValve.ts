/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class ButterflyValve extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.ButterflyValve',
      size: { width: 50, height: 50 },
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
        stem: {
          x1: 'calc(w / 2)',
          y1: 0,
          x2: 'calc(w / 2)',
          y2: 'calc(h)',
          stroke: '#00c4b4',
          strokeWidth: 3
        },
        discLeft: {
          d: 'M calc(w/2) calc(h/2 - 14) Q calc(w/2 - 14) calc(h/2) calc(w/2) calc(h/2 + 14)',
          fill: '#00a399',
          stroke: '#008077',
          strokeWidth: 1.5
        },
        discRight: {
          d: 'M calc(w/2) calc(h/2 - 14) Q calc(w/2 + 14) calc(h/2) calc(w/2) calc(h/2 + 14)',
          fill: '#00c4b4',
          stroke: '#008077',
          strokeWidth: 1.5
        },
        label: {
          text: '蝶阀',
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
              pipeBody: { width: 'calc(w)', height: 'calc(h)', y: 'calc(h / -2)', fill: '#2a2a40', stroke: '#00c4b4', strokeWidth: 1 },
              pipeEnd: { magnet: true, width: 10, height: 'calc(h+6)', y: 'calc(h / -2 - 3)', stroke: '#00c4b4', strokeWidth: 3, fill: '#2a2a40' }
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
      <line @selector="stem" />
      <path @selector="discLeft" />
      <path @selector="discRight" />
      <text @selector="label" />
    `
  }
}
