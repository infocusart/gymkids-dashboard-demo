export type DemoTone = 'positive' | 'warning' | 'negative' | 'neutral'

export interface DemoSourceRow {
  key: string
  label: string
  fact: number
  plan: number
  valid: number
  scheduled: number
  reached: number
}

export interface DemoBreakdownRow {
  key: string
  label: string
  value: number
}

const round = (value: number, precision = 1) => {
  const factor = 10 ** precision

  return Math.round(value * factor) / factor
}

const percent = (value: number, total: number) => total ? round((value / total) * 100) : 0
const forecast = (fact: number, elapsedDays: number, daysInPeriod: number) => Math.round((fact / elapsedDays) * daysInPeriod)
const toneForRate = (rate: number): DemoTone => rate > 95 ? 'positive' : rate >= 85 ? 'warning' : 'negative'
const formatPercent = (value: number) => `${String(round(value)).replace('.', ',')}%`
const formatNumber = (value: number) => value.toLocaleString('ru-RU')
const formatMoney = (value: number) => `${value.toLocaleString('ru-RU')} ₽`
const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${String(round(value)).replace('.', ',')}%`

const meta = {
  centerId: 'novo-peredelkino-demo',
  centerName: 'Ново-Переделкино',
  period: '2026-04',
  periodLabel: 'Апрель 2026',
  elapsedDays: 28,
  daysInPeriod: 30,
}

const daily = [12, 15, 17, 19, 14, 20, 16, 18, 22, 13, 15, 21, 19, 17, 14, 20, 18, 16, 23, 15, 17, 19, 21, 14, 16, 22, 18, 19] as const

const leads = {
  fact: 490,
  plan: 520,
  daily,
}

const cohort = {
  valid: 275,
  invalid: 209,
  inWork: 6,
  scheduled: 236,
  reached: 185,
}

const sources: readonly DemoSourceRow[] = [
  { key: 'website', label: 'Сайт', fact: 180, plan: 190, valid: 115, scheduled: 105, reached: 86 },
  { key: 'promo', label: 'Промо', fact: 136, plan: 165, valid: 65, scheduled: 50, reached: 36 },
  { key: 'direct', label: 'Прямые', fact: 69, plan: 75, valid: 40, scheduled: 35, reached: 30 },
  { key: 'wheel', label: 'Колесо', fact: 34, plan: 35, valid: 20, scheduled: 15, reached: 12 },
  { key: 'other', label: 'Остальные', fact: 71, plan: 55, valid: 35, scheduled: 31, reached: 21 },
]

const invalidReasons: readonly DemoBreakdownRow[] = [
  { key: 'duplicate', label: 'Дубль / уже есть сделка', value: 74 },
  { key: 'unreachable', label: 'Глухой недозвон', value: 54 },
  { key: 'no-answer', label: 'Нет ответа / причина не установлена', value: 33 },
  { key: 'other', label: 'Другие причины', value: 48 },
]

const inWorkStages: readonly DemoBreakdownRow[] = [
  { key: 'assigned', label: 'Назначен оператор', value: 2 },
  { key: 'contact', label: 'На связи', value: 2 },
  { key: 'callback', label: 'Согласован перезвон', value: 1 },
  { key: 'consultation', label: 'На консультации', value: 1 },
]

const promoAgencies: readonly DemoBreakdownRow[] = [
  { key: 'city', label: 'Городские', value: 72 },
  { key: 'private', label: 'Частные', value: 40 },
  { key: 'partners', label: 'Партнёры', value: 24 },
]

const assertEqual = (label: string, actual: number, expected: number) => {
  if (actual !== expected)
    throw new Error(`[gymkids-demo] ${label}: expected ${expected}, received ${actual}`)
}

assertEqual('daily leads', daily.reduce((sum, value) => sum + value, 0), leads.fact)
assertEqual('source facts', sources.reduce((sum, source) => sum + source.fact, 0), leads.fact)
assertEqual('source plans', sources.reduce((sum, source) => sum + source.plan, 0), leads.plan)
assertEqual('quality states', cohort.valid + cohort.invalid + cohort.inWork, leads.fact)
assertEqual('source valid', sources.reduce((sum, source) => sum + source.valid, 0), cohort.valid)
assertEqual('source scheduled', sources.reduce((sum, source) => sum + source.scheduled, 0), cohort.scheduled)
assertEqual('source reached', sources.reduce((sum, source) => sum + source.reached, 0), cohort.reached)
assertEqual('invalid reasons', invalidReasons.reduce((sum, reason) => sum + reason.value, 0), cohort.invalid)
assertEqual('in-work stages', inWorkStages.reduce((sum, stage) => sum + stage.value, 0), cohort.inWork)
assertEqual('promo agencies', promoAgencies.reduce((sum, agency) => sum + agency.value, 0), sources.find(source => source.key === 'promo')?.fact ?? 0)

for (const source of sources) {
  if (!(source.reached <= source.scheduled && source.scheduled <= source.valid && source.valid <= source.fact))
    throw new Error(`[gymkids-demo] invalid nested funnel for ${source.key}`)
}

const leadForecast = forecast(leads.fact, meta.elapsedDays, meta.daysInPeriod)
const leadForecastRate = percent(leadForecast, leads.plan)
const leadScaleMax = Math.ceil(Math.max(leadForecast, leads.plan) / 50) * 50
const maxDaily = Math.max(...daily, leads.plan / meta.daysInPeriod)
const planPerDay = leads.plan / meta.daysInPeriod

const leadChart = Array.from({ length: meta.daysInPeriod }, (_, index) => {
  const isElapsed = index < meta.elapsedDays
  const value = daily[index] ?? 0

  return {
    day: index + 1,
    value: isElapsed ? value : null,
    state: isElapsed ? 'elapsed' as const : 'future' as const,
    actualHeight: isElapsed ? round((value / maxDaily) * 100) : 0,
    planHeight: round((planPerDay / maxDaily) * 100),
    displayHeight: round(((isElapsed ? value : planPerDay) / maxDaily) * 100),
  }
})

const sourceView = sources.map(source => {
  const projected = forecast(source.fact, meta.elapsedDays, meta.daysInPeriod)
  const projectedRate = percent(projected, source.plan)

  return {
    ...source,
    factLabel: formatNumber(source.fact),
    share: percent(source.fact, leads.fact),
    shareLabel: formatPercent(percent(source.fact, leads.fact)),
    forecast: projected,
    forecastLabel: formatNumber(projected),
    forecastRate: projectedRate,
    forecastRateLabel: formatPercent(projectedRate),
    delta: round(projectedRate - 100),
    deltaLabel: formatDelta(projectedRate - 100),
    tone: toneForRate(projectedRate),
    validRate: percent(source.valid, source.fact),
    scheduledRate: percent(source.scheduled, source.fact),
    reachedRate: percent(source.reached, source.fact),
  }
})

const website = sourceView.find(source => source.key === 'website')!
const promo = sourceView.find(source => source.key === 'promo')!
const websiteDemoSpend = 223200
const websiteCpl = round(websiteDemoSpend / website.fact, 0)

assertEqual('website CPL attribution', websiteCpl * website.fact, websiteDemoSpend)

export const gymkidsDemoView = {
  meta: {
    ...meta,
    dayLabel: `${meta.elapsedDays} из ${meta.daysInPeriod} дней`,
  },
  leads: {
    ...leads,
    factLabel: formatNumber(leads.fact),
    planLabel: formatNumber(leads.plan),
    dailyPlan: round(leads.plan / meta.daysInPeriod),
    dailyPlanLabel: String(round(leads.plan / meta.daysInPeriod)).replace('.', ','),
    dailyFact: round(leads.fact / meta.elapsedDays),
    dailyFactLabel: String(round(leads.fact / meta.elapsedDays)).replace('.', ','),
    average: round(leads.fact / meta.elapsedDays),
    averageLabel: String(round(leads.fact / meta.elapsedDays)).replace('.', ','),
    forecast: leadForecast,
    forecastLabel: formatNumber(leadForecast),
    forecastRate: leadForecastRate,
    forecastRateLabel: formatPercent(leadForecastRate),
    scaleMax: leadScaleMax,
    planPosition: percent(leads.plan, leadScaleMax),
    forecastPosition: percent(leadForecast, leadScaleMax),
    tone: toneForRate(leadForecastRate),
    progress: Math.min(100, percent(leads.fact, leads.plan)),
    chart: leadChart,
  },
  trial: {
    scheduled: cohort.scheduled,
    reached: cohort.reached,
    noShow: cohort.scheduled - cohort.reached,
    attendanceRate: percent(cohort.reached, cohort.scheduled),
    attendanceRateLabel: formatPercent(percent(cohort.reached, cohort.scheduled)),
  },
  quality: {
    ...cohort,
    validRate: percent(cohort.valid, leads.fact),
    validRateLabel: formatPercent(percent(cohort.valid, leads.fact)),
    invalidRate: percent(cohort.invalid, leads.fact),
    invalidRateLabel: formatPercent(percent(cohort.invalid, leads.fact)),
    inWorkRate: percent(cohort.inWork, leads.fact),
    inWorkRateLabel: formatPercent(percent(cohort.inWork, leads.fact)),
    reasons: invalidReasons.map(reason => ({
      ...reason,
      share: percent(reason.value, cohort.invalid),
      shareLabel: formatPercent(percent(reason.value, cohort.invalid)),
    })),
    inWorkStages,
  },
  sources: sourceView,
  website: {
    ...website,
    cpl: websiteCpl,
    cplLabel: formatMoney(websiteCpl),
    demoSpend: websiteDemoSpend,
  },
  promo: {
    ...promo,
    agencies: promoAgencies,
  },
}
