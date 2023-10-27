<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})">
    <div class="fit row no-wrap no-scroll" @mouseenter="onMouseenter">
      <div id="stencil-container" class="relative-position" style="width: 210px; flex: 0 0 auto"></div>
      <div class="col-grow column no-wrap" style="width: 0px">
        <div id="toolbar-container" class="overflow-hidden" style="flex: 0 0 auto"></div>
        <div id="paper-container" class="scroll relative-position col-grow" style="height: 0px" tabindex="0"></div>
      </div>
      <div style="flex: 0 0 auto;width: 320px;" class="column no-wrap border-left">
        <div id="inspector-container" class="relative-position col-grow" style="height: 0px"></div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { App } from 'src/jointjs/ecc/app'
import * as joint from '@clientio/rappid'
import { set } from 'lodash'
import { getSelectionHandles, HANDLES, getSelectionConfig } from 'src/jointjs/ecc/selection'

window.online = false

const onMouseenter = () => {
  window.focus()
}

onMounted(() => {
  const el = document.getElementById('paper-container') as HTMLElement
  const panel = ''
  const stencilEl = document.getElementById('stencil-container') as HTMLElement
  const inspectorEl = document.getElementById('inspector-container') as HTMLElement
  const toolbarEl = document.getElementById('toolbar-container') as HTMLElement

  const app = new App({
    el: document.getElementById('paper-container') as HTMLElement,
    panel: '',
    stencilEl: document.getElementById('stencil-container') as HTMLElement,
    inspectorEl: document.getElementById('inspector-container') as HTMLElement,
    toolbarEl: document.getElementById('toolbar-container') as HTMLElement
  })

  set(app, 'paper.meta', {
    resourceOptions: [
      { content: '', value: '' },
      { content: 'a', value: '1' },
      { content: 'b', value: '2' },
      { content: 'c', value: '3' },
      { content: 'd', value: '4' },
      { content: 'e', value: '5' },
      { content: 'f', value: '6' }
    ],
    varTypeOptions: [
      { content: 'String', value: 'String' },
      { content: 'Boolean', value: 'Boolean' }
    ]
  })

  const shapes = joint.shapes as any
  // joint.shapes.standard
  const r1 = new shapes.app.TextBlock({
    position: { x: 50, y: 50 },
    size: { width: 100, height: 100 },
    attrs: {
      label: {
        text: '文本',
        fontSize: 14
      },
      body: {
        fill: '#ffffff',
        strokeWidth: 0
      }

    }
  })
  const r2 = new shapes.app.Rectangle({
    position: { x: 300, y: 50 }
  })

  app.graph.addCell([r1, r2])
})
</script>
