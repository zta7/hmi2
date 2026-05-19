/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class SafetyValve extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.SafetyValve',
      size: { width: 50, height: 50 },
      attrs: {
        root: { magnet: false },
        body: {
          rx: 'calc(w / 2)',
          ry: 'calc(h / 2)',
          cx: 'calc(w / 2)',
          cy: 'calc(h / 2)',
          stroke: '#e15656',
          strokeWidth: 2,
          fill: '#1a1a2e'
        },
        stem: {
          x: 'calc(w / 2 - 4)',
          y: -28,
          width: 8,
          height: 28,
          fill: '#3d3d60',
          stroke: '#e15656',
          strokeWidth: 1
        },
        spring: {
          d: 'M 17 -24 L 33 -21 L 17 -18 L 33 -15 L 17 -12 L 33 -9 L 17 -6',
          fill: 'none',
          stroke: '#e15656',
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        },
        cap: {
          x: 'calc(w/2 - 12)',
          y: -40,
          width: 24,
          height: 12,
          rx: 2,
          ry: 2,
          fill: '#4a4a80',
          stroke: '#b03a3a',
          strokeWidth: 2
        },
        vent: {
          d: 'M 29 17 H 55 L 55 12 L 60 17 L 55 22 L 55 17',
          stroke: '#e15656',
          strokeWidth: 2,
          fill: 'none',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        },
        label: {
          text: '安全阀',
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
              pipeBody: { width: 'calc(w)', height: 'calc(h)', y: 'calc(h / -2)', fill: '#2a2a40', stroke: '#e15656', strokeWidth: 1 },
              pipeEnd: { magnet: true, width: 10, height: 'calc(h+6)', y: 'calc(h / -2 - 3)', stroke: '#e15656', strokeWidth: 3, fill: '#2a2a40' }
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
      <rect @selector="stem" />
      <path @selector="spring" />
      <rect @selector="cap" />
      <ellipse @selector="body" />
      <path @selector="vent" />
      <text @selector="label" />
    `
  }
}
