import { type SalesRecord, displayMetric, metric, ratio } from './planerkiSales'
import { allocateSourceTotal } from './salesSourceDetails'

// Daily distribution is an illustrative prototype; workbook totals stay authoritative.
export function salesLeads(record: SalesRecord) {
  const monthDays = new Date(Number(record.period.slice(0, 4)), Number(record.period.slice(5)), 0).getDate()
  const days = Math.min(monthDays, Math.max(0, displayMetric(record, 72) ?? Number(record.endDate.slice(-2))))
  const fact = displayMetric(record, 58)
  const plan = metric(record, 58, 'plan')
  const dailyPlan = plan === null ? null : plan / monthDays
  const dailyFact = ratio(fact, days)
  let seed = [...`${record.centerId}:${record.period}`].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7)

  const weights = Array.from({ length: days }, () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0

    return 0.3 + seed / 4294967296 * 1.7
  })

  const values = fact === null || !days ? [] : allocateSourceTotal(Math.max(0, fact), weights, 1)
  const maximum = Math.max(1, dailyPlan ?? 0, ...values)
  const chart = Array.from({ length: monthDays }, (_, index) => ({ day: index + 1, value: values[index] ?? null, future: index >= days, height: (values[index] ?? dailyPlan ?? 0) / maximum * 100 }))

  return { fact, plan, days, monthDays, dailyPlan, dailyFact, rate: ratio(fact, plan), planHeight: (dailyPlan ?? 0) / maximum * 100, chart, dailyOrigin: 'illustrative' as const }
}
