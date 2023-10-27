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
  }
}

const inspectorInputs = {
  type: {
    type: 'type',
    label: 'type',
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
    type: 'color-palette',
    options: [
      { content: 'transparent' },
      { content: '#f6f6f6' },
      { content: '#dcd7d7' },
      { content: '#8f8f8f' },
      { content: '#c6c7e2' },
      { content: '#feb663' },
      { content: '#fe854f' },
      { content: '#b75d32' },
      { content: '#31d0c6' },
      { content: '#7c68fc' },
      { content: '#61549c' },
      { content: '#6a6c8a' },
      { content: '#4b4a67' },
      { content: '#3c4260' },
      { content: '#33334e' },
      { content: '#222138' }
    ],
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

const inspectorMap = (type: string, paper: joint.dia.Paper) => {
  if (type === 'app.FunctionBlock') {
    return {
      inputs: {
        ...CommonInputs,
        name: inspectorInputs.text,
        resource: {
          type: 'select',
          options: get(paper, 'meta.resourceOptions', []),
          label: 'Resource',
          group: 'style'
        }
      },
      groups: inspectorGroups
    }
  } else if (type === 'app.VariableDot') {
    return {
      inputs: {
        ...CommonInputs,
        value: inspectorInputs.text,
        varType: {
          type: 'select',
          options: get(paper, 'meta.varTypeOptions', []),
          label: 'Type',
          group: 'style'
        }
      },
      groups: inspectorGroups
    }
  }
}

export const getInspectorConfig = (collection: Backbone.Collection, paper: joint.dia.Paper): joint.ui.Inspector.Options | undefined => {
  if (collection.length === 1) {
    const cell = collection.first()as any
    const type = cell.get('type')
    const config = inspectorMap(type, paper)
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
            const file = $('<input type="file" accept="image/png, image/jpeg"/>')
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
            const text = $('<div/>').text(value)
            const label = $('<label/>').text(options.label || path)
            div.append([label, text])
            return div
          }
          return ''
        },

        getFieldValue: (attribute, type) => {
          console.log(attribute, type)
          if (type === 'image-button') {
            return { value: $(attribute).data('result') }
          }
        }
      }
    }
  }
}
