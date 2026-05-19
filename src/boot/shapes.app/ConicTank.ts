/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class ConicTank extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.ConicTank',
      size: {
        width: 160,
        height: 100
      },
      attrs: {
        root: {
          magnetSelector: 'body'
        },
        body: {
          stroke: '#7c5af8',
          strokeWidth: 4,
          x: 0,
          y: 0,
          width: 'calc(w)',
          height: 'calc(h)',
          rx: 120,
          ry: 10,
          fill: '#1a1a2e'
        },
        top: {
          x: 0,
          y: 20,
          width: 'calc(w)',
          height: 20,
          fill: 'none',
          stroke: '#7c5af8',
          strokeWidth: 2
        },
        bottom: {
          d: 'M 0 0 L calc(w) 0 L calc(w / 2 + 10) 70 h -20 Z',
          transform: 'translate(0, calc(h - 10))',
          stroke: '#7c5af8',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          fill: '#3d3d60'
        },
        label: {
          text: 'Tank 2',
          textAnchor: 'middle',
          textVerticalAnchor: 'bottom',
          x: 'calc(w / 2)',
          y: -10,
          fontSize: 14,
          fontFamily: 'sans-serif',
          fill: '#a0a0c0'
        }
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg/* xml */`
          <path @selector="bottom"/>
          <rect @selector="body"/>
          <rect @selector="top"/>
          <text @selector="label" />
      `
  }
}
