<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})" class="column no-wrap no-scroll">
    <q-card class='fit row no-wrap' flat square>
      <div class="row no-warp">
        <div>
          <div class='text-h6'>批量控制配方管理</div>
          <q-tree
          style='width: 260px'
          class='overflow-auto'
          dense
          :selected='selected ? selected.id : ""'
          :nodes='tree'
          no-selection-unset
          default-expand-all
          node-key='id'>
          <template v-slot:header-b='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;'>
                <q-icon name='mdi-folder' size='xs' color='orange' />
                {{ prop.node.label }}
              </div>
              <div>
                <!-- <q-icon name='add' size='xs' @click='addChildren(prop, { label: "过程单元", header: "b1", children: [], parentId: prop.node.id })' /> -->
              </div>
            </div>
          </template>
          <template v-slot:header-b1='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;' >
                <div class='inline-block'>
                  <!-- <q-icon name='mdi-folder' size='xs' color='orange' /> -->
                  <q-badge outline align='middle' color='orange'>
                    Area
                  </q-badge>
                </div>
                {{ prop.node.label }}

                <!-- <q-menu no-parent-event :value='editing === prop.node' @hide='() => editing = null'>
                  <q-input v-model='prop.node.label' dense autofocus label='过程单元' @keyup.enter='() => editing = null' />
                  <q-input :value='prop.node.deviceId' dense autofocus label='设备ID(英文开头)' @input='v=> setDeviceId(prop.node, "deviceId", v)' @keyup.enter='() => editing = null' />
                </q-menu> -->

                <!-- <q-menu
                  touch-position
                  context-menu>
                  <q-list dense style='min-width: 100px'>
                    <q-item v-close-popup clickable @click='() => editing = prop.node'>
                      <q-item-section>重命名</q-item-section>
                    </q-item>
                    <q-separator />
                  </q-list>
                </q-menu> -->
              </div>
              <!-- <div>
                <q-icon name='close' class='q-mr-xs' size='xs' @click='deleteChild(prop)' />
                <q-icon name='add' size='xs' @click='addChildren(prop, { label: "单元", header: "b2", children: [], parentId: prop.node.id, fbb: {} })' />
              </div> -->
            </div>
          </template>
          <template v-slot:header-b2='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;' >
                <div class='inline-block'>
                  <!-- <q-icon name='mdi-folder' size='xs' color='orange' /> -->
                  <q-badge outline align='middle' color='orange'>
                    Unit
                  </q-badge>
                </div>
                {{ prop.node.label }}

                <!-- <q-menu no-parent-event :value='editing === prop.node' @hide='() => editing = null'>
                  <q-input v-model='prop.node.label' dense autofocus label='单元' @keyup.enter='() => editing = null' />
                  <q-input :value='prop.node.deviceId' dense autofocus label='设备ID(英文开头)' @input='v=> setDeviceId(prop.node, "deviceId", v)' @keyup.enter='() => editing = null' />
                </q-menu>

                <q-menu
                  touch-position
                  context-menu>
                  <q-list dense style='min-width: 100px'>
                    <q-item v-close-popup clickable @click='() => editing = prop.node'>
                      <q-item-section>重命名</q-item-section>
                    </q-item>
                    <q-separator />
                  </q-list>
                </q-menu> -->
                <!-- <q-popup-edit v-slot='scope' v-model='prop.node.label' auto-save>
                  <q-input v-model='scope.value' dense autofocus counter label='单元' @keyup.enter='scope.set' />
                </q-popup-edit> -->
              </div>
              <!-- <div>
                <q-icon name='close' class='q-mr-xs' size='xs' @click='deleteChild(prop)' />
                <q-icon name='add' size='xs' @click='addChildren(prop, { label: "设备", header: "b3", deviceId: "", parentId: prop.node.id, interface: { inputs: [], outputs: [] }, related: [] })' />
              </div> -->
            </div>
          </template>
          <template v-slot:header-b3='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;' @click.stop='() => selected = prop.node' >
                <div class='inline-block'>
                  <!-- <q-icon name='mdi-folder' size='xs' color='orange' /> -->
                  <q-badge outline align='middle' color='orange'>
                    Equip
                  </q-badge>
                </div>
                {{ prop.node.label }}

                <!-- <q-menu no-parent-event :value='editing === prop.node' @hide='() => editing = null'>
                  <q-input v-model='prop.node.label' dense autofocus label='设备' @keyup.enter='() => editing = null' />
                  <q-input :value='prop.node.deviceId' dense autofocus label='设备ID(英文开头)' @input='v=> setDeviceId(prop.node, "deviceId", v)' @keyup.enter='() => editing = null' />
                </q-menu>

                <q-menu
                  touch-position
                  context-menu>
                  <q-list dense style='min-width: 100px'>
                    <q-item v-close-popup clickable @click='() => editing = prop.node'>
                      <q-item-section>重命名</q-item-section>
                    </q-item>
                    <q-separator />
                  </q-list>
                </q-menu> -->
              </div>
              <!-- <div>
                <q-icon name='close' class='q-mr-xs' size='xs' @click='deleteChild(prop)' />
              </div> -->
            </div>
          </template>

          <template v-slot:header-a='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;'>
                <q-icon name='mdi-folder' size='xs' color='orange' />
                {{ prop.node.label }}
              </div>
              <!-- <div>
                <q-icon name='add' size='xs' @click='addChildren(prop, { label: "配方", header: "a1", children: [], parentId: prop.node.id })' />
              </div> -->
            </div>
          </template>
          <template v-slot:header-a1='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;'>
                <div class='inline-block'>
                  <q-icon name='mdi-folder' size='xs' color='orange' />
                </div>
                {{ prop.node.label }}

                <!-- <q-menu no-parent-event :value='editing === prop.node' @hide='() => editing = null'>
                  <q-input v-model='prop.node.label' dense autofocus label='配方(Recipe)' />
                </q-menu>

                <q-menu
                  touch-position
                  context-menu>
                  <q-list dense style='min-width: 100px'>
                    <q-item v-close-popup clickable @click='() => editing = prop.node'>
                      <q-item-section>重命名</q-item-section>
                    </q-item>
                    <q-separator />
                  </q-list>
                </q-menu> -->
              </div>
              <!-- <div>
                <q-icon name='close' class='q-mr-xs' size='xs' @click='deleteChild(prop)' />
                <q-icon name='add' size='xs' @click='addChildren(prop, { label: "配方过程", header: "a2", children: [], parentId: prop.node.id, diagram: {} })' />
              </div> -->
            </div>
          </template>
          <template v-slot:header-a2='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;' @click.stop='() => selected = prop.node' >
                <div class='inline-block'>
                  <!-- <q-icon name='mdi-folder' size='xs' color='orange' /> -->
                  <q-badge outline align='middle' color='orange'>
                    PRO
                  </q-badge>
                </div>
                {{ prop.node.label }}
                <!-- <q-menu no-parent-event :value='editing === prop.node' @hide='() => editing = null'>
                  <q-input v-model='prop.node.label' dense autofocus label='配方过程(Recipe Procedure)' @keyup.enter='() => editing = null' />
                </q-menu>

                <q-menu
                  touch-position
                  context-menu>
                  <q-list dense style='min-width: 100px'>
                    <q-item v-close-popup clickable @click='() => editing = prop.node'>
                      <q-item-section>重命名</q-item-section>
                    </q-item>
                    <q-separator />
                  </q-list>
                </q-menu> -->
              </div>
              <!-- <div>
                <q-icon name='close' class='q-mr-xs' size='xs' @click='deleteChild(prop)' />
                <q-icon name='add' size='xs' @click='addChildren(prop, { label: "配方单元过程", header: "a3", parentId: prop.node.id, children: [], diagram: {} })' />
              </div> -->
            </div>
          </template>

          <template v-slot:header-a3='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;' @click.stop='() => selected = prop.node' >
                <div class='inline-block'>
                  <!-- <q-icon name='mdi-folder' size='xs' color='orange' /> -->
                  <q-badge outline align='middle' color='orange'>
                    UPRO
                  </q-badge>
                </div>
                {{ prop.node.label }}
                <!-- <q-menu no-parent-event :value='editing === prop.node' @hide='() => editing = null'>
                  <q-input v-model='prop.node.label' dense autofocus counter label='配方单元过程(Recipe Unit Procedure)' @keyup.enter='() => editing = null' />
                </q-menu>

                <q-menu
                  touch-position
                  context-menu>
                  <q-list dense style='min-width: 100px'>
                    <q-item v-close-popup clickable @click='() => editing = prop.node'>
                      <q-item-section>重命名</q-item-section>
                    </q-item>
                    <q-separator />
                  </q-list>
                </q-menu> -->
              </div>
              <!-- <div>
                <q-icon name='close' class='q-mr-xs' size='xs' @click='deleteChild(prop)' />
                <q-icon name='add' size='xs' @click='addChildren(prop, { label: "配方操作", header: "a4", diagram: {}, parentId: prop.node.id })' />
              </div> -->
            </div>
          </template>

          <template v-slot:header-a4='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;' @click.stop='() => selected = prop.node' >
                <span>
                  <!-- <q-icon name='mdi-file-edit' size='xs' color='orange' /> -->
                  <q-badge outline align='middle' color='orange'>
                    OP
                  </q-badge>
                  {{ prop.node.label }}

                </span>
              </div>
            </div>
          </template>
          <template v-slot:header-b4='prop'>
            <div class='row items-center justify-between full-width'>
              <div style='min-width: 120px;' @click.stop='() => selected = prop.node' >
                <span>
                  <q-icon name='mdi-file-edit' size='xs' color='orange' />
                  {{ prop.node.label }}

                </span>
              </div>
            </div>
          </template>
        </q-tree>
        </div>
        <q-separator vertical />

      </div>
      <div v-if='selected' class='col-grow'>
        <set-batch-diagram v-if='["a2", "a3", "a4"].includes(selected.header)' :selected='selected' class='fit'  />
        <!-- <set-interface v-else-if='selected.header === "b3"' :selected='selected' class='fit' /> -->
        <!-- <set-device v-else-if='selected.header === "b4"' :selected='selected' class='fit' /> -->
      </div>
    </q-card>
  </q-page>
</template>
<script setup>
import { ref, computed } from 'vue'
import SetBatchDiagram from 'components/RecipePage/SetBatchDiagram'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { Dialog, Notify } from 'quasar'
import { get } from 'lodash'

const { ws, column } = window
const tree = JSON.parse(column)
const selected = ref(null)

const onSave = () => {
  w.send(`$Recipe ${JSON.stringify(tree)}`)
}

const w = new ReconnectingWebSocket(`ws://${ws}`)
w.onopen = () => {
  Notify.create({
    type: 'positive',
    message: 'Websocket Opened.'
    // position: 'top-right'
  })
}
w.onclose = () => {
  Notify.create({
    type: 'negative',
    message: 'Websocket Closed.'
    // position: 'top-right'
  })
}

w.onmessage = (evt) => {
  // const message = evt.data as string
  // const json = JSON.parse(message)
  // const r = get(json, '$Order', [])
  // rows.value = r
}

// const deviceOptions = computed(() => {
//   if (selected) {
//     if (selected.children) {
//       const arr = []
//       selected.children.forEach(e => {
//         arr.push({
//           ...e,
//           displayLabel: `${e.label}`
//         })
//       })
//       return arr
//     } else {
//       const arr = []
//       const a = tree[1]
//       a.children.forEach(a2 => {
//         a2.children.forEach(a3 => {
//           a3.children.forEach(a4 => {
//             arr.push({
//               ...a4,
//               displayLabel: `${a2.label}.${a3.label}.${a4.label}`
//             })
//           })
//         })
//       })
//       return arr
//     }
//   }
//   return []
// })

</script>
<!-- <style lang="scss" scoped>
:deep(.q-table__middle) {
  height: 0px;
}
</style> -->
