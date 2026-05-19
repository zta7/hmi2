/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class HorizontalTank extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.HorizontalTank',
      size: { width: 200, height: 80 },
      attrs: {
        root: { magnet: false },
        body: {
          x: 30,
          y: 0,
          width: 'calc(w - 60)',
          height: 'calc(h)',
          fill: '#1a1a2e',
          stroke: '#7c5af8',
          strokeWidth: 3
        },
        capLeft: {
          cx: 30,
          cy: 'calc(h / 2)',
          rx: 30,
          ry: 'calc(h / 2)',
          fill: '#2a2a40',
          stroke: '#7c5af8',
          strokeWidth: 3
        },
        capRight: {
          cx: 'calc(w - 30)',
          cy: 'calc(h / 2)',
          rx: 30,
          ry: 'calc(h / 2)',
          fill: '#2a2a40',
          stroke: '#7c5af8',
          strokeWidth: 3
        },
        nozzleTop: {
          x: 'calc(w/2 - 6)',
          y: -18,
          width: 12,
          height: 18,
          fill: '#3d3d60',
          stroke: '#7c5af8',
          strokeWidth: 2
        },
        nozzleBottom: {
          x: 'calc(w/2 - 6)',
          y: 'calc(h)',
          width: 12,
          height: 18,
          fill: '#3d3d60',
          stroke: '#7c5af8',
          strokeWidth: 2
        },
        label: {
          text: '卧式罐',
          textAnchor: 'middle',
          textVerticalAnchor: 'top',
          x: 'calc(0.5*w)',
          y: 'calc(h+28)',
          fontSize: 14,
          fontFamily: 'sans-serif',
          fill: '#a0a0c0'
        }
      },
      ports: {
        groups: {
          pipes: {
            position: { name: 'absolute', args: {} },
            markup: joint.util.svg`<rect @selector="pipeEnd" />`,
            size: { width: 10, height: 24 },
            attrs: {
              pipeEnd: { magnet: true, width: 10, height: 24, y: -12, stroke: '#7c5af8', strokeWidth: 3, fill: '#2a2a40' }
            }
          }
        },
        items: [
          { id: 'left', group: 'pipes', z: 0, args: { x: 0, y: 'calc(h/2)' } },
          { id: 'right', group: 'pipes', z: 0, args: { x: 'calc(w)', y: 'calc(h/2)' } },
          { id: 'top', group: 'pipes', z: 0, args: { x: 'calc(w/2)', y: 0 }, attrs: { pipeEnd: { width: 24, height: 10, x: -12, y: 0 } } },
          { id: 'bottom', group: 'pipes', z: 0, args: { x: 'calc(w/2)', y: 'calc(h)' }, attrs: { pipeEnd: { width: 24, height: 10, x: -12, y: 0 } } }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg`
      <rect @selector="nozzleTop" />
      <rect @selector="nozzleBottom" />
      <ellipse @selector="capLeft" />
      <ellipse @selector="capRight" />
      <rect @selector="body" />
      <text @selector="label" />
    `
  }
}
