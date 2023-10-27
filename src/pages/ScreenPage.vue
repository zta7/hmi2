<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})" class="row items-center">
    <q-scroll-area style="height: 100%;width: 100%">
      <div id="paper-container" class="relative-position fit"></div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Paper } from 'src/jointjs/hmi/Paper'
import { Notify } from 'quasar'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { cloneDeep, get, isArray, isNumber, isObject, isPlainObject, set } from 'lodash'
import * as joint from '@clientio/rappid'
import { filter, find } from 'underscore'

// import { api } from 'src/boot/axios'

// const props = defineProps({
//   name: String,
//   runtime: String
// })

window.online = true
onMounted(() => {
  // window.ws = '192.168.3.236:8080'
  // window.screenName = 'S1'
  // window.prefix = 'Device1.Res1.application1.FB1'
  // window.panel = '{"graph":{"cells":[{"angle":0,"attrs":{},"background":"#ffffff","bind":{"onClick":"CNF"},"id":"7742758d-70d9-4434-98a7-b76c1f85574a","position":{"x":432.5,"y":90},"size":{"height":30,"width":80},"text":"鎸夐挳","type":"app.Button","z":2},{"angle":0,"attrs":{"bind":{"table":"QI"}},"columns":[{"field":"name","label":"濮撳悕"},{"field":"sex","label":"鎬у埆"},{"field":"age","label":"骞撮緞"},{"field":"adress","label":"鍦板潃"},{"field":"number","label":"鐢佃瘽"}],"id":"9b695a3c-6227-47c7-8c0f-ea0ebb341521","position":{"x":132.5,"y":177.5},"rows":[{"label1":"","label2":"","label3":"","label4":"","label5":""},{"label1":"","label2":"","label3":"","label4":"","label5":""},{"label1":"","label2":"","label3":"","label4":"","label5":""},{"label1":"","label2":"","label3":"","label4":"","label5":""},{"label1":"","label2":"","label3":"","label4":"","label5":""},{"label1":"","label2":"","label3":"","label4":"","label5":""}],"size":{"height":240,"width":240},"type":"app.Table","z":4},{"angle":0,"attrs":{"bind":{"attrs.label.text":"QI"},"body":{"fill":"#f6f6f6","stroke":"#222138"},"label":{"text":"1q"}},"fills":[],"id":"6b04e3bd-2d5e-4098-b062-e226cf797f2b","position":{"x":147.5,"y":90},"size":{"height":30,"width":210},"type":"app.Rectangle","z":5}]},"paper":{"background":false,"height":600,"width":800}}'
  // window.mapping = '[]'

  const { ws, panel, prefix, mapping = '[]' } = window

  if (ws && panel) {
    const el = document.getElementById('paper-container') as HTMLElement
    const paper = new Paper(el, JSON.parse(panel)) as any
    const w = new ReconnectingWebSocket(`ws://${ws}`)
    paper.paper.ws = w
    w.onopen = () => {
      Notify.create({
        type: 'positive',
        message: 'Websocket Opened.',
        position: 'top-right'
      })
    }
    w.onclose = () => {
      Notify.create({
        type: 'negative',
        message: 'Websocket Closed.',
        position: 'top-right'
      })
    }

    const t = (cell: joint.dia.Cell, path: string, value: string, trigger: string) => {
      const type = get(cell, 'attributes.type')
      const propPath = path.replace(/\./g, '/')
      const splitedPath = path.split('.')
      const lastAttr = splitedPath[splitedPath.length - 1]
      console.log(cell, value)

      if (['chart.Pie', 'chart.Plot', 'app.Table'].includes(type)) {
        const json = JSON.parse(value as string)
        if (type === 'chart.Pie') {
          if (path === 'series.0.data') {
            if (isArray(json) && json.every(e => isNumber(e))) {
              const copy = cloneDeep(cell.prop(propPath))
              copy.forEach((e: any, i: number) => {
                set(e, 'value', get(json, i) || copy[i].value)
              })
              cell.prop(propPath, copy)
            }
          }
        } else if (type === 'chart.Plot') {
          if (path === 'series.0.data') {
            if (isArray(json) && json.every(e => isPlainObject(e) && isNumber(e.x) && isNumber(e.y))) {
              cell.prop(propPath, json)
            }
          }
        } else if (type === 'app.Table') {
          if (path === 'table') {
            if (isPlainObject(json)) {
              console.log(json.columns, json.rows)
              cell.prop('columns', json.columns)
              cell.prop('rows', json.rows)
            }
          }
        }
      } else {
        const splitedPath = path.split('.')
        const lastAttr = splitedPath[splitedPath.length - 1]
        if (['fill', 'background'].includes(lastAttr)) {
          // console.log('color')
          const _mapping = JSON.parse(mapping)
          // console.log(_mapping, trigger, value.toString())
          const m = find(_mapping, e => e.variableName === trigger && e.triggerValue === value.toString())
          // const triggerValue = get(m, 'triggerValue')
          // const mappingValue = get(m, 'mappingValue', 'red')
          // console.log(triggerValue, value)
          // console.log(m)
          if (m) {
            cell.prop(propPath, m.mappingValue)
          } else {
            cell.prop(propPath, 'transparent')
          }
        } else {
          // console.log(propPath, value)
          cell.prop(propPath, String(value))
        }
      }
    }

    const a = (cell: joint.dia.Cell, path: string, value: string | Array<any>, trigger: string, p: string) => {
      // const type = get(cell, 'attributes.type')
      // const propPath = path.replace(/\./g, '/')
      const isArrayValue = isArray(value)

      // 如果value是Array 并且trigger split后长度是2

      // console.log(cell, path, value, trigger)

      // console.log(path, value, trigger, p)

      if (isArrayValue) {
        const matched = trigger.match(/\.(\d+)/)
        // console.log(trigger, matched, value)
        if (matched) {
          if (p === `${prefix}.${trigger.split(/\.\d+/)[0]}`) {
            const index = matched[1]
            const v = get(value, index)
            if (v !== undefined) {
              t(cell, path, v, trigger)
            }
          }
        }
      } else {
        if (p === `${prefix}.${trigger}`) {
          t(cell, path, value, trigger)
        }
      }
    }

    w.onmessage = (evt) => {
      const message = evt.data as string
      console.log(message)
      const json = JSON.parse(message)

      const cells = paper.graph.getCells()

      // console.log(message)
      for (const [path, value] of Object.entries(json)) {
        // console.log(path, value)
        cells.forEach((cell: joint.dia.Cell) => {
          const bind = get(cell, 'attributes.attrs.bind', {})
          // const isArrayValue = isArray(value)

          for (const [k, v] of Object.entries(bind)) {
            // console.log(path, `${prefix}.${v}`)
            // get(v.split(/\[\d+\]/), '[0]')
            a(cell, k, value as any, v, path)

            // if (isArrayValue) {
            //   const _ = v.split(/\[\d+\]/)
            // } else {
            //   // 这里都应该是字符串
            //   if (path === `${prefix}.${v}`) {
            //   // console.log(path, `${prefix}.${v}`)
            //     a(cell, k, value, v)
            //   // const json2 = JSON.parse(value as string)
            //   // console.log(json2)
            //   // cell.prop(k.replace(/\./g, '/'), json2)
            //   }
            // }
          }
        })
      }

      // const data = message.data
      // const arr = data.split(',')
      // console.log(message)
      // arr.forEach((e: any) => {
      //   // eslint-disable-next-line no-unused-vars
      //   const [path, value] = e.split(' ')
      //   const cells = paper.graph.getCells()
      //   console.log(path, value)
      //   cells.forEach((cell:any) => {
      //     const bind = get(cell, 'attributes.attrs.bind', {})
      //     for (const [k, v] of Object.entries(bind)) {
      //       if (path === `${prefix}.${v}`) {
      //         // console.log(k)
      //         // cell.prop(k.replace(/\./g, '/'), value)
      //       }
      //     }
      //   })
      // })
    }
  }
  // api.post(props.runtime as string, { name: props.name })
  //   .then(e => {
  //     const { ws, panel } = e.data
  //     if (ws && panel) {
  //       const el = document.getElementById('paper-container') as HTMLElement
  //       const paper = new Paper(el, panel)
  //       const w = new ReconnectingWebSocket(`ws://${ws}`)
  //       w.onopen = () => {
  //         Notify.create({
  //           type: 'positive',
  //           message: 'Websocket Opened.',
  //           position: 'top-right'
  //         })
  //       }
  //       w.onclose = () => {
  //         Notify.create({
  //           type: 'negative',
  //           message: 'Websocket Closed.',
  //           position: 'top-right'
  //         })
  //       }

  //       w.onmessage = (message) => {
  //         console.log(message)
  //       }
  //     }
  //   })
  //   .catch(() => {
  //     console.log('访问runtime失败')
  //   })
})

</script>
<style lang="scss" scoped>

</style>
