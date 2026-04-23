<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})">
    <q-splitter class="fit" @mouseenter="onMouseenter" v-model="splitterModel" :limits="[0, 100]">
      <template v-slot:before>
        <div id="stencil-container" class="relative-position fit" ></div>
      </template>

      <template v-slot:after>
        <q-splitter class="fit" v-model="splitterModel2" :limits="[0, 100]">
          <template v-slot:before>
            <div class="fit col-grow column no-wrap" style="width: 0px">
              <div id="toolbar-container" class="overflow-hidden" style="flex: 0 0 auto"></div>
              <div id="paper-container" class="scroll relative-position col-grow" style="height: 0px" tabindex="0"></div>
            </div>
          </template>
          <template v-slot:after>
            <div class="fit column no-wrap">
              <div id="inspector-container" class="relative-position col-grow fit" style="height: 0px">
            </div>
          </div>
          </template>
        </q-splitter>
      </template>

    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Paper } from 'src/jointjs/hmi/Paper'
import { set, get } from 'lodash'

const splitterModel = ref(12) // start at 50%
const splitterModel2 = ref(80) // start at 50%

window.online = false

const onMouseenter = () => {
  window.focus()
}

onMounted(() => {
  const el = document.getElementById('paper-container') as HTMLElement
  const stencilEl = document.getElementById('stencil-container') as HTMLElement
  const inspectorEl = document.getElementById('inspector-container') as HTMLElement
  const toolbarEl = document.getElementById('toolbar-container') as HTMLElement

  // const paper = new Paper(el, '', 'zh-hans', stencilEl, inspectorEl, toolbarEl)

  let paper:any
  window.onmessage = e => {
    const target = get(e, 'data.target')
    if (target === 'hmi') {
      const panel = get(e, 'data.data.panel')
      if (paper) {
        paper.reset(panel)
      } else paper = new Paper(el, panel, get(e, 'data.data.lang'), stencilEl, inspectorEl, toolbarEl)
      paper.bindOptions = {
        inputs: get(e, 'data.data.inputs'),
        outputs: get(e, 'data.data.outputs'),
        outputEvents: get(e, 'data.data.outputEvents'),
        windows: get(e, 'data.data.windows')
      }
      console.log(paper.bindOptions)
    } else if (target === 'hmi-bind-inputs') {
      set(paper, 'bindOptions.inputs', get(e, 'data.data'))
    } else if (target === 'hmi-bind-outputs') {
      set(paper, 'bindOptions.outputs', get(e, 'data.data'))
    } else if (target === 'hmi-bind-outputEvents') {
      set(paper, 'bindOptions.outputEvents', get(e, 'data.data'))
    } else if (target === 'hmi-windows') {
      console.log(get(e, 'data.data'))
      set(paper, 'bindOptions.windows', get(e, 'data.data'))
    }
  }
})
</script>
