import assert from 'node:assert/strict'
import test from 'node:test'
import { buildGymkidsTrialCalendar, decodeGymkidsTrialHistory } from '../src/data/gymkidsTrialCalendar'

const matrix = (lead: string, trial: string, reached = 1) => ({ lead_basis: 'lead.created_at', trial_basis: 'trial_scheduled_at', scheduled: 1, reached, cells: [{ lead_date: lead, trial_date: trial, scheduled: 1, reached }] })
const empty = () => ({ lead_basis: 'lead.created_at', trial_basis: 'trial_scheduled_at', scheduled: 0, reached: 0, cells: [] })
const bundle = () => ({ schema_version: 'gymkids.trial-calendar.v2', center_id: 'test', pipeline_id: 5539363, as_of: '2026-11-04T12:00:00Z', origin_from: '2025-12', origin_to: '2026-02', slices: [{ period: '2025-12', matrix: matrix('2025-12-01', '2026-02-15') }, { period: '2026-01', matrix: empty() }, { period: '2026-02', matrix: matrix('2026-02-02', '2026-03-01', 0) }] })

test('complete bundle includes old origins outside published lead months and separates future bookings', () => {
  const history = decodeGymkidsTrialHistory(bundle(), 'test')
  const result = buildGymkidsTrialCalendar(history, 'test', '2026-02-01', '2026-02-28')

  assert.equal(result.reached, 1)
  assert.equal(result.previousLeadsReached, 1)
  assert.equal(result.futureBookings.scheduled, 1)
})
test('missing origin, wrong center/pipeline, legacy version and corrupt totals fail closed', () => {
  const missing = bundle()

  missing.slices.splice(1, 1)

  const wrong = bundle()

  wrong.pipeline_id = 1

  const legacy = bundle()

  legacy.schema_version = 'v1'

  const counts = bundle()

  counts.slices[0].matrix.reached = 2
  for (const value of [missing, wrong, legacy, counts, null]) assert.throws(() => decodeGymkidsTrialHistory(value, 'test'))
  assert.throws(() => decodeGymkidsTrialHistory(bundle(), 'other'))
})

test('impossible ISO calendar days are rejected rather than dropped from a total', () => {
  const value = bundle()

  value.slices[0].matrix.cells[0].trial_date = '2026-02-30'
  assert.throws(() => decodeGymkidsTrialHistory(value, 'test'))
})
