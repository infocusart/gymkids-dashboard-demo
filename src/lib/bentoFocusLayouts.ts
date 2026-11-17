export const bentoFocusCardIds = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export type BentoFocusCardId = typeof bentoFocusCardIds[number]

export interface BentoFocusRect {
  x: number
  y: number
  w: number
  h: number
}

type LayoutKey = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type LayoutRow = readonly [BentoFocusCardId, number, number, number, number]
type BentoFocusLayout = Record<BentoFocusCardId, BentoFocusRect>

const makeLayout = (rows: readonly LayoutRow[]) => Object.fromEntries(
  rows.map(([id, x, y, w, h]) => [id, { x, y, w, h }]),
) as BentoFocusLayout

const cloneLayout = (layout: BentoFocusLayout) => Object.fromEntries(
  bentoFocusCardIds.map(id => [id, { ...layout[id] }]),
) as BentoFocusLayout

const sourcesFocusLayout = makeLayout([
  [1, 6, 4, 4, 2],
  [2, 0, 0, 6, 6],
  [3, 10, 4, 2, 2],
  [4, 9, 2, 3, 2],
  [5, 6, 0, 6, 2],
  [6, 6, 2, 3, 2],
  [7, 0, 6, 3, 2],
  [8, 3, 6, 3, 2],
  [9, 6, 6, 6, 2],
])

const siteFocusLayout = makeLayout([
  [1, 0, 0, 3, 2],
  [2, 6, 0, 4, 2],
  [3, 10, 0, 2, 2],
  [4, 6, 2, 6, 2],
  [5, 3, 0, 3, 2],
  [6, 0, 2, 6, 6],
  [7, 10, 4, 2, 2],
  [8, 6, 4, 4, 2],
  [9, 6, 6, 6, 2],
])

const bookingFocusLayout = makeLayout([
  [1, 0, 0, 3, 4],
  [2, 3, 4, 3, 2],
  [3, 6, 0, 4, 4],
  [4, 6, 4, 6, 4],
  [5, 3, 0, 3, 4],
  [6, 0, 4, 3, 2],
  [7, 0, 6, 3, 2],
  [8, 3, 6, 3, 2],
  [9, 10, 0, 2, 4],
])

const validityFocusLayout = makeLayout([
  [1, 0, 0, 3, 2],
  [2, 0, 2, 4, 2],
  [3, 4, 2, 2, 2],
  [4, 6, 0, 6, 8],
  [5, 3, 0, 3, 2],
  [6, 0, 4, 3, 2],
  [7, 3, 4, 3, 2],
  [8, 0, 6, 3, 2],
  [9, 3, 6, 3, 2],
])

const pathFocusLayout = makeLayout([
  [1, 0, 0, 3, 4],
  [2, 3, 0, 3, 4],
  [3, 10, 0, 2, 2],
  [4, 6, 0, 4, 2],
  [5, 3, 4, 3, 2],
  [6, 0, 4, 3, 2],
  [7, 0, 6, 3, 2],
  [8, 3, 6, 3, 2],
  [9, 6, 2, 6, 6],
])

const customLayouts: Partial<Record<BentoFocusCardId, BentoFocusLayout>> = {
  2: sourcesFocusLayout,
  3: bookingFocusLayout,
  4: validityFocusLayout,
  6: siteFocusLayout,
  9: pathFocusLayout,
}

const layoutTemplates: Record<LayoutKey, BentoFocusLayout> = {
  'top-left': makeLayout([
    [1, 0, 0, 6, 4],
    [5, 6, 0, 6, 4],
    [6, 0, 4, 3, 2],
    [4, 3, 4, 3, 2],
    [7, 0, 6, 3, 2],
    [8, 3, 6, 3, 2],
    [2, 6, 4, 4, 2],
    [3, 10, 4, 2, 2],
    [9, 6, 6, 6, 2],
  ]),
  'top-right': makeLayout([
    [3, 6, 0, 6, 4],
    [1, 0, 0, 3, 4],
    [5, 3, 0, 3, 4],
    [6, 0, 4, 3, 2],
    [2, 3, 4, 3, 2],
    [7, 0, 6, 3, 2],
    [8, 3, 6, 3, 2],
    [4, 6, 4, 4, 4],
    [9, 10, 4, 2, 4],
  ]),
  'bottom-left': makeLayout([
    [6, 0, 4, 6, 4],
    [1, 0, 0, 3, 4],
    [5, 3, 0, 3, 4],
    [2, 6, 0, 4, 2],
    [3, 10, 0, 2, 2],
    [4, 6, 2, 6, 2],
    [8, 6, 4, 4, 2],
    [7, 10, 4, 2, 2],
    [9, 6, 6, 6, 2],
  ]),
  'bottom-right': makeLayout([
    [5, 6, 4, 6, 4],
    [1, 0, 0, 3, 4],
    [2, 3, 0, 3, 4],
    [4, 6, 0, 4, 4],
    [3, 10, 0, 2, 4],
    [6, 0, 4, 3, 2],
    [9, 3, 4, 3, 2],
    [7, 0, 6, 3, 2],
    [8, 3, 6, 3, 2],
  ]),
}

const layoutOwners: Record<LayoutKey, BentoFocusCardId> = {
  'top-left': 1,
  'top-right': 3,
  'bottom-left': 6,
  'bottom-right': 5,
}

const layoutKeyFor = (id: BentoFocusCardId): LayoutKey => {
  if (id === 1 || id === 2)
    return 'top-left'

  if (id === 3 || id === 4)
    return 'top-right'

  if (id === 6 || id === 7 || id === 8)
    return 'bottom-left'

  return 'bottom-right'
}

export const bentoFocusLayoutFor = (selected: BentoFocusCardId) => {
  const customLayout = customLayouts[selected]

  if (customLayout)
    return cloneLayout(customLayout)

  const key = layoutKeyFor(selected)
  const originalOwner = layoutOwners[key]
  const result = cloneLayout(layoutTemplates[key])

  if (selected !== originalOwner) {
    const selectedRect = result[selected]

    result[selected] = { ...result[originalOwner] }
    result[originalOwner] = { ...selectedRect }
  }

  return result
}

export const bentoFocusLayoutArea = (layout: BentoFocusLayout) => bentoFocusCardIds.reduce(
  (total, id) => total + layout[id].w * layout[id].h,
  0,
)

export const bentoFocusLayoutHasOverlap = (layout: BentoFocusLayout) => {
  const cells = new Set<string>()

  for (const id of bentoFocusCardIds) {
    const rect = layout[id]

    for (let row = rect.y; row < rect.y + rect.h; row += 1) {
      for (let column = rect.x; column < rect.x + rect.w; column += 1) {
        const cell = `${column}:${row}`

        if (cells.has(cell))
          return true

        cells.add(cell)
      }
    }
  }

  return false
}
