/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class Reactor extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Reactor',
      size: { width: 100, height: 200 },
      attrs: {
        root: { magnet: false },
        body: {
          x: 0,
          y: 30,
          width: 'calc(w)',
          height: 'calc(h - 80)',
          fill: 'lightgray',
          stroke: 'gray',
          strokeWidth: 3
        },
        topDome: {
          cx: 'calc(w / 2)',
          cy: 30,
          rx: 'calc(w / 2)',
          ry: 30,
          fill: '#ddd',
          stroke: 'gray',
          strokeWidth: 3
        },
        bottomCone: {
          d: 'M 0 0 H calc(w) L calc(w/2 + 10) 50 H calc(w/2 - 10) Z',
          transform: 'translate(0, calc(h - 80))',
          fill: '#ccc',
          stroke: 'gray',
          strokeWidth: 3,
          strokeLinejoin: 'round'
        },
        nozzleTop: {
          x: 'calc(w/2 - 6)',
          y: 0,
          width: 12,
          height: 10,
          fill: '#bbb',
          stroke: 'gray',
          strokeWidth: 2
        },
        nozzleBottom: {
          x: 'calc(w/2 - 4)',
          y: 'calc(h - 30)',
          width: 8,
          height: 30,
          fill: '#bbb',
          stroke: 'gray',
          strokeWidth: 2
        },
        coilLeft: {
          d: 'M 8 60 Q 22 65 8 75 Q 22 80 8 90 Q 22 95 8 105',
          fill: 'none',
          stroke: '#aaa',
          strokeWidth: 5,
          strokeLinecap: 'round'
        },
        coilRight: {
          d: 'M calc(w-8) 60 Q calc(w-22) 65 calc(w-8) 75 Q calc(w-22) 80 calc(w-8) 90 Q calc(w-22) 95 calc(w-8) 105',
          fill: 'none',
          stroke: '#aaa',
          strokeWidth: 5,
          strokeLinecap: 'round'
        },
        label: {
          text: '反应器',
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
          { id: 'bottom', group: 'pipes', z: 0, args: { x: 'calc(w/2)', y: 'calc(h)' }, attrs: { pipeEnd: { width: 12, height: 10, x: -6, y: 0 } } },
          { id: 'left', group: 'pipes', z: 0, args: { x: 0, y: 'calc(h/2)' } },
          { id: 'right', group: 'pipes', z: 0, args: { x: 'calc(w)', y: 'calc(h/2)' } }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg`
      <path @selector="bottomCone" />
      <rect @selector="body" />
      <ellipse @selector="topDome" />
      <rect @selector="nozzleTop" />
      <rect @selector="nozzleBottom" />
      <path @selector="coilLeft" />
      <path @selector="coilRight" />
      <text @selector="label" />
    `
  }
}
