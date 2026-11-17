import { round } from './gymkidsSnapshotMetrics'

export const formatPercent = (value: number) => `${String(round(value)).replace('.', ',')}%`
export const formatNumber = (value: number) => value.toLocaleString('ru-RU')
export const formatMoney = (value: number) => `${Math.round(value).toLocaleString('ru-RU')} ₽`
export const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${String(round(value)).replace('.', ',')}%`
export const periodLabel = (period: string) => {
  const [year, month] = period.split('-').map(Number)

  const label = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)))

  return label.charAt(0).toUpperCase() + label.slice(1)
}
