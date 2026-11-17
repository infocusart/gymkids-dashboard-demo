import type { BentoFocusCardId, BentoFocusRect } from './bentoFocusLayouts'

// Trial keeps its overview cell in the DOM, but yields its space while hidden.
export const pathVisibleCardIds: BentoFocusCardId[] = [1, 2, 3, 4, 5, 6, 7, 9]

export const pathFocusLayout: Record<BentoFocusCardId, BentoFocusRect> = {
  1: { x: 0, y: 0, w: 3, h: 2 },
  2: { x: 3, y: 0, w: 4, h: 1 },
  3: { x: 7, y: 0, w: 2, h: 1 },
  4: { x: 9, y: 0, w: 3, h: 2 },
  5: { x: 3, y: 1, w: 6, h: 1 },
  6: { x: 0, y: 2, w: 3, h: 1 },
  7: { x: 0, y: 3, w: 3, h: 1 },
  8: { x: 3, y: 3, w: 3, h: 1 },
  9: { x: 3, y: 2, w: 9, h: 2 },
}

export const pathTiming = { reflow: 0.85, trialFade: 0.12, secondaryFade: 0.16 } as const
