import * as joint from '@clientio/rappid'
import Backbone from 'backbone'

export const HANDLES = [
  {
    name: 'remove',
    position: 'nw' as joint.ui.Selection.HandlePosition,
    events: {
      pointerdown: 'removeElements'
    }
  },
  {
    name: 'resize',
    position: 'se' as joint.ui.Selection.HandlePosition,
    events: {
      pointerdown: 'startResizing',
      pointermove: 'doResize',
      pointerup: 'stopBatch'
    }
  },
  {
    name: 'rotate',
    position: 'sw' as joint.ui.Selection.HandlePosition,
    events: {
      pointerdown: 'startRotating',
      pointermove: 'doRotate',
      pointerup: 'stopBatch'
    }
  },
  {
    name: 'clone',
    position: 'ne' as joint.ui.Selection.HandlePosition
  }
]

export const getSelectionHandles = (collection: Backbone.Collection): Array<joint.ui.Selection.Handle> => {
  if (collection.length === 1) {
    const cell = collection.first() as joint.dia.Cell
    if (cell.isElement()) {
      if (cell.getEmbeddedCells().length > 0) {
        return []
      } else {
        return HANDLES
      }
    } else {
      // Link
      return []
    }
  } else if (collection.length > 1) {
    return HANDLES
  }
  return []
}

export const getSelectionConfig = (paper: joint.dia.Paper) => {
  return {
    paper,
    filter: (el) => el.isEmbedded(),
    // async 渲染下 view bbox 滞后，改用模型几何（position/size/angle）计算选中框，
    // 保证 resize/移动后选中框实时准确（旋转组件也会按角度换算外接矩形）。
    useModelGeometry: true
  } as joint.ui.Selection.Options
}
