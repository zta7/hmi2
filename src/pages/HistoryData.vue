<script setup lang="ts">
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import { reactive, ref, computed } from 'vue'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { Notify, QTableProps } from 'quasar'
import { get } from 'lodash'

// window.ws = '127.0.0.1:8080'
// window.table = '["users"]'
// window.column = '{"users": ["ts","name","password","email"]}'

const table = JSON.parse(window.table)
const column = JSON.parse(window.column)

// console.log(table, column)

const filter = reactive({
  time: '' as any,
  var: '',
  related: ''
})

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 20
})

const columnOptions = ref(get(column, filter.related, []))

const columns = ref([
  { name: 'time', align: 'left', label: '时间', field: 'time' },
  { name: 'var', label: '变量', field: 'var' },
  { name: 'related', label: '关联', field: 'related' },
  { name: 'value', label: '值', field: 'value' }
] as QTableProps['columns'])

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
  console.log(json)
  const r = get(json, '$History', [])
  columns.value = Object.keys(r[0]).map(e => ({ label: e, field: e, align: 'left', name: e }))
  rows.value = r
  pagination.value.rowsNumber = json.totalrow
}

const onInquire = () => {
  w.send(`$History ${JSON.stringify({ ...filter, offset: pagination.value.page, rowNumber: pagination.value.rowsPerPage })}`)
}

const onInput = (v: string) => {
  filter.related = v
  columnOptions.value = get(column, filter.related, [])
}

const onRequest = (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
}

</script>

<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})" class="column no-wrap no-scroll">
    <div class="row items-center q-gutter-md q-pa-sm">
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
        <q-select :model-value='filter.related'  @update:model-value="onInput" dense outlined :options='table'>
          <template #before>
            <span class='text-subtitle1'>表名</span>
          </template>
        </q-select>
        <q-select v-model='filter.var' dense outlined :options='columnOptions'>
          <template #before>
            <span class='text-subtitle1'>列名</span>
          </template>
        </q-select>
        <!-- <q-select v-model='filter.rowNumber' map-options dense outlined :options="[
          { label: 20, value: 20  },
          { label: 50, value: 50  },
          { label: 100, value: 100  },
          { label: 200, value: 200  },
          { label: 'All', value: 0  }
          ]">
          <template #before>
            <span class='text-subtitle1'>限制条数</span>
          </template>
        </q-select> -->
        <q-space />
        <q-btn label='导出csv' dense/>
        <q-btn label='查询' dense @click="onInquire"/>
    </div>
    <q-table
      title="历史数据"
      class="col-grow sticky-header-table"
      dense
      flat
      bordered
      @request="onRequest"
      v-model:pagination="pagination"
      :rows="rows"
      :columns="columns"
    />
  </q-page>
</template>

<style lang="scss" scoped>
:deep(.q-table__middle) {
  height: 0px;
}
</style>
