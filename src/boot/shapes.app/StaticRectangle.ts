import * as joint from '@clientio/rappid'

export class StaticRectangle extends joint.shapes.standard.Rectangle {
  defaults () {
    return {
      ...super.defaults,
      fills: [],
      type: 'app.StaticRectangle'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
