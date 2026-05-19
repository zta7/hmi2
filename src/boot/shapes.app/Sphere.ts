/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class Sphere extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Sphere',
      color: '#f2c037',
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
    <svg @selector="item" viewBox="0 0 36 36" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sphereGrad3" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#fff9e6"/>
          <stop offset="30%" stop-color="#f2c037"/>
          <stop offset="70%" stop-color="#d4a017"/>
          <stop offset="100%" stop-color="#a88000"/>
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="16" fill="url(#sphereGrad3)"/>
    </svg>`
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
