import * as joint from '@clientio/rappid'

export class Square extends joint.shapes.standard.Rectangle {
  defaults () {
    return {
      ...super.defaults,
      fills: [],
      type: 'app.Square'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
