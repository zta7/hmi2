import * as joint from '@clientio/rappid'

export class Link extends joint.shapes.standard.Link {
  defaultLabel = {
    attrs: {
      rect: {
        fill: '#ffffff',
        stroke: '#8f8f8f',
        strokeWidth: 1,
        width: 'calc(w + 10)',
        height: 'calc(h + 10)',
        x: -5,
        y: -5
      }
    }
  }

  defaults () {
    return joint.util.defaultsDeep({
      type: 'app.Link',
      router: {
        name: 'normal'
      },
      connector: {
        name: 'rounded'
      },
      labels: [],
      attrs: {
        line: {
          stroke: '#8888a0',
          strokeDasharray: '0',
          strokeWidth: 2,
          fill: 'none',
          sourceMarker: {
            type: 'path',
            d: 'M 0 0 0 0',
            stroke: 'none'
          },
          targetMarker: {
            type: 'path',
            d: 'M 0 -5 -10 0 0 5 z',
            stroke: 'none'
          }
        }
      }
    }, joint.shapes.standard.Link.prototype.defaults)
  }
}
