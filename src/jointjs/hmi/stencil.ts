import * as joint from '@clientio/rappid'
import { get } from 'lodash'
import i18n from 'src/i18n'

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
      Inputs: { label: get(i18n, `${lang}.INPUTS`, 'INPUTS'), index: 1 },
      Outputs: { label: get(i18n, `${lang}.OUTPUTS`, 'OUTPUTS'), index: 2 },
      OutputEvents: { label: get(i18n, `${lang}.OUTPUTEVENTS`, 'OUTPUTEVENTS'), index: 3 },
      Links: { label: get(i18n, `${lang}.LINKS`, 'LINKS'), index: 4 },
      Images: { label: get(i18n, `${lang}.STATIC`, 'STATIC'), index: 5 },
      Shapes: { label: get(i18n, `${lang}.SHAPES`, 'SHAPES'), index: 6 },
      Scala: { label: get(i18n, `${lang}.PROCESS`, 'PROCESS'), index: 7 },
      Window: { label: get(i18n, `${lang}.POPUP WINDOW`, 'POPUP WINDOW'), index: 8 }
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

export const getStencilLoad = (lang: string) => {
  console.log(i18n, `${lang}.Switch`)
  return {
    Outputs: [
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Switch({ size: { width: 32, height: 32 } }),
        attrs: {
          image: {
            href: './stencil/button.svg',
            // 'data-tooltip': '开关'
            'data-tooltip': get(i18n, `${lang}.Switch`, 'Switch')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Input(),
        attrs: {
          image: {
            href: './stencil/input.svg',
            'data-tooltip': get(i18n, `${lang}.Input`, 'Input')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Select(),
        attrs: {
          image: {
            href: './stencil/select.svg',
            'data-tooltip': get(i18n, `${lang}.Select`, 'Select')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Slider(),
        attrs: {
          image: {
            href: './stencil/slider.svg',
            'data-tooltip': get(i18n, `${lang}.Slider`, 'Slider')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Checkbox(),
        attrs: {
          image: {
            href: './stencil/checkbox.svg',
            'data-tooltip': get(i18n, `${lang}.CheckBox`, 'CheckBox')
          }
        }
      }
    ],
    Inputs: [
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Light({
          size: { width: 50, height: 50 },
          attrs: {
            label: {
              text: '1',
              fontSize: 14,
              stroke: '#ffffff',
              fontWeight: 300
            },
            body: {
              stroke: '#222138',
              fill: '#e15656',
              rx: 9999,
              ry: 9999
            }
          }
        }),
        attrs: {
          image: {
            href: './stencil/alarm-light-outline.svg',
            'data-tooltip': get(i18n, `${lang}.Indicator`, 'Indicator')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Rectangle({
          size: { width: 90, height: 30 },
          attrs: {
            label: {
              text: '文本',
              fontSize: 14
            },
            body: {
              stroke: '#222138',
              fill: '#f6f6f6'
            }
          }
        }),
        attrs: {
          image: {
            href: './stencil/text.svg',
            'data-tooltip': get(i18n, `${lang}.InputTextbox`, 'InputTextbox')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new joint.shapes.chart.Knob({
          size: { width: 100, height: 100 },
          min: 0,
          max: 100,
          value: 80,
          fill: '#2c97de'
        } as any),
        attrs: {
          image: {
            href: './stencil/chart-arc.svg',
            'data-tooltip': get(i18n, `${lang}.Knob`, 'Knob')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
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
        } as any),
        attrs: {
          image: {
            href: './stencil/chart-pie.svg',
            'data-tooltip': get(i18n, `${lang}.Pie`, 'Pie')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new joint.shapes.chart.Plot({
          size: { width: 300, height: 100 },
          axis: {
            'y-axis': { // floating point value with one digit after the decimal point
              tickSuffix: 'kg'
            },
            'x-axis': { // floating point value with one digit after the decimal point
              tickSuffix: 'ab'
            }
          },
          series: [
            {
              name: 'Plot',
              data: [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 4, y: 3 }]
            }
          ]
        } as any),
        attrs: {
          image: {
            href: './stencil/chart-bar.svg',
            'data-tooltip': get(i18n, `${lang}.Plot`, 'Plot')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Table(),
        attrs: {
          image: {
            href: './stencil/table.svg',
            'data-tooltip': get(i18n, `${lang}.Table`, 'Table')
          }
        }
      }
    ],
    OutputEvents: [
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Button(),
        attrs: {
          image: {
            href: './stencil/button.svg',
            'data-tooltip': get(i18n, `${lang}.Button`, 'Button')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.LightButton({
          size: { width: 50, height: 50 },
          text: 'Push',
          background: '#e15656'
        }),
        attrs: {
          image: {
            href: './stencil/alarm-light-outline.svg',
            'data-tooltip': get(i18n, `${lang}.CircleButton`, 'CircleButton')
          }
        }
      }
    ],
    Links: [
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Link({ vertice: true }),
        attrs: {
          image: {
            href: './stencil/straightLink.svg',
            'data-tooltip': get(i18n, `${lang}.Link`, 'Link')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Link(),
        attrs: {
          image: {
            href: './stencil/angle-rise-lined.svg',
            'data-tooltip': get(i18n, `${lang}.Polyline`, 'Polyline')
          }
        }
      }
    ],
    Images: [
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new joint.shapes.standard.Image({
          size: { width: 30, height: 30 },
          attrs: {
            image: {
              href: './stencil/image-outline.svg'
            }
          }
        }),
        attrs: {
          image: {
            href: './stencil/image-outline.svg',
            'data-tooltip': get(i18n, `${lang}.Image`, 'Image')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.StaticRectangle({
          size: { width: 90, height: 30 },
          attrs: {
            label: {
              text: '文本',
              fontSize: 14
            },
            body: {
              stroke: '#222138',
              fill: '#f6f6f6'
            }
          }
        }),
        attrs: {
          image: {
            href: './stencil/text.svg',
            'data-tooltip': get(i18n, `${lang}.StaticText`, 'StaticText')
          }
        }
      }
    ],
    Shapes: [
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.TextBlock({
          size: { width: 90, height: 30 },
          attrs: {
            label: {
              text: '文本',
              fontSize: 14
            },
            body: {
              fill: '#ffffff',
              strokeWidth: 0
            }

          }
        }),
        attrs: {
          image: {
            href: './stencil/format-text.svg',
            'data-tooltip': get(i18n, `${lang}.TextBlock`, 'TextBlock')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Circle({
          size: { width: 30, height: 30 }
        }),
        attrs: {
          image: {
            href: './stencil/circle.svg',
            'data-tooltip': get(i18n, `${lang}.Circle`, 'Circle')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Square({
          size: { width: 30, height: 30 }
        }),
        attrs: {
          image: {
            href: './stencil/square.svg',
            'data-tooltip': get(i18n, `${lang}.Square`, 'Square')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Sphere({
          size: { width: 30, height: 30 }
        }),
        attrs: {
          image: {
            href: './stencil/sphere.svg',
            'data-tooltip': get(i18n, `${lang}.Sphere`, 'Sphere')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Cone({
          size: { width: 30, height: 30 }
        }),
        attrs: {
          image: {
            href: './stencil/cone.svg',
            'data-tooltip': get(i18n, `${lang}.Cone`, 'Cone')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Cube({
          size: { width: 30, height: 30 }
        }),
        attrs: {
          image: {
            href: './stencil/cube.svg',
            'data-tooltip': get(i18n, `${lang}.Cube`, 'Cube')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Cylinder({
          size: { width: 30, height: 30 }
        }),
        attrs: {
          image: {
            href: './stencil/cylinder.svg',
            'data-tooltip': get(i18n, `${lang}.Cylinder`, 'Cylinder')
          }
        }
      }
    ],
    Scala: [
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Pump({
          attrs: {
            label: {
              text: 'Pump'
            }
          }
        }),
        attrs: {
          image: {
            href: './stencil/pump.svg',
            'data-tooltip': get(i18n, `${lang}.Pump`, 'Pump')

          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.ControlValve({
          open: 1,
          attrs: {
            label: {
              text: 'CTRL Valve 1'
            }
          }
        }),
        attrs: {
          image: {
            href: './stencil/controlValue.svg',
            'data-tooltip': get(i18n, `${lang}.ControlValve`, 'ControlValve')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.LiquidTank({
          attrs: {
            label: {
              text: 'LiquidTank'
            }
          }
        }),
        attrs: {
          image: {
            href: './stencil/liquidTank.svg',
            'data-tooltip': get(i18n, `${lang}.LiquidTank`, 'LiquidTank')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.ConicTank({
          attrs: {
            label: {
              text: 'ConicTank'
            }
          }
        }),
        attrs: {
          image: {
            href: './stencil/conicTank.svg',
            'data-tooltip': get(i18n, `${lang}.ConicTank`, 'ConicTank')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.HandValve({
          attrs: {
            label: {
              text: 'HandValue'
            }
          }
        }),
        attrs: {
          image: {
            href: './stencil/handValue.svg',
            'data-tooltip': get(i18n, `${lang}.HandValue`, 'Valve')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.PipeJoin({
          attrs: {
            root: {
              magnet: false
            },
            body: {
              fill: '#eee',
              strokeWidth: 0
            }
          },
          size: {
            width: 30,
            height: 30
          }
        }),
        attrs: {
          image: {
            href: './stencil/pipeJoin.svg',
            'data-tooltip': get(i18n, `${lang}.PipeJoin`, 'Pipeline Joint')
          }
        }
      },
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.Pipe(),
        attrs: {
          image: {
            href: './stencil/pipe.svg',
            'data-tooltip': get(i18n, `${lang}.Pipe`, 'Pipeline')
          }
        }
      }

    ],
    Window: [
      {
        type: 'standard.Image',
        size: { width: 32, height: 32 },
        shape: new app.WindowButton(),
        attrs: {
          image: {
            href: './stencil/button.svg',
            'data-tooltip': get(i18n, `${lang}.WindowButton`, 'Popup Window')
          }
        }
      }
    ]
  }
}
