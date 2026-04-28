import * as joint from '@clientio/rappid'

export class GroupBox extends joint.shapes.standard.Rectangle {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.GroupBox',
      size: { width: 200, height: 150 },
      attrs: {
        body: {
          fill: 'transparent',
          stroke: '#555577',
          strokeWidth: 1,
          rx: 4,
          ry: 4
        },
        label: {
          text: 'Group',
          refX: 12,
          refY: 0,
          textAnchor: 'start',
          textVerticalAnchor: 'top',
          fontSize: 11,
          fontFamily: 'sans-serif',
          fill: '#8888a0',
          fontWeight: 600
        }
      }
    }
  }
}
