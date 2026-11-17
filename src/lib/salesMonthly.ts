import { type SalesRecord, completeSum, displayMetric, metric, ratio } from './planerkiSales'

// The original source rows remain available unchanged. Desktop uses explicit populations.
export function monthlySales(record: SalesRecord) {
  const f = (row: number) => displayMetric(record, row)
  const p = (row: number) => metric(record, row, 'plan')
  const groups = completeSum([33, 34, 35, 36].map(f))
  const other = completeSum([39, 40, 41].map(f))
  const allNew = completeSum([groups, other])
  const lostGroups = f(8) === null || f(10) === null ? null : f(8)! - f(10)!
  const replacement = groups === null || lostGroups === null ? null : groups - lostGroups

  const sources = [
    { key: 'renewals', label: 'Продления · группы', row: 12 },
    { key: 'renewals', label: 'Продления · индивидуальные', row: 19 },
    { key: 'new', label: 'Новые · группы', row: 30 },
    { key: 'extra', label: 'Новые · другие форматы', row: 44 },
    { key: 'bchk', label: 'Возвращение БЧК', row: 27 },
    { key: 'topups', label: 'Доплаты', row: 22 },
    { key: 'services', label: 'Услуги и события', row: 66 },
  ].map(item => ({ ...item, plan: item.row === 66 && p(66) === 0 && [62, 63, 64, 65].every(row => p(row) === null) ? null : p(item.row), fact: f(item.row) }))

  const knownPlan = sources.reduce((sum, item) => sum + (item.plan ?? 0), 0)
  const knownFact = sources.reduce((sum, item) => sum + (item.fact ?? 0), 0)
  const planGap = p(3) === null ? null : p(3)! - knownPlan
  const factGap = f(3) === null ? null : f(3)! - knownFact
  const days = f(72)
  const monthDays = new Date(Number(record.period.slice(0, 4)), Number(record.period.slice(5, 7)), 0).getDate()
  const net = f(3) === null ? null : f(5)
  const forecast = net === null || days === null || days <= 0 || days > monthDays ? null : net / days * monthDays

  return {
    groups,
    other,
    allNew,
    lostGroups,
    replacement,
    sources,
    knownPlan,
    knownFact,
    planGap,
    factGap,
    missingPlans: sources.filter(item => item.plan === null).length,
    missingFacts: sources.filter(item => item.fact === null).length,
    groupAverage: ratio(f(30), groups),
    otherAverage: ratio(f(44), other),
    purchaseRate: ratio(allNew, f(46)),
    attendanceRate: ratio(f(46), f(48)),
    leadTrialRate: ratio(f(46), f(58)),
    net,
    forecast,
    monthDays,
    days,
    remaining: net === null || p(5) === null ? null : Math.max(0, p(5)! - net),
    renewals: [
      { label: 'Группы', eligibleRow: 8, rateRow: 9, countRow: 10, averageRow: 11, amountRow: 12 },
      { label: 'Индивидуальные', eligibleRow: 15, rateRow: 16, countRow: 17, averageRow: 18, amountRow: 19 },
    ].map(item => ({ ...item, rate: ratio(f(item.countRow), f(item.eligibleRow)), planRate: p(item.rateRow), average: ratio(f(item.amountRow), f(item.countRow)) })),
  }
}
