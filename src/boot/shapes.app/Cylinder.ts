/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class Cylinder extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Cylinder',
      color: '#00c4b4',
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
        <linearGradient id="cylGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00e6d0"/>
          <stop offset="30%" stop-color="#00c4b4"/>
          <stop offset="70%" stop-color="#00a399"/>
          <stop offset="100%" stop-color="#008077"/>
        </linearGradient>
        <linearGradient id="cylTopGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00d4c4"/>
          <stop offset="100%" stop-color="#00a399"/>
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="28" height="20" rx="4" fill="url(#cylGrad2)"/>
      <ellipse cx="18" cy="8" rx="14" ry="4" fill="url(#cylTopGrad2)"/>
      <ellipse cx="18" cy="28" rx="14" ry="4" fill="#008077"/>
    </svg>
    `
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
