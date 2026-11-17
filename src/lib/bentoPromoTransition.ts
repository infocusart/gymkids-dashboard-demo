import { gsap } from 'gsap'
import { promoTiming } from './bentoPromoLayout'
import type { ValidityPixelRect } from './bentoValidityLayout'
import { validityRects } from './bentoValidityTransition'

export const freezePromoDetails = (primary: HTMLElement) => {
  const details = primary.querySelector<HTMLElement>('.promo-details')
  if (!details)
    return
  const origin = primary.getBoundingClientRect()
  const rect = details.getBoundingClientRect()

  Object.assign(details.style, {
    position: 'absolute',
    left: `${rect.left - origin.left - primary.clientLeft}px`,
    top: `${rect.top - origin.top - primary.clientTop}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
  })
  details.setAttribute('inert', '')
}

interface PromoTransitionOptions {
  cards: HTMLElement[]
  grid: HTMLElement
  firstRects: Map<HTMLElement, ValidityPixelRect>
  firstChartHeight: number
  firstChartOpacity: number
  opening: boolean
  speed: number
  audit: boolean
}

export const createPromoTransition = ({ cards, grid, firstRects, firstChartHeight, firstChartOpacity, opening, speed, audit }: PromoTransitionOptions) => {
  const moving = cards.filter(card => [1, 7].includes(Number(card.dataset.focusCard)))
  const site = cards.find(card => card.dataset.focusCard === '6')!
  const chart = grid.querySelector<HTMLElement>('.lead-chart')!
  const lastChartHeight = Number.parseFloat(getComputedStyle(chart).height)
  const lastChartOpacity = Number.parseFloat(getComputedStyle(chart).opacity)
  const lastRects = validityRects(cards, grid)
  const savedStyles = new Map([...moving, site, chart].map(element => [element, element.getAttribute('style')]))
  const timeline = gsap.timeline({ paused: true })
  const reflow = { duration: promoTiming.reflow / speed, ease: 'power3.inOut', autoRound: false }
  const reflowStart = opening ? promoTiming.siteFade / speed : 0

  // Clear Site before Promo crosses it. On return, reveal it only after
  // Promo has cleared its original rectangle; never squeeze its text.
  timeline.fromTo(site, { autoAlpha: opening ? 1 : 0 }, {
    autoAlpha: opening ? 0 : 1,
    duration: promoTiming.siteFade / speed,
    ease: 'power2.inOut',
  }, opening ? 0 : promoTiming.reflow / speed)

  // A single progress value preserves the clear left column and fixed bottom
  // throughout opening AND return. Typography is never scaled.
  for (const card of moving) {
    card.style.setProperty('grid-column', '1 / -1', 'important')
    card.style.setProperty('grid-row', '1 / -1', 'important')
    gsap.set(card, { position: 'absolute', margin: 0, x: 0, y: 0, scale: 1, ...firstRects.get(card)! })
    timeline.to(card, { ...lastRects.get(card)!, ...reflow }, reflowStart)
  }

  timeline.fromTo(chart, { height: firstChartHeight, opacity: firstChartOpacity }, {
    height: lastChartHeight,
    opacity: lastChartOpacity,
    ...reflow,
  }, reflowStart)

  const frames: unknown[] = []

  const capture = () => {
    if (audit && frames.length < 1200) {
      frames.push({
        t: timeline.time(),
        cards: Object.fromEntries([...validityRects(cards, grid)].map(([card, rect]) => [card.dataset.focusCard, rect])),
        chart: { height: chart.getBoundingClientRect().height, opacity: Number.parseFloat(getComputedStyle(chart).opacity) },
        site: { opacity: Number.parseFloat(getComputedStyle(site).opacity), visibility: getComputedStyle(site).visibility },
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
      grid.dataset.promoTrace = JSON.stringify({ opening, speed, frames })
    }
  }

  return { timeline, restore }
}
