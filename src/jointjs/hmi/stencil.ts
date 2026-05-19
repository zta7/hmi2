import * as joint from '@clientio/rappid'
import { get } from 'lodash'
import i18n from 'src/i18n'

// Stencil element size: icon area + label below
const ELEM_W = 52
const ELEM_H = 46

const stencilElement = (href: string, label: string) => ({
  type: 'standard.Image',
  size: { width: ELEM_W, height: ELEM_H },
  attrs: {
    image: {
      href,
      refWidth: '40%',
      refHeight: '50%',
      refX: '30%',
      refY: '4%',
      'data-tooltip': label,
      preserveAspectRatio: 'xMidYMid meet'
    },
    label: {
      text: label,
      refY: '58%',
      refX: 0.5,
      textAnchor: 'middle',
      fontSize: 8,
      fontFamily: 'sans-serif',
      fill: '#8888a0'
    },
    body: {
      fill: 'transparent',
      stroke: 'none'
    }
  }
})

export const getStencilConfig = (paper: joint.dia.Paper | joint.ui.PaperScroller, snaplines: joint.ui.Snaplines, lang: string) => {
  return {
    dragEndClone: (el) => {
      const { shape } = el.attributes
      if (shape) {
        const clone = shape.clone()
        return clone
      }
    },
    paper,
    paperOptions: () => {
      return {
        model: new joint.dia.Graph({}, { cellNamespace: joint.shapes }),
        cellViewNamespace: joint.shapes
      }
    },
    groups: {
      Inputs: { label: get(i18n, `${lang}.INPUTS`, 'Inputs'), index: 1 },
      Outputs: { label: get(i18n, `${lang}.OUTPUTS`, 'Outputs'), index: 2 },
      OutputEvents: { label: get(i18n, `${lang}.OUTPUTEVENTS`, 'Events'), index: 3 },
      Links: { label: get(i18n, `${lang}.LINKS`, 'Links'), index: 4 },
      Images: { label: get(i18n, `${lang}.STATIC`, 'Static'), index: 5 },
      Shapes: { label: get(i18n, `${lang}.SHAPES`, 'Shapes'), index: 6 },
      Scala: { label: get(i18n, `${lang}.PROCESS`, 'Process'), index: 7 },
      Window: { label: get(i18n, `${lang}.POPUP WINDOW`, 'Window'), index: 8 }
    },
    layout: {
      columns: 3,
      columnWidth: ELEM_W + 6,
      rowHeight: ELEM_H + 2,
      resizeToFit: true
    },
    usePaperGrid: true,
    snaplines,
    search: {
      '*': ['shape/attributes/type']
    }
  } as joint.ui.Stencil.Options
}

const shapes = joint.shapes as any
const app = shapes.app

export const getStencilLoad = (lang: string) => {
  const l = (key: string, fallback: string) => get(i18n, `${lang}.${key}`, fallback)

  return {
    Inputs: [
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="#131320" stroke="#4a4a6a" stroke-width="3"/><circle cx="25" cy="25" r="15" fill="#e15656"/></svg>'), l('Indicator', 'Indicator')),
        shape: new app.Light({
          size: { width: 50, height: 50 },
          attrs: {
            label: { text: '', fontSize: 11, fill: '#c0c0d0' },
            body: { stroke: '#4a4a6a', fill: '#e15656', strokeWidth: 2 }
          }
        })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 18"><rect x="0.75" y="0.75" width="44.5" height="16.5" rx="3" fill="#1a1a2e" stroke="#3d3d60" stroke-width="1.5"/><rect x="0.75" y="0.75" width="3" height="16.5" rx="1.5" fill="#3d3d60"/><line x1="8" y1="9" x2="34" y2="9" stroke="#5a5a90" stroke-width="1.5" stroke-linecap="round"/></svg>'), l('InputTextbox', 'Text')),
        shape: new app.Rectangle({
          size: { width: 90, height: 30 },
          attrs: {
            label: { text: '文本', fontSize: 14, fill: '#e0e0e0' },
            body: { stroke: '#3d3d60', fill: '#1a1a2e', rx: 3, ry: 3 }
          }
        })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1a1a2e" stroke="#3d3d60" stroke-width="2"/><path d="M10 32 A14 14 0 1 1 30 32" fill="none" stroke="#2a2a40" stroke-width="4" stroke-linecap="round"/><path d="M10 32 A14 14 0 1 1 33 17" fill="none" stroke="#4a9eff" stroke-width="4" stroke-linecap="round"/><circle cx="20" cy="20" r="3" fill="#3d3d60"/></svg>'), l('Knob', 'Knob')),
        shape: new joint.shapes.chart.Knob({
          size: { width: 100, height: 100 },
          min: 0,
          max: 100,
          value: 80,
          fill: '#4a9eff'
        } as any)
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1a1a2e"/><path d="M20 20 L20 2 A18 18 0 0 1 35.6 29 Z" fill="#4a9eff"/><path d="M20 20 L35.6 29 A18 18 0 0 1 4.4 29 Z" fill="#7c5af8"/><path d="M20 20 L4.4 29 A18 18 0 0 1 20 2 Z" fill="#00c4b4"/><circle cx="20" cy="20" r="7" fill="#1a1a2e"/></svg>'), l('Pie', 'Pie')),
        shape: new joint.shapes.chart.Pie({
          size: { width: 100, height: 100 },
          series: [{
            data: [
              { value: 40, label: 'Organic', fill: '#8bce5d' },
              { value: 20, label: 'Email', fill: '#53abdd' },
              { value: 20, label: 'Social', fill: '#c377b1' },
              { value: 20, label: 'Referral', fill: '#ffe891' }
            ]
          }]
        } as any)
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 32"><rect x="0" y="0" width="46" height="32" rx="3" fill="#1a1a2e"/><line x1="8" y1="4" x2="8" y2="24" stroke="#2a2a40" stroke-width="1"/><line x1="8" y1="24" x2="42" y2="24" stroke="#2a2a40" stroke-width="1"/><polyline points="8,20 16,14 24,17 32,9 40,12" fill="none" stroke="#4a9eff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>'), l('Plot', 'Plot')),
        shape: new joint.shapes.chart.Plot({
          size: { width: 300, height: 100 },
          axis: {
            'y-axis': { tickSuffix: 'kg' },
            'x-axis': { tickSuffix: 'ab' }
          },
          series: [{ name: 'Plot', data: [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 4, y: 3 }] }]
        } as any)
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 32"><rect x="0.75" y="0.75" width="44.5" height="30.5" rx="2.5" fill="#1a1a2e" stroke="#3d3d60" stroke-width="1.5"/><rect x="0.75" y="0.75" width="44.5" height="8" rx="2.5" fill="#252540"/><line x1="0.75" y1="8.75" x2="45.25" y2="8.75" stroke="#3d3d60" stroke-width="1"/><line x1="15" y1="0.75" x2="15" y2="31.25" stroke="#2a2a40" stroke-width="1"/><line x1="30" y1="0.75" x2="30" y2="31.25" stroke="#2a2a40" stroke-width="1"/><line x1="0.75" y1="18" x2="45.25" y2="18" stroke="#2a2a40" stroke-width="1"/></svg>'), l('Table', 'Table')),
        shape: new app.Table()
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 18"><rect x="0.75" y="0.75" width="44.5" height="16.5" rx="3" fill="#1a1a2e" stroke="#3d3d60" stroke-width="1.5"/><rect x="2" y="2" width="27" height="14" rx="2" fill="#4a9eff"/></svg>'), '进度条'),
        shape: new app.ProgressBar({ size: { width: 160, height: 30 } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 32"><rect x="0" y="0" width="50" height="32" rx="3" fill="#1a1a2e"/><path d="M7 28 A18 18 0 0 0 43 28" fill="none" stroke="#2a2a40" stroke-width="4" stroke-linecap="round"/><path d="M7 28 A18 18 0 0 0 30.6 10.9" fill="none" stroke="#4a9eff" stroke-width="4" stroke-linecap="round"/><line x1="25" y1="28" x2="31" y2="12" stroke="#e0e0e0" stroke-width="1.5" stroke-linecap="round"/><circle cx="25" cy="28" r="2" fill="#3d3d60"/></svg>'), '仪表盘'),
        shape: new app.Gauge({ size: { width: 120, height: 120 } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 20"><rect x="0" y="0" width="46" height="20" rx="3" fill="#21BA45"/><text x="23" y="14" text-anchor="middle" font-size="10" font-weight="600" font-family="sans-serif" fill="#ffffff">ON</text></svg>'), '状态显示'),
        shape: new app.StateDisplay({ size: { width: 80, height: 40 } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 30"><rect x="0" y="0" width="46" height="30" rx="3" fill="#1e1e32"/><rect x="7" y="3" width="36" height="19" fill="#16162a"/><line x1="7" y1="3" x2="7" y2="22" stroke="#333350" stroke-width="1"/><line x1="7" y1="22" x2="43" y2="22" stroke="#333350" stroke-width="1"/><polyline points="7,18 13,12 20,15 27,7 34,10 43,6" fill="none" stroke="#4a9eff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>'), '趋势图'),
        shape: new app.TrendChart({
          size: { width: 300, height: 150 },
          data: [20, 35, 28, 50, 42, 60, 55, 70, 65, 80]
        })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 34"><rect x="0.75" y="0.75" width="44.5" height="32.5" rx="2.5" fill="#1e1e32" stroke="#333350" stroke-width="1.5"/><rect x="0.75" y="0.75" width="44.5" height="8" rx="2.5" fill="#252540"/><line x1="0.75" y1="8.75" x2="45.25" y2="8.75" stroke="#333350" stroke-width="1"/><rect x="4" y="13" width="4" height="4" rx="1" fill="#C10015"/><rect x="4" y="21" width="4" height="4" rx="1" fill="#F2C037"/><rect x="4" y="29" width="4" height="4" rx="1" fill="#4a9eff"/><line x1="11" y1="15" x2="38" y2="15" stroke="#555577" stroke-width="1.5" stroke-linecap="round"/><line x1="11" y1="23" x2="32" y2="23" stroke="#555577" stroke-width="1.5" stroke-linecap="round"/><line x1="11" y1="31" x2="28" y2="31" stroke="#555577" stroke-width="1.5" stroke-linecap="round"/></svg>'), '报警列表'),
        shape: new app.AlarmList({ size: { width: 320, height: 200 } })
      }
    ],
    Outputs: [
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1a1a2e" stroke="#4a9eff" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="#4a9eff"/><circle cx="20" cy="20" r="5" fill="#ffffff"/></svg>'), l('Switch', 'Switch')),
        shape: new app.Switch({ size: { width: 32, height: 32 } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 24"><rect x="0.75" y="0.75" width="44.5" height="22.5" rx="3" fill="#1a1a2e" stroke="#00c4b4" stroke-width="1.5"/><rect x="3" y="3" width="8" height="16" rx="1.5" fill="#00c4b4"/><line x1="14" y1="12" x2="38" y2="12" stroke="#00c4b4" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>'), l('Input', 'Input')),
        shape: new app.Input()
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 24"><rect x="0.75" y="0.75" width="44.5" height="22.5" rx="3" fill="#1a1a2e" stroke="#7c5af8" stroke-width="1.5"/><rect x="3" y="5" width="18" height="12" rx="1.5" fill="#7c5af8" opacity="0.3"/><polygon points="36,9 40,12 36,15" fill="#7c5af8"/></svg>'), l('Select', 'Select')),
        shape: new app.Select()
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 20"><rect x="0.75" y="7.25" width="44.5" height="5.5" rx="2.75" fill="#1a1a2e" stroke="#f2c037" stroke-width="1.5"/><rect x="0.75" y="7.25" width="22" height="5.5" rx="2.75" fill="#f2c037"/><circle cx="22.75" cy="10" r="4" fill="#1a1a2e"/></svg>'), l('Slider', 'Slider')),
        shape: new app.Slider()
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0.75" y="0.75" width="22.5" height="22.5" rx="3" fill="#1a1a2e" stroke="#e15656" stroke-width="1.5"/><path d="M6 12 L10 16 L18 8" fill="none" stroke="#e15656" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'), l('CheckBox', 'Checkbox')),
        shape: new app.Checkbox()
      }
    ],
    OutputEvents: [
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 24"><rect x="0.75" y="0.75" width="44.5" height="22.5" rx="3" fill="#1a1a2e" stroke="#4a9eff" stroke-width="1.5"/><text x="23" y="16" text-anchor="middle" font-size="10" font-weight="600" font-family="sans-serif" fill="#4a9eff">Btn</text></svg>'), l('Button', 'Button')),
        shape: new app.Button()
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1a1a2e" stroke="#e15656" stroke-width="2"/><circle cx="20" cy="20" r="12" fill="#e15656"/><text x="20" y="24" text-anchor="middle" font-size="10" font-weight="600" font-family="sans-serif" fill="#ffffff">●</text></svg>'), l('CircleButton', 'Circle Btn')),
        shape: new app.LightButton({
          size: { width: 50, height: 50 },
          text: 'Push',
          background: '#e15656'
        })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 28"><rect x="0.75" y="0.75" width="44.5" height="12.5" rx="3" fill="#1a1a2e" stroke="#555577" stroke-width="1.5"/><rect x="0.75" y="14.75" width="44.5" height="12.5" rx="3" fill="#1a1a2e" stroke="#4a9eff" stroke-width="1.5"/><text x="23" y="9" text-anchor="middle" font-size="8" font-weight="600" font-family="sans-serif" fill="#555577">OFF</text><text x="23" y="24" text-anchor="middle" font-size="8" font-weight="600" font-family="sans-serif" fill="#4a9eff">ON</text></svg>'), '多状态按钮'),
        shape: new app.MultiStateButton({ size: { width: 90, height: 36 } })
      }
    ],
    Links: [
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 24"><line x1="4" y1="12" x2="42" y2="12" stroke="#4a9eff" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="12" r="3" fill="#1a1a2e" stroke="#4a9eff" stroke-width="1.5"/><polygon points="42,12 37,9 37,15" fill="#4a9eff"/></svg>'), l('Link', 'Link')),
        shape: new app.Link({ vertice: true })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 24"><polyline points="4,12 23,12 23,4 42,4" fill="none" stroke="#00c4b4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="12" r="3" fill="#1a1a2e" stroke="#00c4b4" stroke-width="1.5"/><polygon points="42,4 37,1 37,7" fill="#00c4b4"/></svg>'), l('Polyline', 'Polyline')),
        shape: new app.Link()
      }
    ],
    Images: [
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 32"><rect x="0.75" y="0.75" width="44.5" height="30.5" rx="3" fill="#1a1a2e" stroke="#f2c037" stroke-width="1.5"/><rect x="6" y="5" width="14" height="10" rx="1" fill="#2a2a40"/><polygon points="6,15 20,15 20,26 6,26" fill="#2a2a40"/><circle cx="36" cy="22" r="5" fill="#f2c037"/></svg>'), l('Image', 'Image')),
        shape: new joint.shapes.standard.Image({
          size: { width: 30, height: 30 },
          attrs: { image: { href: './stencil/image-outline.svg' } }
        })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 20"><rect x="0.75" y="0.75" width="44.5" height="18.5" rx="3" fill="#1a1a2e" stroke="#7c5af8" stroke-width="1.5"/><text x="23" y="14" text-anchor="middle" font-size="9" font-weight="600" font-family="sans-serif" fill="#7c5af8">Text</text></svg>'), l('StaticText', 'Static Text')),
        shape: new app.StaticRectangle({
          size: { width: 90, height: 30 },
          attrs: {
            label: { text: '文本', fontSize: 14, fill: '#e0e0e0' },
            body: { stroke: '#555577', fill: '#2a2a3e' }
          }
        })
      }
    ],
    Shapes: [
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 20"><rect x="0.75" y="0.75" width="44.5" height="18.5" rx="3" fill="#1a1a2e" stroke="#4a9eff" stroke-width="1.5"/><text x="23" y="14" text-anchor="middle" font-size="9" font-weight="600" font-family="sans-serif" fill="#4a9eff">T</text></svg>'), l('TextBlock', 'Text Block')),
        shape: new app.TextBlock({
          size: { width: 90, height: 30 },
          attrs: {
            label: { text: '文本', fontSize: 14, fill: '#4a9eff', fontWeight: 600 },
            body: { fill: 'transparent', stroke: 'none', strokeWidth: 0 }
          }
        })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#1a1a2e" stroke="#00c4b4" stroke-width="2"/><circle cx="18" cy="18" r="8" fill="#00c4b4" opacity="0.3"/></svg>'), l('Circle', 'Circle')),
        shape: new app.Circle({ size: { width: 30, height: 30 }, attrs: { body: { fill: '#1a1a2e', stroke: '#00c4b4', strokeWidth: 2 } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="1" y="1" width="34" height="34" rx="4" fill="#1a1a2e" stroke="#7c5af8" stroke-width="2"/><rect x="7" y="7" width="22" height="22" rx="2" fill="#7c5af8" opacity="0.2"/></svg>'), l('Square', 'Square')),
        shape: new app.Square({ size: { width: 30, height: 30 }, attrs: { body: { fill: '#1a1a2e', stroke: '#7c5af8', strokeWidth: 2, rx: 4 } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="url(#sphereGradIcon)"/><defs><radialGradient id="sphereGradIcon" cx="35%" cy="35%" r="60%"><stop offset="0%" stop-color="#fff9e6"/><stop offset="30%" stop-color="#f2c037"/><stop offset="70%" stop-color="#d4a017"/><stop offset="100%" stop-color="#a88000"/></radialGradient></defs></svg>'), l('Sphere', 'Sphere')),
        shape: new app.Sphere({ size: { width: 30, height: 30 }, attrs: { body: { fill: 'transparent' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><ellipse cx="18" cy="28" rx="14" ry="5" fill="url(#coneBaseIcon)" stroke="#6b1010" stroke-width="0.5"/><path d="M18 2 L32 28 A14 5 0 0 0 4 28 Z" fill="url(#coneBodyIcon)"/><defs><linearGradient id="coneBodyIcon" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ff6b6b"/><stop offset="30%" stop-color="#f08080"/><stop offset="60%" stop-color="#e15656"/><stop offset="100%" stop-color="#b03a3a"/></linearGradient><linearGradient id="coneBaseIcon" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#d45a5a"/><stop offset="40%" stop-color="#b03a3a"/><stop offset="100%" stop-color="#8b1a1a"/></linearGradient></defs></svg>'), l('Cone', 'Cone')),
        shape: new app.Cone({ size: { width: 30, height: 30 }, attrs: { body: { fill: 'transparent' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><polygon points="6,10 26,10 26,30 6,30" fill="url(#cubeFrontIcon)" stroke="#1a4a96" stroke-width="1"/><polygon points="6,10 26,10 30,6 10,6" fill="url(#cubeTopIcon)" stroke="#1a4a96" stroke-width="1"/><polygon points="26,10 26,30 30,26 30,6" fill="url(#cubeSideIcon)" stroke="#1a4a96" stroke-width="1"/><defs><linearGradient id="cubeFrontIcon" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#7ebbff"/><stop offset="100%" stop-color="#3a85e6"/></linearGradient><linearGradient id="cubeTopIcon" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#99ccff"/><stop offset="100%" stop-color="#4a9eff"/></linearGradient><linearGradient id="cubeSideIcon" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#2d6bc9"/><stop offset="100%" stop-color="#1a4a96"/></linearGradient></defs></svg>'), l('Cube', 'Cube')),
        shape: new app.Cube({ size: { width: 30, height: 30 }, attrs: { body: { fill: 'transparent' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="4" y="8" width="28" height="20" rx="4" fill="url(#cylGradIcon)"/><ellipse cx="18" cy="8" rx="14" ry="4" fill="url(#cylTopGradIcon)"/><ellipse cx="18" cy="28" rx="14" ry="4" fill="#008077"/><defs><linearGradient id="cylGradIcon" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#00e6d0"/><stop offset="30%" stop-color="#00c4b4"/><stop offset="70%" stop-color="#00a399"/><stop offset="100%" stop-color="#008077"/></linearGradient><linearGradient id="cylTopGradIcon" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#00d4c4"/><stop offset="100%" stop-color="#00a399"/></linearGradient></defs></svg>'), l('Cylinder', 'Cylinder')),
        shape: new app.Cylinder({ size: { width: 30, height: 30 }, attrs: { body: { fill: 'transparent' } } })
      }
    ],
    Scala: [
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#1a1a2e" stroke="#4a9eff" stroke-width="2"/><circle cx="18" cy="18" r="8" fill="#3d3d60" stroke="#4a9eff" stroke-width="1"/><path d="M 14 18 L 18 10 L 22 18 M 18 10 V 22 M 14 22 L 22 14" fill="none" stroke="#4a9eff" stroke-width="2" stroke-linejoin="round"/></svg>'), l('Pump', 'Pump')),
        shape: new app.Pump({ attrs: { label: { text: 'Pump' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#1a1a2e" stroke="#00c4b4" stroke-width="2"/><rect x="10" y="10" width="16" height="16" rx="3" fill="#2a2a40" stroke="#00c4b4" stroke-width="1"/><rect x="12" y="8" width="12" height="6" rx="2" fill="#4a4a80" stroke="#008077" stroke-width="1"/></svg>'), l('ControlValve', 'Ctrl Valve')),
        shape: new app.ControlValve({ open: 1, attrs: { label: { text: 'CTRL Valve 1' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="4" y="2" width="28" height="28" rx="10" ry="4" fill="#1a1a2e" stroke="#7c5af8" stroke-width="2"/><rect x="4" y="12" width="28" height="8" fill="#2a2a40" stroke="#7c5af8" stroke-width="1"/></svg>'), l('LiquidTank', 'Liquid Tank')),
        shape: new app.LiquidTank({ attrs: { label: { text: 'LiquidTank' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="6" y="4" width="24" height="18" rx="12" ry="3" fill="#1a1a2e" stroke="#7c5af8" stroke-width="2"/><path d="M 6 22 L 14 32 H 22 L 30 22 Z" fill="#3d3d60" stroke="#7c5af8" stroke-width="2" stroke-linejoin="round"/></svg>'), l('ConicTank', 'Conic Tank')),
        shape: new app.ConicTank({ attrs: { label: { text: 'ConicTank' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="12" fill="#1a1a2e" stroke="#00c4b4" stroke-width="2"/><rect x="14" y="2" width="8" height="10" rx="2" fill="#4a4a80" stroke="#008077" stroke-width="1"/><rect x="12" y="2" width="20" height="4" rx="2" fill="#3d3d60" stroke="#00c4b4" stroke-width="1"/></svg>'), l('HandValue', 'Valve')),
        shape: new app.HandValve({ attrs: { label: { text: 'HandValue' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="2" y="10" width="32" height="16" rx="4" fill="#2a2a40" stroke="#a0a0c0" stroke-width="2"/><circle cx="10" cy="18" r="3" fill="#5a5a90"/><circle cx="26" cy="18" r="3" fill="#5a5a90"/></svg>'), l('PipeJoin', 'Pipe Joint')),
        shape: new app.PipeJoin({
          attrs: { root: { magnet: false }, body: { fill: '#2a2a40', strokeWidth: 0 } },
          size: { width: 30, height: 30 }
        })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><line x1="2" y1="18" x2="34" y2="18" stroke="#5a5a90" stroke-width="8" stroke-linecap="round"/><line x1="2" y1="18" x2="34" y2="18" stroke="#2a2a40" stroke-width="4" stroke-linecap="round"/></svg>'), l('Pipe', 'Pipe')),
        shape: new app.Pipe()
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#1a1a2e" stroke="#4a9eff" stroke-width="2"/><text x="18" y="24" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" fill="#4a9eff" stroke="#2d6bc9" stroke-width="2">M</text></svg>'), l('Motor', '电机')),
        shape: new app.Motor({ attrs: { label: { text: '电机' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="4" y="8" width="28" height="24" rx="3" fill="#1a1a2e" stroke="#f2c037" stroke-width="2"/><rect x="14" y="1" width="8" height="7" rx="2" fill="#4a4a80" stroke="#f2c037" stroke-width="1"/><line x1="18" y1="10" x2="18" y2="20" stroke="#f2c037" stroke-width="2"/><line x1="8" y1="18" x2="28" y2="18" stroke="#f2c037" stroke-width="2" stroke-linecap="round"/></svg>'), l('Mixer', '搅拌器')),
        shape: new app.Mixer({ attrs: { label: { text: '搅拌器' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#1a1a2e" stroke="#e15656" stroke-width="2"/><text x="18" y="24" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="#e15656" stroke="#b03a3a" stroke-width="1">T</text></svg>'), l('Sensor', '传感器')),
        shape: new app.Sensor({ attrs: { label: { text: '传感器' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#1a1a2e" stroke="#e15656" stroke-width="2"/><text x="18" y="24" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="#e15656" stroke="#b03a3a" stroke-width="1">F</text></svg>'), l('FlowMeter', '流量计')),
        shape: new app.FlowMeter({ attrs: { label: { text: '流量计' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#1a1a2e" stroke="#00c4b4" stroke-width="2"/><line x1="18" y1="6" x2="18" y2="30" stroke="#00c4b4" stroke-width="3" stroke-linecap="round"/><path d="M 22 14 H 28 M 26 10 L 28 14 L 26 18" fill="none" stroke="#00c4b4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'), l('CheckValve', '止回阀')),
        shape: new app.CheckValve({ attrs: { label: { text: '止回阀' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#1a1a2e" stroke="#00c4b4" stroke-width="2"/><line x1="18" y1="2" x2="18" y2="34" stroke="#00c4b4" stroke-width="3"/><path d="M 18 8 Q 4 18 18 28" fill="#00a399" stroke="#008077" stroke-width="1"/><path d="M 18 8 Q 32 18 18 28" fill="#00c4b4" stroke="#008077" stroke-width="1"/></svg>'), l('ButterflyValve', '蝶阀')),
        shape: new app.ButterflyValve({ attrs: { label: { text: '蝶阀' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#1a1a2e" stroke="#00c4b4" stroke-width="2"/><line x1="4" y1="18" x2="32" y2="18" stroke="#00c4b4" stroke-width="3" stroke-linecap="round"/><line x1="18" y1="18" x2="18" y2="32" stroke="#00c4b4" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="18" r="3" fill="#008077"/></svg>'), l('ThreeWayValve', '三通阀')),
        shape: new app.ThreeWayValve({ attrs: { label: { text: '三通阀' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="12" fill="#1a1a2e" stroke="#e15656" stroke-width="2"/><rect x="15" y="4" width="6" height="10" fill="#3d3d60" stroke="#e15656" stroke-width="1"/><rect x="12" y="0" width="12" height="4" rx="1" fill="#4a4a80" stroke="#b03a3a" stroke-width="1"/><path d="M 27 16 H 34 L 34 13 L 36 16 L 34 19 L 34 16" fill="none" stroke="#e15656" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'), l('SafetyValve', '安全阀')),
        shape: new app.SafetyValve({ attrs: { label: { text: '安全阀' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path d="M 4 20 H 14 Q 18 20 18 16 V 4" fill="none" stroke="#a0a0c0" stroke-width="14" stroke-linecap="square" stroke-linejoin="round"/><path d="M 4 20 H 14 Q 18 20 18 16 V 4" fill="none" stroke="#2a2a40" stroke-width="10" stroke-linecap="square" stroke-linejoin="round"/></svg>'), l('PipeElbow', '弯头')),
        shape: new app.PipeElbow({ attrs: { label: { text: '弯头' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path d="M 2 14 L 34 14 M 18 14 L 18 34" fill="none" stroke="#a0a0c0" stroke-width="14" stroke-linecap="square" stroke-linejoin="round"/><path d="M 2 14 L 34 14 M 18 14 L 18 34" fill="none" stroke="#2a2a40" stroke-width="10" stroke-linecap="square" stroke-linejoin="round"/></svg>'), l('PipeTee', '三通')),
        shape: new app.PipeTee({ attrs: { label: { text: '三通' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="2" y="12" width="10" height="12" rx="2" fill="#3d3d60" stroke="#a0a0c0" stroke-width="1"/><rect x="12" y="14" width="12" height="8" fill="#2a2a40" stroke="#a0a0c0" stroke-width="1"/><rect x="24" y="12" width="10" height="12" rx="2" fill="#3d3d60" stroke="#a0a0c0" stroke-width="1"/><circle cx="6" cy="16" r="1.5" fill="#5a5a90"/><circle cx="6" cy="20" r="1.5" fill="#5a5a90"/><circle cx="30" cy="16" r="1.5" fill="#5a5a90"/><circle cx="30" cy="20" r="1.5" fill="#5a5a90"/></svg>'), l('PipeFlange', '法兰')),
        shape: new app.PipeFlange({ attrs: { label: { text: '法兰' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="2" y="6" width="32" height="16" fill="#1a1a2e" stroke="#7c5af8" stroke-width="2"/><ellipse cx="4" cy="14" rx="4" ry="8" fill="#2a2a40" stroke="#7c5af8" stroke-width="2"/><ellipse cx="32" cy="14" rx="4" ry="8" fill="#2a2a40" stroke="#7c5af8" stroke-width="2"/><rect x="14" y="0" width="8" height="6" rx="1" fill="#3d3d60" stroke="#7c5af8" stroke-width="1"/></svg>'), l('HorizontalTank', '卧式罐')),
        shape: new app.HorizontalTank({ attrs: { label: { text: '卧式罐' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><defs><linearGradient id="rBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="50%" stop-color="#222244"/><stop offset="100%" stop-color="#15152a"/></linearGradient><linearGradient id="rDomeGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#2a2a4a"/><stop offset="100%" stop-color="#1a1a2e"/></linearGradient></defs><rect x="4" y="4" width="28" height="20" fill="url(#rBodyGrad)" stroke="#f2c037" stroke-width="2" rx="2"/><ellipse cx="18" cy="4" rx="14" ry="5" fill="url(#rDomeGrad)" stroke="#f2c037" stroke-width="2"/><path d="M 4 24 L 10 32 H 26 L 32 24 Z" fill="url(#rBodyGrad)" stroke="#f2c037" stroke-width="2" stroke-linejoin="round"/><rect x="14" y="0" width="8" height="4" fill="#3d3d60" stroke="#f2c037" stroke-width="1"/></svg>'), l('Reactor', '反应器')),
        shape: new app.Reactor({ attrs: { label: { text: '反应器' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="6" y="2" width="24" height="20" fill="#1a1a2e" stroke="#7c5af8" stroke-width="2"/><path d="M 6 22 L 14 34 H 22 L 30 22 Z" fill="#2a2a40" stroke="#7c5af8" stroke-width="2" stroke-linejoin="round"/><rect x="14" y="0" width="8" height="4" rx="1" fill="#3d3d60" stroke="#7c5af8" stroke-width="1"/></svg>'), l('Silo', '料仓')),
        shape: new app.Silo({ attrs: { label: { text: '料仓' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="4" y="12" width="28" height="12" rx="6" fill="#2a2a40" stroke="#4a9eff" stroke-width="2"/><circle cx="6" cy="18" r="6" fill="#3d3d60" stroke="#4a9eff" stroke-width="1"/><circle cx="6" cy="18" r="2" fill="#5a5a90"/><circle cx="30" cy="18" r="6" fill="#3d3d60" stroke="#4a9eff" stroke-width="1"/><circle cx="30" cy="18" r="2" fill="#5a5a90"/><line x1="10" y1="18" x2="4" y2="14" stroke="#4a9eff" stroke-width="2" stroke-linecap="round"/><line x1="26" y1="18" x2="32" y2="14" stroke="#4a9eff" stroke-width="2" stroke-linecap="round"/></svg>'), l('Conveyor', '传送带')),
        shape: new app.Conveyor({ attrs: { label: { text: '传送带' } } })
      },
      {
        ...stencilElement('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="4" y="6" width="28" height="20" rx="3" fill="#1a1a2e" stroke="#ff8c42" stroke-width="2"/><line x1="8" y1="12" x2="28" y2="12" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="16" x2="28" y2="16" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="20" x2="28" y2="20" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/></svg>'), l('Heater', '加热器')),
        shape: new app.Heater({ attrs: { label: { text: '加热器' } } })
      }
    ],
    Window: [
      {
        ...stencilElement('./stencil/button.svg', l('WindowButton', 'Popup')),
        shape: new app.WindowButton()
      }
    ]
  }
}
