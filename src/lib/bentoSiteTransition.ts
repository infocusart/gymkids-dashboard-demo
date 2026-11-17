import { gsap } from 'gsap'
import { siteTiming } from './bentoSiteLayout'
import type { ValidityPixelRect } from './bentoValidityLayout'
import { validityRects } from './bentoValidityTransition'

export const freezeSiteDetails = (primary: HTMLElement) => {
  const details = primary.querySelector<HTMLElement>('.site-details')
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

interface SiteTransitionOptions {
  cards: HTMLElement[]
  grid: HTMLElement
  firstRects: Map<HTMLElement, ValidityPixelRect>
  firstChartHeight: number
  firstChartOpacity: number
  opening: boolean
  speed: number
  audit: boolean
}

export const createSiteTransition = ({ cards, grid, firstRects, firstChartHeight, firstChartOpacity, opening, speed, audit }: SiteTransitionOptions) => {
  const moving = cards.filter(card => [1, 6].includes(Number(card.dataset.focusCard)))
  const promo = cards.find(card => card.dataset.focusCard === '7')!
  const chart = grid.querySelector<HTMLElement>('.lead-chart')!
  const lastChartHeight = Number.parseFloat(getComputedStyle(chart).height)
  const lastChartOpacity = Number.parseFloat(getComputedStyle(chart).opacity)
  const lastRects = validityRects(cards, grid)
  const savedStyles = new Map([...moving, promo, chart].map(element => [element, element.getAttribute('style')]))
  const timeline = gsap.timeline({ paused: true })
  const reflowStart = opening ? siteTiming.promoFade / speed : 0
  const reflow = { duration: siteTiming.reflow / speed, ease: 'power3.inOut', autoRound: false }

  // Hide Promo in place before Site grows into it. Reveal only after Site
  // retracts on closing. Leads and Site share a clock, preserving their gap;
  // all six right-hand cards stay fixed and typography is never scaled.
  timeline.fromTo(promo, { autoAlpha: opening ? 1 : 0 }, {
    autoAlpha: opening ? 0 : 1,
    duration: siteTiming.promoFade / speed,
    ease: 'power2.inOut',
  }, opening ? 0 : siteTiming.reflow / speed)

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
        promo: { opacity: Number.parseFloat(getComputedStyle(promo).opacity), visibility: getComputedStyle(promo).visibility },
        chart: { height: chart.getBoundingClientRect().height, opacity: Number.parseFloat(getComputedStyle(chart).opacity) },
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
      grid.dataset.siteTrace = JSON.stringify({ opening, speed, frames })
    }
  }

  return { timeline, restore }
}
