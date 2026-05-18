import * as joint from '@clientio/rappid'

export class Gauge extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Gauge',
      size: { width: 120, height: 120 },
      min: 0,
      max: 100,
      value: 65,
      unit: '',
      arcColor: '#4a9eff',
      bgColor: '#1e1e32',
      label: 'Gauge'
    }
  }
}

export const GaugeView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    value: ['RENDER'],
    min: ['RENDER'],
    max: ['RENDER'],
    unit: ['RENDER'],
    arcColor: ['RENDER'],
    bgColor: ['RENDER'],
    label: ['RENDER']
  },

  render () {
    const { model } = this
    const { util } = joint
    const { value, min, max, unit, arcColor, bgColor, label } = model.attributes
    const { width, height } = model.size()
    const size = Math.min(width, height)
    const cx = size / 2
    const cy = size / 2
    const r = size * 0.38
    const strokeW = size * 0.1

    // Arc from -210deg to 30deg (240deg sweep)
    const startAngle = -210
    const sweepAngle = 240
    const pct = Math.min(1, Math.max(0, (value - min) / (max - min)))
    const valueSweep = sweepAngle * pct

    const toRad = (deg: number) => (deg * Math.PI) / 180
    const arcPath = (startDeg: number, endDeg: number, color: string, sw: number) => {
      const s = toRad(startDeg)
      const e = toRad(endDeg)
      const x1 = cx + r * Math.cos(s)
      const y1 = cy + r * Math.sin(s)
      const x2 = cx + r * Math.cos(e)
      const y2 = cy + r * Math.sin(e)
      const large = endDeg - startDeg > 180 ? 1 : 0
      return `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`
    }

    const bgArc = arcPath(startAngle, startAngle + sweepAngle, '#333350', strokeW)
    const valArc = valueSweep > 0 ? arcPath(startAngle, startAngle + valueSweep, arcColor, strokeW) : ''

    const svgContent = `
      <rect width="${size}" height="${size}" fill="${bgColor}" rx="4"/>
      ${bgArc}
      ${valArc}
      <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="${size * 0.18}" font-family="sans-serif" fill="#e0e0e0" font-weight="600">${value}${unit}</text>
      <text x="${cx}" y="${cy + size * 0.22}" text-anchor="middle" font-size="${size * 0.1}" font-family="sans-serif" fill="#8888a0">${label}</text>
    `

    const markup = [
      {
        tagName: 'rect',
        selector: 'body',
        attributes: { stroke: 'transparent', fill: 'transparent' }
      },
      {
        tagName: 'foreignObject',
        selector: 'foreignObject',
        attributes: { overflow: 'visible', width: size, height: size },
        children: [{
          tagName: 'div',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          attributes: {
            style: `width:${size}px;height:${size}px;`
          },
          children: [{
            tagName: 'svg',
            attributes: {
              xmlns: 'http://www.w3.org/2000/svg',
              width: size,
              height: size,
              viewBox: `0 0 ${size} ${size}`,
              innerHTML: svgContent
            }
          }]
        }]
      }
    ]

    const doc = util.parseDOMJSON(markup)
    this.body = doc.selectors.body
    this.el.innerHTML = ''
    this.el.appendChild(doc.fragment)

    // Inject SVG directly for proper rendering
    const fo = this.el.querySelector('foreignObject')
    if (fo) {
      fo.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="filter:drop-shadow(0 4px 10px rgba(0,0,0,0.7));">
        <rect width="${size}" height="${size}" fill="${bgColor}" rx="4"/>
        <rect width="${size}" height="${size}" fill="none" rx="4" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
        <rect x="1" y="1" width="${size - 2}" height="${size * 0.45}" fill="url(#topSheen_${size})" rx="3"/>
        <defs><linearGradient id="topSheen_${size}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="white" stop-opacity="0.04"/><stop offset="100%" stop-color="white" stop-opacity="0"/></linearGradient></defs>
        ${bgArc}
        ${valArc}
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="${Math.round(size * 0.18)}" font-family="sans-serif" fill="#e0e0e0" font-weight="600">${value}${unit}</text>
        <text x="${cx}" y="${cy + Math.round(size * 0.26)}" text-anchor="middle" font-size="${Math.round(size * 0.1)}" font-family="sans-serif" fill="#8888a0">${label}</text>
      </svg>`
    }

    this.updateSize()
    this.translate()
  },

  confirmUpdate (flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER')) this.render()
    if (this.hasFlag(flags, 'RESIZE')) { this.updateSize(); this.resize(opt) }
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
  },

  updateSize () {
    const fo = this.vel.findOne('foreignObject')
    const { width, height } = this.model.size()
    fo.setAttribute('width', width)
    fo.setAttribute('height', height)
    this.body.setAttribute('width', width)
    this.body.setAttribute('height', height)
  }
})
