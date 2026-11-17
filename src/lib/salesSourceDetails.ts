import { type SalesRecord, displayMetric, metric, ratio, salesRecords } from './planerkiSales'
import { monthlySales } from './salesMonthly'

export const salesSourceDefinitions = [
  { row: 12, label: 'Продления · группы', countRow: 10, averageRow: 11, eligibleRow: 8 },
  { row: 19, label: 'Продления · индивидуальные', countRow: 17, averageRow: 18, eligibleRow: 15 },
  { row: 30, label: 'Новые · группы', countRow: 32, averageRow: 31 },
  { row: 44, label: 'Новые · другие форматы', countRow: 42, averageRow: 43 },
  { row: 27, label: 'Возвращение БЧК', countRow: 25, averageRow: 26 },
  { row: 22, label: 'Доплаты' },
  { row: 66, label: 'Услуги и события' },
] as const
export type SalesSourceRow = typeof salesSourceDefinitions[number]['row']
export interface SourceParameter { label: string; unit: 'count' | 'money' | 'rate'; plan: number; fact: number; signed?: boolean }
export interface SourceTotals { plan: number; fact: number; countPlan: number; countFact: number; averagePlan: number; averageFact: number; illustrative: boolean }

const ticketInCurrency = (currency: string) => ({ RUB: 40000, AZN: 420, AMD: 160000, UZS: 4500000 }[currency] ?? 40000)
const round = (value: number, precision = 1) => Math.round(value / precision) * precision
const known = (value: number | null, fallback: number) => value ?? fallback

// Prototype-only allocation. Provenance stays explicit in the model, never in the workbook.
export function allocateSourceTotal(total: number, weights: number[], precision = 0.01) {
  const units = Math.round(total / precision)
  const sum = weights.reduce((a, b) => a + b, 0)
  const exact = weights.map(weight => units * weight / sum)
  const allocated = exact.map(Math.floor)
  const order = exact.map((value, index) => ({ index, remainder: value - allocated[index] })).sort((a, b) => b.remainder - a.remainder)
  const remaining = units - allocated.reduce((a, b) => a + b, 0)
  for (let index = 0; index < remaining; index++) allocated[order[index % order.length].index]++

  return allocated.map(value => round(value * precision, precision))
}

function completeBreakdown(total: number, values: (number | null)[], weights: number[], precision = 1) {
  const missing = values.map((value, index) => ({ value, index })).filter(item => item.value === null)
  const residual = Math.max(0, total - values.reduce<number>((sum, value) => sum + (value ?? 0), 0))
  const allocated = missing.length ? allocateSourceTotal(residual, missing.map(item => weights[item.index]), precision) : []
  let cursor = 0

  return values.map(value => value ?? allocated[cursor++])
}

export function sourceTotals(record: SalesRecord, row: SalesSourceRow): SourceTotals {
  const definition = salesSourceDefinitions.find(item => item.row === row)!
  const model = monthlySales(record)
  const source = model.sources.find(item => item.row === row)!
  const ticket = ticketInCurrency(record.currency) * (row === 19 || row === 44 ? 0.8 : row === 22 ? 0.12 : row === 66 ? 0.3 : 1)
  const budget = Math.max(metric(record, 3, 'plan') ?? metric(record, 3) ?? ticket * 100, 0)
  const share = { 12: 0.36, 19: 0.05, 30: 0.38, 44: 0.04, 27: 0.08, 22: 0.06, 66: 0.03 }[row]
  const plan = known(source.plan, round(budget * share))
  const fact = known(source.fact, round(plan * (1.04 + (row % 5) * 0.035)))
  const actualCount = row === 30 ? model.groups : row === 44 ? model.other : 'countRow' in definition ? displayMetric(record, definition.countRow) : null
  const plannedCount = 'countRow' in definition ? metric(record, definition.countRow, 'plan') : null
  const averagePlan = 'averageRow' in definition ? known(metric(record, definition.averageRow, 'plan'), ticket) : ticket
  const countPlan = known(plannedCount, Math.max(0, round(plan / Math.max(averagePlan, 1))))
  const countFact = known(actualCount, Math.max(0, round(fact / Math.max(averagePlan, 1))))

  return { plan, fact, countPlan, countFact, averagePlan, averageFact: ratio(fact, countFact) ?? averagePlan, illustrative: source.plan === null || source.fact === null || actualCount === null || plannedCount === null }
}

export function sourceDetails(record: SalesRecord, row: SalesSourceRow) {
  const definition = salesSourceDefinitions.find(item => item.row === row)!
  const totals = sourceTotals(record, row)

  const parameters: SourceParameter[] = [
    { label: row === 22 ? 'Доплаты · операций' : row === 66 ? 'Услуги · продаж' : 'Абонементы · шт.', unit: 'count', plan: totals.countPlan, fact: totals.countFact },
    { label: row === 22 ? 'Средняя доплата' : 'Средний чек', unit: 'money', plan: totals.averagePlan, fact: totals.averageFact },
  ]

  const planCounts = completeBreakdown(totals.countPlan, [33, 34, 35, 36].map(item => metric(record, item, 'plan')), [0.15, 0.35, 0.35, 0.15], 0.01)
  const factCounts = completeBreakdown(totals.countFact, [33, 34, 35, 36].map(item => displayMetric(record, item)), [0.15, 0.35, 0.35, 0.15])
  if (row === 30) {
    const labels = ['1 месяц', '3 месяца', '6 месяцев', '12 месяцев']

    labels.forEach((label, index) => parameters.push({ label, unit: 'count', plan: known(metric(record, 33 + index, 'plan'), planCounts[index]), fact: known(displayMetric(record, 33 + index), factCounts[index]) }))
  }
  else if ('eligibleRow' in definition) {
    const eligiblePlan = known(metric(record, definition.eligibleRow, 'plan'), Math.ceil(totals.countPlan / 0.6))
    const eligibleFact = known(displayMetric(record, definition.eligibleRow), Math.ceil(totals.countFact / 0.62))

    parameters.push({ label: 'К продлению · шт.', unit: 'count', plan: eligiblePlan, fact: eligibleFact })
    parameters.push({ label: 'Конверсия продления', unit: 'rate', plan: ratio(totals.countPlan, eligiblePlan) ?? 0, fact: ratio(totals.countFact, eligibleFact) ?? 0 })
  }
  else if (row === 44) {
    const weights = [0.65, 0.2, 0.15]
    const plans = completeBreakdown(totals.countPlan, [39, 40, 41].map(item => metric(record, item, 'plan')), weights, 0.01)

    const facts = completeBreakdown(totals.countFact, [39, 40, 41].map(item => displayMetric(record, item)), weights)

    ;['Индивидуальные', 'Сплит', 'Мини-группы'].forEach((label, index) => parameters.push({ label, unit: 'count', plan: known(metric(record, 39 + index, 'plan'), plans[index]), fact: known(displayMetric(record, 39 + index), facts[index]) }))
  }
  else if (row === 66) {
    const plans = completeBreakdown(totals.plan, [62, 63, 64, 65].map(item => metric(record, item, 'plan')), [0.18, 0.35, 0.3, 0.17], 0.01)

    const facts = completeBreakdown(totals.fact, [62, 63, 64, 65].map(item => displayMetric(record, item)), [0.18, 0.35, 0.3, 0.17], 0.01)

    ;['Бар и посещения', 'Лагерь и мастер-классы', 'Дни рождения', 'События'].forEach((label, index) => parameters.push({ label, unit: 'money', plan: known(metric(record, 62 + index, 'plan'), plans[index]), fact: known(displayMetric(record, 62 + index), facts[index]) }))
  }

  // Keep workbook aggregates and known parts intact; expose any mismatch instead of silently reconciling them.
  if ([30, 44, 66].includes(row)) {
    const parts = parameters.slice(2)
    const planDifference = (row === 66 ? totals.plan : totals.countPlan) - parts.reduce((sum, item) => sum + item.plan, 0)
    const factDifference = (row === 66 ? totals.fact : totals.countFact) - parts.reduce((sum, item) => sum + item.fact, 0)
    if (Math.abs(planDifference) > 0.01 || Math.abs(factDifference) > 0.01)
      parameters.push({ label: 'Итог − разбивка', unit: row === 66 ? 'money' : 'count', plan: round(planDifference, 0.01), fact: round(factDifference, 0.01), signed: true })
  }
  const names = ['Анна', 'Мария', 'Екатерина', 'Дмитрий']
  const managerPlans = allocateSourceTotal(totals.plan, [0.32, 0.27, 0.23, 0.18])
  const managerFacts = allocateSourceTotal(totals.fact, [0.3, 0.29, 0.19, 0.22])
  const managers = names.map((name, index) => ({ name, plan: managerPlans[index], fact: managerFacts[index], origin: 'illustrative' as const }))

  // Prefer the same currency; each row retains its own currency when fewer peers exist.
  const peers = salesRecords.filter(item => item.period === record.period && item.centerId !== record.centerId)
    .map(item => ({ record: item, totals: sourceTotals(item, row) }))
    .sort((a, b) => Number(b.record.currency === record.currency) - Number(a.record.currency === record.currency) || Math.abs((ratio(a.totals.fact, a.totals.plan) ?? 0) - (ratio(totals.fact, totals.plan) ?? 0)) - Math.abs((ratio(b.totals.fact, b.totals.plan) ?? 0) - (ratio(totals.fact, totals.plan) ?? 0)))
    .slice(0, 5)

  const centers = peers.map(item => ({ id: item.record.centerId, name: item.record.centerName, currency: item.record.currency, plan: item.totals.plan, fact: item.totals.fact, completion: ratio(item.totals.fact, item.totals.plan), origin: item.totals.illustrative ? 'mixed' as const : 'workbook' as const }))
  const month = record.period.slice(5)

  const years = [2024, 2025, 2026].map((year, index) => {
    const historical = salesRecords.find(item => item.centerId === record.centerId && item.period === `${year}-${month}` && item.currency === record.currency)
    const factor = [0.72, 0.86, 1][index]
    const values = historical ? sourceTotals(historical, row) : { plan: round(totals.plan * (factor + 0.04)), fact: round(totals.fact * factor) }

    return { year, plan: values.plan, fact: values.fact, completion: ratio(values.fact, values.plan), origin: historical && !sourceTotals(historical, row).illustrative ? 'workbook' as const : 'illustrative' as const }
  })

  return { row, label: definition.label, totals, parameters, managers, centers, years }
}
