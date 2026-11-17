import { Flip } from 'gsap/Flip'
import { gsap } from 'gsap'
import { validityTiming } from './bentoValidityLayout'
import type { ValidityPixelRect } from './bentoValidityLayout'

export const validityRects = (cards: HTMLElement[], grid: HTMLElement) => {
  const origin = grid.getBoundingClientRect()

  return new Map(cards.map(card => {
    const rect = card.getBoundingClientRect()

    return [card, {
      left: rect.left - origin.left,
      top: rect.top - origin.top,
      width: rect.width,
      height: rect.height,
    } satisfies ValidityPixelRect]
  }))
}

interface ValidityTransitionOptions {
  cards: HTMLElement[]
  grid: HTMLElement
  firstState: Flip.FlipState
  firstRects: Map<HTMLElement, ValidityPixelRect>
  opening: boolean
  speed: number
  audit: boolean
}

export const createValidityTransition = ({ cards, grid, firstState, firstRects, opening, speed, audit }: ValidityTransitionOptions) => {
  const lastRects = validityRects(cards, grid)
  const savedStyles = new Map(cards.map(card => [card, card.getAttribute('style')]))
  const timeline = gsap.timeline({ paused: true })
  const neighbors = cards.filter(card => card.dataset.focusCard !== '4')
  const primary = cards.find(card => card.dataset.focusCard === '4')!
  const expansionDetails = Array.from(primary.querySelectorAll<HTMLElement>('.quality-expansion-only'))
  const total = validityTiming.heightStart + validityTiming.height
  const horizontalStart = opening ? 0 : (total - validityTiming.reflow) / speed
  const flipVars = { absolute: true, scale: false, simple: true, prune: true, ease: 'power3.inOut', duration: validityTiming.reflow / speed }

  // These remain genuine Flip transitions: preserve DOM identity and animate
  // actual width/height rather than scaling the typography. Sources and
  // Conversion keep their order and full height, without folding or fading.
  timeline.add(Flip.from(firstState, { ...flipVars, targets: neighbors }), horizontalStart)

  // Widen alongside every neighbor from the same clock, not after them.
  // Only vertical growth waits for Path to clear the lower-right corner.
  // The return mirrors these overlapping tracks rather than crossing cards.
  const first = firstRects.get(primary)!
  const last = lastRects.get(primary)!

  primary.style.setProperty('grid-column', '1 / -1', 'important')
  primary.style.setProperty('grid-row', '1 / -1', 'important')
  gsap.set(primary, { position: 'absolute', margin: 0, x: 0, y: 0, scale: 1, ...first })
  timeline.to(primary, {
    left: last.left,
    top: last.top,
    width: last.width,
    autoRound: false,
    ease: flipVars.ease,
    duration: flipVars.duration,
  }, horizontalStart)
  timeline.to(primary, {
    height: last.height,
    autoRound: false,
    ease: 'power2.inOut',
    duration: validityTiming.height / speed,
  }, opening ? validityTiming.heightStart / speed : 0)

  if (opening) {
    gsap.set(expansionDetails, { autoAlpha: 0, y: 6 })
    timeline.to(expansionDetails, {
      autoAlpha: 1,
      y: 0,
      duration: 0.24 / speed,
      ease: 'power2.out',
      stagger: 0.045 / speed,
    }, 0.34 / speed)
  }
  else {
    timeline.to(expansionDetails, {
      autoAlpha: 0,
      y: 4,
      duration: 0.16 / speed,
      ease: 'power1.out',
    }, 0)
  }

  const frames: unknown[] = []

  const capture = () => {
    if (!audit || frames.length >= 1200)
      return

    frames.push({
      t: timeline.time(),
      cards: Object.fromEntries([...validityRects(cards, grid)].map(([card, rect]) => [card.dataset.focusCard, rect])),
    })
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
      grid.dataset.validityTrace = JSON.stringify({ opening, speed, frames })
    }
  }

  return { timeline, restore }
}
