import type { GymkidsSnapshotDetails } from './gymkidsSnapshot'

export interface TrialHistorySlice {
  period: string
  details: GymkidsSnapshotDetails | null
}

export interface GymkidsTrialCalendar {
  available: boolean
  scheduled: number
  reached: number
  previousLeadsScheduled: number
  previousLeadsReached: number
  coverageStart: string
  missingPeriods: string[]
  byLeadMonth: Array<{ period: string; scheduled: number; reached: number }>
  byDate: Array<{ date: string; scheduled: number; reached: number }>
  futureBookings: {
    available: boolean
    scheduled: number
    byTrialMonth: Array<{ period: string; scheduled: number }>
  }
}

/** Cohort files are disjoint by lead month; select visits by trial date, not lead date. */
export const buildGymkidsTrialCalendar = (
  history: readonly TrialHistorySlice[],
  centerId: string,
  from: string,
  to: string,
): GymkidsTrialCalendar => {
  const result: GymkidsTrialCalendar = {
    available: history.length > 0,
    scheduled: 0,
    reached: 0,
    previousLeadsScheduled: 0,
    previousLeadsReached: 0,
    coverageStart: history.map(slice => slice.period).sort()[0] ?? '',
    missingPeriods: [],
    byLeadMonth: [],
    byDate: [],
    futureBookings: { available: false, scheduled: 0, byTrialMonth: [] },
  }

  const months = new Map<string, { period: string; scheduled: number; reached: number }>()
  const dates = new Map<string, { date: string; scheduled: number; reached: number }>()
  const seenPeriods = new Set<string>()
  const futureMonths = new Map<string, { period: string; scheduled: number }>()
  const selectedMonth = from.slice(0, 7)
  let currentLeadMonthValid = false
  for (const { period, details } of history) {
    const matrix = details?.trial_cohort_matrix

    const validContract = details?.schema_version === 'gymkids.manager-details.v1'
      && details.center?.id === centerId
      && details.request?.month === period
      && matrix?.lead_basis === 'lead.created_at'
      && matrix.trial_basis === 'trial_scheduled_at'
      && Array.isArray(matrix.cells)
      && !seenPeriods.has(period)

    seenPeriods.add(period)
    if (!validContract || !matrix || matrix.cells.some(cell => {
      const validDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
        && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
        && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value

      return !validDay(cell.lead_date)
        || !validDay(cell.trial_date)
        || cell.lead_date.slice(0, 7) !== period
        || !Number.isInteger(cell.scheduled) || cell.scheduled < 0
        || !Number.isInteger(cell.reached) || cell.reached < 0 || cell.reached > cell.scheduled
    })

    // Cells may share dates (separate published groups); their sums must match the declared totals.
    || (matrix.scheduled !== undefined && matrix.cells.reduce((sum, cell) => sum + cell.scheduled, 0) !== matrix.scheduled)
    || (matrix.reached !== undefined && matrix.cells.reduce((sum, cell) => sum + cell.reached, 0) !== matrix.reached)) {
      result.missingPeriods.push(period)
      continue
    }
    if (period === selectedMonth)
      currentLeadMonthValid = true

    for (const cell of matrix.cells) {
      // Future bookings are a separate lead-cohort view, never part of calendar totals.
      // lead_date is not booking creation time; only appointments in later months qualify.
      if (period === selectedMonth && cell.lead_date >= from && cell.lead_date <= to && cell.trial_date.slice(0, 7) > selectedMonth) {
        const key = cell.trial_date.slice(0, 7)
        const futureMonth = futureMonths.get(key) ?? { period: key, scheduled: 0 }

        futureMonth.scheduled += cell.scheduled
        futureMonths.set(key, futureMonth)
      }
      if (cell.trial_date < from || cell.trial_date > to)
        continue
      result.scheduled += cell.scheduled
      result.reached += cell.reached

      const month = months.get(period) ?? { period, scheduled: 0, reached: 0 }
      const date = dates.get(cell.trial_date) ?? { date: cell.trial_date, scheduled: 0, reached: 0 }

      month.scheduled += cell.scheduled
      month.reached += cell.reached
      date.scheduled += cell.scheduled
      date.reached += cell.reached
      months.set(period, month)
      dates.set(cell.trial_date, date)
      if (cell.lead_date < from) {
        result.previousLeadsScheduled += cell.scheduled
        result.previousLeadsReached += cell.reached
      }
    }
  }
  result.available &&= result.missingPeriods.length === 0

  // Never expose a partial sum as the center-wide total.
  if (!result.available) {
    result.scheduled = 0
    result.reached = 0
    result.previousLeadsScheduled = 0
    result.previousLeadsReached = 0
  }
  else {
    result.futureBookings.available = currentLeadMonthValid
    if (currentLeadMonthValid) {
      result.futureBookings.byTrialMonth = [...futureMonths.values()].filter(month => month.scheduled > 0).sort((a, b) => a.period.localeCompare(b.period))
      result.futureBookings.scheduled = result.futureBookings.byTrialMonth.reduce((sum, month) => sum + month.scheduled, 0)
    }
    result.byLeadMonth = [...months.values()].filter(month => month.scheduled > 0).sort((a, b) => b.period.localeCompare(a.period))

    // Zero-fill only a validated, available calendar; missing history must not look like empty days.
    let date = Date.parse(`${from}T00:00:00Z`)
    const end = Date.parse(`${to}T00:00:00Z`)

    while (date <= end) {
      const key = new Date(date).toISOString().slice(0, 10)

      result.byDate.push(dates.get(key) ?? { date: key, scheduled: 0, reached: 0 })
      date += 86400000
    }
  }

  return result
}

/** One complete all-age aggregate, immutable and bound to the release manifest. */
export const decodeGymkidsTrialHistory = (input: unknown, centerId: string): TrialHistorySlice[] => {
  const bundle = input as {
    schema_version?: string
    center_id?: string
    pipeline_id?: number
    origin_from?: string
    origin_to?: string
    as_of?: string
    slices?: Array<{ period: string; matrix: NonNullable<GymkidsSnapshotDetails['trial_cohort_matrix']> }>
  }

  const fail = () => {
    throw new Error('Календарь пробных повреждён или неполон')
  }

  if (!bundle || bundle.schema_version !== 'gymkids.trial-calendar.v2'
    || bundle.center_id !== centerId || bundle.pipeline_id !== 5539363
    || !/^\d{4}-\d{2}$/.test(bundle.origin_from ?? '') || !/^\d{4}-\d{2}$/.test(bundle.origin_to ?? '')
    || !bundle.as_of || Number.isNaN(Date.parse(bundle.as_of)) || !Array.isArray(bundle.slices))
    return fail()

  const periods: string[] = []
  let cursor = Date.parse(`${bundle.origin_from}-01T00:00:00Z`)
  const end = Date.parse(`${bundle.origin_to}-01T00:00:00Z`)
  if (!Number.isFinite(cursor) || !Number.isFinite(end) || cursor > end)
    return fail()
  while (cursor <= end) {
    const day = new Date(cursor)

    periods.push(day.toISOString().slice(0, 7))
    day.setUTCMonth(day.getUTCMonth() + 1)
    cursor = day.getTime()
  }
  if (bundle.slices.length !== periods.length || bundle.slices.some((slice, i) => slice.period !== periods[i]))
    return fail()

  const history: TrialHistorySlice[] = bundle.slices.map(slice => ({
    period: slice.period,
    details: {
      schema_version: 'gymkids.manager-details.v1',
      center: { id: centerId },
      request: { month: slice.period },
      trial_cohort_matrix: slice.matrix,
    },
  }))

  // Validate every origin, including empty months, before exposing any sum.
  if (!buildGymkidsTrialCalendar(history, centerId, `${bundle.origin_from}-01`, `${bundle.origin_to}-31`).available)
    return fail()

  return history
}
