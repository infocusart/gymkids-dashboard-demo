import assert from 'node:assert/strict'
import { displayMetric, metric, salesRecords } from '../src/lib/planerkiSales'
import { allocateSourceTotal, salesSourceDefinitions, sourceDetails } from '../src/lib/salesSourceDetails'

const record = salesRecords.find(item => item.centerId === 'novo-peredelkino' && item.period === '2026-08')!
const original = JSON.stringify(salesRecords)
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 0.02, `${a} != ${b}`)
for (const total of [0, 1, 12.34, 123456.78]) close(allocateSourceTotal(total, [0.32, 0.27, 0.23, 0.18]).reduce((a, b) => a + b, 0), total)
const groups = sourceDetails(record, 30)

assert.equal(groups.totals.countFact, 65) // Synthetic group-only sales fixture.
assert.equal(groups.totals.countPlan, metric(record, 32, 'plan'))
assert.equal(groups.totals.fact, displayMetric(record, 30))
assert.notEqual(sourceDetails(record, 12).totals.fact, sourceDetails(record, 19).totals.fact)

const zeroPlan = structuredClone(record)

zeroPlan.metrics['44'].plan = 0
assert.equal(sourceDetails(zeroPlan, 44).totals.plan, 0)
assert.equal(sourceDetails(record, 66).totals.illustrative, true)
for (const item of salesRecords) {
  for (const { row } of salesSourceDefinitions) {
    const details = sourceDetails(item, row)

    close(details.managers.reduce((sum, manager) => sum + manager.plan, 0), details.totals.plan)
    close(details.managers.reduce((sum, manager) => sum + manager.fact, 0), details.totals.fact)
    assert.equal(details.centers.length, Math.min(5, salesRecords.filter(peer => peer.period === item.period && peer.centerId !== item.centerId).length))
    assert.equal(new Set(details.centers.map(peer => peer.id)).size, details.centers.length)
    assert.ok(details.centers.every(peer => peer.id !== item.centerId))
    if (salesRecords.some(peer => peer.period === item.period && peer.centerId !== item.centerId && peer.currency === item.currency))
      assert.equal(details.centers[0].currency, item.currency)
    assert.deepEqual(details.years.map(year => year.year), [2024, 2025, 2026])
    if ([30, 44, 66].includes(row)) {
      const target = row === 66 ? [details.totals.plan, details.totals.fact] : [details.totals.countPlan, details.totals.countFact]
      const parts = details.parameters.slice(2)

      close(parts.reduce((sum, part) => sum + part.plan, 0), target[0])
      close(parts.reduce((sum, part) => sum + part.fact, 0), target[1])
    }
    assert.ok(details.parameters.every(parameter => Number.isFinite(parameter.plan) && Number.isFinite(parameter.fact)))
  }
}
assert.equal(JSON.stringify(salesRecords), original)
console.log('Source details: population, zero, allocation, currencies, fallback and unchanged workbook records verified.')
