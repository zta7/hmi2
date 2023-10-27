<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})" class="column no-wrap no-scroll">
    <!-- <div class="row items-center q-gutter-md q-pa-sm">
      <q-input v-model='filter.recipe' dense outlined>
          <template #before>
            <span class='text-subtitle1'>配方名</span>
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
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
        >
          <div v-if="col.name=== 'unit'">
            <q-icon :name="props.expand ? 'mdi-chevron-up' : 'mdi-chevron-down'" flat dense @click="props.expand = !props.expand" size="sm"/>
            <!-- <q-icon name="mdi-plus" flat dense size="sm"/> -->
          </div>
          <div v-else-if="col.name=== 'action'">
            <q-icon name="mdi-pencil" flat dense size="sm" @click="() => onEditRecipe(props.row)"/>
          </div>
          <div v-else>
            {{ col.value }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <q-table
            dense
            flat
            bordered
            hide-bottom
            :rows="props.row.unit"
            :rows-per-page-options="[0]"
            :columns="columns2">
            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <div>
                  <q-icon name="mdi-pencil" size="sm" @click="() => onEditRecipeUnit(props.row)"/>
                  <!-- <q-icon name="mdi-delete" size="sm" @click="() => onDeleteRecipeUnit(props.row)"/> -->
                </div>
              </q-td>
            </template>
          </q-table>
        </q-td>
      </q-tr>
    </template>
    <template v-slot:body-cell-unit="props">
      <q-td :props="props">
        <div>
          <q-badge color="purple" :label="props.value" />
        </div>
        <div class="my-table-details">
          unit
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
import EditRecipeUnitDialog from 'src/components/RecipePage/EditRecipeUnitDialog'
import EditRecipeDialog from 'src/components/RecipePage/EditRecipeDialog'
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
  const r = get(json, '$recipe', [])
  rows.value = r
}

const onEditRecipe = (row) => {
  Dialog.create({
    component: EditRecipeDialog,
    componentProps: {
      row
    }
  })
}

const onEditRecipeUnit = (row) => {
  Dialog.create({
    component: EditRecipeUnitDialog,
    componentProps: {
      row
    }
  })
}

const onDeleteRecipeUnit = () => {
  console.log(1)
}

const filter = reactive({
  time: '' as any,
  var: '',
  related: ''
})
const columns = [
  {
    label: '配方号',
    field: 'recipe_No',
    name: 'recipe_No'

  },
  {
    label: '配方名',
    field: 'recipe',
    name: 'recipe'

  },
  {
    label: '版本号',
    field: 'version',
    name: 'version'

  },
  {
    label: '产线',
    field: 'production',
    name: 'production'

  },
  {
    label: '修改时间',
    field: 'time',
    name: 'time'
  },
  {
    label: '配方单元',
    name: 'unit',
    field: 'unit'
  },
  {
    label: '操作',
    field: 'action',
    name: 'action'
  }
]
const columns2 = [
  {
    label: '单元名称',
    field: 'name',
    name: 'name'
  },
  {
    label: 'BOM',
    field: 'M1',
    name: 'M1'
  },
  {
    label: '工艺参数',
    field: 'temp',
    name: 'temp'
  },
  {
    label: '操作',
    field: 'action',
    name: 'action'
  }
]

// const rows = [
//   {
//     recipe_No: '1',
//     recipe: 'a',
//     version: 'v0.1',
//     production: 'b',
//     time: 'c',
//     unit: [
//       { name: '单元', M1: 'M1', temp: 'temp' },
//       { name: '单元', M1: 'M1', temp: 'temp' },
//       { name: '单元', M1: 'M1', temp: 'temp' }

//     ]
//   }
// ]

</script>
<!-- <style lang="scss" scoped>
:deep(.q-table__middle) {
  height: 0px;
}
</style> -->
