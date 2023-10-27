import * as joint from '@clientio/rappid'
import { cloneDeep, debounce, get } from 'lodash'
import { dom } from 'quasar'

export interface BasicProps {
  el: HTMLElement,
  panel: any,
  stencilEl: HTMLElement,
  inspectorEl: HTMLElement,
  toolbarEl: HTMLElement,
  // stencilLoad: any
  // online?: boolean
}

const namespace = joint.shapes

export class BasicApp {
  graph: joint.dia.Graph
  paper: joint.dia.Paper
  commandManager: joint.dia.CommandManager
  clipboard: joint.ui.Clipboard
  selection: joint.ui.Selection
  keyboard: joint.ui.Keyboard
  snaplines: joint.ui.Snaplines
  toolbar: joint.ui.Toolbar
  stencil: joint.ui.Stencil
  tooltip: joint.ui.Tooltip
  container: HTMLElement
  constructor ({ el, panel, stencilEl, inspectorEl, toolbarEl }: BasicProps) {
    const g = Object.assign({ cells: [] }, get(panel, 'graph'))
    const p = get(panel, 'paper') || {}
    this.graph = new joint.dia.Graph({}, {
      cellNamespace: namespace
    })
    this.paper = new joint.dia.Paper({
      model: this.graph,
      gridSize: 10,
      async: true,
      sorting: joint.dia.Paper.sorting.APPROX,
      clickThreshold: 10,
      cellViewNamespace: namespace,
      markAvailable: true,
      defaultConnectionPoint: { name: 'anchor' },
      defaultRouter: {
        name: 'manhattan',
        args: {
          step: 10,
          padding: 1,
          startDirections: ['right'],
          endDirections: ['left']
        }
      }
    })
    this.container = el; this.container.append(this.paper.el); this.paper.render()

    g.cells = g.cells.filter((e: any) => get(namespace, get(e, 'type')))

    this.graph.fromJSON(g)
    this.fitToContent()

    window.onresize = () => {
      this.fitToContent()
    }

    this.commandManager = new joint.dia.CommandManager({ graph: this.graph })
    this.clipboard = new joint.ui.Clipboard()
    this.keyboard = new joint.ui.Keyboard()
    this.snaplines = new joint.ui.Snaplines({ paper: this.paper, usePaperGrid: true })
    this.selection = new joint.ui.Selection({ paper: this.paper, filter: (el) => el.isEmbedded() })
    this.toolbar = new joint.ui.Toolbar({
      tools: [
        {
          type: 'undo',
          name: 'undo',
          attrs: {
            button: {
              'data-tooltip': 'undo(crtl+z)',
              'data-tooltip-position': 'top',
              'data-tooltip-position-selector': '.toolbar-container'
            }
          }
        },
        {
          type: 'redo',
          name: 'redo',
          attrs: {
            button: {
              'data-tooltip': 'redo(crtl+y)',
              'data-tooltip-position': 'top',
              'data-tooltip-position-selector': '.toolbar-container'
            }
          }
        },
        {
          type: 'button',
          name: 'copy',
          attrs: {
            button: {
              disabled: true,
              'data-tooltip': 'copy(crtl+c)',
              'data-tooltip-position': 'top',
              'data-tooltip-position-selector': '.toolbar-container',
              background: 'url(/minus.svg)'

            }
          }
        },
        {
          type: 'button',
          name: 'paste',
          attrs: {
            button: {
              'data-tooltip': 'paste(crtl+v)',
              'data-tooltip-position': 'top',
              'data-tooltip-position-selector': '.toolbar-container'
            }
          }
        },
        { type: 'separator' }

      ],
      autoToggle: true,
      references: {
        // paperScroller: this.paperScroller,
        commandManager: this.commandManager
      }
    })
    this.stencil = new joint.ui.Stencil({
      dragEndClone: (el) => {
        const { shape } = el.attributes
        if (shape) {
          const clone = shape.clone()
          return clone
        }
      },
      paper: this.paper,
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
      snaplines: this.snaplines,
      search: {
        '*': ['shape/attributes/type']
      }
    })
    this.tooltip = new joint.ui.Tooltip({
      rootTarget: document.body,
      target: '[data-tooltip]',
      direction: joint.ui.Tooltip.TooltipArrowPosition.Auto,
      padding: 10
    })

    this.initGraphEvents()
    this.initStencilEvents()
    this.initPaperEvents()
    this.initKeyboardEvents()
    // this.initSelectionEvents(inspectorEl)
    this.initToolbarEvents()

    toolbarEl.appendChild(this.toolbar.el) && this.toolbar.render()
    stencilEl.append(this.stencil.render().el)
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
  }, 100)

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
  }

  initStencilEvents () {
    this.stencil.on('element:dragend', async (view, _evt, cloneArea) => {
      const { shape } = view.model.attributes
      if (shape) {
        // give link a length
        if (!shape.isElement()) {
          shape.source(cloneArea.bottomLeft())
          shape.target(cloneArea.topRight())
        }
      }
    })
  }

  initGraphEvents () {
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
    })
  }

  initToolbarEvents () {
    this.toolbar.on({
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
