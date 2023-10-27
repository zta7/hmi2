import * as joint from '@clientio/rappid'

export class Group extends joint.shapes.standard.Rectangle {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Group'
    }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
