/*! JointJS+ v3.6.3 - HTML5 Diagramming Framework

Copyright (c) 2022 client IO

 2022-12-09

This Source Code Form is subject to the terms of the JointJS+ License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file. */
import * as joint from '@clientio/rappid'

import * as Input from './shapes.app/Input'
import * as Rectangle from './shapes.app/Rectangle'
import * as Button from './shapes.app/Button'
import * as Checkbox from './shapes.app/Checkbox'
import * as FunctionBlock from './shapes.app/FunctionBlock'
import * as Group from './shapes.app/Group'
import * as Link from './shapes.app/Link'
import * as Select from './shapes.app/Select'
import * as Slider from './shapes.app/Slider'
import * as Table from './shapes.app/Table'
import * as TextBlock from './shapes.app/TextBlock'
import * as VariableDot from './shapes.app/VariableDot'
import * as NetLink from './shapes.app/NetLink'
import * as IoLink from './shapes.app/IoLink'
import * as EventLink from './shapes.app/EventLink'
import * as Light from './shapes.app/Light'
import * as LightButton from './shapes.app/LightButton'
import * as Switch from './shapes.app/Switch'
import * as Pump from './shapes.app/Pump'
import * as ControlValve from './shapes.app/ControlValve'
import * as LiquidTank from './shapes.app/LiquidTank'
import * as ConicTank from './shapes.app/ConicTank'
import * as HandValve from './shapes.app/HandValve'
import * as Circle from './shapes.app/Circle'
import * as Square from './shapes.app/Square'
import * as Sphere from './shapes.app/Sphere'
import * as Cube from './shapes.app/Cube'
import * as Cone from './shapes.app/Cone'
import * as Cylinder from './shapes.app/Cylinder'
import * as Pipe from './shapes.app/Pipe'
import * as PipeJoin from './shapes.app/PipeJoin'
import * as Panel from './shapes.app/Panel'
import * as StaticRectangle from './shapes.app/StaticRectangle'

import * as WindowButton from './shapes.app/WindowButton'

// Pump

// const p = joint.dia.CellView.prototype as any
// p.addLinkFromMagnet = function (magnet: any, x: any, y: any) {
//   const paper = this.paper
//   const graph = paper.model

//   const link = paper.getDefaultLink(this, magnet)
//   link.set({
//     source: { x, y },
//     target: this.getLinkEnd(magnet, x, y, link, 'target')
//   }).addTo(graph, {
//     async: false,
//     ui: true
//   })

//   return link.findView(paper)
// }

export const shapes = {
  app: {
    ...StaticRectangle,
    ...Pipe,
    ...PipeJoin,
    ...Cube,
    ...Cone,
    ...Cylinder,
    ...Input,
    ...Rectangle,
    ...Button,
    ...Checkbox,
    ...FunctionBlock,
    ...Group,
    ...Link,
    ...Select,
    ...Slider,
    ...Table,
    ...TextBlock,
    ...VariableDot,
    ...NetLink,
    ...IoLink,
    ...EventLink,
    ...Light,
    ...LightButton,
    ...Switch,
    ...Pump,
    ...ControlValve,
    ...HandValve,
    ...LiquidTank,
    ...ConicTank,
    ...Circle,
    ...Square,
    ...Sphere,
    ...Panel,
    ...WindowButton
  }
}

// class FunctionBlock extends joint.dia.Element {
//   markup = [
//     {
//       tagName: 'rect',
//       selector: 'body'
//     },
//     {
//       tagName: 'text',
//       selector: 'name'
//     }
//     // {
//     //   tagName: 'g',
//     //   selector: 'glabel',
//     //   children: [
//     //     {
//     //       tagName: 'rect',
//     //       selector: 'labelBody'
//     //     },
//     //     {
//     //       tagName: 'text',
//     //       selector: 'label'
//     //     }
//     //   ]
//     // }
//   ]

//   // items: [
//   //   { group: 'inputs', attrs: { label: { text: 'in1444444' } }, args: { y: 20 } },
//   //   { group: 'inputs', attrs: { label: { text: 'in2' } }, args: { y: 40 } },
//   //   { group: 'outputs', attrs: { label: { text: 'out1' } }, args: { y: 20 } }

//   // ]

//   defaults () {
//     return {
//       ...super.defaults,
//       type: 'app.FunctionBlock',
//       size: { width: 240, height: 240 },

//       attrs: {
//         body: {
//           width: 'calc(w)',
//           height: 'calc(h)',
//           strokeWidth: 2,
//           stroke: '#000000',
//           fill: '#FFFFFF'
//         },
//         name: {
//           text: '777',
//           'font-size': 14,
//           refX: '50%',
//           textAnchor: 'middle'
//         }
//       }
//     }
//   }

//   initialize (...args: any[]) {
//     console.log(args)
//     super.initialize.call(this, ...args)
//   }
// }

Object.assign(joint.shapes, shapes)
