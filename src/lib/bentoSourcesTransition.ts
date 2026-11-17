import { gsap } from 'gsap'
import { sourcesTiming } from './bentoSourcesLayout'
import type { ValidityPixelRect } from './bentoValidityLayout'
import { validityRects } from './bentoValidityTransition'

// Coordinates relative to each element's positioned parent, not the viewport.
// This lets the real text move without scaling or duplicating its DOM nodes.
export const sourcesContentRects = (grid: HTMLElement) => new Map(
  Array.from(grid.querySelectorAll<HTMLElement>('.forecast-copy h2, .forecast-value, .forecast-copy p, .forecast-facts, .forecast-emblem, .forecast-scale')).map(element => {
    const rect = element.getBoundingClientRect()
    const parent = element.offsetParent as HTMLElement
    const parentRect = parent.getBoundingClientRect()

    return [element, {
      left: rect.left - parentRect.left - parent.clientLeft,
      top: rect.top - parentRect.top - parent.clientTop,
      width: rect.width,
      height: rect.height,
    }]
  }),
)

interface SourcesTransitionOptions {
  cards: HTMLElement[]
  grid: HTMLElement
  firstRects: Map<HTMLElement, ValidityPixelRect>
  firstContent: ReturnType<typeof sourcesContentRects>
  opening: boolean
  speed: number
  audit: boolean
}

export const createSourcesTransition = ({ cards, grid, firstRects, firstContent, opening, speed, audit }: SourcesTransitionOptions) => {
  const primary = cards.find(card => card.dataset.focusCard === '2')!
  const forecast = cards.find(card => card.dataset.focusCard === '5')!
  const lastRects = validityRects(cards, grid)
  const lastContent = sourcesContentRects(grid)
  const savedStyles = new Map([primary, forecast, ...firstContent.keys()].map(element => [element, element.getAttribute('style')]))
  const timeline = gsap.timeline({ paused: true, defaults: { autoRound: false } })
  const reflowStart = opening ? 0 : (sourcesTiming.height - sourcesTiming.reflow) / speed

  for (const card of [primary, forecast]) {
    card.style.setProperty('grid-column', '1 / -1', 'important')
    card.style.setProperty('grid-row', '1 / -1', 'important')
    gsap.set(card, { position: 'absolute', margin: 0, x: 0, y: 0, scale: 1, ...firstRects.get(card)! })
  }

  // Same clock, no delayed primary. The narrower Forecast moves right fast
  // enough to clear the growing Sources, while its right edge stays fixed.
  timeline.to(primary, {
    height: lastRects.get(primary)!.height,
    duration: sourcesTiming.height / speed,
    ease: 'power3.inOut',
    autoRound: false,
  }, 0)
  timeline.to(forecast, {
    ...lastRects.get(forecast)!,
    duration: sourcesTiming.reflow / speed,
    ease: opening ? 'power3.out' : 'power3.in',
    autoRound: false,
  }, reflowStart)

  for (const [element, firstRect] of firstContent) {
    const lastRect = lastContent.get(element)!
    const secondary = element.matches('.forecast-copy p, .forecast-facts')
    const heading = element.matches('h2')

    gsap.set(element, {
      position: 'absolute',
      margin: 0,
      right: 'auto',
      bottom: 'auto',
      autoRound: false,
      ...(secondary && !opening ? lastRect : firstRect),
      autoAlpha: secondary && !opening ? 0 : 1,
    })

    if (secondary) {
      // Hide before the text would clip, reveal only after full width returns.
      timeline.to(element, {
        autoAlpha: opening ? 0 : 1, duration: 0.06 / speed, ease: 'power1.inOut',
      }, opening ? 0 : (sourcesTiming.height - 0.06) / speed)
    }
    else if (heading) {
      // A line wrap is discrete. Crossfade that change instead of stretching
      // the font or making the number underneath jump by one line.
      timeline.to(element, { autoAlpha: 0, duration: 0.1 / speed }, reflowStart)
      timeline.set(element, lastRect, reflowStart + 0.26 / speed)
      timeline.to(element, { autoAlpha: 1, duration: 0.08 / speed }, reflowStart + 0.26 / speed)
    }
    else if (element.matches('.forecast-emblem')) {
      const paragraph = forecast.querySelector<HTMLElement>('.forecast-copy p')!
      const overview = opening ? firstRect : lastRect
      const compact = opening ? lastRect : firstRect

      const bridgeLeft = (paragraph.offsetParent as HTMLElement).offsetLeft
        + Math.max(firstContent.get(paragraph)!.width, lastContent.get(paragraph)!.width) + 4

      // Route around the number: stay to its right while secondary text fades,
      // then descend before moving beneath it. Return follows the same arc.
      if (opening) {
        timeline.to(element, { left: bridgeLeft, duration: 0.06 / speed, ease: 'power3.out' }, 0)
        timeline.to(element, { left: compact.left, duration: 0.28 / speed, ease: 'power3.out' }, 0.06 / speed)
        timeline.to(element, { top: compact.top, duration: 0.08 / speed, ease: 'power3.out' }, 0.06 / speed)
      }
      else {
        timeline.to(element, { left: bridgeLeft, duration: 0.28 / speed, ease: 'power3.in' }, reflowStart)
        timeline.to(element, { top: overview.top, duration: 0.08 / speed, ease: 'power3.in' }, reflowStart + 0.2 / speed)
        timeline.to(element, { left: overview.left, duration: 0.06 / speed, ease: 'power3.in' }, reflowStart + 0.28 / speed)
      }
    }
    else {
      timeline.to(element, {
        ...lastRect,
        duration: sourcesTiming.reflow / speed,
        ease: opening ? 'power3.out' : 'power3.in',
        autoRound: false,
      }, reflowStart)
    }
  }

  const frames: unknown[] = []

  const capture = () => {
    if (audit && frames.length < 1200) {
      frames.push({
        t: timeline.time(),
        cards: Object.fromEntries([...validityRects(cards, grid)].map(([card, rect]) => [card.dataset.focusCard, rect])),
        content: Object.fromEntries([...firstContent.keys(), ...forecast.querySelectorAll<HTMLElement>('.forecast-value strong, .forecast-value > span')].map(element => {
          const rect = element.getBoundingClientRect()
          const cardRect = forecast.getBoundingClientRect()

          const key = element.matches('.forecast-value strong')
            ? 'value-number'
            : element.matches('.forecast-value > span')
              ? 'value-unit'
              : element.matches('h2') ? 'heading' : element.matches('p') ? 'explanation' : element.className

          return [key, {
            left: rect.left - cardRect.left,
            top: rect.top - cardRect.top,
            width: rect.width,
            height: rect.height,
            opacity: Number.parseFloat(getComputedStyle(element).opacity),
          }]
        })),
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
      grid.dataset.sourcesTrace = JSON.stringify({ opening, speed, frames })
    }
  }

  return { timeline, restore }
}
