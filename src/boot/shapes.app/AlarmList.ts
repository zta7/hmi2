import * as joint from '@clientio/rappid'

export class AlarmList extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.AlarmList',
      size: { width: 320, height: 200 },
      alarms: [] as Array<{ time: string; level: string; message: string; ack: boolean }>
    }
  }
}

export const AlarmListView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    alarms: ['RENDER']
  },

  render () {
    const { model } = this
    const { util } = joint
    const { alarms } = model.attributes

    const levelColor = (level: string) => {
      if (level === 'critical') return '#C10015'
      if (level === 'warning') return '#F2C037'
      return '#4a9eff'
    }

    const rows = alarms.length > 0
      ? alarms.map((a: any) => `
          <tr style="border-bottom:1px solid #333350;">
            <td style="padding:3px 6px;color:${levelColor(a.level)};font-size:10px;white-space:nowrap;">${a.time || '--'}</td>
            <td style="padding:3px 6px;color:${levelColor(a.level)};font-size:10px;font-weight:600;">${a.level || 'info'}</td>
            <td style="padding:3px 6px;color:#e0e0e0;font-size:10px;flex:1;">${a.message || ''}</td>
            <td style="padding:3px 6px;color:${a.ack ? '#21BA45' : '#F2C037'};font-size:10px;">${a.ack ? '✓' : '!'}</td>
          </tr>`).join('')
      : `<tr><td colspan="4" style="padding:8px;text-align:center;color:#8888a0;font-size:11px;">No alarms</td></tr>`

    const markup = [
      {
        tagName: 'rect',
        selector: 'body',
        attributes: { stroke: 'transparent', fill: 'transparent' }
      },
      {
        tagName: 'foreignObject',
        selector: 'foreignObject',
        attributes: { overflow: 'hidden', width: 320, height: 200 }
      }
    ]

    const doc = util.parseDOMJSON(markup)
    this.body = doc.selectors.body
    this.el.innerHTML = ''
    this.el.appendChild(doc.fragment)

    const fo = this.el.querySelector('foreignObject')
    if (fo) {
      fo.innerHTML = `
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:#1e1e32;border:1px solid #3d3d60;border-radius:4px;overflow:hidden;box-sizing:border-box;display:flex;flex-direction:column;box-shadow:0 4px 16px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.05);">
          <div style="padding:4px 8px;background:#252540;border-bottom:1px solid #333350;font-size:10px;font-weight:600;color:#8888a0;text-transform:uppercase;letter-spacing:0.5px;flex-shrink:0;">
            Alarm List
          </div>
          <div style="overflow-y:auto;flex:1;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#252540;">
                  <th style="padding:3px 6px;text-align:left;font-size:9px;color:#8888a0;font-weight:600;">Time</th>
                  <th style="padding:3px 6px;text-align:left;font-size:9px;color:#8888a0;font-weight:600;">Level</th>
                  <th style="padding:3px 6px;text-align:left;font-size:9px;color:#8888a0;font-weight:600;">Message</th>
                  <th style="padding:3px 6px;text-align:left;font-size:9px;color:#8888a0;font-weight:600;">Ack</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>`
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
