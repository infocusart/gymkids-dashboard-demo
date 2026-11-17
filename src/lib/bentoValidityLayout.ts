import type { BentoFocusCardId, BentoFocusRect } from './bentoFocusLayouts'

// Owner's Figma 3:51, with the later correction to preserve the top-card order.
// Normalized to the existing 12 columns / 12px gaps.
// Unlike the old focus lab, these row spans address the original FOUR rows.
export const validityFocusLayout: Record<BentoFocusCardId, BentoFocusRect> = {
  1: { x: 0, y: 0, w: 3, h: 2 },
  2: { x: 3, y: 0, w: 3, h: 1 },
  3: { x: 6, y: 0, w: 2, h: 1 },
  4: { x: 8, y: 0, w: 4, h: 4 },
  5: { x: 3, y: 1, w: 5, h: 2 },
  6: { x: 0, y: 2, w: 3, h: 1 },
  7: { x: 0, y: 3, w: 2, h: 1 },
  8: { x: 2, y: 3, w: 2, h: 1 },
  9: { x: 4, y: 3, w: 4, h: 1 },
}

export interface ValidityPixelRect {
  left: number
  top: number
  width: number
  height: number
}

export const validityTiming = {
  reflow: 0.65,
  height: 0.45,
  heightStart: 0.4,
} as const
