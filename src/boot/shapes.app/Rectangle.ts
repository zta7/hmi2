import * as joint from '@clientio/rappid'

export class Rectangle extends joint.shapes.standard.Rectangle {
  defaults () {
    return {
      ...super.defaults,
      fills: [],
      type: 'app.Rectangle'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
