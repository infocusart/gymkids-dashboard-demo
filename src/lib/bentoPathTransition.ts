import { gsap } from 'gsap'
import { pathTiming } from './bentoPathLayout'
import type { ValidityPixelRect } from './bentoValidityLayout'
import { validityRects } from './bentoValidityTransition'

interface PathTransitionOptions {
  cards: HTMLElement[]
  grid: HTMLElement
  firstRects: Map<HTMLElement, ValidityPixelRect>
  firstEmblemTop: number
  firstScaleLeft: number
  opening: boolean
  speed: number
  audit: boolean
}

export const createPathTransition = ({ cards, grid, firstRects, firstEmblemTop, firstScaleLeft, opening, speed, audit }: PathTransitionOptions) => {
  const moving = cards.filter(card => [4, 5, 9].includes(Number(card.dataset.focusCard)))
  const trial = cards.find(card => card.dataset.focusCard === '8')!
  const forecast = cards.find(card => card.dataset.focusCard === '5')!
  const validity = cards.find(card => card.dataset.focusCard === '4')!
  const primary = cards.find(card => card.dataset.focusCard === '9')!
  const emblem = forecast.querySelector<HTMLElement>('.forecast-emblem')!
  const scale = forecast.querySelector<HTMLElement>('.forecast-scale')!
  const secondary = Array.from(grid.querySelectorAll<HTMLElement>('.forecast-copy p, .forecast-facts, .work-zone'))
  const lastRects = validityRects(cards, grid)
  const lastEmblemTop = Number.parseFloat(getComputedStyle(emblem).top)
  const lastScaleLeft = Number.parseFloat(getComputedStyle(scale).left)
  const savedStyles = new Map([...moving, trial, emblem, scale, ...secondary].map(element => [element, element.getAttribute('style')]))
  const timeline = gsap.timeline({ paused: true, defaults: { autoRound: false } })
  const reflow = { duration: pathTiming.reflow / speed, ease: 'power3.inOut' }

  // One progress keeps both upper cards exactly 12px above the growing Path.
  for (const card of moving) {
    card.style.setProperty('grid-column', '1 / -1', 'important')
    card.style.setProperty('grid-row', '1 / -1', 'important')
    gsap.set(card, { position: 'absolute', margin: 0, x: 0, y: 0, scale: 1, autoRound: false, ...firstRects.get(card)! })
    timeline.to(card, { ...lastRects.get(card)!, ...reflow }, 0)
  }

  timeline.fromTo(emblem, { top: firstEmblemTop }, { top: lastEmblemTop, ...reflow }, 0)
  timeline.fromTo(scale, { left: firstScaleLeft }, { left: lastScaleLeft, ...reflow }, 0)

  for (const element of [trial, ...secondary]) {
    const duration = element === trial ? pathTiming.trialFade : pathTiming.secondaryFade
    const start = opening ? 0 : (pathTiming.reflow - duration) / speed

    // Explicit initial visibility also keeps returning nodes hidden while Path
    // still occupies their space. Accessibility is guarded by the lifecycle.
    gsap.set(element, { autoAlpha: opening ? 1 : 0 })
    timeline.to(element, { autoAlpha: opening ? 0 : 1, duration: duration / speed, ease: 'power1.inOut' }, start)
  }

  const frames: unknown[] = []

  const capture = () => {
    if (audit && frames.length < 1200) {
      const content = [
        [forecast, '.forecast-copy h2, .forecast-value strong, .forecast-value > span, .forecast-copy p, .forecast-facts, .forecast-emblem, .forecast-scale'],
        [validity, '.quality-value, .quality-states, .quality-reasons, .work-zone'],
        [primary, '.path-heading, .path-map'],
      ] as const

      frames.push({
        t: timeline.time(),
        cards: Object.fromEntries([...validityRects(cards, grid)].map(([card, rect]) => [card.dataset.focusCard, { ...rect, opacity: Number.parseFloat(getComputedStyle(card).opacity) }])),
        content: content.flatMap(([card, selector]) => {
          const parent = card.getBoundingClientRect()

          return Array.from(card.querySelectorAll<HTMLElement>(selector)).map(element => {
            const rect = element.getBoundingClientRect()

            return {
              card: card.dataset.focusCard,
              name: element.className || element.tagName,
              left: rect.left - parent.left,
              top: rect.top - parent.top,
              width: rect.width,
              height: rect.height,
              opacity: Number.parseFloat(getComputedStyle(element).opacity),
            }
          })
        }),
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
      grid.dataset.pathTrace = JSON.stringify({ opening, speed, frames })
    }
  }

  return { timeline, restore }
}
