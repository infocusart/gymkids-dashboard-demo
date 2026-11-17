import { gsap } from 'gsap'
import { conversionTiming } from './bentoConversionLayout'
import type { ValidityPixelRect } from './bentoValidityLayout'
import { validityRects } from './bentoValidityTransition'

interface ConversionTransitionOptions {
  cards: HTMLElement[]
  grid: HTMLElement
  firstRects: Map<HTMLElement, ValidityPixelRect>
  firstEmblemInset: number
  opening: boolean
  speed: number
  audit: boolean
}

export const createConversionTransition = ({ cards, grid, firstRects, firstEmblemInset, opening, speed, audit }: ConversionTransitionOptions) => {
  const primary = cards.find(card => card.dataset.focusCard === '3')!
  const forecast = cards.find(card => card.dataset.focusCard === '5')!
  const emblem = forecast.querySelector<HTMLElement>('.forecast-emblem')!
  const lastRects = validityRects(cards, grid)
  const lastEmblemInset = Number.parseFloat(getComputedStyle(emblem).right)
  const savedStyles = new Map([primary, forecast, emblem].map(element => [element, element.getAttribute('style')]))
  const timeline = gsap.timeline({ paused: true })
  const widthStart = opening ? 0 : (conversionTiming.height - conversionTiming.width) / speed

  // Animate actual dimensions on the same DOM nodes. All other cards remain
  // in their original grid cells, with no scaling, fading or secondary reflow.
  for (const card of [primary, forecast]) {
    card.style.setProperty('grid-column', '1 / -1', 'important')
    card.style.setProperty('grid-row', '1 / -1', 'important')
    gsap.set(card, { position: 'absolute', margin: 0, x: 0, y: 0, scale: 1, ...firstRects.get(card)! })
  }

  timeline.to(primary, {
    height: lastRects.get(primary)!.height,
    duration: conversionTiming.height / speed,
    ease: 'power3.inOut',
    autoRound: false,
  }, 0)
  timeline.to(forecast, {
    width: lastRects.get(forecast)!.width,
    duration: conversionTiming.width / speed,
    ease: opening ? 'power3.out' : 'power3.in',
    autoRound: false,
  }, widthStart)
  timeline.fromTo(emblem, { right: firstEmblemInset }, {
    right: lastEmblemInset,
    duration: conversionTiming.width / speed,
    ease: opening ? 'power3.out' : 'power3.in',
    autoRound: false,
  }, widthStart)

  const frames: unknown[] = []

  const capture = () => {
    if (audit && frames.length < 1200) {
      frames.push({
        t: timeline.time(),
        cards: Object.fromEntries([...validityRects(cards, grid)].map(([card, rect]) => [card.dataset.focusCard, rect])),
      })
    }
  }

  if (audit) {
    capture()
    timeline.eventCallback('onUpdate', capture)
  }

  const restore = () => {
    for (const [element, style] of savedStyles) {
      if (style === null)
        element.removeAttribute('style')
      else
        element.setAttribute('style', style)
    }
    if (audit) {
      capture()
      grid.dataset.conversionTrace = JSON.stringify({ opening, speed, frames })
    }
  }

  return { timeline, restore }
}
