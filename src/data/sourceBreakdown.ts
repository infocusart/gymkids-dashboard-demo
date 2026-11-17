import breakdown from './sourceBreakdown.generated.json'
import type { DashboardReasonRow, DashboardSourceRow } from './gymkidsSnapshot'

export type SourceCardRow = Pick<DashboardSourceRow, 'key' | 'label' | 'fact' | 'share' | 'shareLabel' | 'tone'>

type CompactableSourceRow = Pick<DashboardSourceRow, 'key' | 'label' | 'fact'>

interface Breakdown {
  release_id: string
  periods: Record<string, Record<string, Record<string, number>>>
}

const sourceBreakdown = breakdown as Breakdown

const percent = (value: number, total: number) => total
  ? Math.round(value / total * 1000) / 10
  : 0

const percentLabel = (value: number) => `${String(value).replace('.', ',')}%`

const isExistingOtherRow = (row: CompactableSourceRow) => row.key === 'other'
  || row.label.toLocaleLowerCase('ru-RU').startsWith('остальн')

const compactParts = <Row extends CompactableSourceRow>(rows: readonly Row[]) => {
  const sorted = [...rows].sort((left, right) => right.fact - left.fact || left.label.localeCompare(right.label, 'ru'))
  const primary = sorted.filter(row => !isExistingOtherRow(row)).slice(0, 4)
  const primaryKeys = new Set(primary.map(row => row.key))

  return {
    primary,
    remainder: sorted.filter(row => !primaryKeys.has(row.key)),
  }
}

const isExistingOtherReason = (row: DashboardReasonRow) => row.label.toLocaleLowerCase('ru-RU').startsWith('остальн')

export const compactReasonRows = (
  rows: readonly DashboardReasonRow[],
  totalInvalid: number,
): DashboardReasonRow[] => {
  const sorted = [...rows].sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, 'ru'))
  const primary = sorted.filter(row => !isExistingOtherReason(row)).slice(0, 3)
  const primaryKeys = new Set(primary.map(row => row.key))
  const remainder = sorted.filter(row => !primaryKeys.has(row.key))

  if (!remainder.length)
    return primary

  const value = remainder.reduce((sum, row) => sum + row.value, 0)
  const share = percent(value, totalInvalid)

  return [...primary, {
    key: 'compact-other-reasons',
    label: 'Остальные причины',
    value,
    share,
    shareLabel: percentLabel(share),
  }]
}

export const compactSourceCardRows = (
  rows: readonly SourceCardRow[],
  totalLeads: number,
): SourceCardRow[] => {
  const { primary, remainder } = compactParts(rows)

  if (!remainder.length)
    return primary

  const fact = remainder.reduce((sum, row) => sum + row.fact, 0)
  const share = percent(fact, totalLeads)

  return [...primary, {
    key: 'compact-other',
    label: 'Остальное',
    fact,
    share,
    shareLabel: percentLabel(share),
    tone: 'neutral',
  }]
}

export const compactDashboardSourceRows = (
  rows: readonly DashboardSourceRow[],
  totalLeads: number,
): DashboardSourceRow[] => {
  const { primary, remainder } = compactParts(rows)

  if (!remainder.length)
    return primary

  const sum = (field: keyof Pick<DashboardSourceRow, 'fact' | 'plan' | 'valid' | 'scheduled' | 'reached' | 'forecast' | 'delta'>) => remainder
    .reduce((total, row) => total + row[field], 0)

  const fact = sum('fact')
  const plan = sum('plan')
  const valid = sum('valid')
  const scheduled = sum('scheduled')
  const reached = sum('reached')
  const forecast = sum('forecast')
  const delta = sum('delta')
  const share = percent(fact, totalLeads)
  const forecastRate = percent(forecast, plan)

  return [...primary, {
    ...remainder[0],
    key: 'compact-other',
    label: 'Остальное',
    fact,
    factLabel: fact.toLocaleString('ru-RU'),
    plan,
    valid,
    scheduled,
    reached,
    share,
    shareLabel: percentLabel(share),
    forecast,
    forecastLabel: forecast.toLocaleString('ru-RU'),
    forecastRate,
    forecastRateLabel: percentLabel(forecastRate),
    delta,
    deltaLabel: `${delta > 0 ? '+' : ''}${delta.toLocaleString('ru-RU')}`,
    tone: 'neutral',
    validRate: percent(valid, fact),
    scheduledRate: percent(scheduled, fact),
    reachedRate: percent(reached, fact),
  }]
}

export const sourceCardRows = (
  sources: readonly DashboardSourceRow[],
  totalLeads: number,
  centerId: string,
  period: string,
  selectedDate: string,
  releaseId: string | undefined,
): SourceCardRow[] => {
  const days = releaseId === sourceBreakdown.release_id
    ? sourceBreakdown.periods[`${centerId}/${period}`]
    : undefined

  const aggregate = sources.find(source => source.key === 'other')

  if (!days || !aggregate)
    return [...sources]

  const counts = new Map<string, number>()

  for (const [day, labels] of Object.entries(days)) {
    if (day > selectedDate)
      continue

    for (const [label, count] of Object.entries(labels))
      counts.set(label, (counts.get(label) ?? 0) + count)
  }

  const expandedCount = [...counts.values()].reduce((sum, count) => sum + count, 0)

  // A new CRM snapshot may change source assignments; never show a stale split.
  if (expandedCount !== aggregate.fact)
    return [...sources]

  const detailedRows: SourceCardRow[] = [...counts]
    .filter(([, count]) => count > 0)
    .map(([label, fact]) => {
      const share = totalLeads ? Math.round(fact / totalLeads * 1000) / 10 : 0

      return {
        key: `amo:${label}`,
        label,
        fact,
        share,
        shareLabel: `${String(share).replace('.', ',')}%`,
        tone: 'neutral',
      }
    })

  return [...sources.filter(source => source.key !== 'other'), ...detailedRows]
    .sort((left, right) => right.fact - left.fact || left.label.localeCompare(right.label, 'ru'))
}
