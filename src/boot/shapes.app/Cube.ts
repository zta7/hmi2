/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class Cube extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Cube',
      color: '#4a9eff',
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
        <linearGradient id="cubeFrontGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#7ebbff"/>
          <stop offset="100%" stop-color="#3a85e6"/>
        </linearGradient>
        <linearGradient id="cubeTopGrad4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#99ccff"/>
          <stop offset="100%" stop-color="#4a9eff"/>
        </linearGradient>
        <linearGradient id="cubeSideGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2d6bc9"/>
          <stop offset="100%" stop-color="#1a4a96"/>
        </linearGradient>
      </defs>
      <polygon points="6,10 26,10 26,30 6,30" fill="url(#cubeFrontGrad4)" stroke="#1a4a96" stroke-width="1"/>
      <polygon points="6,10 26,10 30,6 10,6" fill="url(#cubeTopGrad4)" stroke="#1a4a96" stroke-width="1"/>
      <polygon points="26,10 26,30 30,26 30,6" fill="url(#cubeSideGrad4)" stroke="#1a4a96" stroke-width="1"/>
    </svg>
    `
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
