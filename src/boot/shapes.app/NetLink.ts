import * as joint from '@clientio/rappid'

export class NetLink extends joint.shapes.standard.Link {
  defaults () {
    return joint.util.defaultsDeep({
      type: 'app.NetLink',
      z: -1,
      labels: [],
      attrs: {
        line: {
          stroke: '#8f8f8f',
          strokeDasharray: '0',
          strokeWidth: 2
        }
      }
    }, super.defaults)
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
