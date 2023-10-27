<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" allow-focus-outside>
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">编辑配方单元</div>
      </q-card-section>

      <q-card-section>
        <q-input stack-label dense label="工单编号" v-model="clone.order_id"/>
        <q-input stack-label dense label="流水批号" v-model="clone.serial_id"/>
        <q-input stack-label dense label="物料编码" v-model="clone.fabric_id"/>
        <q-input stack-label dense label="产品编码" v-model="clone.product_id"/>
        <q-input stack-label dense label="产品名称" v-model="clone.product_name"/>
        <q-input stack-label dense label="产品型号" v-model="clone.product_version"/>
        <q-input stack-label dense label="计划数量" v-model="clone.plan_number"/>
        <q-field stack-label dense label="计划时间">
          <template v-slot:control>
            <flat-pickr :model-value="clone.time" class='full-height full-width' style="border: none; outline: none" :config="{
                mode: 'range',
                enableTime: true,
                time_24hr: true,
                onClose: selectedDates => clone.time = selectedDates
            }"/>
          </template>
       </q-field>
        <q-input stack-label dense label="产线" v-model="clone.production_line"/>
        <q-input stack-label dense label="车间" v-model="clone.workshop"/>
        <q-input stack-label dense label="配方号" v-model="clone.recipe_id"/>
        <q-input stack-label dense label="版本号" v-model="clone.recipe_version"/>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn color="primary" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'
import { reactive } from 'vue'
import { cloneDeep } from 'lodash'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
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
