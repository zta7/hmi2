import * as joint from '@clientio/rappid'

export const getStencilConfig = (paper: joint.dia.Paper | joint.ui.PaperScroller, snaplines: joint.ui.Snaplines) => {
  return {
    dragEndClone: (el) => {
      const { shape } = el.attributes
      if (shape) {
        // const type = shape.get('type')
        // if (type === 'app.FunctionBlock') {
        //   await Dialog.create({
        //     title: 'Prompt',
        //     message: 'What is your name?',
        //     prompt: {
        //       model: '',
        //       type: 'text' // optional
        //     },
        //     cancel: true,
        //     persistent: true
        //   })
        // }
        const clone = shape.clone()
        return clone
      }
    },
    paper,
    paperOptions: () => {
      return {
        model: new joint.dia.Graph({}, { cellNamespace: joint.shapes }),
        cellViewNamespace: joint.shapes
      }
    },
    groups: {
      FunctionBlock: { label: 'FunctionBlock', index: 1 },
      VariableDot: { label: 'VariableDot', index: 2 }
    },
    layout: {
      columns: 4,
      columnWidth: 45,
      rowHeight: 45
    },
    usePaperGrid: true,
    snaplines,
    search: {
      '*': ['shape/attributes/type']
    }
  } as joint.ui.Stencil.Options
}

const shapes = joint.shapes as any
const app = shapes.app

export const getStencilLoad = () => {
  return {
    FunctionBlock: [
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.FunctionBlock(),
        attrs: {
          image: {
            href: './stencil/input.svg'
            // 'data-tooltip': 'Input'
          }
        }
      }
    ],
    VariableDot: [
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.VariableDot(),
        attrs: {
          image: {
            href: './stencil/input.svg'
            // 'data-tooltip': 'Input'
          }
        }
      }
    ]
  }
}
