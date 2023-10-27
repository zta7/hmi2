import * as joint from '@clientio/rappid'

export class Light extends joint.shapes.standard.Rectangle {
  defaults () {
    return {
      ...super.defaults,
      fills: [],
      type: 'app.Light'
    }
  }

  initialize (...args: any[]) {
    console.log(args)
    super.initialize.call(this, ...args)
  }
}
