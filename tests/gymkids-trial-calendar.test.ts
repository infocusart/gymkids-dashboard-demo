import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { type TrialHistorySlice, buildGymkidsTrialCalendar } from '../src/data/gymkidsTrialCalendar'
import { type GymkidsSnapshotDetails, adaptGymkidsSnapshot } from '../src/data/gymkidsSnapshot'

const slice = (period: string, cells: NonNullable<GymkidsSnapshotDetails['trial_cohort_matrix']>['cells']): TrialHistorySlice => ({
  period,
  details: {
    schema_version: 'gymkids.manager-details.v1',
    center: { id: 'test' },
    request: { month: period },
    trial_cohort_matrix: { lead_basis: 'lead.created_at', trial_basis: 'trial_scheduled_at', cells },
  },
})

const cell = (leadDate: string, trialDate: string, scheduled = 1, reached = 1) => ({ lead_date: leadDate, trial_date: trialDate, scheduled, reached })

test('calendar includes January and March leads but excludes August trials of July leads', () => {
  const calendar = buildGymkidsTrialCalendar([
    slice('2026-01', [cell('2026-01-01', '2026-07-05', 2, 1)]),
    slice('2026-03', [cell('2026-03-20', '2026-07-10', 3, 2)]),
    slice('2026-07', [cell('2026-07-01', '2026-07-11', 4, 3), cell('2026-07-01', '2026-08-02', 8, 7)]),
  ], 'test', '2026-07-01', '2026-07-31')

  assert.equal(calendar.available, true)
  assert.equal(calendar.scheduled, 9)
  assert.equal(calendar.reached, 6)
  assert.equal(calendar.previousLeadsScheduled, 5)
  assert.equal(calendar.previousLeadsReached, 3)
  assert.deepEqual(calendar.futureBookings, {
    available: true, scheduled: 8, byTrialMonth: [{ period: '2026-08', scheduled: 8 }],
  })
  assert.deepEqual(calendar.byLeadMonth, [
    { period: '2026-07', scheduled: 4, reached: 3 },
    { period: '2026-03', scheduled: 3, reached: 2 },
    { period: '2026-01', scheduled: 2, reached: 1 },
  ])
  assert.equal(calendar.byDate.length, 31)
  assert.deepEqual(calendar.byDate[0], { date: '2026-07-01', scheduled: 0, reached: 0 })
  assert.equal(calendar.byDate.reduce((sum, day) => sum + day.reached, 0), calendar.reached)
  assert.equal(calendar.byDate.reduce((sum, day) => sum + day.scheduled, 0), calendar.scheduled)
})

test('future appointments use only selected-month leads through the cutoff and later trial months', () => {
  const calendar = buildGymkidsTrialCalendar([
    slice('2026-06', [cell('2026-06-20', '2026-08-01', 10, 0)]),
    slice('2026-07', [
      cell('2026-07-01', '2026-07-05', 2, 1),
      cell('2026-07-01', '2026-07-20', 20, 0), // Same month, after report date: not next-month bookings.
      cell('2026-07-05', '2026-08-01', 3, 0),
      cell('2026-07-05', '2026-08-01', 4, 0), // Separate published groups are summed.
      cell('2026-07-10', '2026-09-01', 5, 0),
      cell('2026-07-11', '2026-08-01', 30, 0), // Lead appears after selected cutoff.
    ]),
  ], 'test', '2026-07-01', '2026-07-10')

  assert.deepEqual(calendar.futureBookings, {
    available: true,
    scheduled: 12,
    byTrialMonth: [{ period: '2026-08', scheduled: 7 }, { period: '2026-09', scheduled: 5 }],
  })
  assert.equal(calendar.scheduled, 2)
  assert.equal(calendar.reached, 1)
})

test('missing current cohort is unknown, while a validated empty cohort has zero future bookings', () => {
  const calendar = buildGymkidsTrialCalendar([slice('2026-06', [])], 'test', '2026-07-01', '2026-07-31')

  assert.deepEqual(calendar.futureBookings, { available: false, scheduled: 0, byTrialMonth: [] })
  assert.deepEqual(buildGymkidsTrialCalendar([slice('2026-07', [])], 'test', '2026-07-01', '2026-07-31').futureBookings,
    { available: true, scheduled: 0, byTrialMonth: [] })
})

test('invalid history never exposes a partial future appointment breakdown', () => {
  const calendar = buildGymkidsTrialCalendar([
    slice('2026-07', [cell('2026-07-01', '2026-08-02', 4, 0)]),
    { period: '2026-06', details: null },
  ], 'test', '2026-07-01', '2026-07-31')

  assert.equal(calendar.available, false)
  assert.deepEqual(calendar.futureBookings, { available: false, scheduled: 0, byTrialMonth: [] })
})

test('report cutoff is applied to trial date, not lead creation date', () => {
  const calendar = buildGymkidsTrialCalendar([
    slice('2026-01', [cell('2026-01-01', '2026-07-10'), cell('2026-01-01', '2026-07-11')]),
  ], 'test', '2026-07-01', '2026-07-10')

  assert.equal(calendar.reached, 1)
  assert.equal(calendar.byDate.length, 10)
  assert.equal(calendar.byDate.at(-1)?.date, '2026-07-10')
  assert.equal(calendar.byLeadMonth[0].reached, 1)
})

test('separate published cells sharing dates are summed, while inconsistent totals fail closed', () => {
  const history = [slice('2026-01', [cell('2026-01-01', '2026-07-10'), cell('2026-01-01', '2026-07-10')])]
  const matrix = history[0].details!.trial_cohort_matrix!

  matrix.scheduled = 2
  matrix.reached = 2
  assert.equal(buildGymkidsTrialCalendar(history, 'test', '2026-07-01', '2026-07-31').reached, 2)
  assert.equal(buildGymkidsTrialCalendar(history, 'test', '2026-07-01', '2026-07-31').byDate[9].reached, 2)
  matrix.scheduled = 1
  assert.equal(buildGymkidsTrialCalendar(history, 'test', '2026-07-01', '2026-07-31').available, false)
})

test('missing, duplicate, foreign-center or invalid slices never become a partial total', () => {
  const good = slice('2026-01', [cell('2026-01-01', '2026-07-01')])
  for (const history of [[],
    [good, { period: '2026-03', details: null }],
    [good, good],
    [slice('2026-03', [cell('2026-01-01', '2026-07-01')])],
    [slice('2026-01', [cell('2026-01-01', '2026-07-01', 1, 2)])]]) {
    const calendar = buildGymkidsTrialCalendar(history, 'test', '2026-07-01', '2026-07-31')

    assert.equal(calendar.available, false)
    assert.equal(calendar.reached, 0)
    assert.deepEqual(calendar.byLeadMonth, [])
    assert.deepEqual(calendar.byDate, [])
    assert.deepEqual(calendar.futureBookings, { available: false, scheduled: 0, byTrialMonth: [] })
  }
  assert.equal(buildGymkidsTrialCalendar([good], 'another-center', '2026-07-01', '2026-07-31').available, false)
  assert.equal(buildGymkidsTrialCalendar([slice('2026-01', [])], 'test', '2026-07-01', '2026-07-31').available, true)
})

test('demo calendar reconciles the independent monthly fixture', () => {
  const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
  const base = `public/data/snapshots/${read('public/data/current.json').release_id}`
  const center = read(`${base}/manifest.json`).centers.find((item: { center_id: string }) => item.center_id === 'novo-peredelkino')
  const history = center.periods.map((period: { month: string; details_path: string }) => ({ period: period.month, details: read(`${base}/${period.details_path}`) }))
  const calendar = buildGymkidsTrialCalendar(history, center.center_id, '2026-07-01', '2026-07-31')
  const dashboard = adaptGymkidsSnapshot(read(`${base}/centers/novo-peredelkino/2026-07.json`), read(`${base}/details/novo-peredelkino/2026-07.json`), '2026-07-31', calendar)

  assert.equal(calendar.available, true)
  assert.equal(dashboard.trial.scheduled, 438)
  assert.equal(dashboard.trial.reached, 377)
  assert.equal(dashboard.trial.previousLeadsScheduled, 0)
  assert.deepEqual(dashboard.trial.futureBookings, { available: true, scheduled: 0, byTrialMonth: [] })
  assert.equal(dashboard.trial.byDate.length, 31)
  assert.equal(dashboard.trial.byDate.reduce((sum, day) => sum + day.scheduled, 0), 438)
  assert.equal(dashboard.trial.byDate.reduce((sum, day) => sum + day.reached, 0), 377)
})

test('all published centers reconcile monthly and daily trial breakdowns with the shared calendar', () => {
  const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
  const base = `public/data/snapshots/${read('public/data/current.json').release_id}`
  const manifest = read(`${base}/manifest.json`)

  for (const center of manifest.centers) {
    const history = center.periods.map((period: { month: string; details_path: string }) => ({ period: period.month, details: read(`${base}/${period.details_path}`) }))

    for (const { month } of center.periods) {
      const [year, number] = month.split('-').map(Number)
      const to = new Date(Date.UTC(year, number, 0)).toISOString().slice(0, 10)
      const calendar = buildGymkidsTrialCalendar(history, center.center_id, `${month}-01`, to)

      if (!calendar.available) {
        assert.deepEqual(calendar.byLeadMonth, [])
        assert.deepEqual(calendar.byDate, [])
        continue
      }
      for (const key of ['scheduled', 'reached'] as const) {
        assert.equal(calendar.byLeadMonth.reduce((sum, row) => sum + row[key], 0), calendar[key], `${center.center_id}/${month}: month ${key}`)
        assert.equal(calendar.byDate.reduce((sum, row) => sum + row[key], 0), calendar[key], `${center.center_id}/${month}: day ${key}`)
      }
      assert.ok(calendar.byDate.every(day => day.date.slice(0, 7) === month && day.reached <= day.scheduled))

      const expectedFuture = history.find((item: TrialHistorySlice) => item.period === month)?.details?.trial_cohort_matrix?.cells
        .filter((entry: { lead_date: string; trial_date: string }) => entry.lead_date <= to && entry.trial_date.slice(0, 7) > month)
        .reduce((sum: number, entry: { scheduled: number }) => sum + entry.scheduled, 0) ?? 0

      assert.equal(calendar.futureBookings.scheduled, expectedFuture)
      assert.equal(calendar.futureBookings.byTrialMonth.reduce((sum, row) => sum + row.scheduled, 0), expectedFuture)
      assert.ok(calendar.futureBookings.byTrialMonth.every(row => row.period > month))
    }
  }
})
