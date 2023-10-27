<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})" class="row items-center justify-center">
    <q-card style="min-width: 320px;">
      <q-card-section>
        用户登录
      </q-card-section>
      <q-card-section>
        <q-input v-model="username" label="用户名"/>
        <q-input v-model="password" label="密码"/>
      </q-card-section>
      <q-card-section>
        <q-btn label="登录" @click="onLogin"/>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import ReconnectingWebSocket from 'reconnecting-websocket'
import axios, { api } from 'src/boot/axios'
import { ref } from 'vue'
const username = ref('')
const password = ref('')

const { ws } = window
let w
const onLogin = () => {
  w.send(`$Login ${JSON.stringify({ username, password })}`)
}

if (ws) {
  w = new ReconnectingWebSocket(`ws://${ws}`)
}

</script>
