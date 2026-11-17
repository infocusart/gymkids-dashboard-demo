import type { DashboardSourceRow, DashboardTone, GymkidsDashboardView } from './gymkidsSnapshot'

export interface FeaturedSourceCard {
  key: string | null
  label: string
  fullLabel: string
  available: boolean
  fact: number | null
  plan: number | null
  forecast: number | null
  forecastRate: number | null
  share: number | null
  valid: number | null
  scheduled: number | null
  reached: number | null
  cpl: number | null
  cplBasis: string
  tone: DashboardTone
}

interface SourceContext {
  readonly sources: readonly Readonly<DashboardSourceRow>[]
  readonly website: Pick<GymkidsDashboardView['website'], 'cpl' | 'cplBasis' | 'cplAvailable'>
}

// Rank the complete, uncollapsed source list for the selected center/date slice.
// Stable keys break ties; no source or target is borrowed from another slot.
export const getFeaturedSourceCards = (dashboard: SourceContext): [FeaturedSourceCard, FeaturedSourceCard] => {
  const leaders = [...dashboard.sources]
    .filter(source => source.fact > 0)
    .sort((left, right) => right.fact - left.fact || left.key.localeCompare(right.key, 'en'))
    .slice(0, 2)

  return [0, 1].map(index => {
    const source = leaders[index]
    if (!source) {
      return {
        key: null,
        label: `Источник № ${index + 1}`,
        fullLabel: 'Нет источника с лидами за выбранный период',
        available: false,
        fact: null,
        plan: null,
        forecast: null,
        forecastRate: null,
        share: null,
        valid: null,
        scheduled: null,
        reached: null,
        cpl: null,
        cplBasis: '',
        tone: 'neutral' as const,
      }
    }
    const plan = source.planAvailable === true ? source.plan : null
    const forecastRate = plan !== null && plan > 0 ? Math.round(source.forecast / plan * 1000) / 10 : null
    const label = ({ 'Заявка с сайта': 'Сайт', 'Прямое обращение в центр': 'Прямое', 'Повторная проработка': 'Повторная' } as Record<string, string>)[source.label] ?? source.label

    return {
      key: source.key,
      label,
      fullLabel: source.label,
      available: true,
      fact: source.fact,
      plan,
      forecast: source.forecast,
      forecastRate,
      share: source.share,
      valid: source.valid,
      scheduled: source.scheduled,
      reached: source.reached,
      cpl: source.key === 'website' && dashboard.website.cplAvailable === true ? dashboard.website.cpl : null,
      cplBasis: source.key === 'website' ? dashboard.website.cplBasis : '',
      tone: forecastRate === null ? 'neutral' as const : source.tone,
    }
  }) as [FeaturedSourceCard, FeaturedSourceCard]
}
