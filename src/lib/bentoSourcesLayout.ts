import type { BentoFocusCardId, BentoFocusRect } from './bentoFocusLayouts'

// Owner's schematic supplies the endpoint, not content or motion tracks.
export const sourcesFocusLayout: Record<BentoFocusCardId, BentoFocusRect> = {
  1: { x: 0, y: 0, w: 3, h: 2 },
  2: { x: 3, y: 0, w: 4, h: 3 },
  3: { x: 7, y: 0, w: 2, h: 1 },
  4: { x: 9, y: 0, w: 3, h: 3 },
  5: { x: 7, y: 1, w: 2, h: 2 },
  6: { x: 0, y: 2, w: 3, h: 1 },
  7: { x: 0, y: 3, w: 3, h: 1 },
  8: { x: 3, y: 3, w: 3, h: 1 },
  9: { x: 6, y: 3, w: 6, h: 1 },
}

export const sourcesTiming = { reflow: 0.34, height: 0.85 } as const
