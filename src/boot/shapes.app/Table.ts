import * as joint from '@clientio/rappid'
type Column = {
  label: string
  field: string
}

export class Table extends joint.dia.Element {
  defaults () {
    return joint.util.defaultsDeep({
      ...super.defaults,
      type: 'app.Table',
      size: { width: 240, height: 240 },
      columns: [
        { label: 'label1', field: 'field1' },
        { label: 'label2', field: 'field2' },
        { label: 'label3', field: 'field3' },
        { label: 'label4', field: 'field4' },
        { label: 'label5', field: 'field5' }
      ],
      rows: [
        { label1: '', label2: '', label3: '', label4: '', label5: '' },
        { label1: '', label2: '', label3: '', label4: '', label5: '' },
        { label1: '', label2: '', label3: '', label4: '', label5: '' },
        { label1: '', label2: '', label3: '', label4: '', label5: '' },
        { label1: '', label2: '', label3: '', label4: '', label5: '' },
        { label1: '', label2: '', label3: '', label4: '', label5: '' }
      ]
    }, super.defaults)

    // return {
    //   ...super.defaults,
    //   type: 'app.Table',
    //   size: { width: 240, height: 240 },
    //   columns: [
    //     { label: 'label1', field: 'field1' },
    //     { label: 'label2', field: 'field2' },
    //     { label: 'label3', field: 'field3' },
    //     { label: 'label4', field: 'field4' },
    //     { label: 'label5', field: 'field5' }
    //   ],
    //   rows: [
    //     { label1: '', label2: '', label3: '', label4: '', label5: '' },
    //     { label1: '', label2: '', label3: '', label4: '', label5: '' },
    //     { label1: '', label2: '', label3: '', label4: '', label5: '' },
    //     { label1: '', label2: '', label3: '', label4: '', label5: '' },
    //     { label1: '', label2: '', label3: '', label4: '', label5: '' },
    //     { label1: '', label2: '', label3: '', label4: '', label5: '' }
    //   ]
    // }
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
export const TableView = joint.dia.ElementView.extend({
  initFlag: ['RENDER', 'RESIZE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['RESIZE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM'],
    columns: ['RENDER'],
    rows: ['RENDER']
  },

  render () {
    const { model } = this
    const { util } = joint

    const markup = [{
      tagName: 'rect',
      selector: 'body',
      attributes: {
        stroke: 'transparent',
        fill: 'transparent',
        strokeWidth: 2
      }
    },
    {
      tagName: 'foreignObject',
      selector: 'foreignObject',
      attributes: {
        overflow: 'hidden',
        width: 120,
        height: 120
      },
      children: [
        {
          tagName: 'table',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          selector: 'table',
          attributes: {
            name: 'table'
          },
          style: {
            width: '100%',
            height: '100%'
          },
          children: [
            {
              tagName: 'tr',
              children: model.attributes.columns.map((e: Column) => ({
                tagName: 'th',
                attributes: {
                  'data-content': e.label
                }
              }))
            },
            ...model.attributes.rows.map((r:any) => ({
              tagName: 'tr',
              children: model.attributes.columns.map((e: Column) => ({
                tagName: 'td',
                attributes: {
                  'data-content': r[e.field] || 'Cell'
                }
              }))
            }))
          ]
        }
      ]
    }]
    const doc = util.parseDOMJSON(markup)
    this.body = doc.selectors.body
    this.el.innerHTML = ''
    this.el.appendChild(doc.fragment)
    this.updateSize()
    this.translate()
  },
  confirmUpdate (flags: number, opt: any) {
    if (this.hasFlag(flags, 'RENDER')) this.render()
    if (this.hasFlag(flags, 'RESIZE')) {
      this.updateSize()
      this.resize(opt)
    }
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
  },
  updateSize () {
    const foreignObject = this.vel.findOne('foreignObject')
    const size = this.model.size()
    foreignObject.setAttribute('width', size.width)
    foreignObject.setAttribute('height', size.height)
    this.body.setAttribute('width', size.width)
    this.body.setAttribute('height', size.height)
  }
})
