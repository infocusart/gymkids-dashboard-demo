import type { DashboardSourceRow, GymkidsSnapshotPayload, SourceKey } from './gymkidsSnapshotTypes'
import type { getGymkidsApprovedLeadPlan } from './gymkidsPlans'
import { forecast, percent, round, toneForRate, valueOrZero } from './gymkidsSnapshotMetrics'
import { formatDelta, formatNumber, formatPercent } from './gymkidsSnapshotFormatting'

const aggregateSource = (
  payload: GymkidsSnapshotPayload,
  dates: string[],
  sourceKey: SourceKey,
) => dates.reduce((result, date) => {
  const row = payload.overview.source_by_key_by_date[date]?.[sourceKey]

  if (!row)
    throw new Error(`[gymkids-snapshot] нет источника ${sourceKey} за ${date}`)

  result.leads += valueOrZero(row.leads)
  result.valid += valueOrZero(row.valid)
  result.scheduled += valueOrZero(row.valid_scheduled === undefined ? row.scheduled : row.valid_scheduled)
  result.reached += valueOrZero(row.valid_reached === undefined ? row.reached : row.valid_reached)

  return result
}, { leads: 0, valid: 0, scheduled: 0, reached: 0 })

export const fallbackSource = (source: DashboardSourceRow | undefined, key: SourceKey, label: string): DashboardSourceRow => source ?? {
  key,
  label,
  fact: 0,
  factLabel: '0',
  plan: 0,
  valid: 0,
  scheduled: 0,
  reached: 0,
  share: 0,
  shareLabel: '0%',
  forecast: 0,
  forecastLabel: '0',
  forecastRate: 0,
  forecastRateLabel: '0%',
  delta: 0,
  deltaLabel: '0%',
  tone: 'neutral',
  validRate: 0,
  scheduledRate: 0,
  reachedRate: 0,
}

const summarizeSnapshotSources = (
  sources: DashboardSourceRow[],
  fact: number,
  elapsedDays: number,
  monthDays: number,
): DashboardSourceRow[] => {
  if (sources.length <= 4)
    return sources

  const remainder = sources.slice(4).reduce((total, source) => ({
    fact: total.fact + source.fact,
    valid: total.valid + source.valid,
    scheduled: total.scheduled + source.scheduled,
    reached: total.reached + source.reached,
  }), { fact: 0, valid: 0, scheduled: 0, reached: 0 })

  const remainderForecast = forecast(remainder.fact, elapsedDays, monthDays)

  return [
    ...sources.slice(0, 4),
    {
      key: 'other-sources',
      label: 'Остальные источники',
      fact: remainder.fact,
      factLabel: formatNumber(remainder.fact),
      plan: 0,
      valid: remainder.valid,
      scheduled: remainder.scheduled,
      reached: remainder.reached,
      share: percent(remainder.fact, fact),
      shareLabel: formatPercent(percent(remainder.fact, fact)),
      forecast: remainderForecast,
      forecastLabel: formatNumber(remainderForecast),
      forecastRate: 0,
      forecastRateLabel: '—',
      delta: 0,
      deltaLabel: '—',
      tone: 'neutral' as const,
      validRate: percent(remainder.valid, remainder.fact),
      scheduledRate: percent(remainder.scheduled, remainder.fact),
      reachedRate: percent(remainder.reached, remainder.fact),
    },
  ]
}

export const buildSnapshotSources = (
  payload: GymkidsSnapshotPayload,
  selectedDates: string[],
  elapsedDays: number,
  monthDays: number,
  fact: number,
  approvedPlan: ReturnType<typeof getGymkidsApprovedLeadPlan>,
): { sources: DashboardSourceRow[]; sourcesSummary: DashboardSourceRow[] } => {
  const sourceDisplayLabels: Record<string, string> = {
    'Повторная проработка': 'Повторная',
    'Колесо фортуны': 'Колесо',
  }

  const sourceLabels = Object.fromEntries(payload.overview.source_catalog.map(row => [
    row.key,
    sourceDisplayLabels[row.label] ?? row.label,
  ]))

  const sources = payload.overview.source_order_keys.map(key => {
    const selected = aggregateSource(payload, selectedDates, key)
    const projected = forecast(selected.leads, elapsedDays, monthDays)

    const sourcePlan = key === 'website'
      ? approvedPlan?.internetLeads ?? null
      : key === 'promo'
        ? approvedPlan?.promoLeads ?? null
        : null

    const projectedRate = sourcePlan ? percent(projected, sourcePlan) : 0

    return {
      key,
      label: sourceLabels[key] ?? key,
      fact: selected.leads,
      factLabel: formatNumber(selected.leads),
      plan: sourcePlan ?? 0,
      planAvailable: sourcePlan !== null,
      valid: selected.valid,
      scheduled: selected.scheduled,
      reached: selected.reached,
      share: percent(selected.leads, fact),
      shareLabel: formatPercent(percent(selected.leads, fact)),
      forecast: projected,
      forecastLabel: formatNumber(projected),
      forecastRate: projectedRate,
      forecastRateLabel: formatPercent(projectedRate),
      delta: round(projectedRate - 100),
      deltaLabel: formatDelta(projectedRate - 100),
      tone: toneForRate(projectedRate, sourcePlan !== null && sourcePlan > 0),
      validRate: percent(selected.valid, selected.leads),
      scheduledRate: percent(selected.scheduled, selected.leads),
      reachedRate: percent(selected.reached, selected.leads),
    }
  })
    .filter(source => source.fact > 0)
    .sort((left, right) => right.fact - left.fact)

  const sourcesSummary = summarizeSnapshotSources(sources, fact, elapsedDays, monthDays)

  return { sources, sourcesSummary }
}
