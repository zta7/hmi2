<template>
    <div class='column no-wrap'>
      <div class='col relative-position w-full'>
        <div :id='id' class='absolute-full' />
        <q-card  style="position: absolute; left: 5px; top: 5px;z-index: 1000; padding: 5px">
          <div class="row">
            <div>订单: </div>
            <div>{{selectedRow._orderId}}</div>
          </div>
        </q-card>
        <q-card v-if="selected.header === 'a3' && state" style="position: absolute; right: 5px; top: 5px;z-index: 1000; padding: 5px">
          <div class="row">
            <div>订单</div>
            <div>{{state.order}}</div>
          </div>
          <div class="row">
            <div>单元</div>
            <div>{{state.unit}}</div>
          </div>
          <div class="row">
            <div>开始时间</div>
            <div>{{state.starttime}}</div>
          </div>
          <div class="row">
            <div>结束时间</div>
            <div>{{state.endtime}}</div>
          </div>
        </q-card>
      </div>
      <q-separator  />
      <div class='col row no-wrap'>
        <q-tree
          ref='qtree'
          style='width: 260px; height: 100%;'
          class='overflow-auto'
          dense
          :nodes='selected.vars'
          :selected='varSelected ? varSelected.id : ""'
          no-selection-unset
          default-expand-all
          node-key='id'>
          <template v-slot:header-root='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;'>
                <q-icon name='mdi-folder' size='xs' color='orange' />
                {{ prop.node.label }}
              </div>
            </div>
          </template>
          <template v-slot:header-default='prop'>
            <div class='row items-center justify-between full-width no-warp'>
              <div style='min-width: 120px;' @dblclick='() => editing = prop.node' @click='() => varSelected = prop.node'>
                {{ prop.node.label }}
              </div>
            </div>
          </template>
        </q-tree>
        <q-separator vertical />
        <div v-if='varSelected' class='col-grow column q-px-md'>
          <q-input v-model='varSelected.label' dense label='名称' readonly/>
          <q-select v-model='varSelected.type' :options="[
              'BOOL', 'SINT', 'INT', 'DINT', 'USINT', 'UINT', 'UDINT', 'REAL', 'WSTRING', 'LINT', 'ULINT',
              'TIME_OF_DAY', 'DATE_AND_TIME', 'BYTE', 'WORD', 'DWORD', 'LWORD', 'LREAL', 'TIME'
            ]" dense label='类型' readonly/>
          <q-input v-model='varSelected.arraySize' dense label='数组长度' readonly/>
          <q-input v-model='varSelected.initialValue' dense label='初始值' readonly/>
          <q-input v-model='varSelected.comment' dense label='备注' readonly/>
          <q-input v-model='varSelected.value' dense label='当前值' readonly />
          <div class="q-mt-sm">编辑当前值
            <q-popup-edit v-slot="scope">
              <input @keydown.enter="e => onSetValue(e, scope)" autofocus/>
            </q-popup-edit>
          </div>
          <!-- <q-input v-model='varSelected.editValue' dense label='写入值' @update:model-value="$emit('update', v)"/> -->

        </div>
      </div>
    </div>
</template>
<script setup>
import { ref, toRefs, watch, onMounted, inject } from 'vue'
import { uid } from 'quasar'
import go from 'gojs'
import { isArray } from 'lodash'
const emit = defineEmits(['update'])

const onSetValue = (e, scope) => {
  // console.log(scope)
  emit('update', { value: e.target.value })
  scope.cancel()
}

const $ = go.GraphObject.make

const props = defineProps(['selected', 'devices', 'options', 'recipeState', 'selectedRow'])

const varSelected = inject('varSelected')

const { selected, options, selectedRow } = toRefs(props)
let diagram = null

console.log(selectedRow)

const state = ref(null)

watch(() => props.recipeState, v => {
  state.value = {
    starttime: v.starttime,
    endtime: v.endtime,
    unit: v.unit,
    order: v.order
  }

  if (diagram) {
    diagram.nodes.each(function (n) {
      if (n.data.category === undefined) {
        const t = v.step.find(e => e.path === n.key)
        if (t) {
          diagram.model.setDataProperty(n.data, 'fill', t.fill)
        } else {
          diagram.model.setDataProperty(n.data, 'fill', 'lightyellow')
        }
        // const e = options.value.find(r => r.id === n.data.step)
        // const paths = v.step.map(_e => `${v.id}.${_e}`)
        // if (e) {
        //   const nodePath = [...selected.value._path.slice(1), selected.value.label, e.displayLabel].join('.')
        //   if (paths.includes(nodePath)) {
        //     diagram.model.setDataProperty(n.data, 'fill', v.fill)
        //   } else {
        //     diagram.model.setDataProperty(n.data, 'fill', 'lightyellow')
        //   }
        // }
      }
    })
  }
}, {
  immediate: true
})

const resizeAdornment = function () {
  return $(go.Adornment, go.Panel.Spot,
    $(go.Placeholder),
    $(go.Shape, // left resize handle
      {
        alignment: go.Spot.Left,
        cursor: 'col-resize',
        desiredSize: new go.Size(6, 6),
        fill: 'lightblue',
        stroke: 'dodgerblue'
      }),
    $(go.Shape, // right resize handle
      {
        alignment: go.Spot.Right,
        cursor: 'col-resize',
        desiredSize: new go.Size(6, 6),
        fill: 'lightblue',
        stroke: 'dodgerblue'
      }))
}

const commonNodeStyle = function () {
  return [
    {
      locationSpot: go.Spot.Center
      // selectionAdornmentTemplate: this.commandsAdornment() // shared selection Adornment
    },
    new go.Binding('location', 'location', go.Point.parse).makeTwoWay(go.Point.stringify)
  ]
}
const startNodeTemplate = function () {
  return $(go.Node, 'Horizontal', commonNodeStyle(),
    {
      locationObjectName: 'STEPPANEL',
      selectionObjectName: 'STEPPANEL'
    },
    $(go.Panel, 'Auto',
      { // this is the port element, not the whole Node
        name: 'STEPPANEL',
        portId: '',
        // fromSpot: go.Spot.Bottom,
        fromLinkable: true,
        // toSpot: go.Spot.Top,
        toLinkable: true
      },
      $(go.Shape, { fill: '#ffcc80' }),
      $(go.Panel, 'Auto',
        { margin: 3 },
        $(go.Shape, {
          fill: null,
          minSize: new go.Size(20, 20)
        }),
        $(go.TextBlock, 'Unit',
          {
            margin: 3,
            editable: true
          },
          new go.Binding('text', 'step').makeTwoWay()))),
    // a connector line between the texts
    $(go.Shape, 'LineH', {
      width: 10,
      height: 1
    }, new go.Binding('visible', '', () => {
      // return this.selected.header === 'a4'
    })),
    // the boxed, editable text on the side
    $(go.Panel, 'Auto',
      new go.Binding('visible', '', () => {
        // return this.selected.header === 'a4'
      }),
      $(go.Shape, { fill: 'white' }),
      $(go.TextBlock, 'Action',
        {
          margin: 3,
          editable: false
          // doubleClick: this.action
        },
        new go.Binding('text', 'text', a => {
          let r = ''
          if (isArray(a)) {
            a.forEach(e => {
              r += `${e.var}|${e.value};`
            })
          }
          return r || 'Action'
        }))))
}

const nodeTemplate = function () {
  return $(go.Node, 'Horizontal', commonNodeStyle(),
    {
      locationObjectName: 'STEPPANEL',
      selectionObjectName: 'STEPPANEL'
    },
    $(go.Panel, 'Auto',
      { // this is the port element, not the whole Node
        name: 'STEPPANEL',
        portId: '',
        // fromSpot: go.Spot.Bottom,
        fromLinkable: true,
        // toSpot: go.Spot.Top
        toLinkable: true
      },
      $(go.Shape, {
        fill: 'lightyellow',
        minSize: new go.Size(20, 20)
      }, new go.Binding('fill', 'fill')),
      $(go.TextBlock, 'Step',
        {
          margin: 3,
          editable: false
          // doubleClick: this.onDeviceClick
        },
        new go.Binding('text', 'step', (k, t) => {
          const e = options.value.find(r => r.id === k)
          if (e) return e.displayLabel
          return ''
        }))),
    $(go.Shape, 'LineH', {
      width: 10,
      height: 1
    },
    new go.Binding('visible', '', () => {
      // return this.selected.header === 'a4'
    })),
    $(go.Panel, 'Auto',
      new go.Binding('visible', '', () => {
        // return this.selected.header === 'a4'
      }),
      $(go.Shape, { fill: 'white' }),
      $(go.TextBlock, 'Action',
        {
          margin: 3,
          editable: false
          // doubleClick: this.action
        },
        new go.Binding('text', 'text', a => {
          let r = ''
          if (isArray(a)) {
            a.forEach(e => {
              r += `${e.var}|${e.value};`
            })
          }
          return r || 'Action'
        }))))
}

const linkTemplate = function () {
  class BarLink extends go.Link {
    getLinkPoint (node, port, spot, from, ortho, othernode, otherport) {
      const r = port.getDocumentBounds()
      const op = otherport.getDocumentBounds()
      const below = op.centerY > r.centerY
      const y = below ? r.bottom : r.top
      if (node.category === 'Parallel' || node.category === 'Exclusive' || node.category === 'EndParallel' || node.category === 'EndExclusive') {
        if (op.right < r.left) return new go.Point(r.left, y)
        if (op.left > r.right) return new go.Point(r.right, y)
        return new go.Point((Math.max(r.left, op.left) + Math.min(r.right, op.right)) / 2, y)
      } else return new go.Point(r.centerX, y)
    }

    getLinkDirection (node, port, linkpoint, spot, from, ortho, othernode, otherport) {
      const p = port.getDocumentPoint(go.Spot.Center)
      const op = otherport.getDocumentPoint(go.Spot.Center)
      const below = op.y > p.y
      return below ? 90 : 270
    }
  }
  return $(
    BarLink,
    {
      // routing: go.Link.AvoidsNodes,
      // doubleClick: this.link
      // curve: go.Link.Bezier
      // corner: 10,
      // relinkableFrom: true,
      // relinkableTo: true,
      // reshapable: true
    },
    new go.Binding('points').makeTwoWay(),
    $(go.Shape,
      {
        strokeWidth: 1,
        stroke: '#000000'
      }),
    $(go.Shape,
      {
        toArrow: 'standard',
        stroke: null,
        fill: '#000000'
      }),
    $(go.Shape, 'LineH',
      {
        width: 20,
        height: 1
      },
      new go.Binding('visible', '', p => {
        const fromNode = p.fromNode
        const toNode = p.toNode
        if (fromNode.category === 'Parallel' || toNode.category === 'EndParallel' || fromNode.category === 'EndExclusive' || toNode.category === 'Exclusive') return false
        return true
      }).ofObject()),
    $(go.TextBlock,
      {
        alignmentFocus: new go.Spot(0, 0.5, -12, 0),
        editable: false
      },
      new go.Binding('visible', '', p => {
        const fromNode = p.fromNode
        const toNode = p.toNode
        if (fromNode.category === 'Parallel' || toNode.category === 'EndParallel' || fromNode.category === 'EndExclusive' || toNode.category === 'Exclusive') return false
        return true
      }).ofObject(),
      new go.Binding('text'))
  )
}

const endTemplate = function () {
  return $(go.Node, 'Auto',
    new go.Binding('location', 'location', go.Point.parse).makeTwoWay(go.Point.stringify),
    {
      portId: '',
      // fromSpot: go.Spot.Bottom,
      // fromLinkable: true,
      toSpot: go.Spot.Top,
      toLinkable: true
    },
    $(go.Shape, {
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0
    }),

    $(go.Shape, {
      geometryString: `
            F M25 0 V 40
            F M0 10 H 50
            F M5 15 H 45
            F M10 20 H 40
            F M15 25 H 35
            F M20 30 H 30z
          `,
      fill: 'lightyellow'
    }))
}

const parallelNodeTemplate = function () {
  return $(go.Node, commonNodeStyle(),
    { // special resizing: just at the ends
      resizable: true,
      resizeObjectName: 'SHAPE',
      resizeAdornmentTemplate: resizeAdornment(),
      fromLinkable: true,
      toLinkable: true
    },
    $(go.Shape,
      { // horizontal pair of lines stretched to an initial width of 200
        name: 'SHAPE',
        geometryString: 'M0 0 L100 0 M0 4 L100 4',
        fill: 'transparent',
        stroke: 'red',
        width: 200
      },
      new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)))
}

const exclusiveNodeTemplate = function () {
  return $(go.Node, commonNodeStyle(),
    { // special resizing: just at the ends
      resizable: true,
      resizeObjectName: 'SHAPE',
      resizeAdornmentTemplate: resizeAdornment(),
      fromLinkable: true,
      toLinkable: true
    },
    $(go.Shape,
      { // horizontal line stretched to an initial width of 200
        name: 'SHAPE',
        geometryString: 'M0 0 L100 0',
        fill: 'transparent',
        stroke: 'red',
        width: 200
      },
      new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)))
}

const commentTemplate = function () {
  return $(go.Node, 'Auto',
    new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
      go.Point.stringify
    ),
    $(go.Shape, {
      fill: 'snow'
    }),
    $(go.TextBlock,
      {
        editable: true,
        minSize: new go.Size(45, NaN),
        margin: new go.Margin(8),
        font: '550 13px bold'
      },
      new go.Binding('font').makeTwoWay(),
      new go.Binding('stroke').makeTwoWay(),
      new go.Binding('width').makeTwoWay(),
      new go.Binding('height').makeTwoWay(),
      new go.Binding('text').makeTwoWay()))
}

const initCanvas = function (id, data) {
  if (!diagram) {
    diagram = $(go.Diagram, id, {
      'toolManager.hoverDelay': 0,
      allowLink: false,
      padding: 90
    })

    diagram.nodeTemplate = nodeTemplate()
    diagram.linkTemplate = linkTemplate()

    diagram.nodeTemplateMap.add('Start', startNodeTemplate())
    diagram.nodeTemplateMap.add('End', endTemplate())
    diagram.nodeTemplateMap.add('Parallel', parallelNodeTemplate())
    diagram.nodeTemplateMap.add('EndParallel', parallelNodeTemplate())
    diagram.nodeTemplateMap.add('Exclusive', exclusiveNodeTemplate())
    diagram.nodeTemplateMap.add('EndExclusive', exclusiveNodeTemplate())
    diagram.nodeTemplateMap.add('comment', commentTemplate())

    // diagram.addModelChangedListener(this.modelChangeListener)

    // diagram.addModelChangedListener(this.modelChangeListener)
  }

  diagram.model = $(go.GraphLinksModel, data)

  diagram.nodes.each(function (n) {
    if (n.data.category === undefined) {
      diagram.model.setDataProperty(n.data, 'fill', 'lightyellow')
    }
  })
  return diagram
}

const id = 'diagram'

onMounted(() => {
  watch(selected, n => {
    if (!n.vars) {
      n.vars = [
        {
          id: 'root',
          label: '参数配置',
          header: 'root',
          children: []
        }
      ]
    }
    console.log(123456)
    initCanvas(id, n.diagram)
  }, { immediate: true })
})

const splitterModel = ref(50)
const editing = ref(null)

const addChildren = (prop, child) => {
  prop.node.children.push({
    id: uid(),
    ...child
  })
}

const qtree = ref(null)

const deleteChild = (prop) => {
  const parentId = prop.node.parentId
  const parent = qtree.value.getNodeByKey(parentId)
  const i = parent.children.findIndex(e => e === prop.node)
  parent.children.splice(i, 1)
  if (selected.value === prop.node) this.selected = ''
  // this.findParentNode(this.tree, prop.node)
}
</script>
