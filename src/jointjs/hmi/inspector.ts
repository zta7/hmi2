import * as joint from '@clientio/rappid'
import Backbone from 'backbone'
import $ from 'jquery'
import { get } from 'lodash'

const inspectorGroups = {
  common: {
    label: '通用',
    closed: true,
    index: 1
  },
  style: {
    label: '样式',
    closed: true,
    index: 2
  },
  bind: {
    label: '绑定变量',
    closed: true,
    index: 3
  },
  window: {
    label: '窗口',
    closed: true,
    index: 4
  }
}

const inspectorInputs = {
  type: {
    type: 'type',
    label: 'type',
    group: 'common'
  },
  ratio: {
    type: 'ratio',
    label: 'ratio',
    group: 'common'
  },
  x: {
    type: 'number',
    label: 'x',
    group: 'common'
  },
  y: {
    type: 'number',
    label: 'y',
    group: 'common'
  },
  width: {
    type: 'number',
    label: 'width',
    group: 'common'
  },
  height: {
    type: 'number',
    label: 'height',
    group: 'common'
  },
  zindex: {
    type: 'range',
    min: 1,
    max: 100,
    label: 'zindex',
    group: 'common'
  },
  angle: {
    type: 'range',
    min: 0,
    max: 360,
    label: 'angle',
    group: 'common'
  },
  text: {
    type: 'content-editable',
    label: 'Text',
    group: 'style'
  },
  fontSize: {
    type: 'range',
    min: 5,
    max: 80,
    unit: 'px',
    label: 'Font size',
    group: 'style'
  },
  fontWeight: {
    type: 'range',
    min: 100,
    max: 800,
    step: 100,
    label: 'Font Weight',
    group: 'style',
    defaultValue: 400
  },
  strokeWidth: {
    type: 'range',
    min: 0,
    max: 10,
    defaultValue: 1,
    unit: 'px',
    label: 'Stroke Width',
    group: 'style'
  },
  strokeDasharray: {
    type: 'select',
    options: [
      { value: '0', content: 'Solid' },
      { value: '2,5', content: 'Dotted' },
      { value: '10,5', content: 'Dashed' }
    ],
    label: 'stroke Dash',
    group: 'style'
  },
  rx: {
    type: 'range',
    min: 0,
    max: 100,
    label: 'rx',
    defaultValue: 0,
    group: 'style'
  },
  ry: {
    type: 'range',
    min: 0,
    max: 100,
    label: 'ry',
    defaultValue: 0,
    group: 'style'
  },
  background: {
    type: 'color',
    label: 'Background',
    group: 'style'
  },
  fill: {
    type: 'color',
    label: 'Fill',
    group: 'style'
  },
  stroke: {
    type: 'color',
    label: 'Stroke',
    group: 'style'
  },
  min: {
    type: 'number',
    label: 'min',
    group: 'style'
  },
  max: {
    type: 'number',
    label: 'max',
    group: 'style'
  },
  step: {
    type: 'number',
    label: 'step',
    group: 'style'
  },
  boolean: {
    type: 'toggle',
    label: 'toggle',
    group: 'style'
  }
}

const CommonInputs = {
  type: inspectorInputs.type,
  ratio: inspectorInputs.ratio,
  size: {
    width: inspectorInputs.width,
    height: inspectorInputs.height
  },
  position: {
    x: inspectorInputs.x,
    y: inspectorInputs.y
  },
  z: inspectorInputs.zindex,
  angle: inspectorInputs.angle
}

const LinkInputs = {
  type: inspectorInputs.type,
  z: inspectorInputs.zindex
}

const inspectorMap = (type: string, bindOptions = {}) => {
  const inputs = get(bindOptions, 'inputs', [])
  const outputs = get(bindOptions, 'outputs', [])
  const outputEvents = get(bindOptions, 'outputEvents', [])
  const windows = get(bindOptions, 'windows', [])

  if (type === 'app.Rectangle') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: {
            text: inspectorInputs.text,
            fontSize: inspectorInputs.fontSize,
            fontWeight: inspectorInputs.fontWeight,
            stroke: inspectorInputs.stroke
          },
          body: {
            strokeWidth: inspectorInputs.strokeWidth,
            rx: inspectorInputs.rx,
            ry: inspectorInputs.ry,
            fill: inspectorInputs.fill
          },
          bind: {
            'attrs.label.text': {
              type: 'select',
              options: inputs,

              label: 'Text',
              group: 'bind'
            },
            'attrs.body.fill': {
              type: 'select',
              options: inputs,
              label: 'Fill',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Light') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: {
            text: inspectorInputs.text,
            fontSize: inspectorInputs.fontSize,
            fontWeight: inspectorInputs.fontWeight,
            stroke: inspectorInputs.stroke
          },
          body: {
            strokeWidth: inspectorInputs.strokeWidth,
            fill: inspectorInputs.fill
          },
          bind: {
            'attrs.body.fill': {
              type: 'select',
              options: inputs,
              label: 'Fill',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.StaticRectangle') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: {
            text: inspectorInputs.text,
            fontSize: inspectorInputs.fontSize,
            fontWeight: inspectorInputs.fontWeight,
            stroke: inspectorInputs.stroke
          },
          body: {
            strokeWidth: inspectorInputs.strokeWidth,
            rx: inspectorInputs.rx,
            ry: inspectorInputs.ry,
            fill: inspectorInputs.fill
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'chart.Knob') {
    return {
      inputs: {
        ...CommonInputs,
        fill: inspectorInputs.fill,
        min: inspectorInputs.min,
        max: inspectorInputs.max,
        attrs: {
          bind: {
            value: {
              type: 'select',
              options: inputs,
              label: 'Value',
              group: 'bind'
            }
          }
        },
        value: {
          type: 'number',
          label: 'value',
          group: 'style'
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'chart.Pie') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          bind: {
            'series.0.data': {
              type: 'select',
              options: inputs,
              label: 'Data',
              group: 'bind'
            }
          }
        },
        'series/0/data': {
          type: 'list',
          group: 'style',
          item: {
            type: 'object',
            properties: {
              label: inspectorInputs.text,
              value: {
                type: 'number',
                label: 'value',
                group: 'style'
              },
              fill: inspectorInputs.fill
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Button') {
    return {
      inputs: {
        ...CommonInputs,
        background: inspectorInputs.background,
        text: inspectorInputs.text,
        bind: {
          onClick: {
            type: 'select',
            options: outputEvents,
            group: 'bind'
          }
          // output: {
          //   type: 'select',
          //   options: outputs,
          //   group: 'bind'
          // },
          // background: {
          //   type: 'select',
          //   options: inputs,
          //   group: 'bind'
          // }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.LightButton') {
    return {
      inputs: {
        ...CommonInputs,
        background: inspectorInputs.background,
        text: inspectorInputs.text,
        bind: {
          onClick: {
            type: 'select',
            options: outputEvents,
            group: 'bind'
          },
          background: {
            type: 'select',
            options: inputs,
            group: 'bind'
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Input') {
    return {
      inputs: {
        ...CommonInputs,
        color: {
          type: 'color',
          label: 'Color',
          group: 'style'
        },
        value: inspectorInputs.text,
        fontSize: inspectorInputs.fontSize,
        bind: {
          onChange: {
            type: 'select',
            options: outputs,
            group: 'bind'
          },
          event: {
            type: 'select',
            options: outputEvents,
            group: 'bind'
          }
          // 'attrs.value': {
          //   type: 'select',
          //   options: outputs,
          //   label: 'Text',
          //   group: 'bind'
          // }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Slider') {
    return {
      inputs: {
        ...CommonInputs,

        min: inspectorInputs.min,
        max: inspectorInputs.max,
        step: inspectorInputs.step,
        value: {
          type: 'number',
          label: 'value',
          group: 'style'
        },
        bind: {
          onChange: {
            type: 'select',
            options: outputs,
            group: 'bind'
          },
          event: {
            type: 'select',
            options: outputEvents,
            group: 'bind'
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Table') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          bind: {
            table: {
              type: 'select',
              options: inputs,
              label: 'Data',
              group: 'bind'
            }
          }
        },
        columns: {
          type: 'list',
          group: 'style',
          item: {
            type: 'object',
            properties: {
              label: { type: 'text' },
              field: { type: 'text' }
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Select') {
    return {
      inputs: {
        ...CommonInputs,

        value: inspectorInputs.text,
        options: {
          type: 'list',
          group: 'style',
          item: {
            type: 'object',
            properties: {
              label: { type: 'text' },
              value: { type: 'text' }
            }
          }
        },
        bind: {
          onChange: {
            type: 'select',
            options: outputs,
            group: 'bind'
          },
          event: {
            type: 'select',
            options: outputEvents,
            group: 'bind'
          }
          // 'attrs.value': {
          //   type: 'select',
          //   options: outputs,
          //   label: 'Text',
          //   group: 'bind'
          // }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Checkbox') {
    return {
      inputs: {
        ...CommonInputs,

        checked: inspectorInputs.boolean,
        bind: {
          onChange: {
            type: 'select',
            options: outputs,
            group: 'bind'
          },
          event: {
            type: 'select',
            options: outputEvents,
            group: 'bind'
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'chart.Plot') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          bind: {
            'series.0.data': {
              type: 'select',
              options: inputs,
              label: 'Data',
              group: 'bind'
            }
          }
        },
        axis: {
          'y-axis': {
            tickSuffix: {
              type: 'content-editable',
              label: 'YLabel',
              group: 'style'
            }
          },
          'x-axis': {
            tickSuffix: {
              type: 'content-editable',
              label: 'XLabel',
              group: 'style'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'standard.Image') {
    return {
      inputs: {
        ...CommonInputs,

        attrs: {
          image: {
            href: {
              type: 'image-button',
              label: 'href',
              group: 'style'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Link') {
    return {
      inputs: {
        ...LinkInputs,
        attrs: {
          line: {
            strokeWidth: inspectorInputs.strokeWidth,
            strokeDasharray: inspectorInputs.strokeDasharray,
            stroke: inspectorInputs.stroke,
            sourceMarker: {
              d: {
                type: 'select-box',
                options: [
                  { value: 'M 0 0 0 0', content: 'None' },
                  { value: 'M 0 -3 -6 0 0 3 z', content: 'Small' },
                  { value: 'M 0 -5 -10 0 0 5 z', content: 'Medium' },
                  { value: 'M 0 -10 -15 0 0 10 z', content: 'Large' }
                ],
                group: 'style',
                label: 'Source arrowhead'
              }
            },
            targetMarker: {
              d: {
                type: 'select-box',
                options: [
                  { value: 'M 0 0 0 0', content: 'None' },
                  { value: 'M 0 -3 -6 0 0 3 z', content: 'Small' },
                  { value: 'M 0 -5 -10 0 0 5 z', content: 'Medium' },
                  { value: 'M 0 -10 -15 0 0 10 z', content: 'Large' }
                ],
                group: 'style',
                label: 'Target arrowhead'
              }
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.TextBlock') {
    return {
      inputs: {
        ...CommonInputs,

        attrs: {
          label: {
            text: inspectorInputs.text,
            fontSize: inspectorInputs.fontSize,
            fontWeight: inspectorInputs.fontWeight,
            style: {
              color: inspectorInputs.stroke
            }
          },
          body: {
            strokeWidth: inspectorInputs.strokeWidth,
            rx: inspectorInputs.rx,
            ry: inspectorInputs.ry,
            fill: inspectorInputs.fill
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Switch') {
    return {
      inputs: {
        ...CommonInputs,
        bind: {
          onClick: {
            type: 'select',
            options: outputEvents,
            group: 'bind'
          }
          // output: {
          //   type: 'select',
          //   options: outputs,
          //   group: 'bind'
          // },
          // background: {
          //   type: 'select',
          //   options: inputs,
          //   group: 'bind'
          // }
        },
        on: inspectorInputs.boolean
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Pump') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          bind: {
            power: {
              type: 'select',
              options: inputs,
              label: 'Power',
              group: 'bind'
            }
          }
        },
        power: inspectorInputs.boolean
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.ControlValve') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          bind: {
            power: {
              type: 'select',
              options: inputs,
              label: 'Open',
              group: 'bind'
            }
          }
        },
        open: inspectorInputs.boolean
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.LiquidTank') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          bind: {
            level: {
              type: 'select',
              options: inputs,
              label: 'Open',
              group: 'bind'
            }
          }
        },
        level: {
          type: 'range',
          min: 0,
          max: 100,
          label: 'Level'
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.WindowButton') {
    return {
      inputs: {
        ...CommonInputs,
        background: inspectorInputs.background,
        text: inspectorInputs.text,
        window: {
          onClick: {
            type: 'select',
            options: windows,
            group: 'window'
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.ProgressBar') {
    return {
      inputs: {
        ...CommonInputs,
        min: inspectorInputs.min,
        max: inspectorInputs.max,
        value: { type: 'number', label: 'value', group: 'style' },
        barColor: { type: 'color', label: 'Bar Color', group: 'style' },
        bgColor: { type: 'color', label: 'BG Color', group: 'style' },
        showLabel: { type: 'toggle', label: 'Show Label', group: 'style' },
        direction: {
          type: 'select',
          options: [{ value: 'horizontal', content: 'Horizontal' }, { value: 'vertical', content: 'Vertical' }],
          label: 'Direction',
          group: 'style'
        },
        bind: {
          value: { type: 'select', options: inputs, label: 'Value', group: 'bind' }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Gauge') {
    return {
      inputs: {
        ...CommonInputs,
        min: inspectorInputs.min,
        max: inspectorInputs.max,
        value: { type: 'number', label: 'value', group: 'style' },
        unit: { type: 'content-editable', label: 'Unit', group: 'style' },
        label: { type: 'content-editable', label: 'Label', group: 'style' },
        arcColor: { type: 'color', label: 'Arc Color', group: 'style' },
        bgColor: { type: 'color', label: 'BG Color', group: 'style' },
        bind: {
          value: { type: 'select', options: inputs, label: 'Value', group: 'bind' }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.StateDisplay') {
    return {
      inputs: {
        ...CommonInputs,
        value: { type: 'number', label: 'value', group: 'style' },
        states: {
          type: 'list',
          group: 'style',
          item: {
            type: 'object',
            properties: {
              value: { type: 'number', label: 'value' },
              label: { type: 'text', label: 'label' },
              color: { type: 'color', label: 'color' },
              textColor: { type: 'color', label: 'text color' }
            }
          }
        },
        bind: {
          value: { type: 'select', options: inputs, label: 'Value', group: 'bind' }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.MultiStateButton') {
    return {
      inputs: {
        ...CommonInputs,
        states: {
          type: 'list',
          group: 'style',
          item: {
            type: 'object',
            properties: {
              value: { type: 'number', label: 'value' },
              label: { type: 'text', label: 'label' },
              color: { type: 'color', label: 'color' },
              textColor: { type: 'color', label: 'text color' }
            }
          }
        },
        bind: {
          onChange: { type: 'select', options: outputs, label: 'Output', group: 'bind' }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.AlarmList') {
    return {
      inputs: {
        ...CommonInputs,
        bind: {
          alarms: { type: 'select', options: inputs, label: 'Alarms Data', group: 'bind' }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.TrendChart') {
    return {
      inputs: {
        ...CommonInputs,
        min: inspectorInputs.min,
        max: inspectorInputs.max,
        maxPoints: { type: 'number', label: 'Max Points', group: 'style' },
        label: { type: 'content-editable', label: 'Label', group: 'style' },
        lineColor: { type: 'color', label: 'Line Color', group: 'style' },
        bind: {
          data: { type: 'select', options: inputs, label: 'Data', group: 'bind' }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Motor') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: {
            text: inspectorInputs.text
          },
          bind: {
            power: {
              type: 'select',
              options: inputs,
              label: 'Power',
              group: 'bind'
            }
          }
        },
        power: inspectorInputs.boolean
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Mixer') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: {
            text: inspectorInputs.text
          },
          bind: {
            power: {
              type: 'select',
              options: inputs,
              label: 'Power',
              group: 'bind'
            }
          }
        },
        power: inspectorInputs.boolean
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Sensor') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: {
            text: inspectorInputs.text
          },
          bind: {
            value: {
              type: 'select',
              options: inputs,
              label: 'Value',
              group: 'bind'
            }
          }
        },
        value: { type: 'number', label: 'Value', group: 'style' },
        unit: { type: 'content-editable', label: 'Unit', group: 'style' },
        sensorType: {
          type: 'select',
          options: [
            { value: 'T', content: 'Temperature (T)' },
            { value: 'P', content: 'Pressure (P)' },
            { value: 'L', content: 'Level (L)' },
            { value: 'F', content: 'Flow (F)' },
            { value: 'H', content: 'Humidity (H)' }
          ],
          label: 'Sensor Type',
          group: 'style'
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.FlowMeter') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: {
            text: inspectorInputs.text
          },
          bind: {
            value: {
              type: 'select',
              options: inputs,
              label: 'Value',
              group: 'bind'
            }
          }
        },
        value: { type: 'number', label: 'Value', group: 'style' },
        unit: { type: 'content-editable', label: 'Unit', group: 'style' }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.CheckValve') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            status: {
              type: 'select',
              options: inputs,
              label: 'Status',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.ButterflyValve') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            open: {
              type: 'select',
              options: inputs,
              label: 'Open',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.ThreeWayValve') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            position: {
              type: 'select',
              options: inputs,
              label: 'Position',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.SafetyValve') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            status: {
              type: 'select',
              options: inputs,
              label: 'Status',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.PipeElbow') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            flow: {
              type: 'select',
              options: inputs,
              label: 'Flow',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.PipeTee') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            flow: {
              type: 'select',
              options: inputs,
              label: 'Flow',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.PipeFlange') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            flow: {
              type: 'select',
              options: inputs,
              label: 'Flow',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.HorizontalTank') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            level: {
              type: 'select',
              options: inputs,
              label: 'Level',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Reactor') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            status: {
              type: 'select',
              options: inputs,
              label: 'Status',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Silo') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            level: {
              type: 'select',
              options: inputs,
              label: 'Level',
              group: 'bind'
            }
          }
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Conveyor') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            power: {
              type: 'select',
              options: inputs,
              label: 'Power',
              group: 'bind'
            }
          }
        },
        power: inspectorInputs.boolean
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.Heater') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: { text: inspectorInputs.text },
          bind: {
            power: {
              type: 'select',
              options: inputs,
              label: 'Power',
              group: 'bind'
            }
          }
        },
        power: inspectorInputs.boolean
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.GroupBox') {
    return {
      inputs: {
        ...CommonInputs,
        attrs: {
          label: {
            text: inspectorInputs.text,
            fontSize: inspectorInputs.fontSize,
            fill: inspectorInputs.stroke
          },
          body: {
            stroke: inspectorInputs.stroke,
            strokeWidth: inspectorInputs.strokeWidth,
            rx: inspectorInputs.rx,
            ry: inspectorInputs.ry
          }
        }
      },
      groups: inspectorGroups
    }
  } else {
    return {
      inputs: {
        ...CommonInputs
      },
      groups: inspectorGroups
    }
  }
}

export const getInspectorConfig = (
  collection: Backbone.Collection,
  bindOptions = {}
): joint.ui.Inspector.Options | undefined => {
  if (collection.length === 1) {
    const cell = collection.first() as any
    const type = cell.get('type')
    const config = inspectorMap(type, bindOptions)
    if (config) {
      const { inputs, groups } = config
      return {
        cell,
        groups,
        inputs,
        renderFieldContent: (options, path, value, inspector) => {
          const t = options.type
          if (t === 'image-button') {
            const div = $('<div/>')
            const file = $(
              '<input type="file" accept="image/png, image/jpeg"/>'
            )
            const label = $('<label/>').text(options.label || path)
            div.data('result', value)
            div.append([label, file])
            file.on('change', (evt) => {
              const f = get(evt, 'target.files[0]')
              if (f) {
                const fileReader = new FileReader()
                fileReader.onload = () => {
                  div.data('result', fileReader.result)
                  inspector.updateCell(div, path, options)
                }
                fileReader.readAsDataURL(f)
              }
            })
            return div
          } else if (t === 'type') {
            const div = $('<div/>')
            div.addClass('row justify-between items-center')
            div.data('type', value)
            // console.log(options, path, value, inspector)
            const text = $('<div/>').text(value)
            const label = $('<label/>').text(options.label || path)
            div.append([label, text])
            return div
          } else if (t === 'ratio') {
            const div = $('<div/>')
            div.addClass('row justify-between items-center')
            const button = $('<button>ratio:1/1</button>')
            const label = $('<label/>').text(options.label || path)
            div.data('result', value)
            div.append([label, button])
            button.on('click', () => {
              cell.size(cell.attributes.size.width, cell.attributes.size.width)
              inspector.updateCell()
            })
            return div
          }
          // console.log(options, path, value, inspector)
          return ''
        },

        getFieldValue: (attribute, type) => {
          if (type === 'image-button') {
            return { value: $(attribute).data('result') }
          }
          if (type === 'type') {
            return { value: $(attribute).data('type') }
          }
          if (type === 'ratio') {
            return { value: '1/1' }
          }
        }
      }
    }
  }
}
