import * as joint from '@clientio/rappid'

export class Circle extends joint.shapes.standard.Circle {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Circle'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
