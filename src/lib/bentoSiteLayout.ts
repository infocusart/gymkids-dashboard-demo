import type { BentoFocusCardId, BentoFocusRect } from './bentoFocusLayouts'

// Leads compact above Site; hidden Promo releases the rest of the left column.
export const siteFocusLayout: Record<BentoFocusCardId, BentoFocusRect> = {
  1: { x: 0, y: 0, w: 3, h: 1 },
  2: { x: 3, y: 0, w: 4, h: 1 },
  3: { x: 7, y: 0, w: 2, h: 1 },
  4: { x: 9, y: 0, w: 3, h: 3 },
  5: { x: 3, y: 1, w: 6, h: 2 },
  6: { x: 0, y: 1, w: 3, h: 3 },
  7: { x: 0, y: 3, w: 3, h: 0 },
  8: { x: 3, y: 3, w: 3, h: 1 },
  9: { x: 6, y: 3, w: 6, h: 1 },
}

export const siteTiming = { reflow: 0.65, promoFade: 0.16 } as const
