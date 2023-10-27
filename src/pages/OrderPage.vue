<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})" class="column no-wrap no-scroll">
    <!-- <div class="row items-center q-gutter-md q-pa-sm">
      <q-input v-model='filter.recipe' dense outlined>
          <template #before>
            <span class='text-subtitle1'>订单名</span>
          </template>
        </q-input>
      <q-field dense outlined style="width: 340px">
        <template #before>
          <span class='text-subtitle1'>时间段</span>
        </template>
        <template v-slot:control>
          <flat-pickr :model-value="filter.time" class='full-height full-width' style="border: none; outline: none" :config="{
              mode: 'range',
              enableTime: true,
              time_24hr: true,
              onClose: selectedDates => filter.time = selectedDates
          }"/>
        </template>
      </q-field>
      <q-space />
      <q-btn label='添加订单' dense @click="onAddOrder"/>
      <q-btn label='查询' dense @click="onInquire"/>
    </div> -->
    <q-table
      title="Batch配方"
      class="col-grow sticky-header-table"
      dense
      flat
      bordered
      :rows="rows"
      :columns="columns"
    >
    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <div>
          <q-icon name="mdi-pencil" flat dense size="xs" @click="() => onEditOrder(props.row)"/>
          <q-icon name="mdi-delete" flat dense size="xs" @click="() => onDeleteOrder(props.row)"/>
        </div>
      </q-td>
    </template>
  </q-table>
</q-page>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import EditOrderDialog from 'src/components/OrderPage/EditOrderDialog'
import { Dialog, Notify } from 'quasar'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { get } from 'lodash'

const rows = ref([])

const { ws } = window
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
  const message = evt.data as string
  const json = JSON.parse(message)
  const r = get(json, '$Order', [])
  rows.value = r
}

const onAddOrder = () => {
  Dialog.create({
    component: EditOrderDialog,
    componentProps: {
      row: {}
    }
  })
}

const onEditOrder = (row) => {
  Dialog.create({
    component: EditOrderDialog,
    componentProps: {
      row
    }
  })
}

const filter = reactive({
  time: '' as any,
  var: '',
  related: ''
})
const columns = [
  {
    label: '工单编号',
    field: 'order_id',
    name: 'order_id'
  },
  {
    label: '流水批号',
    field: 'serial_id',
    name: 'serial_id'

  },
  {
    label: '物料编码',
    field: 'fabric_id',
    name: 'fabric_id'
  },
  {
    label: '产品编码',
    field: 'product_id',
    name: 'product_id'
  },
  {
    label: '产品名称',
    field: 'product_name',
    name: 'product_name'

  },
  {
    label: '产品型号',
    field: 'product_version',
    name: 'product_version'
  },
  {
    label: '计划数量',
    name: 'plan_number',
    field: 'plan_number'
  },
  {
    label: '计划开始时间',
    field: 'plan_starttime',
    name: 'plan_starttime'
  },
  {
    label: '计划结束时间',
    field: 'plan_endtime',
    name: 'plan_endtime'
  },
  {
    label: '产线',
    name: 'production_line',
    field: 'production_line'
  },
  {
    label: '车间',
    name: 'workshop',
    field: 'workshop'
  },
  {
    label: '配方号',
    name: 'recipe_id',
    field: 'recipe_id'
  },
  {
    label: '版本号',
    name: 'recipe_version',
    field: 'recipe_version'
  },
  {
    label: '执行顺序',
    name: 'order',
    field: 'order'
  },
  {
    label: '状态',
    name: 'status',
    field: 'status'
  },
  {
    label: '操作',
    name: 'action',
    field: 'action'
  }
]
// const rows = [
//   {
//     order_id: 'order_id',
//     serial_id: 'serial_id',
//     fabric_id: 'fabric_id',
//     product_id: 'product_id',
//     product_name: 'product_name',
//     product_version: 'product_version',
//     plan_number: 'plan_number',
//     plan_starttime: 'plan_starttime',
//     plan_endtime: 'plan_endtime',
//     production_line: 'production_line',
//     workshop: 'workshop',
//     recipe_id: 'recipe_id',
//     recipe_version: 'recipe_version',
//     order: 0,
//     status: 0
//   }
// ]

</script>
<!-- <style lang="scss" scoped>
:deep(.q-table__middle) {
  height: 0px;
}
</style> -->
