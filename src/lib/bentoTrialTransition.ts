import { gsap } from 'gsap'
import { trialTiming } from './bentoTrialLayout'
import type { ValidityPixelRect } from './bentoValidityLayout'
import { validityRects } from './bentoValidityTransition'
import { trialContentRects } from './bentoTrialContent'

interface TrialTransitionOptions {
  cards: HTMLElement[]
  grid: HTMLElement
  firstRects: Map<HTMLElement, ValidityPixelRect>
  firstEmblemInset: number
  firstTrialContent: Map<HTMLElement, ValidityPixelRect> | null
  opening: boolean
  speed: number
  audit: boolean
}

export const createTrialTransition = ({ cards, grid, firstRects, firstEmblemInset, firstTrialContent, opening, speed, audit }: TrialTransitionOptions) => {
  const primary = cards.find(card => card.dataset.focusCard === '8')!
  const forecast = cards.find(card => card.dataset.focusCard === '5')!
  const emblem = forecast.querySelector<HTMLElement>('.forecast-emblem')!
  const lastRects = validityRects(cards, grid)
  const lastEmblemInset = Number.parseFloat(getComputedStyle(emblem).right)
  const lastTrialContent = firstTrialContent ? trialContentRects(primary) : null
  const savedStyles = new Map([primary, forecast, emblem, ...(firstTrialContent?.keys() ?? [])].map(element => [element, element.getAttribute('style')]))
  const timeline = gsap.timeline({ paused: true, defaults: { autoRound: false } })
  const reflowStart = opening ? 0 : (trialTiming.height - trialTiming.reflow) / speed
  const reflow = { duration: trialTiming.reflow / speed, ease: opening ? 'power3.out' : 'power3.in' }

  for (const card of [primary, forecast]) {
    card.style.setProperty('grid-column', '1 / -1', 'important')
    card.style.setProperty('grid-row', '1 / -1', 'important')
    gsap.set(card, { position: 'absolute', margin: 0, x: 0, y: 0, scale: 1, autoRound: false, ...firstRects.get(card)! })
  }

  // Top and height share exactly one progress, keeping Trial's bottom fixed.
  // Forecast clears its corner early, while Trial starts growing immediately.
  timeline.to(primary, {
    ...lastRects.get(primary)!, duration: trialTiming.height / speed, ease: 'power3.inOut',
  }, 0)
  timeline.to(forecast, { ...lastRects.get(forecast)!, ...reflow }, reflowStart)
  timeline.fromTo(emblem, { right: firstEmblemInset }, { right: lastEmblemInset, ...reflow }, reflowStart)

  // Closing uses measured content tracks as well as the card track. Otherwise
  // justify-content: space-between redistributes the rows before the card shrinks.
  if (firstTrialContent && lastTrialContent) {
    for (const [element, first] of firstTrialContent) {
      gsap.set(element, { position: 'absolute', margin: 0, autoRound: false, ...first })
      timeline.to(element, {
        ...lastTrialContent.get(element)!, duration: trialTiming.height / speed, ease: 'power3.inOut',
      }, 0)
    }
  }

  const frames: unknown[] = []

  const capture = () => {
    if (audit && frames.length < 1200) {
      const forecastRect = forecast.getBoundingClientRect()

      frames.push({
        t: timeline.time(),
        cards: Object.fromEntries([...validityRects(cards, grid)].map(([card, rect]) => [card.dataset.focusCard, rect])),
        trialContent: Object.fromEntries([...trialContentRects(primary)].map(([element, rect]) => [element.className, rect])),
        detailsOpacity: primary.querySelector('.trial-details') ? Number.parseFloat(getComputedStyle(primary.querySelector('.trial-details')!).opacity) : null,
        content: Array.from(forecast.querySelectorAll<HTMLElement>('.forecast-copy h2, .forecast-value strong, .forecast-value > span, .forecast-copy p, .forecast-facts, .forecast-emblem, .forecast-scale')).map(element => {
          const rect = element.getBoundingClientRect()

          return {
            name: element.className || element.tagName,
            left: rect.left - forecastRect.left,
            top: rect.top - forecastRect.top,
            width: rect.width,
            height: rect.height,
          }
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
      grid.dataset.trialTrace = JSON.stringify({ opening, speed, frames })
    }
  }

  return { timeline, restore }
}
