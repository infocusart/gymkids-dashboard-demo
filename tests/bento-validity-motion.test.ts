import assert from 'node:assert/strict'
import test from 'node:test'
import { bentoFocusLayoutArea, bentoFocusLayoutHasOverlap } from '../src/lib/bentoFocusLayouts'
import { validityFocusLayout, validityTiming } from '../src/lib/bentoValidityLayout'
import type { ValidityPixelRect } from '../src/lib/bentoValidityLayout'

const ownerRevision = {
  1: { x: 0, y: 0, w: 3, h: 2 },
  2: { x: 3, y: 0, w: 3, h: 1 },
  3: { x: 6, y: 0, w: 2, h: 1 },
  4: { x: 8, y: 0, w: 4, h: 4 },
  5: { x: 3, y: 1, w: 5, h: 2 },
  6: { x: 0, y: 2, w: 3, h: 1 },
  7: { x: 0, y: 3, w: 2, h: 1 },
  8: { x: 2, y: 3, w: 2, h: 1 },
  9: { x: 4, y: 3, w: 4, h: 1 },
} as const

test('latest owner composition fills four original rows without overlaps', () => {
  assert.deepEqual(validityFocusLayout, ownerRevision)
  assert.equal(bentoFocusLayoutArea(validityFocusLayout), 48)
  assert.equal(bentoFocusLayoutHasOverlap(validityFocusLayout), false)
  for (const rect of Object.values(validityFocusLayout)) {
    assert.ok(rect.x >= 0 && rect.x + rect.w <= 12)
    assert.ok(rect.y >= 0 && rect.y + rect.h <= 4)
  }
})

const interpolate = (a: ValidityPixelRect, b: ValidityPixelRect, t: number): ValidityPixelRect => ({
  left: a.left + (b.left - a.left) * t,
  top: a.top + (b.top - a.top) * t,
  width: a.width + (b.width - a.width) * t,
  height: a.height + (b.height - a.height) * t,
})

const overlap = (a: ValidityPixelRect, b: ValidityPixelRect) =>
  Math.min(a.left + a.width, b.left + b.width) > Math.max(a.left, b.left)
  && Math.min(a.top + a.height, b.top + b.height) > Math.max(a.top, b.top)

test('Sources stay left of Conversion without folding during opening and return', () => {
  // 1800 × 1007 CSS px, with the existing centered 1560px dashboard grid.
  for (const gridWidth of [1560]) {
    const pitch = (gridWidth + 12) / 12
    const rect = (x: number, w: number): ValidityPixelRect => ({ left: x * pitch, top: 0, width: w * pitch - 12, height: 192 })
    const sources = { overview: rect(3, 4), focused: rect(validityFocusLayout[2].x, validityFocusLayout[2].w) }
    const conversion = { overview: rect(7, 2), focused: rect(validityFocusLayout[3].x, validityFocusLayout[3].w) }
    for (const opening of [true, false]) {
      for (let step = 0; step <= 100; step++) {
        const progress = opening ? step / 100 : 1 - step / 100
        const a = interpolate(sources.overview, sources.focused, progress)
        const b = interpolate(conversion.overview, conversion.focused, progress)

        assert.equal(overlap(a, b), false)
        assert.equal(a.top, 0)
        assert.equal(b.top, 0)
        assert.equal(a.height, 192)
        assert.equal(b.height, 192)
        assert.ok(Math.abs(b.left - (a.left + a.width) - 12) < 0.001)
      }
    }
  }
})

test('composition acceptance rejects static overview geometry', () => {
  const frozenOverview = { ...ownerRevision, 4: { x: 9, y: 0, w: 3, h: 3 } }

  assert.throws(() => assert.deepEqual(frozenOverview, ownerRevision))
  assert.ok(validityTiming.heightStart < validityTiming.reflow)
})

test('synchronized horizontal reflow and overlapping height track do not cross Path', () => {
  const total = validityTiming.heightStart + validityTiming.height

  const easeInOut = (progress: number, power: number) => progress < 0.5
    ? (2 * progress) ** power / 2
    : 1 - (2 * (1 - progress)) ** power / 2

  const clamp = (value: number) => Math.max(0, Math.min(1, value))
  const validityOverview = { left: 1179, top: 0, width: 381, height: 568 }
  const validityFocused = { left: 1048, top: 0, width: 512, height: 802 }
  const pathOverview = { left: 786, top: 580, width: 774, height: 222 }
  const pathFocused = { left: 524, top: 580, width: 512, height: 222 }

  for (const opening of [true, false]) {
    for (let step = 0; step <= 1000; step++) {
      const time = total * step / 1000
      const horizontalStart = opening ? 0 : total - validityTiming.reflow
      const verticalStart = opening ? validityTiming.heightStart : 0
      const horizontal = easeInOut(clamp((time - horizontalStart) / validityTiming.reflow), 4)
      const vertical = easeInOut(clamp((time - verticalStart) / validityTiming.height), 3)
      const progress = opening ? horizontal : 1 - horizontal
      const heightProgress = opening ? vertical : 1 - vertical
      const primary = interpolate(validityOverview, validityFocused, progress)
      const path = interpolate(pathOverview, pathFocused, progress)

      primary.height = validityOverview.height + (validityFocused.height - validityOverview.height) * heightProgress
      assert.equal(overlap(primary, path), false, `collision at ${time}s, opening=${opening}`)
      if (opening && time > 0 && time < validityTiming.heightStart)
        assert.ok(primary.width > validityOverview.width, 'Validity must start widening before vertical growth')
    }
  }
})
