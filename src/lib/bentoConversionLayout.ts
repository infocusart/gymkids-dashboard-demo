import type { BentoFocusCardId, BentoFocusRect } from './bentoFocusLayouts'

// Figma supplies the endpoint only. Keep the original four unequal rows,
// content, Sources/Conversion order and all seven unaffected cards.
export const conversionFocusLayout: Record<BentoFocusCardId, BentoFocusRect> = {
  1: { x: 0, y: 0, w: 3, h: 2 },
  2: { x: 3, y: 0, w: 4, h: 1 },
  3: { x: 7, y: 0, w: 2, h: 3 },
  4: { x: 9, y: 0, w: 3, h: 3 },
  5: { x: 3, y: 1, w: 4, h: 2 },
  6: { x: 0, y: 2, w: 3, h: 1 },
  7: { x: 0, y: 3, w: 3, h: 1 },
  8: { x: 3, y: 3, w: 3, h: 1 },
  9: { x: 6, y: 3, w: 6, h: 1 },
}

// Authored here, not exported Figma timings. Both tracks start immediately;
// the shorter width track clears the shared corner before height crosses it.
export const conversionTiming = { width: 0.34, height: 0.8 } as const
