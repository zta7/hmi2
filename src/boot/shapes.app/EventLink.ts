import * as joint from '@clientio/rappid'

export class EventLink extends joint.shapes.standard.Link {
  defaults () {
    return joint.util.defaultsDeep({
      type: 'app.EventLink',
      z: -1,
      labels: [],
      attrs: {
        line: {
          stroke: 'green',
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
