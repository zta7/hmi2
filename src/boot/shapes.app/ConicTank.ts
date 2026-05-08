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
          stroke: 'gray',
          strokeWidth: 4,
          x: 0,
          y: 0,
          width: 'calc(w)',
          height: 'calc(h)',
          rx: 120,
          ry: 10,
          fill: 'lightgray'
        },
        top: {
          x: 0,
          y: 20,
          width: 'calc(w)',
          height: 20,
          fill: 'none',
          stroke: 'gray',
          strokeWidth: 2
        },
        bottom: {
          d: 'M 0 0 L calc(w) 0 L calc(w / 2 + 10) 70 h -20 Z',
          transform: 'translate(0, calc(h - 10))',
          stroke: 'gray',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          fill: '#ddd'
        },
        label: {
          text: 'Tank 2',
          textAnchor: 'middle',
          textVerticalAnchor: 'bottom',
          x: 'calc(w / 2)',
          y: -10,
          fontSize: 14,
          fontFamily: 'sans-serif',
          fill: '#350100'
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
