import assert from 'node:assert/strict'
import test from 'node:test'
import { bentoFocusLayoutArea, bentoFocusLayoutHasOverlap } from '../src/lib/bentoFocusLayouts'
import { promoFocusLayout } from '../src/lib/bentoPromoLayout'

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

const focusedRows = [192, 212, 140, 222]

const focused = Object.fromEntries(Object.entries(promoFocusLayout).map(([id, rect]) => [id, {
  left: rect.x * 131,
  top: focusedRows.slice(0, rect.y).reduce((sum, height) => sum + height + 12, 0),
  width: rect.w * 131 - 12,
  height: focusedRows.slice(rect.y, rect.y + rect.h).reduce((sum, height) => sum + height, 0) + Math.max(0, rect.h - 1) * 12,
}]))

test('Promo owns the whole left column below Leads; Site is hidden and six other rectangles stay fixed', () => {
  assert.equal(focusedRows.reduce((sum, height) => sum + height, 0) + 36, 802)
  assert.equal(bentoFocusLayoutArea(promoFocusLayout), 48)
  assert.equal(bentoFocusLayoutHasOverlap(promoFocusLayout), false)
  assert.deepEqual(focused, {
    ...overview,
    1: { ...overview[1], height: 192 },
    6: { ...overview[6], height: 0 },
    7: { ...overview[7], top: 204, height: 598 },
  })
  assert.throws(() => assert.deepEqual(overview, focused), 'frozen overview is not an opening')
})

test('both directions keep Promo bottom fixed with no visible collisions; Site only shows at overview', () => {
  for (const opening of [true, false]) {
    for (let step = 0; step <= 1000; step++) {
      const p = opening ? step / 1000 : 1 - step / 1000

      const cards = Object.fromEntries(Object.entries(overview).map(([id, first]) => [id, {
        left: first.left + (focused[id].left - first.left) * p,
        top: first.top + (focused[id].top - first.top) * p,
        width: first.width + (focused[id].width - first.width) * p,
        height: first.height + (focused[id].height - first.height) * p,
      }]))

      assert.ok(cards[7].top - cards[1].height >= 12 - 0.0001)
      assert.ok(Math.abs(cards[7].top + cards[7].height - 802) < 0.0001)

      const rects = Object.entries(cards).filter(([id]) => id !== '6' || p === 0).map(([, rect]) => rect)
      for (let a = 0; a < rects.length; a++) {
        for (let b = a + 1; b < rects.length; b++) {
          const r = rects[a]
          const s = rects[b]

          assert.ok(
            Math.min(r.left + r.width, s.left + s.width) <= Math.max(r.left, s.left)
            || Math.min(r.top + r.height, s.top + s.height) <= Math.max(r.top, s.top),
          )
        }
      }
    }
  }
})
