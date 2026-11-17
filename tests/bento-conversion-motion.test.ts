import assert from 'node:assert/strict'
import test from 'node:test'
import { bentoFocusLayoutArea, bentoFocusLayoutHasOverlap } from '../src/lib/bentoFocusLayouts'
import { conversionFocusLayout, conversionTiming } from '../src/lib/bentoConversionLayout'

const overview = {
  1: { x: 0, y: 0, w: 3, h: 2 },
  2: { x: 3, y: 0, w: 4, h: 1 },
  3: { x: 7, y: 0, w: 2, h: 1 },
  4: { x: 9, y: 0, w: 3, h: 3 },
  5: { x: 3, y: 1, w: 6, h: 2 },
  6: { x: 0, y: 2, w: 3, h: 1 },
  7: { x: 0, y: 3, w: 3, h: 1 },
  8: { x: 3, y: 3, w: 3, h: 1 },
  9: { x: 6, y: 3, w: 6, h: 1 },
} as const

test('Conversion endpoint changes only its height and Forecast width', () => {
  assert.deepEqual(conversionFocusLayout, {
    ...overview,
    3: { ...overview[3], h: 3 },
    5: { ...overview[5], w: 4 },
  })
  assert.equal(bentoFocusLayoutArea(conversionFocusLayout), 48)
  assert.equal(bentoFocusLayoutHasOverlap(conversionFocusLayout), false)
  assert.ok(conversionFocusLayout[2].x < conversionFocusLayout[3].x)
  assert.throws(() => assert.deepEqual(overview, conversionFocusLayout), 'a static page must fail acceptance')
})

test('shared-clock dimension tracks clear the corner, opening and mirrored return', () => {
  // Numerical contract at the ONLY owner-approved viewport, 1800 × 1007.
  // Browser DOM traces separately verify that the implementation follows it.
  const clamp = (value: number) => Math.min(1, Math.max(0, value))
  const heightEase = (t: number) => t < 0.5 ? 8 * t ** 4 : 1 - 8 * (1 - t) ** 4

  for (const opening of [true, false]) {
    for (let step = 0; step <= 1000; step++) {
      const time = conversionTiming.height * step / 1000
      const widthStart = opening ? 0 : conversionTiming.height - conversionTiming.width
      const widthTime = clamp((time - widthStart) / conversionTiming.width)
      const widthProgress = opening ? 1 - (1 - widthTime) ** 4 : 1 - widthTime ** 4
      const heightProgress = opening ? heightEase(time / conversionTiming.height) : 1 - heightEase(time / conversionTiming.height)
      const height = 192 + 376 * heightProgress
      const forecastRight = 393 + 774 - 262 * widthProgress

      assert.ok(height <= 204 || forecastRight <= 917, `cards cross at ${time}s, opening=${opening}`)
      if (opening && step > 0) {
        assert.ok(height > 192, 'height has no delayed start')
        assert.ok(forecastRight < 1167, 'width has no delayed start')
      }
    }
  }
})
