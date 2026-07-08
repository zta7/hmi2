<template>
  <q-page
    class="hmi-editor"
    :style-fn="(offset, height) => ({ height: `${height - offset}px` })"
  >
    <q-splitter
      class="fit hmi-splitter"
      @mouseenter="onMouseenter"
      v-model="splitterModel"
      :limits="[0, 100]"
      separator-class="hmi-separator"
    >
      <template v-slot:before>
        <div class="stencil-panel fit column no-wrap">
          <div class="panel-header">
            <span class="panel-title">Components 组件</span>
          </div>
          <div
            id="stencil-container"
            class="col-grow relative-position"
            style="height: 0px"
          ></div>
        </div>
      </template>

      <template v-slot:after>
        <q-splitter
          class="fit hmi-splitter"
          v-model="splitterModel2"
          :limits="[0, 100]"
          separator-class="hmi-separator"
        >
          <template v-slot:before>
            <div
              class="fit col-grow column no-wrap canvas-area"
              style="width: 0px"
            >
              <div
                id="toolbar-container"
                class="toolbar-panel overflow-hidden"
                style="flex: 0 0 auto"
              ></div>
              <div
                id="paper-container"
                class="relative-position col-grow canvas-container"
                style="height: 0px; overflow: hidden"
                tabindex="0"
              ></div>
            </div>
          </template>
          <template v-slot:after>
            <div class="inspector-panel fit column no-wrap">
              <div class="panel-header">
                <span class="panel-title">Properties </span>
              </div>
              <div
                id="inspector-container"
                class="relative-position col-grow fit"
                style="height: 0px"
              ></div>
            </div>
          </template>
        </q-splitter>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
console.log('=== HMI.VUE COMPILED VERSION: 2026-07-08-v2 ===');

import { onMounted, ref } from "vue";
import { Paper } from "src/jointjs/hmi/Paper";
import { set, get } from "lodash";

const splitterModel = ref(14);
const splitterModel2 = ref(82);

window.online = false;

const onMouseenter = () => {
  window.focus();
};

onMounted(() => {
  const el = document.getElementById("paper-container") as HTMLElement;
  const stencilEl = document.getElementById("stencil-container") as HTMLElement;
  const inspectorEl = document.getElementById(
    "inspector-container"
  ) as HTMLElement;
  const toolbarEl = document.getElementById("toolbar-container") as HTMLElement;

  let paper: any;
  window.onmessage = (e) => {
    const target = get(e, "data.target");
    if (target === "hmi") {
      const panel = get(e, "data.data.panel");
      // ---------- 调试日志：打印 HMI2 接收到的 panel cells ----------
      console.log('========== [HMI2 RECEIVE] panel cells ==========');
      const rcells = get(panel, 'graph.cells', []);
      rcells.forEach((cell: any) => {
        if (cell.type && cell.type.endsWith('Link')) {
          console.log(`  [HMI2-IN] LINK id=${cell.id?.slice(-8)}, ${cell.source?.id?.slice(-8) || '?'} → ${cell.target?.id?.slice(-8) || '?'}`);
        } else {
          console.log(
            `  [HMI2-IN] id=${cell.id?.slice(-8)}, type=${cell.type}, isGroup=${cell.isGroup || false}, ` +
            `parent=${cell.parent ? cell.parent.slice(-8) : '-'}, ` +
            `position=(${cell.position?.x}, ${cell.position?.y}), ` +
            `size=(${cell.size?.width}, ${cell.size?.height}), ` +
            `hasAttrsBind=${!!(cell.attrs && cell.attrs.bind)}, ` +
            `bindKeys=${JSON.stringify(Object.keys((cell.attrs && cell.attrs.bind) || {}))}`
          );
        }
      });
      console.log('====================================================');
      // ---------- 调试日志结束 ----------
      if (paper) {
        paper.reset(panel);
      } else {
        paper = new Paper(
          el,
          panel,
          get(e, "data.data.lang"),
          stencilEl,
          inspectorEl,
          toolbarEl
        );
      }
      paper.bindOptions = {
        inputs: get(e, "data.data.inputs"),
        outputs: get(e, "data.data.outputs"),
        outputEvents: get(e, "data.data.outputEvents"),
        windows: get(e, "data.data.windows"),
      };
      console.log(paper.bindOptions);
    } else if (target === "hmi-bind-inputs") {
      set(paper, "bindOptions.inputs", get(e, "data.data"));
    } else if (target === "hmi-bind-outputs") {
      set(paper, "bindOptions.outputs", get(e, "data.data"));
    } else if (target === "hmi-bind-outputEvents") {
      set(paper, "bindOptions.outputEvents", get(e, "data.data"));
    } else if (target === "hmi-windows") {
      console.log(get(e, "data.data"));
      set(paper, "bindOptions.windows", get(e, "data.data"));
    }
  };
});
</script>

<style lang="scss" scoped>
.hmi-editor {
  background: #1a1a2e;
  color: #e0e0e0;
  /* iframe responsive: fill entire viewport */
  width: 100%;
  height: 100%;
  min-height: 0;
}

.stencil-panel,
.inspector-panel {
  background: #1e1e32;
  border: none;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid #2a2a40;
  background: #1e1e32;
  min-height: 32px;
  flex-shrink: 0;
}

.panel-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8888a0;
}

.canvas-area {
  background: #2c2c3a;
}

.canvas-container {
  background: #2c2c3a;
}

.toolbar-panel {
  background: #1e1e32;
  border-bottom: 1px solid #2a2a40;
}
</style>

<style lang="scss">
.hmi-splitter {
  .q-splitter__separator {
    background: #2a2a40;
    width: 1px !important;
  }

  .q-splitter__before,
  .q-splitter__after {
    overflow: hidden;
  }
}

.hmi-separator {
  background: #2a2a40 !important;
  width: 1px !important;
}
</style>
