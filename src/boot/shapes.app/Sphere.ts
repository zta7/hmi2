/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class Sphere extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Sphere',
      attrs: {
        body: {
          width: 'calc(w)',
          height: 'calc(h)',
          fill: 'transparent'
        },
        item: {
          width: 'calc(w)',
          height: 'calc(h)'
        }
      }
    }
  }

  preinitialize () {
    this.markup = joint.util.svg/* xml */`
    <rect @selector="body"/>
    <svg @selector="item" t="1689916566214" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1513">
      <path d="M890.24 578.72C824.48 633.76 679.84 672 512 672s-312.48-38.24-378.24-93.28C165.344 758.976 322.688 896 512 896s346.656-137.024 378.24-317.28zM128 512c0 62.336 170.72 128 384 128s384-65.664 384-128c0-8.352-0.256-16.672-0.8-24.896l-6.112 3.904c-13.312-20.928-44.48-42.464-89.92-60.512l11.808-29.76c32.544 12.928 59.456 28 79.264 44.544C858.656 265.024 701.312 128 512 128S165.344 265.024 133.76 445.28a250.624 250.624 0 0 1 49.92-31.52l14.144 28.672c-43.2 21.312-66.56 44.96-69.504 65.088H128V512z m560-145.024l-5.664 31.488a935.872 935.872 0 0 0-123.008-13.408l1.408-31.968c45.024 2.016 87.808 6.816 127.264 13.888z m-255.968-12.032l2.4 31.904c-43.264 3.264-84.48 9.184-122.24 17.504l-6.88-31.232a905.472 905.472 0 0 1 126.72-18.176zM512 928C282.24 928 96 741.76 96 512S282.24 96 512 96s416 186.24 416 416-186.24 416-416 416z" fill="#2c2c2c" p-id="1514">
      </path>
    </svg>`
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
