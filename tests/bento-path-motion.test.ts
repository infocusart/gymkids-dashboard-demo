import assert from 'node:assert/strict'
import test from 'node:test'
import { pathFocusLayout, pathTiming, pathVisibleCardIds } from '../src/lib/bentoPathLayout'

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

test('Path endpoint fills the original grid with eight visible cards, Trial retained but hidden', () => {
  assert.deepEqual(pathFocusLayout, {
    ...overview,
    4: { ...overview[4], h: 2 },
    5: { ...overview[5], h: 1 },
    9: { x: 3, y: 2, w: 9, h: 2 },
  })
  assert.deepEqual(pathVisibleCardIds, [1, 2, 3, 4, 5, 6, 7, 9])

  const cells = new Set<string>()

  for (const id of pathVisibleCardIds) {
    const rect = pathFocusLayout[id]

    for (let y = rect.y; y < rect.y + rect.h; y++) {
      for (let x = rect.x; x < rect.x + rect.w; x++) {
        const key = `${x}:${y}`

        assert.ok(!cells.has(key), `visible cards overlap at ${key}`)
        cells.add(key)
      }
    }
  }
  assert.equal(cells.size, 48)
  assert.ok(pathFocusLayout[2].x < pathFocusLayout[3].x)
  assert.throws(() => assert.deepEqual(overview, pathFocusLayout), 'static layout must fail')
})

test('one progress preserves vertical clearance and Trial fades before overlap in either direction', () => {
  const ease = (t: number) => t < 0.5 ? 8 * t ** 4 : 1 - 8 * (1 - t) ** 4

  for (const opening of [true, false]) {
    for (let step = 0; step <= 1000; step++) {
      const time = pathTiming.reflow * step / 1000
      const progress = opening ? ease(step / 1000) : 1 - ease(step / 1000)
      const left = 786 - 393 * progress
      const top = 580 - 152 * progress
      const width = 774 + 393 * progress
      const height = 222 + 152 * progress
      const forecastBottom = 204 + 364 - 152 * progress
      const validityBottom = 568 - 152 * progress
      const trialVisible = opening ? time < pathTiming.trialFade : time > pathTiming.reflow - pathTiming.trialFade

      assert.ok(Math.abs(top - forecastBottom - 12) < 1e-9)
      assert.ok(Math.abs(top - validityBottom - 12) < 1e-9)
      assert.ok(Math.abs(top + height - 802) < 1e-9)
      assert.ok(Math.abs(left + width - 1560) < 1e-9)
      if (trialVisible)
        assert.ok(left >= 774, `Path overlaps visible Trial at ${time}s, opening=${opening}`)
      if (opening && step > 0)
        assert.ok(top < 580 && left < 786, 'primary starts on both axes immediately')
    }
  }
})
