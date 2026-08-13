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

console.log(view);
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
    //           type: "standard.Image",
    //           position: {
    //             x: 420,
    //             y: 170
    //           },
    //           size: {
    //             width: 480,
    //             height: 50
    //           },
    //           angle: 0,
    //           id: "9d741058-6979-45b8-8b82-83041e50b28c",
    //           z: 2,
    //           attrs: {
    //             image: {
    //               href: "data:image/png;base64,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"
    //             }
    //           }
    //         },
    //         {
    //           type: "app.Light",
    //           position: {
    //             x: 750,
    //             y: 370
    //           },
    //           size: {
    //             width: 50,
    //             height: 50
    //           },
    //           angle: 0,
    //           fills: [],
    //           id: "cb558407-0aa7-4858-ae4a-939f91e89777",
    //           z: 3,
    //           attrs: {
    //             body: {
    //               stroke: "#4a4a6a",
    //               fill: "#e15656"
    //             },
    //             label: {
    //               fontSize: 11,
    //               fill: "#c0c0d0",
    //               text: ""
    //             }
    //           }
    //         }
    //       ]
    //     },
    //     paper: {
    //       background: {
    //         color: "#2c2c3a"
    //       },
    //       width: 1920,
    //       height: 1080
    //     }
    //   }
    // );
    // window.mapping = '[]'
    const { ws, panel, prefix, mapping = "[]" } = window;
    console.log('[ScreenPage] v2 loaded - format conversion enabled');

    if (ws && panel) {
      const parsedPanel = JSON.parse(panel);
      const rectCells = (parsedPanel.graph?.cells || []).filter((c: any) => c.type === 'app.Rectangle');
      console.log('[ScreenPage] Rectangle cells:', rectCells.map((c: any) => ({ id: c.id, format: c.format })));

      const el = document.getElementById("paper-container") as HTMLElement;
      const paper = new Paper(el, parsedPanel) as any;
      // 视口已由 Paper 构造时等比缩放居中（zoomToRect），无需再滚动内容；
      // 若组件超出边框线，scrollToContent 会把视口中心移到内容中心，导致边框线偏移出屏幕
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

        if (["chart.Pie", "chart.Plot", "app.Table", "app.TrendChart"].includes(type)) {
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
          } else if (type === "app.TrendChart") {
            // 追加 + 滚动模式（博图式）：新数据追加到已有 data，按 maxPoints 截断只保留最近 N 点。
            // 变量值可以是 JSON 数组字符串（如 "[1,2,3]"）或单个最新数字（如 "5" / "5.5"）
            if (path === "data") {
              let pts: number[] = [];
              if (isArray(json) && json.every((e) => isNumber(e))) {
                pts = json;
              } else if (isNumber(json)) {
                pts = [json];
              } else if (typeof json === "string" && json.trim() !== "" && !isNaN(Number(json))) {
                pts = [Number(json)];
              }
              if (pts.length) {
                const current = Array.isArray(cell.prop("data")) ? cell.prop("data") : [];
                const maxPts = Number(cell.prop("maxPoints")) || 60;
                cell.prop("data", current.concat(pts).slice(-maxPts));
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
            const strValue = String(value);
            cell.prop("value", strValue === "''" ? "" : strValue);
          } else if (type === "app.TrendChart" && path === "data") {
            // 与 attrs.bind 路径（函数 t）行为一致：追加 + 滚动；支持数组或单个最新数字
            try {
              const json = JSON.parse(String(value));
              let pts: number[] = [];
              if (isArray(json) && json.every((e) => isNumber(e))) {
                pts = json;
              } else if (isNumber(json)) {
                pts = [json];
              } else if (typeof json === "string" && json.trim() !== "" && !isNaN(Number(json))) {
                pts = [Number(json)];
              }
              if (pts.length) {
                const current = Array.isArray(cell.prop("data")) ? cell.prop("data") : [];
                const maxPts = Number(cell.prop("maxPoints")) || 60;
                cell.prop("data", current.concat(pts).slice(-maxPts));
              }
            } catch (err) {
              console.warn("[ScreenPage] TrendChart data 解析失败:", value, err);
            }
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
