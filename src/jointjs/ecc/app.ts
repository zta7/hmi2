import * as joint from '@clientio/rappid'
import Backbone from 'backbone'
import { getInspectorConfig } from './inspector'
import { get, debounce, cloneDeep } from 'lodash'
import { getSelectionHandles, HANDLES, getSelectionConfig } from './selection'
import { getStencilConfig, getStencilLoad } from './stencil'
import { getToolbarConfig } from './toolbar'
import { getTooltipConfig } from './tooltip'
import { dom } from 'quasar'
import { BasicApp, BasicProps } from '../BasicApp'

export type resourceOption = {
  content: string
  value: string | number
}
export class App extends BasicApp {
  constructor (props: BasicProps) {
    super(props)

    this.stencil.load({
      FunctionBlock: [
        {
          type: 'standard.Image',
          size: { width: 32, height: 32 },
          shape: new joint.shapes.app.FunctionBlock(),
          attrs: {
            image: {
              href: './stencil/input.svg'
            }
          }
        }
      ],
      VariableDot: [
        {
          type: 'standard.Image',
          size: { width: 32, height: 32 },
          shape: new joint.shapes.app.VariableDot(),
          attrs: {
            image: {
              href: './stencil/input.svg'
            }
          }
        }
      ]
    })
  }

  initToolbarEvents () {
    this.toolbar.on({
      'paper-width:change': (width: number) => {
        this.paper.setDimensions(width, this.paper.options.height as number)
        this.postWindowTop()
      },
      'paper-height:change': (height: number) => {
        this.paper.setDimensions(this.paper.options.width as number, height)
        this.postWindowTop()
      },
      'copy:pointerclick': () => {
        console.log('fasfas')
        this.clipboard.copyElements(this.selection.collection, this.graph)
      },
      'paste:pointerclick': () => {
        const pastedCells = this.clipboard.pasteCells(this.graph)
        const elements = pastedCells.filter(cell => cell.isElement())
        this.selection.collection.reset(elements)
      }
    })
  }

  initStencilEvents () {
    this.stencil.on('element:dragend', async (view, _evt, cloneArea) => {
      const { shape } = view.model.attributes
      if (shape) {
        // const type = shape.get('type')
        // give link a length
        if (!shape.isElement()) {
          shape.source(cloneArea.bottomLeft())
          shape.target(cloneArea.topRight())
        }
      }
    })
  }

  initSelectionEvents (inspectorEl?:HTMLElement) {
    this.selection.on('action:clone:pointerdown', (evt) => {
      evt.stopPropagation()
      this.clipboard.copyElements(this.selection.collection, this.graph)
      this.clipboard.pasteCells(this.graph)
    })

    this.selection.collection.on('reset add remove', (collection: Backbone.Collection) => {
      this.paper.removeTools()
      joint.ui.Inspector.close()
      const copyTool = this.toolbar.getWidgetByName('copy')
      // 删除所有handles
      HANDLES.forEach(e => this.selection.removeHandle(e.name))
      // 添加handles
      const handles = getSelectionHandles(collection)
      handles.forEach(e => this.selection.addHandle(e))
      // 添加inspector
      const inspectorConfig = getInspectorConfig(collection, this.paper)
      inspectorEl && inspectorConfig && joint.ui.Inspector.create(inspectorEl, inspectorConfig)
      // this.selection
      if (collection.length === 1) {
        copyTool.enable()
        const cell = collection.first() as joint.dia.Cell
        if (!cell.isElement()) {
          const view = this.paper.findViewByModel(cell)
          const ns = joint.linkTools
          const toolsView = new joint.dia.ToolsView({
            name: 'link-pointerdown',
            tools: [
              new ns.Vertices(),
              new ns.SourceAnchor(),
              new ns.TargetAnchor(),
              new ns.SourceArrowhead(),
              new ns.TargetArrowhead(),
              new ns.Segments(),
              new ns.Remove({ offset: -20, distance: 40 })
            ]
          })
          view.addTools(toolsView)
        }
      } else if (collection.length > 1) {
        copyTool.enable()
      } else if (collection.length === 0) {
        copyTool.disable()
      }
    })
  }

  initPaperEvents () {
    this.paper.on('link:connect', (linkView) => {
      const tmpLink = linkView.model
      if (tmpLink.get('switchSourceAndTarget')) {
        const newLink = tmpLink.clone()
        newLink.removeProp('switchSourceAndTarget')
        const source = cloneDeep(newLink.prop('source'))
        const target = cloneDeep(newLink.prop('target'))
        newLink.prop('source', target)
        newLink.prop('target', source)
        tmpLink.remove()

        console.log(newLink)

        this.graph.addCell(newLink)

        console.log(newLink)
      }
      // const link = new joint.shapes.standard.Link({
      //   source: tmpLink.target(),
      //   target: tmpLink.source(),
      //   attrs: {
      //     line: {
      //       stroke: 'blue'
      //     }
      //   }
      // })
      // tmpLink.remove()
      // this.graph.addCell(link)
    })

    this.paper.on('blank:pointerdown', (evt) => {
      this.selection.startSelecting(evt)
      this.paper.removeTools()
    })

    this.paper.on('blank:pointerdown cell:pointerdown', () => {
      const el = document.activeElement as HTMLElement
      if (el) { el.blur() }
    })

    this.paper.on('cell:pointerup', (elementView) => {
      const element = elementView.model
      const [group = element] = element.getAncestors().reverse()
      if (!this.selection.collection.has(group)) {
        this.selection.collection.reset([group])
      }
    })

    this.paper.on('link:mouseenter', (linkView) => {
      if (linkView.hasTools()) { return }

      const ns = joint.linkTools
      const toolsView = new joint.dia.ToolsView({
        name: 'link-hover',
        tools: [
          new ns.Vertices({ vertexAdding: false }),
          new ns.SourceArrowhead(),
          new ns.TargetArrowhead()
        ]
      })

      linkView.addTools(toolsView)
    })
    this.paper.on('link:mouseleave', function (linkView) {
      if (linkView.hasTools('link-hover')) {
        linkView.removeTools()
      }
    })

    // this.paper.on('paper', () => {
    //   console.log(111)
    // })
  }

  initKeyboardEvents () {
    this.keyboard.on({
      'ctrl+c': () => {
        this.clipboard.copyElements(this.selection.collection, this.graph)
      },

      'ctrl+v': () => {
        const pastedCells = this.clipboard.pasteCells(this.graph)
        const elements = pastedCells.filter(cell => cell.isElement())
        this.selection.collection.reset(elements)
      },

      'delete backspace': () => {
        this.graph.removeCells(this.selection.collection.toArray())
      },

      'ctrl+z': () => {
        this.commandManager.undo()
        this.selection.cancelSelection()
      },

      'ctrl+y': () => {
        this.commandManager.redo()
        this.selection.cancelSelection()
      }

      // 'ctrl+plus': (evt: Event) => {
      //   evt.preventDefault()
      //   this.paperScroller.zoom(0.2, { max: 5, grid: 0.2 })
      // },

      // 'ctrl+minus': (evt: Event) => {
      //   evt.preventDefault()
      //   this.paperScroller.zoom(-0.2, { min: 0.2, grid: 0.2 })
      // }
    })
  }

  initGraphEvents () {
    this.graph.on('change add remove', () => {
      this.postWindowTop()
    })

    this.graph.on('add', (cell: joint.dia.Cell) => {
      if (cell.isElement()) {
        cell.on('change:position change:angle change:size', () => {
          this.fitToContent()
        })
      }
    })

    this.graph.on('remove', () => {
      this.fitToContent()
    })

    this.graph.getElements().forEach(el => {
      el.on('change:position change:angle change:size', () => {
        this.fitToContent()
      })
    })
  }

  fitToContent = debounce(() => {
    const containerWidth = dom.width(this.container)
    const containerHeight = dom.height(this.container)
    this.paper.fitToContent({
      padding: 30,
      allowNewOrigin: 'negative',
      allowNegativeBottomRight: true,
      minWidth: containerWidth,
      minHeight: containerHeight
    })
    // console.log(this.paper.getContentArea())
  }, 100)

  postWindowTop () {
    const data = this.toJSON()
    console.log(data)
    if (window.top) {
      window.top.postMessage({
        target: 'fbb',
        data
      }, '*')
    }
  }

  toJSON () {
    const graph = this.graph.toJSON()
    const paper = {
      background: this.paper.options.background,
      width: this.paper.options.width,
      height: this.paper.options.height
    }

    return {
      graph,
      paper
    }
  }
}
