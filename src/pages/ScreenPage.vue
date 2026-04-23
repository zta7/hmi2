<template>
  <q-page :style-fn="(offset,height) => ({height: `${height-offset}px`})" class="row items-center">
    <iframe v-if="view==='html'" id='iframe' width='100%' height='100%' frameborder='0'></iframe>
    <div v-else id="paper-container" class="relative-position fit"></div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Paper } from 'src/jointjs/hmi/Paper'
import { Notify } from 'quasar'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { cloneDeep, get, isArray, isNumber, isObject, isPlainObject, set } from 'lodash'
import * as joint from '@clientio/rappid'
import { filter, find } from 'underscore'

// const props = defineProps({
//   name: String,
//   runtime: String
// })

window.online = true
const view = window.view
onMounted(() => {
  if (view === 'html') {
    // window.html = '<html><body><div>12314</div><div>12314</div><div>12314</div></body></html>'
    const { ws, prefix, mapping = '[]', html } = window
    const iframe = document.getElementById('iframe')
    iframe.contentWindow.ws = ws
    iframe.contentWindow.prefix = prefix
    iframe.contentWindow.mapping = mapping

    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(html)
    iframe.contentWindow.document.close()
  } else {
    // window.ws = '192.168.3.10:8080'
    // window.screenName = 'S1'
    // window.prefix = 'Device1.Res1.application1.FB1'
    // window.panel = JSON.stringify({
    //   graph: {
    //     cells: [{
    //       position: {
    //         x: 0,
    //         y: 75
    //       },
    //       size: {
    //         width: 160,
    //         height: 300
    //       },
    //       angle: 0,
    //       type: 'app.LiquidTank',
    //       level: 20,
    //       id: '3f0b77d8-af9a-4501-a5f5-f5d54b0f221a',
    //       z: 1,
    //       attrs: {
    //         label: {
    //           text: 'LiquidTank'
    //         },
    //         bind: {
    //           power: 'QIL1'
    //         }
    //       }
    //     },
    //     {
    //       position: {
    //         x: 817.5,
    //         y: 405
    //       },
    //       size: {
    //         width: 160,
    //         height: 300
    //       },
    //       angle: 0,
    //       type: 'app.LiquidTank',
    //       level: 12,
    //       id: '2d942d45-472e-4dc1-95cb-47a9d1bda489',
    //       z: 2,
    //       attrs: {
    //         label: {
    //           text: 'LiquidTank'
    //         },
    //         bind: {
    //           power: 'QIL2'
    //         }
    //       }
    //     },
    //     {
    //       position: {
    //         x: -892.5,
    //         y: 105
    //       },
    //       size: {
    //         width: 40,
    //         height: 35
    //       },
    //       angle: 0,
    //       type: 'app.ControlValve',
    //       open: 1,
    //       ports: {
    //         groups: {
    //           pipes: {
    //             position: {
    //               name: 'absolute',
    //               args: {
    //                 x: 'calc(w / 2)',
    //                 y: 'calc(h / 2)'
    //               }
    //             },
    //             markup: [{
    //               namespaceURI: 'http://www.w3.org/2000/svg',
    //               tagName: 'rect',
    //               style: {},
    //               selector: 'pipeBody'
    //             },
    //             {
    //               namespaceURI: 'http://www.w3.org/2000/svg',
    //               tagName: 'rect',
    //               style: {},
    //               selector: 'pipeEnd'
    //             }
    //             ],
    //             size: {
    //               width: 50,
    //               height: 30
    //             },
    //             attrs: {
    //               pipeBody: {
    //                 width: 'calc(w)',
    //                 height: 'calc(h)',
    //                 y: 'calc(h / -2)',
    //                 fill: {
    //                   type: 'linearGradient',
    //                   stops: [{
    //                     offset: '0%',
    //                     color: 'gray'
    //                   },
    //                   {
    //                     offset: '30%',
    //                     color: 'white'
    //                   },
    //                   {
    //                     offset: '70%',
    //                     color: 'white'
    //                   },
    //                   {
    //                     offset: '100%',
    //                     color: 'gray'
    //                   }
    //                   ],
    //                   attrs: {
    //                     x1: '0%',
    //                     y1: '0%',
    //                     x2: '0%',
    //                     y2: '100%'
    //                   }
    //                 }
    //               },
    //               pipeEnd: {
    //                 magnet: true,
    //                 width: 10,
    //                 height: 'calc(h+6)',
    //                 y: 'calc(h / -2 - 3)',
    //                 stroke: 'gray',
    //                 strokeWidth: 3,
    //                 fill: 'white'
    //               }
    //             }
    //           }
    //         },
    //         items: [{
    //           group: 'pipes',
    //           z: 0,
    //           attrs: {
    //             pipeBody: {
    //               x: 'calc(-1 * w)'
    //             },
    //             pipeEnd: {
    //               x: 'calc(-1 * w)'
    //             }
    //           },
    //           id: '6eb9eb83-62ce-486a-afbf-0d9228efb2c7'
    //         },
    //         {
    //           group: 'pipes',
    //           z: 0,
    //           attrs: {
    //             pipeEnd: {
    //               x: 'calc(w - 10)'
    //             }
    //           },
    //           id: '462e46e8-f5e2-4161-ab89-3a09d990b58b'
    //         }
    //         ]
    //       },
    //       id: '4bcdaac2-51ae-4b0f-b999-89502cc34234',
    //       z: 3,
    //       attrs: {
    //         label: {
    //           text: 'CTRL Valve 1'
    //         },
    //         bind: {
    //           power: 'QIR1'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.Pipe',
    //       source: {
    //         x: -980,
    //         y: 165
    //       },
    //       target: {
    //         id: '4bcdaac2-51ae-4b0f-b999-89502cc34234',
    //         magnet: 'pipeEnd',
    //         port: '6eb9eb83-62ce-486a-afbf-0d9228efb2c7'
    //       },
    //       z: 4,
    //       router: {
    //         name: 'rightAngle'
    //       },
    //       flow: 1,
    //       id: '4124d1b8-4b91-489a-b8cd-9d76fb4e6535',
    //       vertices: [{
    //         x: -955,
    //         y: 165
    //       }],
    //       attrs: {}
    //     },
    //     {
    //       type: 'app.Pipe',
    //       source: {
    //         id: '4bcdaac2-51ae-4b0f-b999-89502cc34234',
    //         magnet: 'pipeEnd',
    //         port: '462e46e8-f5e2-4161-ab89-3a09d990b58b'
    //       },
    //       target: {
    //         x: -770,
    //         y: 140
    //       },
    //       z: 5,
    //       router: {
    //         name: 'rightAngle'
    //       },
    //       flow: 1,
    //       id: '365061e5-5a17-442b-8b15-47f9be6ec46f',
    //       attrs: {}
    //     },
    //     {
    //       type: 'app.Pipe',
    //       source: {
    //         x: -595,
    //         y: 325
    //       },
    //       target: {
    //         id: '37159cc5-edd2-4152-86cd-90d48f8084ec',
    //         magnet: 'pipeEnd',
    //         port: 'left'
    //       },
    //       z: 6,
    //       router: {
    //         name: 'rightAngle'
    //       },
    //       flow: 1,
    //       id: '40c9ba01-baf3-45ad-8c65-fab2b82b6261',
    //       attrs: {}
    //     },
    //     {
    //       position: {
    //         x: 560,
    //         y: 385
    //       },
    //       size: {
    //         width: 50,
    //         height: 50
    //       },
    //       angle: 0,
    //       type: 'app.HandValve',
    //       power: 0,
    //       ports: {
    //         groups: {
    //           pipes: {
    //             position: {
    //               name: 'absolute',
    //               args: {
    //                 x: 'calc(w / 2)',
    //                 y: 'calc(h / 2)'
    //               }
    //             },
    //             markup: [{
    //               namespaceURI: 'http://www.w3.org/2000/svg',
    //               tagName: 'rect',
    //               style: {},
    //               selector: 'pipeBody'
    //             },
    //             {
    //               namespaceURI: 'http://www.w3.org/2000/svg',
    //               tagName: 'rect',
    //               style: {},
    //               selector: 'pipeEnd'
    //             }
    //             ],
    //             size: {
    //               width: 50,
    //               height: 30
    //             },
    //             attrs: {
    //               pipeBody: {
    //                 width: 'calc(w)',
    //                 height: 'calc(h)',
    //                 y: 'calc(h / -2)',
    //                 fill: {
    //                   type: 'linearGradient',
    //                   stops: [{
    //                     offset: '0%',
    //                     color: 'gray'
    //                   },
    //                   {
    //                     offset: '30%',
    //                     color: 'white'
    //                   },
    //                   {
    //                     offset: '70%',
    //                     color: 'white'
    //                   },
    //                   {
    //                     offset: '100%',
    //                     color: 'gray'
    //                   }
    //                   ],
    //                   attrs: {
    //                     x1: '0%',
    //                     y1: '0%',
    //                     x2: '0%',
    //                     y2: '100%'
    //                   }
    //                 }
    //               },
    //               pipeEnd: {
    //                 magnet: true,
    //                 width: 10,
    //                 height: 'calc(h+6)',
    //                 y: 'calc(h / -2 - 3)',
    //                 stroke: 'gray',
    //                 strokeWidth: 3,
    //                 fill: 'white'
    //               }
    //             }
    //           }
    //         },
    //         items: [{
    //           id: 'left',
    //           group: 'pipes',
    //           z: 0,
    //           attrs: {
    //             pipeBody: {
    //               x: 'calc(-1 * w)'
    //             },
    //             pipeEnd: {
    //               x: 'calc(-1 * w)'
    //             }
    //           }
    //         },
    //         {
    //           id: 'right',
    //           group: 'pipes',
    //           z: 0,
    //           attrs: {
    //             pipeEnd: {
    //               x: 'calc(w - 10)'
    //             }
    //           }
    //         }
    //         ]
    //       },
    //       id: '37159cc5-edd2-4152-86cd-90d48f8084ec',
    //       z: 7,
    //       attrs: {
    //         label: {
    //           text: 'HandValue'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.Pipe',
    //       source: {
    //         id: '37159cc5-edd2-4152-86cd-90d48f8084ec',
    //         magnet: 'pipeEnd',
    //         port: 'right'
    //       },
    //       target: {
    //         x: 815,
    //         y: 430
    //       },
    //       z: 8,
    //       router: {
    //         name: 'rightAngle'
    //       },
    //       flow: 1,
    //       id: '4f093511-4f15-4983-917f-89592f17aaba',
    //       attrs: {}
    //     },
    //     {
    //       type: 'app.Pipe',
    //       source: {
    //         x: 965,
    //         y: 665
    //       },
    //       target: {
    //         x: 1040,
    //         y: 710
    //       },
    //       z: 9,
    //       router: {
    //         name: 'rightAngle'
    //       },
    //       flow: 1,
    //       id: '64f942a4-eb99-4cd5-b3d8-abc4acc792f7',
    //       attrs: {}
    //     },
    //     {
    //       position: {
    //         x: 1080,
    //         y: 705
    //       },
    //       size: {
    //         width: 15,
    //         height: 10
    //       },
    //       angle: 0,
    //       type: 'app.HandValve',
    //       power: 0,
    //       ports: {
    //         groups: {
    //           pipes: {
    //             position: {
    //               name: 'absolute',
    //               args: {
    //                 x: 'calc(w / 2)',
    //                 y: 'calc(h / 2)'
    //               }
    //             },
    //             markup: [{
    //               namespaceURI: 'http://www.w3.org/2000/svg',
    //               tagName: 'rect',
    //               style: {},
    //               selector: 'pipeBody'
    //             },
    //             {
    //               namespaceURI: 'http://www.w3.org/2000/svg',
    //               tagName: 'rect',
    //               style: {},
    //               selector: 'pipeEnd'
    //             }
    //             ],
    //             size: {
    //               width: 50,
    //               height: 30
    //             },
    //             attrs: {
    //               pipeBody: {
    //                 width: 'calc(w)',
    //                 height: 'calc(h)',
    //                 y: 'calc(h / -2)',
    //                 fill: {
    //                   type: 'linearGradient',
    //                   stops: [{
    //                     offset: '0%',
    //                     color: 'gray'
    //                   },
    //                   {
    //                     offset: '30%',
    //                     color: 'white'
    //                   },
    //                   {
    //                     offset: '70%',
    //                     color: 'white'
    //                   },
    //                   {
    //                     offset: '100%',
    //                     color: 'gray'
    //                   }
    //                   ],
    //                   attrs: {
    //                     x1: '0%',
    //                     y1: '0%',
    //                     x2: '0%',
    //                     y2: '100%'
    //                   }
    //                 }
    //               },
    //               pipeEnd: {
    //                 magnet: true,
    //                 width: 10,
    //                 height: 'calc(h+6)',
    //                 y: 'calc(h / -2 - 3)',
    //                 stroke: 'gray',
    //                 strokeWidth: 3,
    //                 fill: 'white'
    //               }
    //             }
    //           }
    //         },
    //         items: [{
    //           id: 'left',
    //           group: 'pipes',
    //           z: 0,
    //           attrs: {
    //             pipeBody: {
    //               x: 'calc(-1 * w)'
    //             },
    //             pipeEnd: {
    //               x: 'calc(-1 * w)'
    //             }
    //           }
    //         },
    //         {
    //           id: 'right',
    //           group: 'pipes',
    //           z: 0,
    //           attrs: {
    //             pipeEnd: {
    //               x: 'calc(w - 10)'
    //             }
    //           }
    //         }
    //         ]
    //       },
    //       id: 'b1563a65-9b38-4e6b-a2fa-77cd72302f55',
    //       z: 10,
    //       attrs: {
    //         label: {
    //           text: 'HandValue'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.Pipe',
    //       source: {
    //         id: 'b1563a65-9b38-4e6b-a2fa-77cd72302f55',
    //         magnet: 'pipeEnd',
    //         port: 'right'
    //       },
    //       target: {
    //         x: 1175,
    //         y: 760
    //       },
    //       z: 11,
    //       router: {
    //         name: 'rightAngle'
    //       },
    //       flow: 1,
    //       id: '01a236ad-f727-4cbe-8380-15dcfa1663e7',
    //       attrs: {}
    //     },
    //     {
    //       type: 'app.Rectangle',
    //       position: {
    //         x: -922.5,
    //         y: 187.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       fills: [],
    //       id: 'cb9f6954-317e-4cde-a2dc-8ecae2491d4c',
    //       z: 17,
    //       attrs: {
    //         body: {
    //           stroke: '#222138',
    //           fill: '#f6f6f6'
    //         },
    //         label: {
    //           text: ''
    //         },
    //         bind: {
    //           'attrs.body.fill': 'QIR1',
    //           'attrs.label.text': ''
    //         }
    //       }
    //     },
    //     {
    //       position: {
    //         x: 460,
    //         y: 627.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Input',
    //       value: '',
    //       color: 'black',
    //       fontSize: 14,
    //       id: '9d6a5c69-bef1-4d9c-a007-94f9ea4a4064',
    //       z: 21,
    //       attrs: {}
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 460,
    //         y: 667.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '1f1975e4-7ad5-453a-b2a2-f4b8fb06f708',
    //       z: 30,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '下位水箱液位设定高度'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 265,
    //         y: 800
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '8c53cd5e-f59b-4a69-b101-92ba4dc1bdbf',
    //       z: 31,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '上位水箱初始液位高度'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 460,
    //         y: 800
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '6c284d94-0a39-4e9a-afe2-5b2c8fd6cccd',
    //       z: 33,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '下位水箱初始液位高度'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 665,
    //         y: 657.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '3ce7a0e3-9c05-4c0b-8536-5765db905c4d',
    //       z: 34,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: 'P'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 665,
    //         y: 800
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '069e44dc-870d-492e-9902-7029c7d9caa4',
    //       z: 35,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: 'D'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 665,
    //         y: 736.6666666666666
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '70f63afc-f318-439d-a136-1eaa12fa195e',
    //       z: 37,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: 'I'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 852.5,
    //         y: 735
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '75184982-c703-4f06-97a5-5a14f75e95f1',
    //       z: 38,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '下位水箱'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 1042.5,
    //         y: 752.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: 'b0e885f8-3930-4fc3-a19c-a6e449b5c456',
    //       z: 39,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '开关阀R3=2'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 540,
    //         y: 465
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '2dd1a264-ce50-4f18-b6ea-fd3978fbdeea',
    //       z: 40,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '开关阀R2=0.5'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: -745,
    //         y: 405
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '2e12df31-bbd1-4a7d-ae1f-53fa8cbed142',
    //       z: 42,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '上位水箱'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: -922.5,
    //         y: 217.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: 'f952e804-c131-4328-80b0-018735b4521f',
    //       z: 44,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '调节阀R1开度 %'
    //         }
    //       }
    //     },
    //     {
    //       position: {
    //         x: 265,
    //         y: 760
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Input',
    //       value: '',
    //       color: 'black',
    //       fontSize: 14,
    //       id: 'cd41b496-ab69-45ed-b0e3-40fd14d7e2b8',
    //       z: 45,
    //       attrs: {}
    //     },
    //     {
    //       position: {
    //         x: 460,
    //         y: 760
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Input',
    //       value: '',
    //       color: 'black',
    //       fontSize: 14,
    //       id: 'b42e0ed1-e489-49ff-a3a3-bee5a0f6447c',
    //       z: 46,
    //       attrs: {}
    //     },
    //     {
    //       position: {
    //         x: 663.448275862069,
    //         y: 627.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Input',
    //       value: '',
    //       color: 'black',
    //       fontSize: 14,
    //       id: '198f4471-8600-46bb-9e33-63cb5f65dd8b',
    //       z: 47,
    //       attrs: {}
    //     },
    //     {
    //       position: {
    //         x: 665,
    //         y: 697.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Input',
    //       value: '',
    //       color: 'black',
    //       fontSize: 14,
    //       id: '6de7ea27-6d9e-4b79-80f3-104fcee93578',
    //       z: 48,
    //       attrs: {}
    //     },
    //     {
    //       position: {
    //         x: 665,
    //         y: 770
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Input',
    //       value: '',
    //       color: 'black',
    //       fontSize: 14,
    //       id: '4b9b2736-53cc-4a6e-8854-692d749f5496',
    //       z: 49,
    //       attrs: {}
    //     },
    //     {
    //       position: {
    //         x: 75,
    //         y: 627.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Input',
    //       value: '',
    //       color: 'black',
    //       fontSize: 14,
    //       id: '450129b8-2fbd-4ae6-baa9-e47885c33c49',
    //       z: 50,
    //       attrs: {}
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 75,
    //         y: 667.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '3cff4cd7-237f-40b9-9516-945d25909934',
    //       z: 51,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '上位水箱横截面积'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 85,
    //         y: 800
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '497d5fac-6d8c-4816-a122-077c96da6e6e',
    //       z: 52,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '下位水箱横截面积'
    //         }
    //       }
    //     },
    //     {
    //       position: {
    //         x: 75,
    //         y: 760
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Input',
    //       value: '',
    //       color: 'black',
    //       fontSize: 14,
    //       id: 'bac478c0-f481-494b-ae0a-eab689494afb',
    //       z: 53,
    //       attrs: {}
    //     },
    //     {
    //       position: {
    //         x: 252.5,
    //         y: 632.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Input',
    //       value: '',
    //       color: 'black',
    //       fontSize: 14,
    //       id: 'f1f7d127-4619-4f04-a28e-3a912cfb038a',
    //       z: 54,
    //       attrs: {}
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 252.5,
    //         y: 677.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: 'c7ddd91e-cc77-451c-9c19-bce5a2d63851',
    //       z: 55,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '扫描周期'
    //         }
    //       }
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: -155,
    //         y: 60
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: 'dd8ff8a0-ea92-48f3-9fa0-2890603dbe0b',
    //       z: 60,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           fontSize: 42,
    //           style: {
    //             color: '#e21212'
    //           },
    //           text: '串联自衡双容水箱控制模拟试验'
    //         }
    //       }
    //     },
    //     {
    //       position: {
    //         x: 75,
    //         y: 527.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Select',
    //       options: [{
    //         label: '手动',
    //         value: '0'
    //       },
    //       {
    //         label: '自动',
    //         value: '1'
    //       },
    //       {
    //         label: '3',
    //         value: '3'
    //       },
    //       {
    //         label: '4',
    //         value: '4'
    //       }
    //       ],
    //       value: '4',
    //       bind: {
    //         event: '',
    //         onChange: 'Mode'
    //       },
    //       id: '0462356e-210c-4d38-9be0-776a97700fb9',
    //       ratio: '1/1',
    //       z: 61,
    //       attrs: {}
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 75,
    //         y: 567.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: 'f4c06f46-03cc-4b83-b191-8850f30b4548',
    //       z: 62,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '控制模式选择'
    //         }
    //       }
    //     },
    //     {
    //       position: {
    //         x: 252.5,
    //         y: 527.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       type: 'app.Input',
    //       value: '',
    //       color: 'black',
    //       fontSize: 14,
    //       id: '6297d102-1dd9-4c13-81da-4f2364c52a98',
    //       z: 63,
    //       attrs: {}
    //     },
    //     {
    //       type: 'app.TextBlock',
    //       position: {
    //         x: 252.5,
    //         y: 567.5
    //       },
    //       size: {
    //         width: 90,
    //         height: 30
    //       },
    //       angle: 0,
    //       id: '04152e82-188d-4a06-a728-5bb958a7c7e8',
    //       z: 64,
    //       attrs: {
    //         body: {
    //           strokeWidth: 0,
    //           fill: '#ffffff'
    //         },
    //         label: {
    //           text: '手动设定值'
    //         }
    //       }
    //     }
    //     ]
    //   },
    //   paper: {
    //     background: false,
    //     width: '1280',
    //     height: '800'
    //   }
    // })
    // window.mapping = '[]'
    const { ws, panel, prefix, mapping = '[]' } = window

    if (ws && panel) {
      const el = document.getElementById('paper-container') as HTMLElement
      const paper = new Paper(el, JSON.parse(panel)) as any
      const w = new ReconnectingWebSocket(`ws://${ws}`)
      paper.paper.ws = w
      w.onopen = () => {
        w.send(`$initData ${window.screenName}`)
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
                cell.prop('columns', json.columns)
                cell.prop('rows', json.rows)
              }
            }
          }
        } else {
          console.log(1)
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
            console.log(propPath, String(value))
            // console.log(propPath, value)
            cell.prop(propPath, String(value))
          }
        }
      }

      const a = (cell: joint.dia.Cell, path: string, value: string | Array<any>, trigger: string, p: string) => {
        const isArrayValue = isArray(value)

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

      const b = (cell: joint.dia.Cell, path: string, value: string | Array<any>, trigger: string, p: string) => {
        if (p === `${prefix}.${trigger}`) {
          const type = get(cell, 'attributes.type')
          if (['app.Input', 'app.Select'].includes(type)) {
            cell.prop('value', String(value))
          }
        }
      }

      w.onmessage = (evt) => {
        const message = evt.data as string
        const json = JSON.parse(message)
        const cells = paper.graph.getCells()

        console.log(json)
        for (const [path, value] of Object.entries(json)) {
          cells.forEach((cell: joint.dia.Cell) => {
            const bind = get(cell, 'attributes.attrs.bind', {})
            for (const [k, v] of Object.entries(bind)) {
              a(cell, k, value as any, v, path)
              if (isArray(value)) {
                value.forEach((e, i) => {
                  a(cell, k, e as any, v, `${path}[${i}]`)
                })
              }
            }
            const bind2 = get(cell, 'attributes.bind', {})
            for (const [k, v] of Object.entries(bind2)) {
              b(cell, k, value as any, v, path)
              if (isArray(value)) {
                value.forEach((e, i) => {
                  b(cell, k, e as any, v, `${path}[${i}]`)
                })
              }
            }
          })
        }
      }
    }
  }
})

</script>
<style lang="scss">
button {
  cursor: pointer;
}

// button:hover {background-color: #3e8e41}

button:active {
  background-color: #90EE90;
  box-shadow: 0 5px #666;
  transform: translateY(2px);
}
</style>
