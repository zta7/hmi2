import * as joint from '@clientio/rappid'
import { get } from 'lodash'
import i18n from 'src/i18n'

// Stencil element size: icon area + label below
const ELEM_W = 52
const ELEM_H = 46

const stencilElement = (href: string, label: string) => ({
  type: 'standard.Image',
  size: { width: ELEM_W, height: ELEM_H },
  attrs: {
    image: {
      href,
      refWidth: '40%',
      refHeight: '50%',
      refX: '30%',
      refY: '4%',
      'data-tooltip': label,
      preserveAspectRatio: 'xMidYMid meet'
    },
    label: {
      text: label,
      refY: '58%',
      refX: 0.5,
      textAnchor: 'middle',
      fontSize: 8,
      fontFamily: 'sans-serif',
      fill: '#8888a0'
    },
    body: {
      fill: 'transparent',
      stroke: 'none'
    }
  }
})

export const getStencilConfig = (paper: joint.dia.Paper | joint.ui.PaperScroller, snaplines: joint.ui.Snaplines, lang: string) => {
  return {
    dragEndClone: (el) => {
      const { shape } = el.attributes
      if (shape) {
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
      Inputs: { label: get(i18n, `${lang}.INPUTS`, 'Inputs'), index: 1 },
      Outputs: { label: get(i18n, `${lang}.OUTPUTS`, 'Outputs'), index: 2 },
      OutputEvents: { label: get(i18n, `${lang}.OUTPUTEVENTS`, 'Events'), index: 3 },
      Links: { label: get(i18n, `${lang}.LINKS`, 'Links'), index: 4 },
      Images: { label: get(i18n, `${lang}.STATIC`, 'Static'), index: 5 },
      Shapes: { label: get(i18n, `${lang}.SHAPES`, 'Shapes'), index: 6 },
      Scala: { label: get(i18n, `${lang}.PROCESS`, 'Process'), index: 7 },
      Window: { label: get(i18n, `${lang}.POPUP WINDOW`, 'Window'), index: 8 }
    },
    layout: {
      columns: 3,
      columnWidth: ELEM_W + 6,
      rowHeight: ELEM_H + 2,
      resizeToFit: true
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

export const getStencilLoad = (lang: string) => {
  const l = (key: string, fallback: string) => get(i18n, `${lang}.${key}`, fallback)

  return {
    Inputs: [
      {
        ...stencilElement('./stencil/alarm-light-outline.svg', l('Indicator', 'Indicator')),
        shape: new app.Light({
          size: { width: 50, height: 50 },
          attrs: {
            label: { text: '1', fontSize: 14, stroke: '#ffffff', fontWeight: 300 },
            body: { stroke: '#8f8fc7ff', fill: '#e15656', rx: 9999, ry: 9999 }
          }
        })
      },
      {
        ...stencilElement('./stencil/text.svg', l('InputTextbox', 'Text')),
        shape: new app.Rectangle({
          size: { width: 90, height: 30 },
          attrs: {
            label: { text: '文本', fontSize: 14, fill: '#e0e0e0' },
            body: { stroke: '#555577', fill: '#2a2a3e' }
          }
        })
      },
      {
        ...stencilElement('./stencil/chart-arc.svg', l('Knob', 'Knob')),
        shape: new joint.shapes.chart.Knob({
          size: { width: 100, height: 100 },
          min: 0,
          max: 100,
          value: 80,
          fill: '#2c97de'
        } as any)
      },
      {
        ...stencilElement('./stencil/chart-pie.svg', l('Pie', 'Pie')),
        shape: new joint.shapes.chart.Pie({
          size: { width: 100, height: 100 },
          series: [{
            data: [
              { value: 40, label: 'Organic', fill: '#8bce5d' },
              { value: 20, label: 'Email', fill: '#53abdd' },
              { value: 20, label: 'Social', fill: '#c377b1' },
              { value: 20, label: 'Referral', fill: '#ffe891' }
            ]
          }]
        } as any)
      },
      {
        ...stencilElement('./stencil/chart-bar.svg', l('Plot', 'Plot')),
        shape: new joint.shapes.chart.Plot({
          size: { width: 300, height: 100 },
          axis: {
            'y-axis': { tickSuffix: 'kg' },
            'x-axis': { tickSuffix: 'ab' }
          },
          series: [{ name: 'Plot', data: [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 4, y: 3 }] }]
        } as any)
      },
      {
        ...stencilElement('./stencil/table.svg', l('Table', 'Table')),
        shape: new app.Table()
      }
    ],
    Outputs: [
      {
        ...stencilElement('./stencil/button.svg', l('Switch', 'Switch')),
        shape: new app.Switch({ size: { width: 32, height: 32 } })
      },
      {
        ...stencilElement('./stencil/input.svg', l('Input', 'Input')),
        shape: new app.Input()
      },
      {
        ...stencilElement('./stencil/select.svg', l('Select', 'Select')),
        shape: new app.Select()
      },
      {
        ...stencilElement('./stencil/slider.svg', l('Slider', 'Slider')),
        shape: new app.Slider()
      },
      {
        ...stencilElement('./stencil/checkbox.svg', l('CheckBox', 'Checkbox')),
        shape: new app.Checkbox()
      }
    ],
    OutputEvents: [
      {
        ...stencilElement('./stencil/button.svg', l('Button', 'Button')),
        shape: new app.Button()
      },
      {
        ...stencilElement('./stencil/alarm-light-outline.svg', l('CircleButton', 'Circle Btn')),
        shape: new app.LightButton({
          size: { width: 50, height: 50 },
          text: 'Push',
          background: '#e15656'
        })
      }
    ],
    Links: [
      {
        ...stencilElement('./stencil/straightLink.svg', l('Link', 'Link')),
        shape: new app.Link({ vertice: true })
      },
      {
        ...stencilElement('./stencil/angle-rise-lined.svg', l('Polyline', 'Polyline')),
        shape: new app.Link()
      }
    ],
    Images: [
      {
        ...stencilElement('./stencil/image-outline.svg', l('Image', 'Image')),
        shape: new joint.shapes.standard.Image({
          size: { width: 30, height: 30 },
          attrs: { image: { href: './stencil/image-outline.svg' } }
        })
      },
      {
        ...stencilElement('./stencil/text.svg', l('StaticText', 'Static Text')),
        shape: new app.StaticRectangle({
          size: { width: 90, height: 30 },
          attrs: {
            label: { text: '文本', fontSize: 14, fill: '#e0e0e0' },
            body: { stroke: '#555577', fill: '#2a2a3e' }
          }
        })
      }
    ],
    Shapes: [
      {
        ...stencilElement('./stencil/format-text.svg', l('TextBlock', 'Text Block')),
        shape: new app.TextBlock({
          size: { width: 90, height: 30 },
          attrs: {
            label: { text: '文本', fontSize: 14, fill: '#e0e0e0' },
            body: { fill: 'transparent', strokeWidth: 0 }
          }
        })
      },
      {
        ...stencilElement('./stencil/circle.svg', l('Circle', 'Circle')),
        shape: new app.Circle({ size: { width: 30, height: 30 }, attrs: { body: { fill: 'transparent', stroke: '#8888a0', strokeWidth: 2 } } })
      },
      {
        ...stencilElement('./stencil/square.svg', l('Square', 'Square')),
        shape: new app.Square({ size: { width: 30, height: 30 }, attrs: { body: { fill: 'transparent', stroke: '#8888a0', strokeWidth: 2 } } })
      },
      {
        ...stencilElement('./stencil/sphere.svg', l('Sphere', 'Sphere')),
        shape: new app.Sphere({ size: { width: 30, height: 30 }, attrs: { body: { fill: 'transparent', stroke: '#8888a0', strokeWidth: 2 } } })
      },
      {
        ...stencilElement('./stencil/cone.svg', l('Cone', 'Cone')),
        shape: new app.Cone({ size: { width: 30, height: 30 }, attrs: { body: { fill: 'transparent', stroke: '#8888a0', strokeWidth: 2 } } })
      },
      {
        ...stencilElement('./stencil/cube.svg', l('Cube', 'Cube')),
        shape: new app.Cube({ size: { width: 30, height: 30 }, attrs: { body: { fill: 'transparent', stroke: '#8888a0', strokeWidth: 2 } } })
      },
      {
        ...stencilElement('./stencil/cylinder.svg', l('Cylinder', 'Cylinder')),
        shape: new app.Cylinder({ size: { width: 30, height: 30 }, attrs: { body: { fill: 'transparent', stroke: '#8888a0', strokeWidth: 2 } } })
      }
    ],
    Scala: [
      {
        ...stencilElement('./stencil/pump.svg', l('Pump', 'Pump')),
        shape: new app.Pump({ attrs: { label: { text: 'Pump' } } })
      },
      {
        ...stencilElement('./stencil/controlValue.svg', l('ControlValve', 'Ctrl Valve')),
        shape: new app.ControlValve({ open: 1, attrs: { label: { text: 'CTRL Valve 1' } } })
      },
      {
        ...stencilElement('./stencil/liquidTank.svg', l('LiquidTank', 'Liquid Tank')),
        shape: new app.LiquidTank({ attrs: { label: { text: 'LiquidTank' } } })
      },
      {
        ...stencilElement('./stencil/conicTank.svg', l('ConicTank', 'Conic Tank')),
        shape: new app.ConicTank({ attrs: { label: { text: 'ConicTank' } } })
      },
      {
        ...stencilElement('./stencil/handValue.svg', l('HandValue', 'Valve')),
        shape: new app.HandValve({ attrs: { label: { text: 'HandValue' } } })
      },
      {
        ...stencilElement('./stencil/pipeJoin.svg', l('PipeJoin', 'Pipe Joint')),
        shape: new app.PipeJoin({
          attrs: { root: { magnet: false }, body: { fill: '#eee', strokeWidth: 0 } },
          size: { width: 30, height: 30 }
        })
      },
      {
        ...stencilElement('./stencil/pipe.svg', l('Pipe', 'Pipe')),
        shape: new app.Pipe()
      }
    ],
    Window: [
      {
        ...stencilElement('./stencil/button.svg', l('WindowButton', 'Popup')),
        shape: new app.WindowButton()
      }
    ]
  }
}
