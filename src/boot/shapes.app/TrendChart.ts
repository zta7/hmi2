import * as joint from '@clientio/rappid'

// TrendChart: real-time line chart, data pushed via bind variable
export class TrendChart extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.TrendChart',
      size: { width: 300, height: 150 },
      data: [] as number[],
      maxPoints: 60,
      min: 0,
      max: 100,
      lineColor: '#4a9eff',
      label: 'Trend'
    }
  }
}

export const TrendChartView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    data: ['RENDER'],
    min: ['RENDER'],
    max: ['RENDER'],
    lineColor: ['RENDER'],
    label: ['RENDER']
  },

  render () {
    const { model } = this
    const { util } = joint
    const { data, min, max, lineColor, label } = model.attributes
    const { width, height } = model.size()

    const pad = { top: 8, right: 8, bottom: 20, left: 30 }
    const w = width - pad.left - pad.right
    const h = height - pad.top - pad.bottom

    let polyline = ''
    let areaFill = ''
    if (data.length > 1) {
      const pts = data.map((v: number, i: number) => {
        const x = pad.left + (i / (data.length - 1)) * w
        const y = pad.top + h - ((v - min) / (max - min)) * h
        return `${x},${y}`
      })
      const baseY = pad.top + h
      areaFill = `<path d="M ${pad.left} ${baseY} L ${pts.join(' L ')} L ${pad.left + w} ${baseY} Z" fill="${lineColor}" fill-opacity="0.12"/>`
      polyline = `<polyline points="${pts.join(' ')}" fill="none" stroke="${lineColor}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`
    }

    // Y axis labels
    const yLabels = [min, Math.round((min + max) / 2), max].map((v, i) => {
      const y = pad.top + h - (i / 2) * h
      return `<text x="${pad.left - 4}" y="${y + 4}" text-anchor="end" font-size="8" fill="#8888a0">${v}</text>`
    }).join('')

    const svgContent = `
      <rect width="${width}" height="${height}" fill="#1e1e32" rx="4"/>
      <rect width="${width}" height="${height}" fill="none" rx="4" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <rect x="${pad.left}" y="${pad.top}" width="${w}" height="${h}" fill="#16162a"/>
      <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + h}" stroke="#333350" stroke-width="1"/>
      <line x1="${pad.left}" y1="${pad.top + h}" x2="${pad.left + w}" y2="${pad.top + h}" stroke="#333350" stroke-width="1"/>
      ${yLabels}
      ${areaFill}
      ${polyline}
      <text x="${pad.left + w / 2}" y="${height - 4}" text-anchor="middle" font-size="9" fill="#8888a0">${label}</text>
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
        attributes: { overflow: 'hidden', width, height }
      }
    ]

    const doc = util.parseDOMJSON(markup)
    this.body = doc.selectors.body
    this.el.innerHTML = ''
    this.el.appendChild(doc.fragment)

    const fo = this.el.querySelector('foreignObject')
    if (fo) {
      fo.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${svgContent}</svg>`
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
