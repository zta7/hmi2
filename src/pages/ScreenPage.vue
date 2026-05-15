<template>
  <q-page :style-fn="(offset, height) => ({ height: `${height - offset}px` })" class="row items-center">
    <iframe v-if="view === 'html'" id="iframe" width="100%" height="100%" frameborder="0"></iframe>
    <div v-else id="paper-container" class="relative-position fit"></div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Paper } from "src/jointjs/hmi/Paper";
import { Notify } from "quasar";
import ReconnectingWebSocket from "reconnecting-websocket";
import {
  cloneDeep,
  get,
  isArray,
  isNumber,
  isObject,
  isPlainObject,
  set,
} from "lodash";
import * as joint from "@clientio/rappid";
import { filter, find } from "underscore";

// const props = defineProps({
//   name: String,
//   runtime: String
// })

window.online = true;
const view = window.view;
onMounted(() => {
  console.log(view);
  if (view === "html") {
    // window.html = '<html><body><div>12314</div><div>12314</div><div>12314</div></body></html>'
    const { ws, prefix, mapping = "[]", html } = window;
    console.log(html);

    const iframe = document.getElementById("iframe");
    iframe.contentWindow.ws = ws;
    iframe.contentWindow.prefix = prefix;
    iframe.contentWindow.mapping = mapping;

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();
  } else {
    // window.ws = '192.168.3.192:9528'
    // window.screenName = 'vff'
    // window.prefix = 'PLC.实时.主程序.sss'
    // window.panel = JSON.stringify(
    //   {
    //     graph: {
    //       cells: [
    //         {
    //           angle: 0,
    //           attrs: {},
    //           id: "c68e2fc6-088c-492a-b624-8916da74e7f4",
    //           on: true,
    //           position: {
    //             x: 450,
    //             y: 230
    //           },
    //           size: {
    //             height: 32,
    //             width: 32
    //           },
    //           type: "app.Switch",
    //           z: 2
    //         },
    //         {
    //           angle: 0,
    //           attrs: {},
    //           bind: {
    //             event: "INITO",
    //             onChange: "QO"
    //           },
    //           color: "black",
    //           fontSize: 14,
    //           id: "af2145cc-5cfc-44e1-9b7b-d436caa766d0",
    //           position: {
    //             x: 130,
    //             y: 262
    //           },
    //           size: {
    //             height: 30,
    //             width: 90
    //           },
    //           type: "app.Input",
    //           value: "",
    //           z: 4
    //         },
    //         {
    //           angle: 0,
    //           attrs: {
    //             body: {
    //               fill: "#2a2a3e",
    //               stroke: "#555577"
    //             },
    //             label: {
    //               fill: "#e0e0e0",
    //               text: "123"
    //             }
    //           },
    //           fills: [],
    //           format: "hex",
    //           id: "9b5be2ef-7453-4fdc-a6ef-125e227ef45b",
    //           position: {
    //             x: 70,
    //             y: 110
    //           },
    //           size: {
    //             height: 30,
    //             width: 90
    //           },
    //           type: "app.Rectangle",
    //           z: 5
    //         }
    //       ]
    //     },
    //     paper: {
    //       background: false,
    //       height: 600,
    //       width: 800
    //     }
    //   }
    // )
    // window.mapping = '[]'
    const { ws, panel, prefix, mapping = "[]" } = window;
    console.log('[ScreenPage] v2 loaded - format conversion enabled');

    if (ws && panel) {
      const parsedPanel = JSON.parse(panel);
      const rectCells = (parsedPanel.graph?.cells || []).filter((c: any) => c.type === 'app.Rectangle');
      console.log('[ScreenPage] Rectangle cells:', rectCells.map((c: any) => ({ id: c.id, format: c.format })));

      const el = document.getElementById("paper-container") as HTMLElement;
      const paper = new Paper(el, parsedPanel) as any;
      const w = new ReconnectingWebSocket(`ws://${ws}`);
      paper.paper.ws = w;
      w.onopen = () => {
        w.send(`$initData ${window.screenName}`);
        Notify.create({
          type: "positive",
          message: "Websocket Opened.",
          position: "top-right",
        });
      };
      w.onclose = () => {
        Notify.create({
          type: "negative",
          message: "Websocket Closed.",
          position: "top-right",
        });
      };

      const t = (
        cell: joint.dia.Cell,
        path: string,
        value: string,
        trigger: string
      ) => {
        const type = get(cell, "attributes.type");
        const propPath = path.replace(/\./g, "/");
        const splitedPath = path.split(".");
        const lastAttr = splitedPath[splitedPath.length - 1];

        if (["chart.Pie", "chart.Plot", "app.Table"].includes(type)) {
          const json = JSON.parse(value as string);
          if (type === "chart.Pie") {
            if (path === "series.0.data") {
              if (isArray(json) && json.every((e) => isNumber(e))) {
                const copy = cloneDeep(cell.prop(propPath));
                copy.forEach((e: any, i: number) => {
                  set(e, "value", get(json, i) || copy[i].value);
                });
                cell.prop(propPath, copy);
              }
            }
          } else if (type === "chart.Plot") {
            if (path === "series.0.data") {
              if (
                isArray(json) &&
                json.every(
                  (e) => isPlainObject(e) && isNumber(e.x) && isNumber(e.y)
                )
              ) {
                cell.prop(propPath, json);
              }
            }
          } else if (type === "app.Table") {
            if (path === "table") {
              if (isPlainObject(json)) {
                cell.prop("columns", json.columns);
                cell.prop("rows", json.rows);
              }
            }
          }
        } else {
          console.log(1);
          const splitedPath = path.split(".");
          const lastAttr = splitedPath[splitedPath.length - 1];
          if (["fill", "background"].includes(lastAttr)) {
            // console.log('color')
            const _mapping = JSON.parse(mapping);
            // console.log(_mapping, trigger, value.toString())
            const m = find(
              _mapping,
              (e) =>
                e.variableName === trigger &&
                e.triggerValue === value.toString()
            );
            // const triggerValue = get(m, 'triggerValue')
            // const mappingValue = get(m, 'mappingValue', 'red')
            // console.log(triggerValue, value)
            // console.log(m)
            if (m) {
              cell.prop(propPath, m.mappingValue);
            } else {
              cell.prop(propPath, "transparent");
            }
          } else {
            let displayValue = String(value);
            // 对 app.Rectangle 的文本属性应用进制格式转换
            if (type === 'app.Rectangle' && propPath === 'attrs/label/text') {
              const format = cell.get('format') || 'dec';
              const num = parseInt(displayValue, 10);
              if (!isNaN(num) && num.toString() === displayValue.trim()) {
                if (format === 'bin') displayValue = num.toString(2);
                if (format === 'hex') displayValue = '0x' + num.toString(16).toUpperCase();
              }
              console.log('[ScreenPage] Rectangle format:', { raw: String(value), format, result: displayValue });
            }
            console.log(propPath, displayValue);
            cell.prop(propPath, displayValue);
          }
        }
      };

      const a = (
        cell: joint.dia.Cell,
        path: string,
        value: string | Array<any>,
        trigger: string,
        p: string
      ) => {
        const isArrayValue = isArray(value);

        if (isArrayValue) {
          const matched = trigger.match(/\.(\d+)/);
          // console.log(trigger, matched, value)
          if (matched) {
            if (p === `${prefix}.${trigger.split(/\.\d+/)[0]}`) {
              const index = matched[1];
              const v = get(value, index);
              if (v !== undefined) {
                t(cell, path, v, trigger);
              }
            }
          }
        } else {
          if (p === `${prefix}.${trigger}`) {
            t(cell, path, value, trigger);
          }
        }
      };

      const b = (
        cell: joint.dia.Cell,
        path: string,
        value: string | Array<any>,
        trigger: string,
        p: string
      ) => {
        if (p === `${prefix}.${trigger}`) {
          const type = get(cell, "attributes.type");
          if (["app.Input", "app.Select"].includes(type)) {
            cell.prop("value", String(value));
          }
        }
      };

      w.onmessage = (evt) => {
        const message = evt.data as string;
        const json = JSON.parse(message);
        const cells = paper.graph.getCells();

        console.log(json);
        for (const [path, value] of Object.entries(json)) {
          cells.forEach((cell: joint.dia.Cell) => {
            const bind = get(cell, "attributes.attrs.bind", {});
            for (const [k, v] of Object.entries(bind)) {
              a(cell, k, value as any, v, path);
              if (isArray(value)) {
                value.forEach((e, i) => {
                  a(cell, k, e as any, v, `${path}[${i}]`);
                });
              }
            }
            const bind2 = get(cell, "attributes.bind", {});
            for (const [k, v] of Object.entries(bind2)) {
              b(cell, k, value as any, v, path);
              if (isArray(value)) {
                value.forEach((e, i) => {
                  b(cell, k, e as any, v, `${path}[${i}]`);
                });
              }
            }
          });
        }
      };
    }
  }
});
</script>
<style lang="scss">
button {
  cursor: pointer;
}

// button:hover {background-color: #3e8e41}

button:active {
  background-color: #90ee90;
  box-shadow: 0 5px #666;
  transform: translateY(2px);
}
</style>
