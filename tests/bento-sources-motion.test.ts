import assert from 'node:assert/strict'
import test from 'node:test'
import { bentoFocusLayoutArea, bentoFocusLayoutHasOverlap } from '../src/lib/bentoFocusLayouts'
import { sourcesFocusLayout, sourcesTiming } from '../src/lib/bentoSourcesLayout'

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
}

test('Sources endpoint changes only Sources and Forecast; order stays unchanged', () => {
  assert.deepEqual(sourcesFocusLayout, {
    ...overview,
    2: { ...overview[2], h: 3 },
    5: { ...overview[5], x: 7, w: 2 },
  })
  assert.equal(bentoFocusLayoutArea(sourcesFocusLayout), 48)
  assert.equal(bentoFocusLayoutHasOverlap(sourcesFocusLayout), false)
  assert.throws(() => assert.deepEqual(overview, sourcesFocusLayout), 'static geometry must fail')
})

test('shared clock clears Sources corner in opening and mirrored return', () => {
  const clamp = (value: number) => Math.max(0, Math.min(1, value))
  const heightEase = (t: number) => t < 0.5 ? 8 * t ** 4 : 1 - 8 * (1 - t) ** 4

  for (const opening of [true, false]) {
    for (let step = 0; step <= 1000; step++) {
      const time = sourcesTiming.height * step / 1000
      const reflowStart = opening ? 0 : sourcesTiming.height - sourcesTiming.reflow
      const t = clamp((time - reflowStart) / sourcesTiming.reflow)
      const reflow = opening ? 1 - (1 - t) ** 4 : 1 - t ** 4
      const height = opening ? heightEase(time / sourcesTiming.height) : 1 - heightEase(time / sourcesTiming.height)
      const sourceBottom = 192 + 376 * height
      const forecastLeft = 393 + 524 * reflow
      const forecastWidth = 774 - 524 * reflow

      assert.ok(sourceBottom <= 204 || forecastLeft >= 905, `collision at ${time}, opening=${opening}`)
      assert.ok(Math.abs(forecastLeft + forecastWidth - 1167) < 0.0001)
      if (opening && step > 0) {
        assert.ok(sourceBottom > 192)
        assert.ok(forecastLeft > 393)
      }
    }
  }
})
