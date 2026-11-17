import { getGymkidsApprovedLeadPlan } from './gymkidsPlans'
import type { FunnelDay, GymkidsSnapshotDetails, GymkidsSnapshotPayload } from './gymkidsSnapshotTypes'
import { daysInMonth, forecast, metric, percent, sumRows, valueOrZero } from './gymkidsSnapshotMetrics'

export interface SnapshotSelection {
  allRows: FunnelDay[]
  selectedRows: FunnelDay[]
  selectedDates: string[]
  availableThroughDate: string
  selectedDate: string
  period: string
}

export const selectSnapshotWindow = (payload: GymkidsSnapshotPayload, requestedDate?: string): SnapshotSelection => {
  const allRows = [...payload.overview.days].sort((left, right) => left.date.localeCompare(right.date))
  const availableThroughDate = allRows.at(-1)!.date

  const selectedDate = requestedDate && requestedDate >= allRows[0].date && requestedDate <= availableThroughDate
    ? requestedDate
    : availableThroughDate

  const selectedRows = allRows.filter(row => row.date <= selectedDate)
  const selectedDates = selectedRows.map(row => row.date)
  const period = payload.request.month || selectedDate.slice(0, 7)

  return { allRows, selectedRows, selectedDates, availableThroughDate, selectedDate, period }
}

export const summarizeSnapshotCohort = (
  payload: GymkidsSnapshotPayload,
  details: GymkidsSnapshotDetails | null | undefined,
  selection: SnapshotSelection,
) => {
  const { allRows, selectedRows, selectedDates, selectedDate, period } = selection
  const approvedPlan = getGymkidsApprovedLeadPlan(payload.center.id, period)
  const hasApprovedTotalPlan = approvedPlan?.totalLeads !== null && approvedPlan?.totalLeads !== undefined
  const elapsedDays = Number(selectedDate.slice(-2))
  const monthDays = metric(payload.plan?.month_days) ?? daysInMonth(period)
  const fact = sumRows(selectedRows, row => row.leads)
  const leadPlan = approvedPlan?.totalLeads ?? 0
  const valid = sumRows(selectedRows, row => row.valid)
  const invalid = sumRows(selectedRows, row => row.invalid)
  const inWork = sumRows(selectedRows, row => row.in_work) + sumRows(selectedRows, row => row.unknown)
  const cohortScheduled = sumRows(selectedRows, row => row.scheduled)
  const cohortReached = sumRows(selectedRows, row => row.reached)
  const validityIntersections = details?.validity_trial_intersections?.by_lead_date

  const completeValidityIntersections = validityIntersections && selectedDates.every(date => validityIntersections[date]?.valid)
    ? validityIntersections
    : null

  const validScheduled = completeValidityIntersections
    ? selectedDates.reduce((sum, date) => sum + valueOrZero(completeValidityIntersections[date].valid?.scheduled), 0)
    : null

  const validReached = completeValidityIntersections
    ? selectedDates.reduce((sum, date) => sum + valueOrZero(completeValidityIntersections[date].valid?.reached), 0)
    : null

  const leadForecast = forecast(fact, elapsedDays, monthDays)
  const forecastRate = leadPlan ? percent(leadForecast, leadPlan) : 0
  const scaleMax = Math.max(50, Math.ceil(Math.max(leadForecast, leadPlan) / 50) * 50)
  const dailyPlan = leadPlan / monthDays
  const dailyFact = elapsedDays ? fact / elapsedDays : 0

  const maxDaily = Math.max(
    dailyPlan,
    ...selectedRows.map(row => valueOrZero(row.leads)),
    1,
  )

  const rowsByDay = Object.fromEntries(allRows.map(row => [Number(row.date.slice(-2)), row]))

  return {
    approvedPlan,
    hasApprovedTotalPlan,
    elapsedDays,
    monthDays,
    fact,
    leadPlan,
    valid,
    invalid,
    inWork,
    cohortScheduled,
    cohortReached,
    validScheduled,
    validReached,
    leadForecast,
    forecastRate,
    scaleMax,
    dailyPlan,
    dailyFact,
    maxDaily,
    rowsByDay,
  }
}
