<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})" class="row items-center justify-center">
    <div style="width: 90%;height: 90%" class="row q-gutter-md content-start">
      <div class="full-width text-h6 q-pl-md">HMI监控界面</div>
      <a v-for="(e, i) in data" :key="i" :href="e.href">
        <q-card>
          <q-card-section>
            <q-icon name="monitor" size="80px"/>
          </q-card-section>
          <q-card-section class="text-center q-pt-none">
            {{  e.name  }}
          </q-card-section>
        </q-card>
      </a>
    </div>
  </q-page>
</template>

<script setup>
import axios, { api } from 'src/boot/axios'
import { ref } from 'vue'

// const data = [
//   { name: '1111', href: 'http://www.google.com' },
//   { name: '1111', href: '111' },
//   { name: '1111', href: '111' },
//   { name: '1111', href: '111' },
//   { name: '1111', href: '111' },
//   { name: '1111', href: '111' },
//   { name: '1111', href: '111' },
//   { name: '1111', href: '111' },
//   { name: '1111', href: '111' },
//   { name: '1111', href: '111' },
//   { name: '1111', href: '111' },
//   { name: '1111', href: '111' }
// ]

const { data } = window

</script>

<style scoped>
a{
text-decoration:none;
color:#333;
}
</style>
