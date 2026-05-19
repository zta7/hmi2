/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'
export class HandValve extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.HandValve',
      size: {
        width: 50,
        height: 50
      },
      power: 0,
      attrs: {
        root: {
          magnet: false
        },
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
          width: 10,
          height: 30,
          x: 'calc(w / 2 - 5)',
          y: -30,
          stroke: '#00c4b4',
          strokeWidth: 2,
          fill: '#3d3d60'
        },
        handwheel: {
          width: 60,
          height: 10,
          x: 'calc(w / 2 - 30)',
          y: -30,
          stroke: '#008077',
          strokeWidth: 2,
          rx: 5,
          ry: 5,
          fill: '#4a4a80'
        },
        label: {
          text: 'Valve',
          textAnchor: 'middle',
          textVerticalAnchor: 'top',
          x: 'calc(0.5*w)',
          y: 'calc(h+10)',
          fontSize: '14',
          fontFamily: 'sans-serif',
          fill: '#a0a0c0'
        }
      },
      ports: {
        groups: {
          pipes: {
            position: {
              name: 'absolute',
              args: {
                x: 'calc(w / 2)',
                y: 'calc(h / 2)'
              }
            },
            markup: joint.util.svg`
                          <rect @selector="pipeBody" />
                          <rect @selector="pipeEnd" />
                      `,
            size: { width: 50, height: 30 },
            attrs: {
              // portRoot: {
              //   magnetSelector: 'pipeEnd'
              // },
              pipeBody: {
                width: 'calc(w)',
                height: 'calc(h)',
                y: 'calc(h / -2)',
                fill: '#2a2a40',
                stroke: '#00c4b4',
                strokeWidth: 1
              },
              pipeEnd: {
                magnet: true,
                width: 10,
                height: 'calc(h+6)',
                y: 'calc(h / -2 - 3)',
                stroke: '#00c4b4',
                strokeWidth: 3,
                fill: '#2a2a40'
              }
            }
          }
        },
        items: [
          {
            id: 'left',
            group: 'pipes',
            z: 0,
            attrs: {
              pipeBody: {
                x: 'calc(-1 * w)'
              },
              pipeEnd: {
                x: 'calc(-1 * w)'
              }
            }
          },
          {
            id: 'right',
            group: 'pipes',
            z: 0,
            attrs: {
              pipeEnd: {
                x: 'calc(w - 10)'
              }
            }
          }
        ]
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg/* xml */`
          <rect @selector="stem" />
          <rect @selector="handwheel" />
          <ellipse @selector="body" />
          <text @selector="label" />
      `
  }
}
