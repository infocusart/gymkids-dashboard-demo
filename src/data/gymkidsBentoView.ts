import { gymkidsBento } from './gymkidsBento'

const percent = (value: number, total: number) => total ? Number(((value / total) * 100).toFixed(1)) : 0
const formatPercent = (value: number) => `${String(value).replace('.', ',')}%`

const maxDaily = Math.max(...gymkidsBento.leads.daily)
const maxSource = Math.max(...gymkidsBento.sources.map(item => item.leads))
const maxReached = Math.max(...gymkidsBento.sourceQuality.map(item => item.reached))

export const gymkidsBentoView = {
  meta: gymkidsBento.meta,
  leads: {
    ...gymkidsBento.leads,
    value: gymkidsBento.leads.fact.toLocaleString('ru-RU'),
    averageLabel: `${String(gymkidsBento.leads.dailyAverage).replace('.', ',')} в день`,
    dailyBars: gymkidsBento.leads.daily.map((value, index) => ({
      day: index + 1,
      value,
      height: Math.max(14, Math.round((value / maxDaily) * 100)),
    })),
  },
  validity: {
    rate: formatPercent(percent(gymkidsBento.cohort.valid, gymkidsBento.cohort.leads)),
    valid: gymkidsBento.cohort.valid,
    invalid: gymkidsBento.cohort.invalid,
    inWork: gymkidsBento.cohort.inWork,
    reasons: gymkidsBento.invalidReasons.map(item => ({
      ...item,
      share: formatPercent(percent(item.value, gymkidsBento.cohort.invalid)),
    })),
  },
  trial: {
    cohortRate: percent(gymkidsBento.cohort.reached, gymkidsBento.cohort.leads),
    cohortRateLabel: formatPercent(percent(gymkidsBento.cohort.reached, gymkidsBento.cohort.leads)),
    cohortReached: gymkidsBento.cohort.reached,
    cohortScheduled: gymkidsBento.cohort.scheduled,
    ...gymkidsBento.trialCalendar,
  },
  sources: gymkidsBento.sources.map(item => ({
    ...item,
    share: formatPercent(percent(item.leads, gymkidsBento.cohort.leads)),
    width: Math.round((item.leads / maxSource) * 100),
  })),
  stages: {
    knownCoverage: formatPercent(percent(gymkidsBento.stages.knownLeads, gymkidsBento.stages.sourceLeads)),
    rows: gymkidsBento.stages.rows.map(item => ({
      ...item,
      shareValue: percent(item.value, gymkidsBento.stages.knownLeads),
      share: formatPercent(percent(item.value, gymkidsBento.stages.knownLeads)),
    })),
  },
  website: {
    ...gymkidsBento.website,
    validRate: formatPercent(percent(gymkidsBento.website.valid, gymkidsBento.website.leads)),
    reachedRate: formatPercent(percent(gymkidsBento.website.reached, gymkidsBento.website.leads)),
  },
  promo: {
    ...gymkidsBento.promo,
    validRate: formatPercent(percent(gymkidsBento.promo.valid, gymkidsBento.promo.leads)),
    reachedRate: formatPercent(percent(gymkidsBento.promo.reached, gymkidsBento.promo.leads)),
  },
  sourceQuality: gymkidsBento.sourceQuality.map(item => ({
    ...item,
    width: Math.round((item.reached / maxReached) * 100),
  })),
}
