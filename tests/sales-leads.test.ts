import assert from 'node:assert/strict'
import test from 'node:test'
import { salesRecords } from '../src/lib/planerkiSales'
import { salesLeads } from '../src/lib/salesLeads'

test('sales-leads contracts', () => {
  const record = salesRecords.find(item => item.centerId === 'novo-peredelkino' && item.period === '2026-08')!
  const leads = salesLeads(record)

  assert.equal(leads.fact, 500)
  assert.equal(leads.plan, 600)
  assert.equal(leads.rate, 500 / 600)
  assert.equal(leads.chart.length, 31)
  assert.deepEqual(leads.chart, salesLeads(record).chart)
  for (const salesRecord of salesRecords) {
    const value = salesLeads(salesRecord)

    assert.equal(value.chart.length, value.monthDays)
    assert.ok(value.chart.every(day => day.height >= 0 && day.height <= 100))
    if (value.fact !== null && value.days > 0)
      assert.equal(value.chart.reduce((sum, day) => sum + (day.value ?? 0), 0), Math.round(value.fact))
  }
  const zero = structuredClone(record)

  zero.metrics['58'].fact = 0
  zero.metrics['58'].plan = 0
  assert.equal(salesLeads(zero).rate, null)
  assert.ok(salesLeads(zero).chart.every(day => day.value === 0))
  console.log('Monthly leads: source totals, zero denominator, stable daily allocation and chart scale PASS')
})
