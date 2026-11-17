import assert from 'node:assert/strict'
import test from 'node:test'
import {
  bentoFocusCardIds,
  bentoFocusLayoutArea,
  bentoFocusLayoutFor,
  bentoFocusLayoutHasOverlap,
} from '../src/lib/bentoFocusLayouts'

const interactiveCardIds = [2, 3, 4, 6, 7, 8, 9] as const

const donorSourcesGeometry = {
  1: { x: 6, y: 4, w: 4, h: 2 },
  2: { x: 0, y: 0, w: 6, h: 6 },
  3: { x: 10, y: 4, w: 2, h: 2 },
  4: { x: 9, y: 2, w: 3, h: 2 },
  5: { x: 6, y: 0, w: 6, h: 2 },
  6: { x: 6, y: 2, w: 3, h: 2 },
  7: { x: 0, y: 6, w: 3, h: 2 },
  8: { x: 3, y: 6, w: 3, h: 2 },
  9: { x: 6, y: 6, w: 6, h: 2 },
} as const

const legacyOverviewGeometry = {
  1: { x: 0, y: 0, w: 3, h: 4 },
  2: { x: 3, y: 0, w: 4, h: 2 },
  3: { x: 7, y: 0, w: 2, h: 2 },
  4: { x: 9, y: 0, w: 3, h: 6 },
  5: { x: 3, y: 2, w: 6, h: 4 },
  6: { x: 0, y: 4, w: 3, h: 2 },
  7: { x: 0, y: 6, w: 3, h: 2 },
  8: { x: 3, y: 6, w: 3, h: 2 },
  9: { x: 6, y: 6, w: 6, h: 2 },
} as const

const geometryMismatches = (
  actual: Record<number, { x: number; y: number; w: number; h: number }>,
  expected: Record<number, { x: number; y: number; w: number; h: number }>,
) => bentoFocusCardIds.filter(id => {
  const actualRect = actual[id]
  const expectedRect = expected[id]

  return !actualRect
    || actualRect.x !== expectedRect.x
    || actualRect.y !== expectedRect.y
    || actualRect.w !== expectedRect.w
    || actualRect.h !== expectedRect.h
})

test('every interactive dashboard card has a complete non-overlapping focus layout', () => {
  for (const selectedId of interactiveCardIds) {
    const layout = bentoFocusLayoutFor(selectedId)

    assert.deepEqual(Object.keys(layout).map(Number).sort((a, b) => a - b), [...bentoFocusCardIds])
    assert.equal(bentoFocusLayoutArea(layout), 96)
    assert.equal(bentoFocusLayoutHasOverlap(layout), false)

    for (const rect of Object.values(layout)) {
      assert.ok(rect.x >= 0 && rect.y >= 0)
      assert.ok(rect.x + rect.w <= 12)
      assert.ok(rect.y + rect.h <= 8)
    }
  }
})

test('the selected card receives the intended expanded geometry', () => {
  for (const selectedId of interactiveCardIds) {
    const rect = bentoFocusLayoutFor(selectedId)[selectedId]

    assert.ok(rect.w >= 4)
    assert.ok(rect.h >= 4)
  }
})

test('the browser geometry gate rejects the former static-grid failure', () => {
  assert.deepEqual(bentoFocusLayoutFor(2), donorSourcesGeometry)
  assert.deepEqual(geometryMismatches(donorSourcesGeometry, donorSourcesGeometry), [])
  assert.deepEqual(geometryMismatches(legacyOverviewGeometry, donorSourcesGeometry), [1, 2, 3, 4, 5, 6])
})
