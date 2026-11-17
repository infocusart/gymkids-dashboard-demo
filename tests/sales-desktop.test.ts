import assert from 'node:assert/strict'
import test from 'node:test'
import { salesCardKeys, salesFocusPlacement, salesRevenueTone } from '../src/lib/salesDesktop'

test('sales-desktop contracts', () => {
  assert.equal(salesRevenueTone(null), 'neutral')
  assert.equal(salesRevenueTone(0), 'negative')
  assert.equal(salesRevenueTone(0.84999), 'negative')
  assert.equal(salesRevenueTone(0.85), 'warning')
  assert.equal(salesRevenueTone(0.99999), 'warning')
  assert.equal(salesRevenueTone(1), 'positive')
  assert.equal(salesRevenueTone(1.308), 'positive')
  assert.equal(salesFocusPlacement('revenue', null), undefined)
  for (const selected of salesCardKeys) {
    const occupied = new Set<string>()
    for (const key of salesCardKeys) {
      const placement = salesFocusPlacement(key, selected)!
      const [left, right] = placement.gridColumn.split(' / ').map(Number)
      const [top, bottom] = placement.gridRow.split(' / ').map(Number)

      assert(left >= 1 && right <= 13 && top >= 1 && bottom <= 6)
      for (let x = left; x < right; x++) {
        for (let y = top; y < bottom; y++) {
          const cell = `${x}:${y}`

          assert(!occupied.has(cell), `Overlap: ${selected} / ${key} / ${cell}`)
          occupied.add(cell)
        }
      }
    }
    assert.equal(occupied.size, 36 + (salesCardKeys.length - 4) * 3, `Incomplete grid: ${selected}`)
  }
  console.log('Final month status thresholds and all monthly focus layouts: PASS')
})
