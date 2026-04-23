<template>
  <div class="fit column">
    <q-scroll-area class="col-7" >
      <div id="device-diagram" class="fit"></div>
    </q-scroll-area>
    <div class="col-5">
      <q-table
        :rows="rows"
        :columns="columns"
        flat bordered
        dense>
        <template v-slot:body-cell-value="props">
          <q-td :props="props">
            <div>
              {{props.row.value}}
            </div>
            <q-popup-edit v-slot="scope">
              <input @keydown.enter="e => onSetValue(e, props.row, scope)" autofocus />
            </q-popup-edit>
          </q-td>
        </template>

      </q-table>
    </div>
  </div>
</template>
<script setup>
import { toRefs, ref, onMounted, watch } from 'vue'
import * as joint from '@clientio/rappid'

const props = defineProps(['selected', 'deviceState'])
const namespace = joint.shapes
// const app = namespace.app as any
const graph = new joint.dia.Graph({}, {
  cellNamespace: namespace
})
const paper = new joint.dia.Paper({
  model: graph,
  gridSize: 5,
  async: true,
  clickThreshold: 10,
  width: '750px',
  height: '450px',
  cellViewNamespace: namespace
})

watch(() => props.deviceState, v => {
  if (v) {
    const cells = graph.getCells()
    cells.forEach(e => {
      if (e.id === v.id) {
        e.attr('body/fill', v.fill)
      } else {
        e.attr('body/fill', '#ffffff')
      }
    })
  }
}, {
  immediate: true
})

// watch((v) => {
//   if (v) {
//     const cells = graph.getCells()
//     cells.forEach(e => {
//       if (e.id === v.id) {
//         e.attr('fill', v.fill)
//       }
//     })
//   }
// }, [props.deviceState])

onMounted(() => {
  const el = document.getElementById('device-diagram')
  el.append(paper.el)
  paper.render()

  const Complete = new joint.shapes.standard.Rectangle()
  Complete.position(50, 50)
  Complete.resize(100, 40)
  Complete.prop('id', 'Complete')
  Complete.attr({
    label: {
      text: 'Complete'
    }
  })

  const Restarting = new joint.shapes.standard.Rectangle()
  Restarting.position(200, 50)
  Restarting.resize(100, 40)
  Restarting.prop('id', 'Restarting')
  Restarting.attr({
    label: {
      text: 'Restarting'
    }
  })

  const Held = new joint.shapes.standard.Rectangle()
  Held.position(350, 50)
  Held.resize(100, 40)
  Held.prop('id', 'Held')
  Held.attr({
    label: {
      text: 'Held'
    }
  })

  const Holding = new joint.shapes.standard.Rectangle()
  Holding.position(500, 50)
  Holding.resize(100, 40)
  Holding.prop('id', 'Holding')

  Holding.attr({
    id: 'Holding',
    label: {
      text: 'Holding'
    }
  })

  const Idle = new joint.shapes.standard.Rectangle()
  Idle.position(50, 150)
  Idle.resize(100, 40)
  Idle.prop('id', 'Idle')
  Idle.attr({
    label: {
      text: 'Idle'
    }
  })

  const Running = new joint.shapes.standard.Rectangle()
  Running.position(275, 150)
  Running.resize(100, 40)
  Running.prop('id', 'Running')

  Running.attr({
    label: {
      text: 'Running'
    }
  })

  const Pausing = new joint.shapes.standard.Rectangle()
  Pausing.position(500, 150)
  Pausing.resize(100, 40)
  Pausing.prop('id', 'Pausing')
  Pausing.attr({
    label: {
      text: 'Pausing'
    }
  })

  const Aborting = new joint.shapes.standard.Rectangle()
  Aborting.position(150, 250)
  Aborting.resize(100, 40)
  Aborting.prop('id', 'Aborting')
  Aborting.attr({
    label: {
      text: 'Aborting'
    }
  })
  const Stopping = new joint.shapes.standard.Rectangle()
  Stopping.position(325, 250)
  Stopping.resize(100, 40)
  Stopping.prop('id', 'Stopping')
  Stopping.attr({
    label: {
      text: 'Stopping'
    }
  })
  const Paused = new joint.shapes.standard.Rectangle()
  Paused.position(500, 250)
  Paused.resize(100, 40)
  Paused.prop('id', 'Paused')
  Paused.attr({
    label: {
      text: 'Paused'
    }
  })

  const Aborted = new joint.shapes.standard.Rectangle()
  Aborted.position(150, 350)
  Aborted.resize(100, 40)
  Aborted.prop('id', 'Aborted')

  Aborted.attr({
    label: {
      text: 'Aborted'
    }
  })
  const Stopped = new joint.shapes.standard.Rectangle()
  Stopped.position(325, 350)
  Stopped.resize(100, 40)
  Stopped.prop('id', 'Stopped')
  Stopped.attr({
    label: {
      text: 'Stopped'
    }
  })

  const link1 = new joint.shapes.standard.Link()
  link1.source(Running)
  link1.target(Complete)

  const link2 = new joint.shapes.standard.Link()
  link2.source(Complete)
  link2.target(Idle)

  const link3 = new joint.shapes.standard.Link()
  link3.source(Idle)
  link3.target(Running)

  const link4 = new joint.shapes.standard.Link()
  link4.source(Running)
  link4.target(Holding)
  const link5 = new joint.shapes.standard.Link()
  link5.source(Holding)
  link5.target(Held)
  const link6 = new joint.shapes.standard.Link()
  link6.source(Held)
  link6.target(Restarting)

  const link7 = new joint.shapes.standard.Link()
  link7.source(Restarting)
  link7.target(Running)

  const link8 = new joint.shapes.standard.Link()
  link8.source(Running)
  link8.target(Pausing)

  const link9 = new joint.shapes.standard.Link()
  link9.source(Paused)
  link9.target(Running)

  const link10 = new joint.shapes.standard.Link()
  link10.source(Running)
  link10.target(Stopping)

  const link11 = new joint.shapes.standard.Link()
  link11.source(Stopping)
  link11.target(Stopped)
  const link12 = new joint.shapes.standard.Link()
  link12.source(Stopped)
  link12.router('oneSide', {
    side: 'bottom',
    padding: 30
  })
  link12.connector('rounded')
  link12.target(Idle)

  const link13 = new joint.shapes.standard.Link()
  link13.source(Running)
  link13.target(Aborting)
  const link14 = new joint.shapes.standard.Link()
  link14.source(Aborting)
  link14.target(Aborted)
  const link15 = new joint.shapes.standard.Link()
  link15.source(Aborted)
  link15.target(Idle)

  link15.router('oneSide', {
    side: 'left',
    padding: 30
  })
  link15.connector('rounded')

  Complete.addTo(graph)
  Restarting.addTo(graph)
  Held.addTo(graph)
  Holding.addTo(graph)
  Idle.addTo(graph)
  Running.addTo(graph)
  Pausing.addTo(graph)
  Aborting.addTo(graph)
  Stopping.addTo(graph)
  Paused.addTo(graph)
  Aborted.addTo(graph)
  Stopped.addTo(graph)

  link1.addTo(graph)
  link2.addTo(graph)
  link3.addTo(graph)
  link4.addTo(graph)
  link5.addTo(graph)
  link6.addTo(graph)
  link7.addTo(graph)
  link8.addTo(graph)
  link9.addTo(graph)
  link10.addTo(graph)
  link11.addTo(graph)
  link12.addTo(graph)
  link13.addTo(graph)
  link14.addTo(graph)
  link15.addTo(graph)

  // const cells = graph.getCells()
  // console.log(cells)
})

//
const emit = defineEmits(['update'])

const rows = ref([...props.selected.interface.inputs.map(e => ({ ...e, _type: '输入', editValue: '' })), ...props.selected.interface.outputs.map(e => ({ ...e, _type: '输出', editValue: '' }))])

watch(() => props.selected, v => {
  rows.value = [...v.interface.inputs.map(e => ({ ...e, _type: '输入', editValue: '' })), ...v.interface.outputs.map(e => ({ ...e, _type: '输出', editValue: '' }))]
})

const columns = [
  { name: 'text', align: 'left', label: '名称', field: 'text' },
  { name: 'type', align: 'left', label: '输入/输出', field: '_type' },
  { name: 'value', align: 'left', label: '当前值' }

]

const onSetValue = (e, row, scope) => {
  scope.cancel()
  emit('update', { row, value: e.target.value })
}

</script>
