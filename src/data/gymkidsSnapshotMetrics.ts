import type { DashboardTone, MetricValue } from './gymkidsSnapshotTypes'

export const round = (value: number, precision = 1) => {
  const factor = 10 ** precision

  return Math.round(value * factor) / factor
}

export const metric = (value: MetricValue | undefined): number | null => {
  if (value && typeof value === 'object')
    return value.available === false ? null : metric(value.value)

  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export const valueOrZero = (value: MetricValue | undefined) => metric(value) ?? 0
export const percent = (value: number, total: number) => total ? round((value / total) * 100) : 0
export const forecast = (fact: number, elapsedDays: number, daysInPeriod: number) => elapsedDays ? Math.round((fact / elapsedDays) * daysInPeriod) : 0
export const toneForRate = (rate: number, hasPlan = true): DashboardTone => {
  if (!hasPlan)
    return 'neutral'

  return rate > 95 ? 'positive' : rate >= 85 ? 'warning' : 'negative'
}

export const sumRows = <T>(rows: T[], getValue: (row: T) => MetricValue | undefined) => rows.reduce((sum, row) => sum + valueOrZero(getValue(row)), 0)

export const daysInMonth = (period: string) => {
  const [year, month] = period.split('-').map(Number)

  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}
