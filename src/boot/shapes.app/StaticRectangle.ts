import * as joint from '@clientio/rappid'

export class StaticRectangle extends joint.shapes.standard.Rectangle {
  defaults () {
    return {
      ...super.defaults,
      fills: [],
      type: 'app.StaticRectangle',
      attrs: {
        body: {
          fill: '#1a1a2e',
          stroke: '#7c5af8',
          strokeWidth: 1.5,
          rx: 4,
          ry: 4
        },
        label: {
          fill: '#7c5af8',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'sans-serif'
        }
      }
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
