/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class Conveyor extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Conveyor',
      size: { width: 200, height: 60 },
      attrs: {
        root: { magnet: false },
        frame: {
          x: 20,
          y: 'calc(h/2 - 14)',
          width: 'calc(w - 40)',
          height: 28,
          fill: 'none',
          stroke: '#4a9eff',
          strokeWidth: 3,
          rx: 14,
          ry: 14
        },
        belt: {
          x: 20,
          y: 'calc(h/2 - 14)',
          width: 'calc(w - 40)',
          height: 28,
          fill: '#2a2a40',
          stroke: 'none',
          rx: 14,
          ry: 14
        },
        rollerLeft: {
          cx: 20,
          cy: 'calc(h/2)',
          r: 14,
          fill: '#3d3d60',
          stroke: '#4a9eff',
          strokeWidth: 3
        },
        rollerRight: {
          cx: 'calc(w - 20)',
          cy: 'calc(h/2)',
          r: 14,
          fill: '#3d3d60',
          stroke: '#4a9eff',
          strokeWidth: 3
        },
        rollerLeftInner: {
          cx: 20,
          cy: 'calc(h/2)',
          r: 6,
          fill: '#5a5a90',
          stroke: '#2d6bc9',
          strokeWidth: 1
        },
        rollerRightInner: {
          cx: 'calc(w - 20)',
          cy: 'calc(h/2)',
          r: 6,
          fill: '#5a5a90',
          stroke: '#2d6bc9',
          strokeWidth: 1
        },
        legs: {
          d: 'M 30 calc(h/2 + 14) V calc(h) M calc(w - 30) calc(h/2 + 14) V calc(h)',
          fill: 'none',
          stroke: '#4a9eff',
          strokeWidth: 4,
          strokeLinecap: 'round'
        },
        label: {
          text: '传送带',
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
          items: {
            position: { name: 'absolute', args: {} },
            markup: joint.util.svg`<rect @selector="portBody" />`,
            size: { width: 20, height: 8 },
            attrs: { portBody: { magnet: true, width: 20, height: 8, x: -10, y: -4, fill: '#2a2a40', stroke: '#4a9eff', strokeWidth: 2 } }
          }
        },
        items: [
          { id: 'in', group: 'items', z: 0, args: { x: 0, y: 'calc(h/2)' } },
          { id: 'out', group: 'items', z: 0, args: { x: 'calc(w)', y: 'calc(h/2)' } }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg`
      <path @selector="legs" />
      <rect @selector="belt" />
      <rect @selector="frame" />
      <circle @selector="rollerLeft" />
      <circle @selector="rollerRight" />
      <circle @selector="rollerLeftInner" />
      <circle @selector="rollerRightInner" />
      <text @selector="label" />
    `
  }
}
