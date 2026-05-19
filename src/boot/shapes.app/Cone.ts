/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as joint from '@clientio/rappid'

export class Cone extends joint.dia.Element {
  defaults () {
    return {
      ...super.defaults,
      type: 'app.Cone',
      color: '#e15656',
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
        <linearGradient id="coneBodyGrad5" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ff6b6b"/>
          <stop offset="30%" stop-color="#f08080"/>
          <stop offset="60%" stop-color="#e15656"/>
          <stop offset="100%" stop-color="#b03a3a"/>
        </linearGradient>
        <linearGradient id="coneBaseGrad5" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#d45a5a"/>
          <stop offset="40%" stop-color="#b03a3a"/>
          <stop offset="100%" stop-color="#8b1a1a"/>
        </linearGradient>
      </defs>
      <ellipse cx="18" cy="28" rx="14" ry="5" fill="url(#coneBaseGrad5)" stroke="#6b1010" stroke-width="0.5"/>
      <path d="M18 2 L32 28 A14 5 0 0 0 4 28 Z" fill="url(#coneBodyGrad5)"/>
    </svg>
    `
  }

  initialize (...args: any[]) {
    super.initialize.call(this, ...args)
  }
}
