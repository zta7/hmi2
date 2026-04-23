<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})" class="column no-wrap no-scroll">
    <q-splitter
      v-model="splitterModel"
      class="col-grow"
    >
      <template v-slot:before>
        <div class="fit column no-wrap">
          <div class="row items-center q-gutter-md q-pa-sm">
            <div class='text-h6'>批量控制订单管理</div>
            <q-select
                v-model="visibleColumns"
                label="显示列"
                multiple
                outlined
                dense
                options-dense
                :display-value="$q.lang.table.columns"
                emit-value
                map-options
                :options="columns"
                option-value="name"
                options-cover
                style="min-width: 150px"
              />
              <q-select
                v-model="option"
                label="选项"
                outlined
                dense
                options-dense
                emit-value
                map-options
                :options="[{label: '默认', value: 'normal'}, {label: '历史', value: 'history'}, {label: '当前', value: 'current'}]"
                style="min-width: 150px"
              />
            <q-space />
            <!-- <q-btn label='保存' dense @click="onInquire"/> -->
            <q-btn label='查询' dense @click="onInquire"/>
          </div>
          <div class='col-grow'>
            <q-table
              title="Batch配方"
              class="my-sticky-header-table"
              dense
              flat
              :rows="rows"
              :columns="columns"
              @request="onRequest"
              @row-click="onRowClick"
              v-model:pagination="pagination"
              :visible-columns="visibleColumns">

              <template v-slot:body-cell-_recipe="props">
                <q-td key="_recipe" :props="props">
                  {{ props.row._recipe }}
                </q-td>
              </template>
              <template v-slot:body-cell-_device="props">
                <q-td key="_device" :props="props">
                  {{ props.row._device }}
                </q-td>
              </template>
              <template v-slot:body-cell-_status="props">
                <q-td key="_status" :props="props">
                  {{ props.row._status }}
                </q-td>
              </template>
              <template v-slot:body-cell-_action="props">
                <q-td :props="props">
                  <div>
                    <q-icon name="mdi-pencil" flat dense size="sm" color="blue" @click.stop="() => onEditOrder(props)">
                      <q-tooltip>
                        编辑订单
                      </q-tooltip>
                    </q-icon>
                    <!-- <q-icon name="mdi-eye" flat dense size="sm" color="blue" @click="() => onRecipe(props.row)">
                      <q-tooltip>
                        查看配方
                      </q-tooltip>
                    </q-icon> -->
                    <q-icon name="mdi-play" flat dense size="sm" color="green" @click.stop="() => onAction(props.row, 'start')">
                      <q-tooltip>
                        开始
                      </q-tooltip>
                    </q-icon>
                    <q-icon name="mdi-pause" flat dense size="sm" color="red" @click.stop="() => onAction(props.row,'pause')">
                      <q-tooltip>
                        暂停
                      </q-tooltip>
                    </q-icon>
                    <q-icon name="mdi-restore" flat dense size="sm" color="green" @click.stop="() => onAction(props.row,'restore')">
                      <q-tooltip>
                        恢复
                      </q-tooltip>
                    </q-icon>
                    <q-icon name="mdi-lock-reset" flat dense size="sm" color="green" @click.stop="() => onAction(props.row,'reset')">
                      <q-tooltip>
                        重置
                      </q-tooltip>
                    </q-icon>
                    <q-icon name="mdi-stop" flat dense size="sm" color="red" @click.stop="() => onAction(props.row,'stop')">
                      <q-tooltip>
                        终止
                      </q-tooltip>
                    </q-icon>
                    <q-icon name="mdi-delete" flat dense size="sm" color="red" @click.stop="() => onAction(props.row,'delete')">
                      <q-tooltip>
                        删除
                      </q-tooltip>
                    </q-icon>
                  </div>
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </template>

      <template v-slot:after>
        <q-card class='fit row no-wrap' flat square v-if="tree">
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
            <set-batch-diagram v-if='["a2", "a3", "a4"].includes(selected.header)' :selected='selected' :selectedRow='selectedRow'  class='fit' @update="onUpdate" :options='deviceOptions' :recipeState='recipeState'/>
            <set-interface v-else-if='selected.header === "b4"' :selected='selected' class='fit' @update="onInterface" :deviceState='deviceState'/>
            <!-- <set-interface v-else-if='selected.header === "b3"' :selected='selected' class='fit' /> -->
            <!-- <set-device v-else-if='selected.header === "b4"' :selected='selected' class='fit' /> -->
          </div>
        </q-card>
      </template>

    </q-splitter>
</q-page>
</template>
<script setup lang="ts">
import { reactive, ref, computed, provide, watch } from 'vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import EditOrderDialog from 'src/components/OrderPage/EditOrderDialog'
import { Dialog, Notify } from 'quasar'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { get, omit, cloneDeep, debounce } from 'lodash'
import SetBatchDiagram from 'components/RecipePage/SetBatchDiagram'
import SetInterface from 'components/RecipePage/SetInterface'

// window.ws = '127.0.0.1:8080'
// window.recipeList = JSON.stringify(['Battery'])
// window.recipeVarMap = JSON.stringify({ Battery: ['Proc1.Test2', 'Proc1.UnitProc1.Test1'] })
// window.OrderVarMap = JSON.stringify({ f0: ['OrderNumber', 'Quantity'], f1: ['we', 'sx'] })
// window.deviceList = JSON.stringify(['Line1'])
// window.sfcTreeMap = '[{"id":"5248f3d2-05bf-42c6-9f67-ee919f3bb346","label":"配方配置","header":"a","comment":"","children":[{"id":"89d3e36c-7367-4dab-9935-25b589bd9ce3","parentId":"5248f3d2-05bf-42c6-9f67-ee919f3bb346","label":"Battery","deviceId":"","header":"a1","comment":"","diagram":{"nodeDataArray":null,"linkDataArray":null},"children":[{"id":"e80984a8-1e1c-4dc9-82e7-5c8b93755e7c","parentId":"89d3e36c-7367-4dab-9935-25b589bd9ce3","label":"Proc1","deviceId":"","header":"a2","comment":"","diagram":{"nodeDataArray":[{"category":"Start","step":"Start","key":-1,"location":"-99 -158"},{"step":"8a31d367-c659-4b1b-aebb-d394e824206e","key":-2,"location":"-99 -97"},{"category":"End","key":-3,"location":"-126 -45.5"}],"linkDataArray":[{"from":-1,"to":-2,"text":"Test2 = 1","points":[-99,-142.7439208984375,-99,-108.7560791015625]},{"from":-2,"to":-3,"text":"TRUE","points":[-99,-85.24392089843751,-100.5,-55.5,-100.5,-45.5]}]},"children":[{"id":"8a31d367-c659-4b1b-aebb-d394e824206e","parentId":"e80984a8-1e1c-4dc9-82e7-5c8b93755e7c","label":"UnitProc1","deviceId":"","header":"a3","comment":"","diagram":{"nodeDataArray":[{"category":"Start","step":"Start","key":-1,"location":"-123.5 -266"},{"category":"End","key":-3,"location":"-135 -38"},{"category":"Parallel","key":-4,"location":"-99 -191","size":"369 4"},{"step":"3e2dd732-c6dd-462e-9460-e0ad6d5aab5d","key":-5,"location":"-28 -143"},{"step":"c82fd019-7e46-42bb-acaa-2b76d7c1d675","key":-6,"location":"-212.5 -139"},{"category":"EndParallel","key":-7,"location":"-100 -89","size":"425 4"},{"step":"b51ab8cb-fc90-4cfb-9020-9ca661551b7c","key":-8,"location":"-125 -141"}],"linkDataArray":[{"from":-1,"to":-4,"text":"Test1 \u003e 0","points":[-123.5,-250.74392089843747,-123.5,-193.5]},{"from":-4,"to":-5,"points":[-28,-188.5,-28,-154.7560791015625]},{"from":-4,"to":-6,"points":[-212.5,-188.5,-212.5,-150.7560791015625]},{"from":-6,"to":-7,"points":[-212.5,-127.24392089843751,-212.5,-91.5]},{"from":-5,"to":-7,"points":[-28,-131.2439208984375,-28,-91.5]},{"from":-7,"to":-3,"text":"(OP1.completed = TRUE) AND (OP2.completed = TRUE) AND (OP3.completed = TRUE)","points":[-109.5,-86.5,-109.5,-48,-109.5,-38]},{"from":-4,"to":-8,"points":[-125,-188.5,-125,-152.7560791015625]},{"from":-8,"to":-7,"points":[-125,-129.2439208984375,-125,-91.5]}]},"children":[{"id":"c82fd019-7e46-42bb-acaa-2b76d7c1d675","parentId":"8a31d367-c659-4b1b-aebb-d394e824206e","label":"OP1","deviceId":"","header":"a4","comment":"","interface":{"input_events":null,"output_events":null,"inputs":null,"outputs":null},"diagram":{"nodeDataArray":[{"category":"Start","step":"Start","key":-1,"location":"-44.5 -142"},{"step":"7f140932-b8b4-4a48-b0b1-8e6803d9500e","text":[{"var":"OUT1","operation":"","value":"1"}],"key":-3,"location":"-44.5 -52.5"},{"category":"End","key":-4,"location":"-69.5 17.29998779296875"}],"linkDataArray":[{"from":-1,"to":-3,"text":"PLC1.IN1 = TRUE","points":[-44.5,-126.74392089843751,-44.5,-64.2560791015625]},{"from":-3,"to":-4,"text":"TRUE","points":[-44.5,-40.74392089843751,-44,7.29998779296875,-44,17.29998779296875]}]},"related":null,"vars":[{"id":"root","label":"参数配置","header":"root","type":"","parentId":"","arraySize":"","initialValue":"","comment":"","children":[]}]},{"id":"b51ab8cb-fc90-4cfb-9020-9ca661551b7c","parentId":"8a31d367-c659-4b1b-aebb-d394e824206e","label":"OP2","deviceId":"","header":"a4","comment":"","interface":{"input_events":null,"output_events":null,"inputs":null,"outputs":null},"diagram":{"nodeDataArray":[{"category":"Start","step":"Start","key":-1,"location":"-37.5 -89.5"},{"step":"7f140932-b8b4-4a48-b0b1-8e6803d9500e","text":[{"var":"OUT2","operation":"","value":"1"}],"key":-3,"location":"-38 -15.5"},{"category":"End","key":-6,"location":"-65 44"}],"linkDataArray":[{"from":-3,"to":-6,"text":"TRUE","points":[-38,-3.743920898437498,-39.5,34,-39.5,44]},{"from":-1,"to":-3,"text":"PLC1.IN2 = TRUE","points":[-37.5,-74.24392089843751,-38,-27.2560791015625]}]},"related":null,"vars":[{"id":"root","label":"参数配置","header":"root","type":"","parentId":"","arraySize":"","initialValue":"","comment":"","children":[]}]},{"id":"3e2dd732-c6dd-462e-9460-e0ad6d5aab5d","parentId":"8a31d367-c659-4b1b-aebb-d394e824206e","label":"OP3","deviceId":"","header":"a4","comment":"","interface":{"input_events":null,"output_events":null,"inputs":null,"outputs":null},"diagram":{"nodeDataArray":[{"category":"Start","step":"Start","key":-1,"location":"-46.20001220703125 -184.19996643066406"},{"category":"Exclusive","key":-2,"location":"-60.20001220703125 -134.19996643066406","size":"462 0"},{"step":"7f140932-b8b4-4a48-b0b1-8e6803d9500e","text":[{"var":"OUT3","operation":"","value":"1"}],"key":-3,"location":"-199.20004272460938 -79.69996643066406"},{"step":"7f140932-b8b4-4a48-b0b1-8e6803d9500e","text":[{"var":"OUT4","operation":"","value":"1"}],"key":-4,"location":"69 -81.79997253417969"},{"category":"End","key":-6,"location":"-57.100067138671875 15.800033569335938"},{"category":"EndExclusive","key":-7,"location":"-66.20004272460938 -34.19996643066406","size":"460 0"}],"linkDataArray":[{"from":-1,"to":-2,"text":"TRUE","points":[-46.20001220703125,-168.94388732910156,-46.20001220703125,-134.69996643066406]},{"from":-2,"to":-3,"text":"PLC1.IN3 = TRUE","points":[-198.4301300048828,-133.69996643066406,-199.20004272460938,-91.45604553222657]},{"from":-2,"to":-4,"text":"PLC1.IN4 = TRUE","points":[69,-133.69996643066406,69,-93.5560516357422]},{"from":-3,"to":-7,"text":"PLC1.IN5 = TRUE","points":[-199.20004272460938,-67.94388732910157,-199.20004272460938,-34.69996643066406]},{"from":-4,"to":-7,"text":"PLC1.IN6 = TRUE","points":[69,-70.0438934326172,69,-34.69996643066406]},{"from":-7,"to":-6,"points":[-31.600067138671875,-33.69996643066406,-31.600067138671875,5.8000335693359375,-31.600067138671875,15.800033569335938]}]},"related":null,"vars":[{"id":"root","label":"参数配置","header":"root","type":"","parentId":"","arraySize":"","initialValue":"","comment":"","children":[]}]}],"vars":[{"id":"root","label":"参数配置","header":"root","type":"","parentId":"","arraySize":"","initialValue":"","comment":"","children":[{"id":"0071f331-413b-44af-b2d6-b6149f8e46f7","label":"Test1","header":"default","type":"DINT","parentId":"root","arraySize":"1","initialValue":"0","comment":"","children":[]}]}]}],"vars":[{"id":"root","label":"参数配置","header":"root","type":"","parentId":"","arraySize":"","initialValue":"","comment":"","children":[{"id":"83380e57-d599-4736-a613-20f8202107e0","label":"Test2","header":"default","type":"BOOL","parentId":"root","arraySize":"1","initialValue":"0","comment":"","children":[]}]}]}]}]},{"id":"45eae55d-71f3-4299-a03d-b54d89172589","label":"设备配置","header":"b","comment":"","children":[{"id":"f9820554-411f-4b7e-99ce-2f0bd811a71b","parentId":"45eae55d-71f3-4299-a03d-b54d89172589","label":"Line1","deviceId":"Line1","header":"b1","comment":"","diagram":{"nodeDataArray":null,"linkDataArray":null},"children":[{"id":"d0c3d270-a5ec-408e-a87d-779e2a0e4be3","parentId":"f9820554-411f-4b7e-99ce-2f0bd811a71b","label":"Workstation1","deviceId":"Workstation1","header":"b2","comment":"","diagram":{"nodeDataArray":null,"linkDataArray":null},"children":[{"id":"dfe92d9a-6af2-4d94-abe0-26f55560255d","parentId":"d0c3d270-a5ec-408e-a87d-779e2a0e4be3","label":"Machine1","deviceId":"Machine1","header":"b3","comment":"","diagram":{"nodeDataArray":null,"linkDataArray":null},"children":[{"id":"7f140932-b8b4-4a48-b0b1-8e6803d9500e","parentId":"dfe92d9a-6af2-4d94-abe0-26f55560255d","label":"PLC1","deviceId":"PLC1","header":"b4","comment":"","interface":{"input_events":null,"output_events":null,"inputs":[{"key":"66b7bc15-1a26-465a-ae61-f79a152fe9ae","text":"IN1","comment":"","type":"BOOL","initVals":"0","max":"","min":"","step":"","arrayLength":"1","relatedEvents":[]},{"key":"0f9565e8-452d-45c5-b08f-043cc5394fe0","text":"IN2","comment":"","type":"BOOL","initVals":"0","max":"","min":"","step":"","arrayLength":"1","relatedEvents":[]},{"key":"922f48bc-0d9f-44d8-8db5-f5f340bbb74c","text":"IN3","comment":"","type":"BOOL","initVals":"0","max":"","min":"","step":"","arrayLength":"1","relatedEvents":[]},{"key":"f8578890-ba6f-4b88-871e-cc31ee9d7947","text":"IN4","comment":"","type":"BOOL","initVals":"0","max":"","min":"","step":"","arrayLength":"1","relatedEvents":[]},{"key":"1d554f91-6d0b-4a17-8394-a494ce1e486f","text":"IN5","comment":"","type":"BOOL","initVals":"0","max":"","min":"","step":"","arrayLength":"1","relatedEvents":[]},{"key":"7b07ed2e-3a32-4794-a7cd-9d1bddeaf74c","text":"IN6","comment":"","type":"BOOL","initVals":"0","max":"","min":"","step":"","arrayLength":"1","relatedEvents":[]}],"outputs":[{"key":"30219962-cfd0-4b34-b532-b947929a255c","text":"OUT1","comment":"","type":"BOOL","initVals":"0","max":"","min":"","step":"","arrayLength":"1","relatedEvents":[]},{"key":"319a0a38-1465-4644-a34c-adf54e44a61f","text":"OUT2","comment":"","type":"BOOL","initVals":"0","max":"","min":"","step":"","arrayLength":"1","relatedEvents":[]},{"key":"5034ca40-a999-4dc8-bc50-6e560e319a3f","text":"OUT3","comment":"","type":"BOOL","initVals":"0","max":"","min":"","step":"","arrayLength":"1","relatedEvents":[]},{"key":"0941a762-b39f-4927-bc88-a5cfd1e96b4c","text":"OUT4","comment":"","type":"BOOL","initVals":"0","max":"","min":"","step":"","arrayLength":"1","relatedEvents":[]}]},"diagram":{"nodeDataArray":null,"linkDataArray":null},"related":[{"text":"PLC1","related":{"applicationKey":"03153507-fac2-4f02-a367-1bc9ab83102e","fbbKey":-15}}],"vars":null}],"vars":null}],"vars":null}]}]}]'
// window.column = '["a"]'

const { column } = window

const sfcTreeMap = JSON.parse(window.sfcTreeMap)
// const view = ref(null)e

const splitterModel = ref(50)
const varSelected = ref(null)
const selected = ref(null)
const selectedRow = ref(null)

provide('varSelected', varSelected)

// const memo1 = []
watch(varSelected, v => {
  if (v) {
    const path = [...selected.value._path.slice(1), selected.value.label].join('.')
    // const exist = memo1.find(e => e === path)
    w.send(`$OrderTreeSelected ${JSON.stringify({ path, var: v.label, _orderId: selectedRow.value._orderId })}`)
    console.log(`$OrderTreeSelected ${JSON.stringify({ path, var: v.label, _orderId: selectedRow.value._orderId })}`)
  }
})

watch(selected, () => {
  varSelected.value = null
})

const rows = ref(
  // Array.from({ length: 25 }, (e, i) => ({
  //   _orderId: `f${i}`, // 订单号
  //   _recipe: 'Battery', // 配方号
  //   _device: '2', // 产线
  //   _status: '生产中', // 状态
  //   _deviceNumber: '123', // 产线数
  //   _extras: {
  //     A: 1
  //   },
  //   _extras2: {
  //     A: 1
  //   }
  // }))
)

// const c = []

const c = JSON.parse(column)

const _ = [
  {
    name: '_orderId',
    label: '订单号',
    field: '_orderId',
    align: 'left'
  },
  {
    name: '_recipe',
    label: '配方',
    field: '_recipe',
    align: 'left'
  },
  {
    name: '_device',
    label: '产线',
    field: '_device',
    align: 'left'
  },
  {
    name: '_deviceNumber',
    label: '产线批次',
    field: '_deviceNumber',
    align: 'left'
  },
  {
    name: '_status',
    label: '状态',
    field: '_status',
    align: 'left'
  },
  {
    name: '_action',
    label: '管理',
    field: '_action',
    align: 'left'
  }
]

const b = (parent, path) => {
  console.log(parent)
  if (parent.children) {
    path = [...path, parent.label]
    parent.children.forEach(e => {
      e._varPath = path
      a(e, path)
    })
  }
}

const a = (parent, path) => {
  if (parent.children) {
    path = [...path, parent.label]
    parent.children.forEach(e => {
      e._path = path
      a(e, path)
      if (e.vars) {
        e.vars.forEach(e => {
          b(e, [])
        })
      }
    })
  }
}

const d = (parent, path) => {
  if (parent.children) {
    path = [...path, parent.deviceId]
    parent.children.forEach(e => {
      e._path = path
      d(e, path)

      const i = get(e, 'interface.inputs')
      const o = get(e, 'interface.outputs')
      if (i) {
        i.forEach(e => {
          e._varPath = path
        })
      }

      if (o) {
        o.forEach(e => {
          e._varPath = path
        })
      }
    })
  }
}

const tree = computed(() => {
  console.log('selectedChanged')
  if (selectedRow.value) {
    const i = sfcTreeMap[0].children.findIndex(e => e.label === selectedRow.value._recipe)
    if (i !== -1) {
      console.log(i)
      const r = [
        { ...sfcTreeMap[0], children: sfcTreeMap[0].children.slice(i, i + 1) },
        sfcTreeMap[1]
      ]
      if (!r) return null
      a(r[0], [])
      d(r[1], [])
      console.log(r)
      return r
    }
  }

  return null
  // const r = sfcTreeMap[view.value]
  // if (!r) return null
  // a(r[0], [])
  // d(r[1], [])
  // console.log(r)
  // return r
})

const view = computed(() => {
  if (selectedRow.value) return selectedRow.value
  return null
})

const deviceOptions = computed(() => {
  if (selected.value) {
    if (selected.value.children) {
      const arr = []
      selected.value.children.forEach(e => {
        arr.push({
          ...e,
          displayLabel: `${e.label}`
        })
      })
      console.log(arr)
      return arr
    } else {
      const arr = []
      const a = tree.value[1]
      a.children.forEach(a2 => {
        a2.children.forEach(a3 => {
          a3.children.forEach(a4 => {
            a4.children.forEach(a5 => {
              arr.push({
                ...a5,
                displayLabel: `${a3.label}.${a4.label}.${a5.label}`
              })
            })
          })
        })
      })
      console.log(arr)
      return arr
    }
  }
  return []
})

const columns = _.concat(c.map(e => ({ label: e, field: e, align: 'left', name: e })))
const visibleColumns = ref(columns.map(e => e.name))
const option = ref('normal')
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 20
})
const onRequest = (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
}

const onInquire = () => {
  console.log(`$Order ${JSON.stringify({ offset: pagination.value.page, rowNumber: pagination.value.rowsPerPage, option: option.value })}`)
  w.send(`$Order ${JSON.stringify({ offset: pagination.value.page, rowNumber: pagination.value.rowsPerPage, option: option.value })}`)
}

const onUpdate = debounce(
  (data) => {
    const { value } = data
    const currentPath = [...selected.value._path.slice(1), selected.value.label, ...varSelected.value._varPath.slice(1), varSelected.value.label].join('.')
    console.log({ path: currentPath, value, _orderId: selectedRow.value._orderId })
    w.send(`$VarUpdate ${JSON.stringify({ path: currentPath, value, _orderId: selectedRow.value._orderId })}`)
    onInquire()
  }, 500
)

const onInterface = (data) => {
  const { row, value } = data
  const currentPath = [...row._varPath.slice(1), selected.value.label, row.text].join('.')
  console.log({ path: currentPath, value })
  w.send(`$DeviceVarUpdate ${JSON.stringify({ path: currentPath, value })}`)
}

const onVar = (path, value) => {
  const currentPath = [...selected.value._path.slice(1), selected.value.label, ...varSelected.value._varPath.slice(1), varSelected.value.label].join('.')
  if (path === currentPath) {
    varSelected.value = {
      ...varSelected.value,
      value
    }
  }
}

const onDeviceVar = (path, value) => {
  const currentPath = [...selected.value._path.slice(1)].join('.')
  console.log(path, value, currentPath)
  if (path.startsWith(currentPath)) {
    const arr = path.split('.')
    const v = arr[arr.length - 1]
    const vs = [...selected.value.interface.inputs, ...selected.value.interface.outputs]
    const r = vs.find(e => e.text === v)
    console.log(r)
    if (r) {
      r.value = value
    }

    selected.value = { ...selected.value }
  }
}
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

const deviceState = ref('')
const recipeState = ref('')

w.onmessage = (evt) => {
  const message = evt.data as string
  const json = JSON.parse(message)
  const r = get(json, '$Order')
  if (r) {
    rows.value = r
    return
  }

  const r2 = get(json, '$OrderState')
  if (r2) {
    r2.forEach(e => {
      onState(e.id, e.status)
    })
  }

  const r3 = get(json, '$RecipeVar')

  if (r3) {
    r3.forEach(e => {
      onVar(e.path, e.value)
    })
  }

  const r4 = get(json, '$DeviceVar')

  if (r4) {
    r4.forEach(e => {
      onDeviceVar(e.path, e.value)
    })
  }

  const r5 = get(json, '$DeviceState')
  if (r5) {
    deviceState.value = r5
  }

  const r6 = get(json, '$RecipeState')
  if (r6) {
    recipeState.value = r6
  }
}

const onRowClick = (evt, row, index) => {
  selected.value = null
  varSelected.value = null
  selectedRow.value = row
}

// setTimeout(() => {
//   recipeState.value = { id: 'Battery.Proc1.UnitProc1', step: [-1, -2], fill: 'red' }
// }, 5000)

const onRecipe = (row) => {
  view.value = row._recipe
}

const onAddOrder = () => {
  Dialog.create({
    component: EditOrderDialog,
    componentProps: {
      row: {}
    }
  })
}

const onState = (_orderId, _status) => {
  rows.value = rows.value.map(e => {
    if (e._orderId === _orderId) {
      e._status = _status
    }
    return e
  })
}

const onAction = (row, k) => {
  if (k === 'delete') {
    Dialog.create({
      title: '确认删除',
      cancel: true,
      persistent: true
    }).onOk(() => {
      w.send(`$OrderAction ${JSON.stringify({ row: omit(cloneDeep(row), '_status'), action: k })}`)
    })
  } else {
    w.send(`$OrderAction ${JSON.stringify({ row: omit(cloneDeep(row), '_status'), action: k })}`)
  }
}

const onEditOrder = (props) => {
  Dialog.create({
    component: EditOrderDialog,
    componentProps: {
      row: props.row
    }
  }).onOk(row => {
    w.send(`$Order ${JSON.stringify({ row: omit(cloneDeep(row), '_status'), action: 'save' })}`)
    // onInquire()
    rows.value[props.rowIndex] = row
  })
}

// const memo2 = []
watch(selected, (v) => {
  if (selected.value) {
    const path = [...v._path, v.label].slice(1).join('.')
    // const exist = memo2.find(e => e === path)
    // if (!exist) {
    if (v.header === 'b4') {
      console.log(`$OrderTreeSelected ${JSON.stringify({ path })}`)
      w.send(`$OrderTreeSelected ${JSON.stringify({ path })}`)
    } else {
      console.log(`$OrderTreeSelected ${JSON.stringify({ path, _orderId: selectedRow.value._orderId })}`)
      w.send(`$OrderTreeSelected ${JSON.stringify({ path, _orderId: selectedRow.value._orderId })}`)
    }
  }
  // memo2.push(path)
  // }
})

const filter = reactive({
  time: '' as any,
  var: '',
  related: ''
})
// const columns = [
//   {
//     label: '工单编号',
//     field: 'order_id',
//     name: 'order_id'
//   },
//   {
//     label: '流水批号',
//     field: 'serial_id',
//     name: 'serial_id'

//   },
//   {
//     label: '物料编码',
//     field: 'fabric_id',
//     name: 'fabric_id'
//   },
//   {
//     label: '产品编码',
//     field: 'product_id',
//     name: 'product_id'
//   },
//   {
//     label: '产品名称',
//     field: 'product_name',
//     name: 'product_name'

//   },
//   {
//     label: '产品型号',
//     field: 'product_version',
//     name: 'product_version'
//   },
//   {
//     label: '计划数量',
//     name: 'plan_number',
//     field: 'plan_number'
//   },
//   {
//     label: '计划开始时间',
//     field: 'plan_starttime',
//     name: 'plan_starttime'
//   },
//   {
//     label: '计划结束时间',
//     field: 'plan_endtime',
//     name: 'plan_endtime'
//   },
//   {
//     label: '产线',
//     name: 'production_line',
//     field: 'production_line'
//   },
//   {
//     label: '车间',
//     name: 'workshop',
//     field: 'workshop'
//   },
//   {
//     label: '配方号',
//     name: 'recipe_id',
//     field: 'recipe_id'
//   },
//   {
//     label: '版本号',
//     name: 'recipe_version',
//     field: 'recipe_version'
//   },
//   {
//     label: '执行顺序',
//     name: 'order',
//     field: 'order'
//   },
//   {
//     label: '状态',
//     name: 'status',
//     field: 'status'
//   },
//   {
//     label: '操作',
//     name: '_action',
//     field: '_action'
//   }
// ]
// const rows = [
//   {
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
<style lang="sass" scoped>
.my-sticky-header-table
  /* height or max-height is important */
  height: calc( 100% - 52px )

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #00b4ff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
