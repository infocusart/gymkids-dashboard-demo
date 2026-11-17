import type { BentoFocusCardId, BentoFocusRect } from './bentoFocusLayouts'

// Keep the four overview tracks and every right-side edge unchanged.
// Site has no visible footprint while Promo owns the full left column below Leads.
export const promoFocusLayout: Record<BentoFocusCardId, BentoFocusRect> = {
  1: { x: 0, y: 0, w: 3, h: 1 },
  2: { x: 3, y: 0, w: 4, h: 1 },
  3: { x: 7, y: 0, w: 2, h: 1 },
  4: { x: 9, y: 0, w: 3, h: 3 },
  5: { x: 3, y: 1, w: 6, h: 2 },
  6: { x: 0, y: 2, w: 3, h: 0 },
  7: { x: 0, y: 1, w: 3, h: 3 },
  8: { x: 3, y: 3, w: 3, h: 1 },
  9: { x: 6, y: 3, w: 6, h: 1 },
}

export const promoTiming = { reflow: 0.65, siteFade: 0.16 } as const
