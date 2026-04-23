<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" allow-focus-outside>
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">编辑配方单元</div>
      </q-card-section>

      <q-card-section>
        <q-select dense outline v-model="clone._recipe" label="配方" :options="r"/>
        <q-select dense outline v-model="clone._device" label="产线" :options="d"/>
        <q-input dense outline v-model="clone._deviceNumber" label="产线批次" type="number"/>
        <div class="q-mt-md" v-if="vars">
          <div>配方参数</div>
          <q-input dense outline v-for="(e,i) in vars" :key="i" :label="e" v-model="clone._extras[e]"/>
        </div>
        <div class="q-mt-md" v-if="vars2">
          <div>订单参数</div>
          <q-input dense outline v-for="(e,i) in vars2" :key="i" :label="e" v-model="clone._extras2[e]"/>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="primary" label="Cancel" @click="onDialogCancel" />
        <q-btn color="primary" label="OK" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'
import { reactive, computed } from 'vue'
import { cloneDeep } from 'lodash'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

const { recipeList, deviceList, recipeVarMap, OrderVarMap } = window

// const m = { 1: ['A', 'B', 'C'] }
// const r = [1, 2, 3]
// const d = [4, 5, 6]
// const m2 = { 1: ['A', 'B', 'C'] }

const r = JSON.parse(recipeList)
const d = JSON.parse(deviceList)
const m = JSON.parse(recipeVarMap)
const m2 = JSON.parse(OrderVarMap)

const vars = computed(() => m[clone._recipe])
const vars2 = computed(() => m2[clone._orderId])

const props = defineProps({
  row: Object
})

const clone = reactive(cloneDeep(props.row))

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick () {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK(clone)
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
