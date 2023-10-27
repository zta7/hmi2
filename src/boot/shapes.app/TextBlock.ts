import * as joint from '@clientio/rappid'

export class TextBlock extends joint.shapes.standard.Rectangle {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.TextBlock'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
