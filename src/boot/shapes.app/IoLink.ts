import * as joint from '@clientio/rappid'

export class IoLink extends joint.shapes.standard.Link {
  defaults () {
    return joint.util.defaultsDeep({
      type: 'app.IoLink',
      z: -1,
      labels: [],
      attrs: {
        line: {
          stroke: 'orange',
          strokeDasharray: '0',
          strokeWidth: 2,
          targetMarker: null
        }
      }
    }, super.defaults)
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
