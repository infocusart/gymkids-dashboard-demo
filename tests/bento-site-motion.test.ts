import assert from 'node:assert/strict'
import test from 'node:test'
import { bentoFocusLayoutArea, bentoFocusLayoutHasOverlap } from '../src/lib/bentoFocusLayouts'
import { siteFocusLayout, siteTiming } from '../src/lib/bentoSiteLayout'

const overview = {
  1: { left: 0, top: 0, width: 381, height: 416 },
  2: { left: 393, top: 0, width: 512, height: 192 },
  3: { left: 917, top: 0, width: 250, height: 192 },
  4: { left: 1179, top: 0, width: 381, height: 568 },
  5: { left: 393, top: 204, width: 774, height: 364 },
  6: { left: 0, top: 428, width: 381, height: 140 },
  7: { left: 0, top: 580, width: 381, height: 222 },
  8: { left: 393, top: 580, width: 381, height: 222 },
  9: { left: 786, top: 580, width: 774, height: 222 },
}

test('Leads shrink above expanded Site; hidden Promo and six right-hand cards stay put', () => {
  assert.equal(bentoFocusLayoutArea(siteFocusLayout), 48)
  assert.equal(bentoFocusLayoutHasOverlap(siteFocusLayout), false)
  assert.deepEqual(siteFocusLayout[1], { x: 0, y: 0, w: 3, h: 1 })
  assert.deepEqual(siteFocusLayout[6], { x: 0, y: 1, w: 3, h: 3 })
  assert.deepEqual(siteFocusLayout[7], { x: 0, y: 3, w: 3, h: 0 })
  for (const id of [2, 3, 4, 5, 8, 9] as const) {
    const rect = siteFocusLayout[id]
    const rowTops = [0, 204, 428, 580]
    const rowBottoms = [192, 416, 568, 802]

    assert.deepEqual({ left: rect.x * 131, top: rowTops[rect.y], width: rect.w * 131 - 12, height: rowBottoms[rect.y + rect.h - 1] - rowTops[rect.y] }, overview[id])
  }
  assert.throws(() => assert.deepEqual(siteFocusLayout[6], { x: 0, y: 2, w: 3, h: 1 }), 'frozen overview must fail')
})

test('Promo fades before Site extends and returns only after Site retracts', () => {
  const total = siteTiming.promoFade + siteTiming.reflow
  const clamp = (value: number) => Math.max(0, Math.min(1, value))
  const ease = (t: number, power: number) => t < 0.5 ? (2 * t) ** power / 2 : 1 - (2 * (1 - t)) ** power / 2

  for (const opening of [true, false]) {
    for (let step = 0; step <= 1000; step++) {
      const time = total * step / 1000
      const reflowStart = opening ? siteTiming.promoFade : 0
      const fadeStart = opening ? 0 : siteTiming.reflow
      const p = ease(clamp((time - reflowStart) / siteTiming.reflow), 4)
      const fade = ease(clamp((time - fadeStart) / siteTiming.promoFade), 3)
      const reflow = opening ? p : 1 - p
      const promoOpacity = opening ? 1 - fade : fade

      const cards = {
        ...overview,
        1: { ...overview[1], height: 416 - 224 * reflow },
        6: { ...overview[6], top: 428 - 224 * reflow, height: 140 + 458 * reflow },
      }

      assert.ok(Math.abs(cards[6].top - cards[1].height - 12) < 0.0001)

      assert.deepEqual(cards[7], overview[7], 'Promo fades in place')
      for (const id of [2, 3, 4, 5, 8, 9] as const)
        assert.deepEqual(cards[id], overview[id])
      const rects = Object.entries(cards).filter(([id]) => id !== '7' || promoOpacity > 0).map(([, rect]) => rect)
      for (let a = 0; a < rects.length; a++) {
        for (let b = a + 1; b < rects.length; b++) {
          const r = rects[a]
          const s = rects[b]
          const x = Math.min(r.left + r.width, s.left + s.width) - Math.max(r.left, s.left)
          const y = Math.min(r.top + r.height, s.top + s.height) - Math.max(r.top, s.top)

          assert.ok(x <= 0.0001 || y <= 0.0001, `collision ${a + 1}/${b + 1} at ${time}, opening=${opening}`)
        }
      }
    }
  }
})
