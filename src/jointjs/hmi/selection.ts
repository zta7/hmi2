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
    filter: (el) => el.isEmbedded()
  } as joint.ui.Selection.Options
}
