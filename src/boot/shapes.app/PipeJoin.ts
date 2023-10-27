/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class PipeJoin extends joint.shapes.standard.Rectangle {
  defaults () {
    return {
      ...super.defaults,
      fills: [],
      type: 'app.PipeJoin',
      ports: {
        groups: {
          left: {
            markup: [{
              tagName: 'circle',
              selector: 'portBody',
              attributes: {
                r: 6
              }
            }],
            attrs: {
              portBody: {
                magnet: true,
                fill: '#61549c',
                strokeWidth: 0
              },
              portLabel: {
                fontSize: 11,
                fill: '#61549c',
                fontWeight: 800
              }
            },
            position: {
              name: 'left'
            },
            label: {
              position: {
                name: 'left',
                args: {
                  y: 0
                }
              }
            }
          },
          right: {
            markup: [{
              tagName: 'circle',
              selector: 'portBody',
              attributes: {
                r: 6
              }
            }],
            position: {
              name: 'right'
            },
            attrs: {
              portBody: {
                magnet: true,
                fill: '#61549c',
                strokeWidth: 0
              },
              portLabel: {
                fontSize: 11,
                fill: '#61549c',
                fontWeight: 800
              }
            },
            label: {
              position: {
                name: 'right',
                args: {
                  y: 0
                }
              }
            }
          },
          top: {
            markup: [{
              tagName: 'circle',
              selector: 'portBody',
              attributes: {
                r: 6
              }
            }],
            attrs: {
              portBody: {
                magnet: true,
                fill: '#61549c',
                strokeWidth: 0
              },
              portLabel: {
                fontSize: 11,
                fill: '#61549c',
                fontWeight: 800
              }
            },
            position: {
              name: 'top'
            },
            label: {
              position: {
                name: 'top',
                args: {
                  y: 0
                }
              }
            }
          },
          bottom: {
            markup: [{
              tagName: 'circle',
              selector: 'portBody',
              attributes: {
                r: 6
              }
            }],
            position: {
              name: 'bottom'
            },
            attrs: {
              portBody: {
                magnet: true,
                fill: '#61549c',
                strokeWidth: 0
              },
              portLabel: {
                fontSize: 11,
                fill: '#61549c',
                fontWeight: 800
              }
            },
            label: {
              position: {
                name: 'bottom',
                args: {
                  y: 0
                }
              }
            }
          }
        },
        items: [
          { group: 'left' },
          { group: 'right' },
          { group: 'top' },
          { group: 'bottom' }
        ]
      }
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
