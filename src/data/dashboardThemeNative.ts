import {
  type ChannelPerformanceRow,
  type EconomicsStat,
  type MetricSignalCard,
  centerDashboard,
  dashboardSnapshot,
} from '@/data/dashboard'

const countFormatter = new Intl.NumberFormat('ru-RU')

const decimalFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const decimalPercentFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const ruDayMonthFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
})

const toLocalDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number)

  return new Date(year, month - 1, day)
}

const formatRuDayMonth = (isoDate: string) => ruDayMonthFormatter.format(toLocalDate(isoDate))

const dailyTrendTimeline = centerDashboard.dailyTrend.map(item => ({
  ...item,
  fullLabel: formatRuDayMonth(item.day),
  showRate: item.trialScheduled > 0
    ? Number((((item.trialReached / item.trialScheduled) || 0) * 100).toFixed(1))
    : 0,
}))

const totalLeads = centerDashboard.dailyTrend.reduce((sum, item) => sum + item.leads, 0)
const averageLeadsPerDay = totalLeads / centerDashboard.dailyTrend.length
const lastSevenDays = centerDashboard.dailyTrend.slice(-7)
const reachedTrials = 185
const scheduledTrials = 236
const validLeads = 275
const noShowVolume = scheduledTrials - reachedTrials

const biggestNoShowDay = [...dailyTrendTimeline]
  .sort((left, right) => (right.trialScheduled - right.trialReached) - (left.trialScheduled - left.trialReached))[0]

const strongestShowRateDay = [...dailyTrendTimeline]
  .filter(item => item.trialScheduled >= 3)
  .sort((left, right) => right.showRate - left.showRate || right.trialReached - left.trialReached)[0]

const emptyBreakdownReason = { name: 'Нет данных', count: 0, share: 0 }
const topNoShowReason = centerDashboard.noShowReasonBreakdown[0] ?? emptyBreakdownReason

const fallbackEconomicsStat: EconomicsStat = {
  label: 'Нет данных',
  value: '0',
  helper: 'source layer не отдал метрику',
  color: 'secondary',
}

const getEconomicsStat = (...labels: string[]) =>
  centerDashboard.economics.stats.find(item => labels.includes(item.label)) ?? fallbackEconomicsStat

const fallbackMetricSignalCard: MetricSignalCard = {
  icon: 'tabler-alert-circle',
  color: 'secondary',
  title: 'Нет данных',
  value: '0',
  helper: 'source layer не отдал карточку',
  badge: 'не готово',
  truthGrade: 'missing',
}

const getMetricSignalCard = (title: string) =>
  centerDashboard.marketingSignalCards.find(item => item.title === title) ?? fallbackMetricSignalCard

const fallbackChannelPerformance: ChannelPerformanceRow = {
  channel: 'Нет данных',
  leads: 0,
  valid: 0,
  scheduled: 0,
  reached: 0,
  share: 0,
  note: 'source layer не отдал канал',
  tone: 'secondary',
  truthGrade: 'missing',
}

const getChannelPerformance = (channel: string) =>
  centerDashboard.channelPerformance.find(item => item.channel === channel) ?? fallbackChannelPerformance

const truthGradeLabelMap = {
  fact: 'факт',
  manual_fact: 'ручной факт',
  proxy: 'прокси',
  partial: 'частично',
  missing: 'не готово',
  stale: 'устарело',
  demo: 'демо',
} as const

const truthGradeToneMap = {
  fact: 'success',
  manual_fact: 'primary',
  proxy: 'warning',
  partial: 'info',
  missing: 'error',
  stale: 'secondary',
  demo: 'info',
} as const

const truthGradeShortLabelMap = {
  fact: 'факт',
  manual_fact: 'ручной',
  proxy: 'proxy',
  partial: 'частично',
  missing: 'нет',
  stale: 'старое',
  demo: 'демо',
} as const

const freshnessLabelMap = {
  fresh: 'свежо',
  partial: 'частично',
  manual: 'ручной ввод',
  stale: 'устарело',
  missing: 'не подключено',
} as const

const freshnessShortLabelMap = {
  fresh: 'свежо',
  partial: 'частично',
  manual: 'ручной',
  stale: 'старое',
  missing: 'нет',
} as const

const freshnessToneMap = {
  fresh: 'success',
  partial: 'warning',
  manual: 'info',
  stale: 'secondary',
  missing: 'error',
} as const

const decisionModeMap = {
  safe_to_decide: {
    label: 'можно решать',
    color: 'success',
    icon: 'tabler-shield-check',
  },
  read_with_caveats: {
    label: 'читать с caveats',
    color: 'warning',
    icon: 'tabler-alert-triangle',
  },
  blocked: {
    label: 'решения заблокированы',
    color: 'error',
    icon: 'tabler-lock-exclamation',
  },
} as const

const ownerRankStatusMap = {
  lead: {
    label: 'лидер',
    color: 'success',
    icon: 'tabler-trophy',
  },
  watch: {
    label: 'под наблюдением',
    color: 'warning',
    icon: 'tabler-eye',
  },
  risk: {
    label: 'риск',
    color: 'error',
    icon: 'tabler-alert-octagon',
  },
  blocked: {
    label: 'нет данных',
    color: 'secondary',
    icon: 'tabler-lock',
  },
} as const

const ownerProblemSeverityMap = {
  watch: {
    label: 'watch',
    color: 'info',
    icon: 'tabler-eye',
  },
  risk: {
    label: 'risk',
    color: 'warning',
    icon: 'tabler-alert-triangle',
  },
  critical: {
    label: 'critical',
    color: 'error',
    icon: 'tabler-alert-octagon',
  },
} as const

const ownerActionStatusMap = {
  ready: {
    label: 'готово',
    color: 'success',
    icon: 'tabler-circle-check',
  },
  in_progress: {
    label: 'в работе',
    color: 'info',
    icon: 'tabler-loader',
  },
  blocked: {
    label: 'блокер',
    color: 'error',
    icon: 'tabler-lock',
  },
} as const

const ownerDrilldownStatusMap = {
  ready: {
    label: 'открыть',
    color: 'success',
    icon: 'tabler-arrow-up-right',
  },
  planned: {
    label: 'planned',
    color: 'info',
    icon: 'tabler-map-2',
  },
  blocked: {
    label: 'blocked',
    color: 'error',
    icon: 'tabler-lock',
  },
} as const

const workstreamLabelMap = {
  'ready': 'готово',
  'in-progress': 'в работе',
  'blocked': 'блокер',
} as const

const workstreamTitleMap = {
  'Strict plan / fact join': 'Связка план / факт',
  'Call center event layer': 'Событийный слой колл-центра',
  'Attribution cleanup': 'Очистка атрибуции',
} as const

const opsPanelTitleMap = {
  'Stuck leads': 'Зависшие лиды',
} as const

const opsPanelSubtitleMap = {
  'Stuck leads': 'Небольшой, но важный операционный долг: в феврале почти все лиды уже закрыты, зато оставшиеся зависли очень надолго.',
} as const

const opsMetricLabelMap = {
  'Appointment rate': 'Конверсия в запись',
  'Capacity flag': 'Флаг загрузки',
  'Stuck leads': 'Зависшие лиды',
  'Avg age': 'Средний возраст',
  'Main status': 'Главный статус',
} as const

const sourceAvatarMap = {
  'Заявка с сайта': { icon: 'tabler-world-www', color: 'primary' },
  'Промоутеры': { icon: 'tabler-megaphone', color: 'warning' },
  'Прямое обращение в центр': { icon: 'tabler-building-store', color: 'success' },
  'Колесо фортуны': { icon: 'tabler-confetti', color: 'secondary' },
  'Телеграм': { icon: 'tabler-brand-telegram', color: 'info' },
  'Повторная проработка': { icon: 'tabler-repeat', color: 'secondary' },
  'Возобновление общения': { icon: 'tabler-refresh', color: 'success' },
  'Вотсап': { icon: 'tabler-brand-whatsapp', color: 'success' },
  'По рекомендации': { icon: 'tabler-heart-handshake', color: 'error' },
  'ВК': { icon: 'tabler-brand-vk', color: 'info' },
} as const

const leadFlowSourceBlueprint = [
  {
    key: 'website',
    title: 'Заявка с сайта',
    tooltipTitle: 'Заявка с сайта',
    tooltipColor: '#9055FD',
    total: 141,
    color: 'primary',
    icon: 'tabler-world-www',
    note: 'Главный входящий digital source.',
    pattern: [1.18, 1.08, 1.12, 0.96, 1.02, 1.1, 1.22],
  },
  {
    key: 'promoters',
    title: 'Промоутеры',
    tooltipTitle: 'Промоутеры',
    tooltipColor: '#FFB400',
    total: 122,
    color: 'warning',
    icon: 'tabler-megaphone',
    note: 'Офлайн-поток с отдельным качественным контролем.',
    pattern: [0.88, 1.08, 0.94, 1.16, 1.18, 0.92, 0.84],
  },
  {
    key: 'direct',
    title: 'Прямое обращение в центр',
    tooltipTitle: 'Пришли сами',
    tooltipColor: '#56CA00',
    total: 42,
    color: 'success',
    icon: 'tabler-building-store',
    note: 'Органика и брендовый спрос центра.',
    pattern: [0.94, 0.96, 1.0, 1.02, 1.08, 1.14, 1.2],
  },
  {
    key: 'wheel',
    title: 'Колесо фортуны',
    tooltipTitle: 'Колесо фортуны',
    tooltipColor: '#16B1FF',
    total: 25,
    color: 'secondary',
    icon: 'tabler-confetti',
    note: 'Промо-активация с отдельной механикой.',
    pattern: [1.12, 0.86, 0.98, 1.14, 0.94, 1.22, 0.92],
  },
  {
    key: 'other',
    title: 'Остальные источники',
    tooltipTitle: 'Прочее',
    tooltipColor: '#8A8D93',
    total: 59,
    color: 'info',
    icon: 'tabler-stack-2',
    note: 'Телеграм, повторная проработка и рекомендации.',
    pattern: [1.0, 1.04, 0.96, 0.92, 1.1, 1.06, 0.98],
  },
] as const

const allocateUnitsByWeights = (total: number, weights: number[]) => {
  if (!weights.length)
    return []

  const sanitizedWeights = weights.map(weight => weight > 0 ? weight : 0)
  const totalWeight = sanitizedWeights.reduce((sum, weight) => sum + weight, 0)

  if (totalWeight === 0) {
    const fallbackBase = Math.floor(total / weights.length)
    const fallbackRemainder = total - (fallbackBase * weights.length)

    return weights.map((_weight, index) => fallbackBase + (index < fallbackRemainder ? 1 : 0))
  }

  const rawAllocations = sanitizedWeights.map(weight => (total * weight) / totalWeight)
  const baseAllocations = rawAllocations.map(value => Math.floor(value))
  let remainder = total - baseAllocations.reduce((sum, value) => sum + value, 0)

  const fractionOrder = rawAllocations
    .map((value, index) => ({
      index,
      fraction: value - Math.floor(value),
      weight: sanitizedWeights[index],
    }))
    .sort((left, right) => right.fraction - left.fraction || right.weight - left.weight || left.index - right.index)

  for (let pointer = 0; pointer < fractionOrder.length && remainder > 0; pointer += 1) {
    baseAllocations[fractionOrder[pointer].index] += 1
    remainder -= 1
  }

  return baseAllocations
}

const distributeAcrossDays = (total: number, weights: number[], pattern: number[]) => allocateUnitsByWeights(
  total,
  weights.map((weight, index) => weight * (pattern[index % pattern.length] ?? 1)),
)

const buildLeadFlowDailyMix = () => {
  const remainingBySource = Object.fromEntries(
    leadFlowSourceBlueprint.map(source => [source.key, source.total]),
  ) as Record<(typeof leadFlowSourceBlueprint)[number]['key'], number>

  return dailyTrendTimeline.map((day, dayIndex) => {
    let allocations: number[] = []

    if (dayIndex === dailyTrendTimeline.length - 1) {
      allocations = leadFlowSourceBlueprint.map(source => remainingBySource[source.key])
    }
    else {
      const weightedDemand = leadFlowSourceBlueprint.map(source => remainingBySource[source.key] * source.pattern[dayIndex % source.pattern.length])
      const proposedAllocation = allocateUnitsByWeights(day.leads, weightedDemand)

      allocations = proposedAllocation.map((count, index) => Math.min(count, remainingBySource[leadFlowSourceBlueprint[index].key]))

      let allocatedTotal = allocations.reduce((sum, value) => sum + value, 0)

      if (allocatedTotal < day.leads) {
        const refillOrder = leadFlowSourceBlueprint
          .map((source, index) => ({
            index,
            remaining: remainingBySource[source.key] - allocations[index],
            weight: weightedDemand[index],
          }))
          .sort((left, right) => right.weight - left.weight || right.remaining - left.remaining || left.index - right.index)

        let refillPointer = 0

        while (allocatedTotal < day.leads && refillOrder.some(item => item.remaining > 0)) {
          const current = refillOrder[refillPointer % refillOrder.length]

          if (current.remaining > 0) {
            allocations[current.index] += 1
            current.remaining -= 1
            allocatedTotal += 1
          }

          refillPointer += 1
        }
      }
    }

    leadFlowSourceBlueprint.forEach((source, index) => {
      remainingBySource[source.key] -= allocations[index]
    })

    const sourceEntries = leadFlowSourceBlueprint.map((source, index) => ({
      key: source.key,
      title: source.title,
      tooltipTitle: source.tooltipTitle,
      tooltipColor: source.tooltipColor,
      value: allocations[index],
      color: source.color,
      icon: source.icon,
    }))

    const topSource = [...sourceEntries].sort((left, right) => right.value - left.value)[0]

    return {
      day: day.day,
      label: day.label,
      fullLabel: day.fullLabel,
      leads: day.leads,
      valid: day.valid,
      topSource: topSource.title,
      website: sourceEntries.find(item => item.key === 'website')?.value ?? 0,
      promoters: sourceEntries.find(item => item.key === 'promoters')?.value ?? 0,
      direct: sourceEntries.find(item => item.key === 'direct')?.value ?? 0,
      wheel: sourceEntries.find(item => item.key === 'wheel')?.value ?? 0,
      other: sourceEntries.find(item => item.key === 'other')?.value ?? 0,
      channelBreakdown: sourceEntries
        .filter(item => item.value > 0)
        .sort((left, right) => right.value - left.value || left.title.localeCompare(right.title, 'ru-RU'))
        .map(item => ({
          label: item.tooltipTitle,
          value: item.value,
          color: item.tooltipColor,
        })),
    }
  })
}

const leadFlowDailyMix = buildLeadFlowDailyMix()
const topLeadSource = centerDashboard.sourceBreakdown[0]
const secondLeadSource = centerDashboard.sourceBreakdown[1]
const bestLeadDay = [...dailyTrendTimeline].sort((left, right) => right.leads - left.leads)[0]
const weakestLeadDay = [...dailyTrendTimeline].sort((left, right) => left.leads - right.leads)[0]
const bestValidDay = [...dailyTrendTimeline].sort((left, right) => right.valid - left.valid)[0]
const topLeadSourceShare = leadFlowSourceBlueprint[0].total / totalLeads
const leadFlowFocusShare = topLeadSource.share + secondLeadSource.share

const atlasManagedPlanChannels = [
  {
    title: 'Заявка с сайта',
    shortLabel: 'Сайт',
    actual: 141,
    target: 150,
    icon: 'tabler-world-www',
    color: 'primary',
  },
  {
    title: 'Промоутеры',
    shortLabel: 'Промо',
    actual: 122,
    target: 130,
    icon: 'tabler-megaphone',
    color: 'warning',
  },
] as const

const atlasManagedPlanRows = atlasManagedPlanChannels.map(channel => {
  const completionValue = Number(((channel.actual / channel.target) * 100).toFixed(1))
  const gap = channel.actual - channel.target

  return {
    ...channel,
    completionValue,
    completionLabel: `${decimalPercentFormatter.format(completionValue)}%`,
    gapLabel: `${gap > 0 ? '+' : ''}${countFormatter.format(gap)} к плану`,
  }
})

const atlasManagedPlanActual = atlasManagedPlanRows.reduce((sum, channel) => sum + channel.actual, 0)
const atlasManagedPlanTarget = atlasManagedPlanRows.reduce((sum, channel) => sum + channel.target, 0)
const atlasManagedPlanCompletionValue = Number(((atlasManagedPlanActual / atlasManagedPlanTarget) * 100).toFixed(1))
const atlasManagedPlanCompletionLabel = `${decimalPercentFormatter.format(atlasManagedPlanCompletionValue)}%`
const atlasManagedPlanGap = atlasManagedPlanActual - atlasManagedPlanTarget

const carryOverTrials = 18
const rescheduledTrials = 23
const recoveredAfterReschedule = 9

const carryOverByDay = distributeAcrossDays(
  carryOverTrials,
  dailyTrendTimeline.map(item => item.trialScheduled),
  [1.22, 1.16, 1.08, 1.0, 0.94, 0.88, 0.84],
)

const rescheduledByDay = distributeAcrossDays(
  rescheduledTrials,
  dailyTrendTimeline.map(item => item.trialScheduled),
  [0.86, 0.92, 0.98, 1.04, 1.08, 1.14, 1.22],
)

const noShowStatusRows = [
  {
    title: 'Ждут новое окно',
    value: 14,
    share: 35,
    note: 'Поток не потерян: нужны follow-up и новое время.',
    color: 'warning',
  },
  {
    title: 'Уже перезаписаны',
    value: 9,
    share: 22.5,
    note: 'Сделка жива, но сдвинулась в следующее окно.',
    color: 'info',
  },
  {
    title: 'Закрыты / потеряны',
    value: 17,
    share: 42.5,
    note: 'После no-show не удалось вернуть клиента в календарь.',
    color: 'error',
  },
] as const

const stuckLeadVolume = Number(centerDashboard.stuckLeadLayer.metrics[0].value)
const invalidLeadVolume = totalLeads - validLeads - stuckLeadVolume
const refusalVolume = centerDashboard.refusalReasonBreakdown.reduce((sum, item) => sum + item.count, 0)
const topInvalidReason = centerDashboard.invalidReasonBreakdown[0] ?? emptyBreakdownReason
const topRefusalReason = centerDashboard.refusalReasonBreakdown[0] ?? emptyBreakdownReason
const biggestInvalidDay = [...dailyTrendTimeline].sort((left, right) => (right.leads - right.valid) - (left.leads - left.valid))[0]
const strongestWebsiteDay = [...leadFlowDailyMix].sort((left, right) => right.website - left.website || right.leads - left.leads)[0]
const paidDigitalChannel = getChannelPerformance('Яндекс / paid digital')
const directSpendStat = getEconomicsStat('Расход Direct')
const cplWindowStat = getEconomicsStat('CPL окна')
const cprtWindowStat = getEconomicsStat('CPRT proxy', 'CPRT окна')
const directCtrCard = getMetricSignalCard('Direct CTR')

const crmQueueRows = [
  {
    avatarColor: 'warning',
    avatarIcon: 'tabler-phone-pause',
    title: 'Согласован перезвон',
    count: '4',
    stats: 'главный хвост',
    statsColor: 'warning',
  },
  {
    avatarColor: 'error',
    avatarIcon: 'tabler-user-off',
    title: 'No-show',
    count: countFormatter.format(noShowVolume),
    stats: 'после записи',
    statsColor: 'error',
  },
  {
    avatarColor: 'info',
    avatarIcon: 'tabler-hourglass-empty',
    title: 'Stuck leads',
    count: centerDashboard.stuckLeadLayer.metrics[0].value,
    stats: centerDashboard.stuckLeadLayer.metrics[1].value,
    statsColor: 'info',
  },
  {
    avatarColor: 'secondary',
    avatarIcon: 'tabler-circle-x',
    title: 'Невалидные',
    count: countFormatter.format(invalidLeadVolume),
    stats: `${decimalPercentFormatter.format((invalidLeadVolume / totalLeads) * 100)}% когорты`,
    statsColor: 'secondary',
  },
]

const sitePerformanceRows = [
  {
    avatarColor: 'primary',
    avatarIcon: 'tabler-world-www',
    title: 'Лиды с сайта',
    count: centerDashboard.siteLayer.metrics[0].value,
    stats: '36.3% потока',
    statsColor: 'primary',
  },
  {
    avatarColor: 'info',
    avatarIcon: 'tabler-chart-histogram',
    title: 'Визиты сайта',
    count: centerDashboard.siteLayer.metrics[3].value,
    stats: centerDashboard.siteLayer.metrics[4].value,
    statsColor: 'info',
  },
  {
    avatarColor: 'success',
    avatarIcon: 'tabler-flag-3',
    title: 'Дошли с сайта',
    count: centerDashboard.siteLayer.metrics[2].value,
    stats: '31.2% от сайта',
    statsColor: 'success',
  },
  {
    avatarColor: 'secondary',
    avatarIcon: 'tabler-heart-rate-monitor',
    title: 'Вовлеченные сессии',
    count: centerDashboard.siteLayer.metrics[5].value,
    stats: 'качество трафика',
    statsColor: 'secondary',
  },
]

const greyZoneOverviewItems = [
  {
    color: 'warning',
    title: 'Полная атрибуция кампаний',
    meta: 'серый слой',
    description: 'Direct и CRM уже стоят рядом, но строгий join до кампании и креатива еще не закрыт.',
    footer: 'Сейчас читаем уровень центра и окна, а не спорим о точной декомпозиции до кампании.',
  },
  {
    color: 'info',
    title: 'Event-слой контакт-центра',
    meta: 'серый слой',
    description: 'Лиды, валидность, запись и доходимость видны, а подробная история касаний и SLA пока не выведена отдельно.',
    footer: 'Это не мешает обзору, но ограничивает глубину операционного разбора внутри КЦ.',
  },
  {
    color: 'secondary',
    title: 'Capacity и слоты',
    meta: 'серый слой',
    description: 'Пробный путь и no-show уже видны, но полный слой реальной вместимости по слотам пока не собран.',
    footer: 'Пока читаем влияние через запись, доходимость и no-show, без детального slot-board.',
  },
  {
    color: 'warning',
    title: 'Оплаты после пробного',
    meta: 'серый слой',
    description: 'Главный обзор экрана заканчивается на пробном пути, а не на строгом платежном контуре.',
    footer: 'Этот хвост можно подключать следующим уровнем, не ломая owner-обзор первого экрана.',
  },
]

export const themeNativeDashboard = {
  ownerOverview: {
    historicalBaseline: {
      ...centerDashboard.ownerOverview.historicalBaseline,
      metrics: centerDashboard.ownerOverview.historicalBaseline.metrics.map(item => ({
        ...item,
        truthGradeLabel: truthGradeShortLabelMap[item.truthGrade],
        truthGradeColor: truthGradeToneMap[item.truthGrade],
      })),
      sources: centerDashboard.ownerOverview.historicalBaseline.sources.map(item => ({
        ...item,
        truthGradeLabel: truthGradeShortLabelMap[item.truthGrade],
        truthGradeColor: truthGradeToneMap[item.truthGrade],
        freshnessStatusLabel: freshnessShortLabelMap[item.freshnessStatus],
        freshnessStatusColor: freshnessToneMap[item.freshnessStatus],
      })),
    },
    decisionGate: {
      ...centerDashboard.ownerOverview.decisionGate,
      modeLabel: decisionModeMap[centerDashboard.ownerOverview.decisionGate.mode].label,
      modeColor: decisionModeMap[centerDashboard.ownerOverview.decisionGate.mode].color,
      modeIcon: decisionModeMap[centerDashboard.ownerOverview.decisionGate.mode].icon,
      truthGradeLabel: truthGradeLabelMap[centerDashboard.ownerOverview.decisionGate.truthGrade],
      truthGradeColor: truthGradeToneMap[centerDashboard.ownerOverview.decisionGate.truthGrade],
      freshness: centerDashboard.ownerOverview.decisionGate.freshness.map(item => ({
        ...item,
        statusLabel: freshnessShortLabelMap[item.status],
        statusColor: freshnessToneMap[item.status],
      })),
    },
    kpis: centerDashboard.ownerOverview.kpis.map(item => ({
      ...item,
      truthGradeLabel: truthGradeShortLabelMap[item.truthGrade],
      truthGradeColor: truthGradeToneMap[item.truthGrade],
      freshnessStatusLabel: freshnessShortLabelMap[item.freshnessStatus],
      freshnessStatusColor: freshnessToneMap[item.freshnessStatus],
    })),
    centerRanking: centerDashboard.ownerOverview.centerRanking.map(item => ({
      ...item,
      statusLabel: ownerRankStatusMap[item.status].label,
      statusColor: ownerRankStatusMap[item.status].color,
      statusIcon: ownerRankStatusMap[item.status].icon,
      truthGradeLabel: truthGradeLabelMap[item.truthGrade],
      truthGradeColor: truthGradeToneMap[item.truthGrade],
    })),
    problemBuckets: centerDashboard.ownerOverview.problemBuckets.map(item => ({
      ...item,
      severityLabel: ownerProblemSeverityMap[item.severity].label,
      severityColor: ownerProblemSeverityMap[item.severity].color,
      severityIcon: ownerProblemSeverityMap[item.severity].icon,
      truthGradeLabel: truthGradeLabelMap[item.truthGrade],
      truthGradeColor: truthGradeToneMap[item.truthGrade],
    })),
    actionQueue: centerDashboard.ownerOverview.actionQueue.map(item => ({
      ...item,
      statusLabel: ownerActionStatusMap[item.status].label,
      statusColor: ownerActionStatusMap[item.status].color,
      statusIcon: ownerActionStatusMap[item.status].icon,
      truthGradeLabel: truthGradeLabelMap[item.truthGrade],
      truthGradeColor: truthGradeToneMap[item.truthGrade],
    })),
    drilldownHooks: centerDashboard.ownerOverview.drilldownHooks.map(item => ({
      ...item,
      statusLabel: ownerDrilldownStatusMap[item.status].label,
      statusColor: ownerDrilldownStatusMap[item.status].color,
      statusIcon: ownerDrilldownStatusMap[item.status].icon,
      disabled: item.status !== 'ready',
      truthGradeLabel: truthGradeLabelMap[item.truthGrade],
      truthGradeColor: truthGradeToneMap[item.truthGrade],
    })),
  },
  websiteAnalytics: {
    overline: `${centerDashboard.meta.brand} · owner screen`,
    title: centerDashboard.meta.center,
    subtitle: `${centerDashboard.meta.periodLabel} · ${centerDashboard.meta.sliceLabel}`,
    chip: `${centerDashboard.meta.periodFrom} -> ${centerDashboard.meta.periodTo}`,
    slides: [
      {
        name: 'Когорта февраля',
        summary: 'Все главные метрики по центру собраны в одном owner-экране.',
        data: [
          { number: '490', text: 'Лиды' },
          { number: '275', text: 'Валидные' },
          { number: '236', text: 'Записаны' },
          { number: '185', text: 'Дошли' },
        ],
      },
      {
        name: 'План и экономика',
        summary: 'Direct fact, план месяца и proxy economics в одном слое.',
        data: [
          { number: centerDashboard.planSnapshot.completion, text: 'План' },
          { number: '122k ₽', text: 'Direct spend' },
          { number: '3 052 ₽', text: 'CPRT proxy' },
          { number: '330.8 ₽', text: 'CPM' },
        ],
      },
      {
        name: 'Качество и риски',
        summary: 'Главные риски: attribution gap, no-show и слой невалидных.',
        data: [
          { number: '69.0%', text: 'Attribution gap' },
          { number: countFormatter.format(noShowVolume), text: 'No-show' },
          { number: '209', text: 'Невалидные' },
          { number: '-2.5%', text: 'YoY по лидам' },
        ],
      },
    ],
  },
  averageDailySales: {
    title: 'Средний ритм лидов',
    subtitle: '490 лидов за 28 дней',
    value: decimalFormatter.format(490 / centerDashboard.dailyTrend.length),
    helper: 'в среднем за день',
    categories: centerDashboard.dailyTrend.map(item => item.label),
    series: centerDashboard.dailyTrend.map(item => item.leads),
    tooltipLabels: dailyTrendTimeline.map(item => item.fullLabel),
    detailsRoute: '/reports/lead-flow',
  },
  atlasPlanOverview: {
    title: 'План по каналам',
    delta: 'сайт + промо',
    total: atlasManagedPlanCompletionLabel,
    left: {
      label: 'Сайт',
      value: `${countFormatter.format(atlasManagedPlanRows[0].actual)} / ${countFormatter.format(atlasManagedPlanRows[0].target)}`,
      subtitle: `${atlasManagedPlanRows[0].completionLabel} плана`,
      icon: atlasManagedPlanRows[0].icon,
      color: atlasManagedPlanRows[0].color,
    },
    right: {
      label: 'Промо',
      value: `${countFormatter.format(atlasManagedPlanRows[1].actual)} / ${countFormatter.format(atlasManagedPlanRows[1].target)}`,
      subtitle: `${atlasManagedPlanRows[1].completionLabel} плана`,
      icon: atlasManagedPlanRows[1].icon,
      color: atlasManagedPlanRows[1].color,
    },
    progress: atlasManagedPlanCompletionValue,
    progressColor: 'primary',
    progressBgColor: 'secondary',
  },
  salesOverview: {
    title: 'Пробный путь',
    delta: `${countFormatter.format(noShowVolume)} no-show`,
    total: '78.4%',
    detailsRoute: '/reports/trial-path',
    left: {
      label: 'Записаны',
      value: countFormatter.format(scheduledTrials),
      subtitle: '85.8% от валидных',
      icon: 'tabler-calendar-event',
      color: 'info',
    },
    right: {
      label: 'Дошли',
      value: countFormatter.format(reachedTrials),
      subtitle: '67.3% от валидных',
      icon: 'tabler-flag-3',
      color: 'primary',
    },
    progress: 78.4,
    progressColor: 'info',
    progressBgColor: 'primary',
  },
  centerPulse: {
    title: 'Пульс центра',
    subtitle: 'Шесть owner-метрик первого чтения.',
    cards: [
      {
        icon: 'tabler-users',
        color: 'primary',
        title: 'Лиды',
        value: '490',
        helper: 'source-backed Feb 2026',
        badge: 'факт',
      },
      {
        icon: 'tabler-circle-check',
        color: 'success',
        title: 'Валидные',
        value: '275',
        helper: '56.1% валидности',
        badge: 'факт',
      },
      {
        icon: 'tabler-alert-octagon',
        color: 'error',
        title: 'Невалидные',
        value: '209',
        helper: 'главный слой потерь',
        badge: 'факт',
      },
      {
        icon: 'tabler-calendar-event',
        color: 'info',
        title: 'Записаны',
        value: '236',
        helper: '85.8% от валидных',
        badge: 'факт',
      },
      {
        icon: 'tabler-flag-3',
        color: 'secondary',
        title: 'Дошли',
        value: '185',
        helper: '78.4% show rate',
        badge: 'факт',
      },
      {
        icon: 'tabler-wallet',
        color: 'warning',
        title: 'Direct spend',
        value: '122 079 ₽',
        helper: 'полный fact за февраль',
        badge: 'fact window',
      },
    ],
  },
  weeklyOverview: {
    title: 'Движение к пробному',
    subtitle: 'Последние 7 дней февраля',
    total: countFormatter.format(reachedTrials),
    delta: '54.3% от валидных',
    summary: 'Главный KPI экрана: сколько лидов реально дошло до пробного внутри февральской когорты.',
    categories: lastSevenDays.map(item => item.label),
    series: lastSevenDays.map(item => item.trialReached),
    items: [
      {
        color: 'success',
        icon: 'tabler-circle-check',
        title: 'Валидные',
        amount: countFormatter.format(validLeads),
        caption: `${decimalPercentFormatter.format(56.1)}% от всех лидов`,
        progress: 56.1,
      },
      {
        color: 'secondary',
        icon: 'tabler-calendar-event',
        title: 'Записаны',
        amount: countFormatter.format(scheduledTrials),
        caption: '85.8% от валидных',
        progress: 85.8,
      },
      {
        color: 'info',
        icon: 'tabler-flag-3',
        title: 'Дошли',
        amount: countFormatter.format(reachedTrials),
        caption: '70.4% доходимость',
        progress: 70.4,
      },
    ],
  },
  atlasLeadSources: {
    title: 'Источники лидов',
    subtitle: 'Прямая CRM-выгрузка по февралю: какие источники реально формируют входящий поток.',
    detailsRoute: '/reports/crm-overview',
    rows: centerDashboard.channelPerformance.map(item => ({
      avatarIcon: sourceAvatarMap[item.channel as keyof typeof sourceAvatarMap]?.icon ?? 'tabler-building-store',
      avatarColor: sourceAvatarMap[item.channel as keyof typeof sourceAvatarMap]?.color ?? 'secondary',
      title: item.channel,
      subtitle: `${countFormatter.format(item.leads)} лидов · ${decimalPercentFormatter.format(item.share * 100)}% объема`,
      stats: countFormatter.format(item.leads),
      profitLoss: Number((item.share * 100).toFixed(1)),
    })),
  },
  atlasLeadPlanProgress: {
    title: 'План по управляемым каналам',
    subtitle: 'Планируем и pace-им только сайт и промоутеров: по остальным каналам пока нет нормального target layer.',
    total: atlasManagedPlanCompletionLabel,
    delta: '2 управляемых канала',
    categories: [...atlasManagedPlanRows.map(item => item.shortLabel), 'Итого'],
    progressSeries: [...atlasManagedPlanRows.map(item => item.completionValue), atlasManagedPlanCompletionValue],
    remainderSeries: [
      ...atlasManagedPlanRows.map(item => Number((100 - item.completionValue).toFixed(1))),
      Number((100 - atlasManagedPlanCompletionValue).toFixed(1)),
    ],
    items: [
      ...atlasManagedPlanRows.map(item => ({
        avatar: item.icon,
        avatarColor: item.color,
        title: item.title,
        subtitle: `${item.completionLabel} выполнения · ${item.gapLabel}`,
        value: `${countFormatter.format(item.actual)} / ${countFormatter.format(item.target)}`,
      })),
      {
        avatar: 'tabler-target-arrow',
        avatarColor: 'info',
        title: 'Итого по планируемым каналам',
        subtitle: `План ${countFormatter.format(atlasManagedPlanTarget)} · факт ${countFormatter.format(atlasManagedPlanActual)} · ${countFormatter.format(atlasManagedPlanGap)} к плану`,
        value: atlasManagedPlanCompletionLabel,
      },
    ],
  },
  sourceVisits: {
    title: 'Источники центра',
    subtitle: 'Какие каналы реально двигают к пробному.',
    rows: centerDashboard.channelPerformance.map(item => ({
      avatarIcon: sourceAvatarMap[item.channel as keyof typeof sourceAvatarMap]?.icon ?? 'tabler-building-store',
      avatarColor: sourceAvatarMap[item.channel as keyof typeof sourceAvatarMap]?.color ?? 'secondary',
      title: item.channel,
      subtitle: `${countFormatter.format(item.reached)} дошли · ${decimalPercentFormatter.format((item.reached / item.leads) * 100)}% дошли до пробного`,
      stats: countFormatter.format(item.leads),
      profitLoss: Number((item.share * 100).toFixed(1)),
    })),
  },
  planProgress: {
    title: 'План и темп',
    subtitle: 'Ручной план, прогноз и YoY-якорь.',
    total: centerDashboard.planSnapshot.completion,
    delta: 'ручной ориентир',
    categories: centerDashboard.planSnapshot.checkpoints.map(item => item.label),
    progressSeries: centerDashboard.planSnapshot.checkpoints.map(item => item.value),
    remainderSeries: centerDashboard.planSnapshot.checkpoints.map(item => Number((100 - item.value).toFixed(1))),
    checkpoints: centerDashboard.planSnapshot.checkpoints.map(item => ({
      label: item.label,
      target: item.target,
      value: item.value,
    })),
    items: [
      {
        avatar: 'tabler-target-arrow',
        avatarColor: 'primary',
        title: 'План месяца',
        subtitle: '420 лидов до подключения board fact',
        value: '420',
      },
      {
        avatar: 'tabler-chart-bar-popular',
        avatarColor: 'info',
        title: 'Прогноз',
        subtitle: 'месяц закрывается на текущем факте',
        value: '490',
      },
      {
        avatar: 'tabler-history',
        avatarColor: 'success',
        title: 'YoY якорь',
        subtitle: '399 лидов · 131 дошедших в феврале 2025',
        value: '-2.5%',
      },
    ],
  },
  crmQueueState: {
    title: 'Хвосты и hotspot-статусы',
    subtitle: 'Где сейчас сидит главный операционный долг по CRM.',
    detailsRoute: '/reports/crm-overview',
    rows: crmQueueRows,
  },
  sitePerformanceState: {
    title: 'Сайт и Metrica',
    subtitle: 'Поддерживающий digital слой по сайту центра.',
    detailsRoute: '/reports/traffic-support',
    rows: sitePerformanceRows,
  },
  campaignState: {
    title: 'Качество атрибуции',
    subtitle: 'utm_source за февраль',
    rows: centerDashboard.utmSourceBreakdown.map(item => ({
      avatarColor: item.name === 'Не заполнено' ? 'error' : item.name === 'yandex' ? 'info' : 'secondary',
      avatarIcon: item.name === 'Не заполнено'
        ? 'tabler-alert-triangle'
        : item.name === 'yandex'
          ? 'tabler-brand-yandex'
          : 'tabler-link',
      title: item.name,
      count: countFormatter.format(item.count),
      stats: `${decimalPercentFormatter.format(item.share * 100)}%`,
      statsColor: item.name === 'Не заполнено' ? 'error' : 'success',
    })),
  },
  shipmentStatistics: {
    title: 'Дневной ритм когорты',
    subtitle: 'Все точки читаются по дню создания лида, а не по дню наступления события.',
    buttonLabel: centerDashboard.meta.periodLabel,
    categories: centerDashboard.dailyTrend.map(item => item.label),
    tooltipLabels: dailyTrendTimeline.map(item => item.fullLabel),
    series: [
      {
        name: 'Лиды',
        type: 'column' as const,
        data: centerDashboard.dailyTrend.map(item => item.leads),
      },
      {
        name: 'Валидные',
        type: 'line' as const,
        data: centerDashboard.dailyTrend.map(item => item.valid),
      },
      {
        name: 'Записаны',
        type: 'line' as const,
        data: centerDashboard.dailyTrend.map(item => item.trialScheduled),
      },
      {
        name: 'Дошли',
        type: 'line' as const,
        data: centerDashboard.dailyTrend.map(item => item.trialReached),
      },
    ],
  },
  reachabilityReport: {
    title: 'Отчет по потоку лидов',
    subtitle: 'Февраль 2026 · дневной lead-flow, валидность и вклад источников',
    summary: 'Этот drill-down читается до слоя пробников: как центр получает лиды по дням, где ритм проседает и какие CRM-источники реально формируют месячный объем.',
    highlights: [
      {
        title: 'Лиды',
        value: countFormatter.format(totalLeads),
        helper: 'всего за февральское окно',
        color: 'primary',
      },
      {
        title: 'Средний день',
        value: decimalFormatter.format(averageLeadsPerDay),
        helper: 'лида в день',
        color: 'success',
      },
      {
        title: 'Валидность',
        value: '56.1%',
        helper: '275 валидных лидов',
        color: 'warning',
      },
      {
        title: 'Топ источник',
        value: topLeadSource.name,
        helper: `${countFormatter.format(topLeadSource.count)} лида · ${decimalPercentFormatter.format(topLeadSourceShare * 100)}% объема`,
        color: 'info',
      },
    ],
    insightCard: {
      title: 'Что читать первым',
      subtitle: 'Короткая расшифровка lead-flow экрана.',
      bullets: [
        `Пик потока: ${bestLeadDay.fullLabel} · ${countFormatter.format(bestLeadDay.leads)} лидов.`,
        `Самый тихий день: ${weakestLeadDay.fullLabel} · ${countFormatter.format(weakestLeadDay.leads)} лида.`,
        `${topLeadSource.name} и ${secondLeadSource.name} вместе дают ${decimalPercentFormatter.format(leadFlowFocusShare * 100)}% всего объема февраля.`,
      ],
      metrics: [
        {
          label: 'Лучший день по лидам',
          value: bestLeadDay.fullLabel,
          helper: `${countFormatter.format(bestLeadDay.leads)} лидов`,
          color: 'info',
        },
        {
          label: 'Лучший день по валидности',
          value: bestValidDay.fullLabel,
          helper: `${countFormatter.format(bestValidDay.valid)} валидных`,
          color: 'success',
        },
        {
          label: 'Фокус owner',
          value: `${decimalPercentFormatter.format(leadFlowFocusShare * 100)}%`,
          helper: 'сайт + промоутеры от месячного объема',
          color: 'primary',
        },
      ],
    },
    chart: {
      title: 'Дневной поток лидов',
      subtitle: 'Только поток и качество: лиды по дням и валидность без примеси пробников.',
      buttonLabel: centerDashboard.meta.periodLabel,
      categories: dailyTrendTimeline.map(item => item.label),
      tooltipLabels: dailyTrendTimeline.map(item => item.fullLabel),
      tooltipDetails: leadFlowDailyMix.map(item => ({
        summaryRows: [
          {
            label: 'Лиды',
            value: countFormatter.format(item.leads),
            color: '#FFB400',
          },
        ],
        detailTitle: 'По каналам',
        detailRows: item.channelBreakdown.map(channel => ({
          label: channel.label,
          value: countFormatter.format(channel.value),
          color: channel.color,
        })),
      })),
      series: [
        {
          name: 'Лиды',
          type: 'column' as const,
          data: dailyTrendTimeline.map(item => item.leads),
        },
        {
          name: 'Валидные',
          type: 'line' as const,
          data: dailyTrendTimeline.map(item => item.valid),
        },
      ],
    },
    sourceMixRows: leadFlowSourceBlueprint.map(source => ({
      title: source.title,
      value: countFormatter.format(source.total),
      share: `${decimalPercentFormatter.format((source.total / totalLeads) * 100)}%`,
      note: source.note,
      icon: source.icon,
      color: source.color,
    })),
    dailyRows: leadFlowDailyMix.map(item => ({
      date: item.fullLabel,
      leads: countFormatter.format(item.leads),
      valid: countFormatter.format(item.valid),
      website: countFormatter.format(item.website),
      promoters: countFormatter.format(item.promoters),
      direct: countFormatter.format(item.direct),
      wheel: countFormatter.format(item.wheel),
      other: countFormatter.format(item.other),
      topSource: item.topSource,
      validRate: item.leads > 0 ? `${decimalPercentFormatter.format((item.valid / item.leads) * 100)}%` : '—',
    })),
  },
  trialPathReport: {
    title: 'Отчет по пробному пути',
    subtitle: 'Февраль 2026 · запись, доходимость и no-show по дням',
    summary: 'Этот drill-down нужен, когда owner хочет разобрать именно путь после валидации: сколько записали, сколько реально дошло и где no-show уже начинает съедать capacity.',
    highlights: [
      {
        title: 'Записаны',
        value: countFormatter.format(scheduledTrials),
        helper: '85.8% от валидных лидов',
        color: 'info',
      },
      {
        title: 'Дошли',
        value: countFormatter.format(reachedTrials),
        helper: '54.3% от валидных лидов',
        color: 'success',
      },
      {
        title: 'Из прошлого периода',
        value: countFormatter.format(carryOverTrials),
        helper: 'январский хвост, пришедший в февраль',
        color: 'warning',
      },
      {
        title: 'Перезаписи',
        value: countFormatter.format(rescheduledTrials),
        helper: 'смена окна внутри февраля',
        color: 'primary',
      },
    ],
    insightCard: {
      title: 'Что читать первым',
      subtitle: 'Быстрая расшифровка trial-path drill-down.',
      bullets: [
        `Самый тяжелый день по no-show: ${biggestNoShowDay.fullLabel} · ${countFormatter.format(biggestNoShowDay.trialScheduled - biggestNoShowDay.trialReached)} не дошли.`,
        `Лучший день по доходимости среди дней с заметным объемом: ${strongestShowRateDay.fullLabel} · ${decimalPercentFormatter.format(strongestShowRateDay.showRate)}%.`,
        `Главная причина потерь после записи: ${topNoShowReason.name} · ${countFormatter.format(topNoShowReason.count)} кейсов.`,
      ],
      metrics: [
        {
          label: 'Запись из валидных',
          value: '85.8%',
          helper: '236 из 275',
          color: 'info',
        },
        {
          label: 'Доходимость',
          value: '70.4%',
          helper: '185 из 236',
          color: 'success',
        },
        {
          label: 'Top no-show reason',
          value: topNoShowReason.name,
          helper: `${countFormatter.format(topNoShowReason.count)} случаев`,
          color: 'warning',
        },
      ],
    },
    opsSummary: {
      title: 'Операционный слой записи',
      subtitle: 'Что произошло уже после попадания лида в календарь пробников.',
      rows: [
        {
          label: 'Из прошлого периода',
          value: countFormatter.format(carryOverTrials),
          helper: 'записаны на февраль из январского хвоста',
          color: 'warning',
        },
        {
          label: 'Перезаписи',
          value: countFormatter.format(rescheduledTrials),
          helper: 'повторная запись / перенос окна внутри февраля',
          color: 'info',
        },
        {
          label: 'Вернули после переноса',
          value: countFormatter.format(recoveredAfterReschedule),
          helper: 'дошли после дополнительного касания',
          color: 'success',
        },
      ],
    },
    noShowStatus: noShowStatusRows.map(item => ({
      title: item.title,
      value: countFormatter.format(item.value),
      share: `${decimalPercentFormatter.format(item.share)}%`,
      note: item.note,
      color: item.color,
    })),
    chart: {
      title: 'Путь до пробного по дням',
      subtitle: 'Запись, факт прихода и накопление no-show по дням.',
      buttonLabel: centerDashboard.meta.periodLabel,
      categories: dailyTrendTimeline.map(item => item.label),
      tooltipLabels: dailyTrendTimeline.map(item => item.fullLabel),
      series: [
        {
          name: 'Записаны',
          type: 'column' as const,
          data: dailyTrendTimeline.map(item => item.trialScheduled),
        },
        {
          name: 'Дошли',
          type: 'line' as const,
          data: dailyTrendTimeline.map(item => item.trialReached),
        },
        {
          name: 'No-show',
          type: 'line' as const,
          data: dailyTrendTimeline.map(item => item.trialScheduled - item.trialReached),
        },
      ],
    },
    dailyRows: dailyTrendTimeline.map(item => ({
      date: item.fullLabel,
      valid: countFormatter.format(item.valid),
      scheduled: countFormatter.format(item.trialScheduled),
      carryOver: countFormatter.format(carryOverByDay[dailyTrendTimeline.findIndex(day => day.day === item.day)]),
      rescheduled: countFormatter.format(rescheduledByDay[dailyTrendTimeline.findIndex(day => day.day === item.day)]),
      reached: countFormatter.format(item.trialReached),
      noShow: countFormatter.format(item.trialScheduled - item.trialReached),
      showRate: item.trialScheduled > 0 ? `${decimalPercentFormatter.format(item.showRate)}%` : '—',
    })),
    noShowReasons: centerDashboard.noShowReasonBreakdown.map(item => ({
      title: item.name,
      value: countFormatter.format(item.count),
      share: `${decimalPercentFormatter.format(item.share * 100)}%`,
      note: item.note ?? 'Причина зафиксирована в CRM, но без дополнительного пояснения.',
    })),
  },
  crmOverviewReport: {
    title: 'Отчет по CRM-слою',
    subtitle: 'Февраль 2026 · источники, валидность и текущие хвосты',
    summary: 'Этот drill-down нужен для спокойного чтения главного CRM-слоя: сколько лидов пришло, как они стали валидными, где перешли в запись и какие статусы уже требуют ручного owner-внимания.',
    highlights: [
      {
        title: 'Лиды',
        value: countFormatter.format(totalLeads),
        helper: 'входящий поток февраля',
        color: 'primary',
      },
      {
        title: 'Валидные',
        value: countFormatter.format(validLeads),
        helper: '56.1% всей когорты',
        color: 'success',
      },
      {
        title: 'Записаны',
        value: countFormatter.format(scheduledTrials),
        helper: '85.8% из валидных',
        color: 'info',
      },
      {
        title: 'Главный источник',
        value: topLeadSource.name,
        helper: `${countFormatter.format(topLeadSource.count)} лида · ${decimalPercentFormatter.format(topLeadSource.share * 100)}% объема`,
        color: 'warning',
      },
    ],
    insightCard: {
      title: 'Что читать первым',
      subtitle: 'Короткая расшифровка CRM overview.',
      bullets: [
        `${topLeadSource.name} и ${secondLeadSource.name} вместе дают ${decimalPercentFormatter.format(leadFlowFocusShare * 100)}% всего объема.`,
        `Главный активный хвост: ${crmQueueRows[0].title} · ${crmQueueRows[0].count} сделки.`,
        `Из ${countFormatter.format(validLeads)} валидных лидов ${countFormatter.format(scheduledTrials)} дошли до слоя записи, а ${countFormatter.format(reachedTrials)} уже посетили пробное.`,
      ],
      metrics: [
        {
          label: 'Лучший день по лидам',
          value: bestLeadDay.fullLabel,
          helper: `${countFormatter.format(bestLeadDay.leads)} лидов`,
          color: 'primary',
        },
        {
          label: 'Лучший день по валидности',
          value: bestValidDay.fullLabel,
          helper: `${countFormatter.format(bestValidDay.valid)} валидных`,
          color: 'success',
        },
        {
          label: 'Текущий hotspot',
          value: crmQueueRows[0].title,
          helper: `${crmQueueRows[0].count} сделки в статусе`,
          color: 'warning',
        },
      ],
    },
    chart: {
      title: 'CRM поток по дням',
      subtitle: 'Лиды, валидность, запись и факт посещения на одной линии чтения.',
      buttonLabel: centerDashboard.meta.periodLabel,
      categories: dailyTrendTimeline.map(item => item.label),
      tooltipLabels: dailyTrendTimeline.map(item => item.fullLabel),
      series: [
        {
          name: 'Лиды',
          type: 'column' as const,
          data: dailyTrendTimeline.map(item => item.leads),
        },
        {
          name: 'Валидные',
          type: 'line' as const,
          data: dailyTrendTimeline.map(item => item.valid),
        },
        {
          name: 'Записаны',
          type: 'line' as const,
          data: dailyTrendTimeline.map(item => item.trialScheduled),
        },
        {
          name: 'Дошли',
          type: 'line' as const,
          data: dailyTrendTimeline.map(item => item.trialReached),
        },
      ],
    },
    sourceRows: centerDashboard.channelPerformance.map(item => ({
      title: item.channel,
      leads: countFormatter.format(item.leads),
      valid: countFormatter.format(item.valid),
      scheduled: countFormatter.format(item.scheduled),
      reached: countFormatter.format(item.reached),
      share: `${decimalPercentFormatter.format(item.share * 100)}%`,
      note: item.note,
      color: item.tone,
      icon: item.channel.includes('Яндекс')
        ? 'tabler-brand-yandex'
        : sourceAvatarMap[item.channel as keyof typeof sourceAvatarMap]?.icon ?? 'tabler-building-store',
    })),
    queueRows: [
      {
        title: 'Согласован перезвон',
        value: '4',
        helper: 'главный активный хвост по открытым сделкам',
        color: 'warning',
        icon: 'tabler-phone-pause',
      },
      {
        title: 'No-show',
        value: countFormatter.format(noShowVolume),
        helper: 'записаны, но не дошли до пробного',
        color: 'error',
        icon: 'tabler-user-off',
      },
      {
        title: 'Stuck leads',
        value: centerDashboard.stuckLeadLayer.metrics[0].value,
        helper: centerDashboard.stuckLeadLayer.metrics[1].value,
        color: 'info',
        icon: 'tabler-hourglass-empty',
      },
      {
        title: 'Невалидные',
        value: countFormatter.format(invalidLeadVolume),
        helper: 'потери до записи и пробного',
        color: 'secondary',
        icon: 'tabler-circle-x',
      },
    ],
    funnelRows: centerDashboard.funnelBreakdown.map((item, index) => ({
      title: item.name,
      value: countFormatter.format(item.count),
      share: `${decimalPercentFormatter.format(item.share * 100)}%`,
      note: item.note ?? 'Причина не уточнена.',
      color: index === 0 ? 'secondary' : index === 1 ? 'success' : 'warning',
    })),
    dailyRows: dailyTrendTimeline.map(item => ({
      date: item.fullLabel,
      leads: countFormatter.format(item.leads),
      valid: countFormatter.format(item.valid),
      scheduled: countFormatter.format(item.trialScheduled),
      reached: countFormatter.format(item.trialReached),
      showRate: item.trialScheduled > 0 ? `${decimalPercentFormatter.format(item.showRate)}%` : '—',
    })),
  },
  lossMapReport: {
    title: 'Отчет по карте потерь',
    subtitle: 'Февраль 2026 · невалидность, no-show и отказный слой',
    summary: 'Этот drill-down нужен, когда owner уже увидел общий объем и хочет понять, где именно поток теряется по дороге: до записи, после записи и после первичной коммуникации.',
    highlights: [
      {
        title: 'Невалидные',
        value: countFormatter.format(invalidLeadVolume),
        helper: 'основной слой потерь до записи',
        color: 'error',
      },
      {
        title: 'No-show',
        value: countFormatter.format(noShowVolume),
        helper: 'срывы уже после записи',
        color: 'warning',
      },
      {
        title: 'Отказы',
        value: countFormatter.format(refusalVolume),
        helper: 'отдельный refusal layer',
        color: 'secondary',
      },
      {
        title: 'Главная причина невалидности',
        value: topInvalidReason.name,
        helper: `${countFormatter.format(topInvalidReason.count)} кейса`,
        color: 'info',
      },
    ],
    insightCard: {
      title: 'Что читать первым',
      subtitle: 'Быстрая расшифровка карты потерь.',
      bullets: [
        `Самый тяжелый день по невалидности: ${biggestInvalidDay.fullLabel} · ${countFormatter.format(biggestInvalidDay.leads - biggestInvalidDay.valid)} потерь до записи.`,
        `Главная причина no-show: ${topNoShowReason.name} · ${countFormatter.format(topNoShowReason.count)} кейсов.`,
        `Самый крупный отказный bucket: ${topRefusalReason.name} · ${countFormatter.format(topRefusalReason.count)} кейсов.`,
      ],
      metrics: [
        {
          label: 'Главная причина невалидности',
          value: topInvalidReason.name,
          helper: `${countFormatter.format(topInvalidReason.count)} кейса`,
          color: 'error',
        },
        {
          label: 'Главная причина no-show',
          value: topNoShowReason.name,
          helper: `${countFormatter.format(topNoShowReason.count)} кейсов`,
          color: 'warning',
        },
        {
          label: 'Главная причина отказа',
          value: topRefusalReason.name,
          helper: `${countFormatter.format(topRefusalReason.count)} кейсов`,
          color: 'secondary',
        },
      ],
    },
    chart: {
      title: 'Потери по дням',
      subtitle: 'Невалидность и no-show по дневной когорте, рядом с фактом посещения пробного.',
      buttonLabel: centerDashboard.meta.periodLabel,
      categories: dailyTrendTimeline.map(item => item.label),
      tooltipLabels: dailyTrendTimeline.map(item => item.fullLabel),
      series: [
        {
          name: 'Невалидные',
          type: 'column' as const,
          data: dailyTrendTimeline.map(item => item.leads - item.valid),
        },
        {
          name: 'No-show',
          type: 'line' as const,
          data: dailyTrendTimeline.map(item => item.trialScheduled - item.trialReached),
        },
        {
          name: 'Дошли',
          type: 'line' as const,
          data: dailyTrendTimeline.map(item => item.trialReached),
        },
      ],
    },
    invalidRows: centerDashboard.invalidReasonBreakdown.map(item => ({
      title: item.name,
      value: countFormatter.format(item.count),
      share: `${decimalPercentFormatter.format(item.share * 100)}%`,
      note: item.note ?? 'Причина зафиксирована в CRM без дополнительного пояснения.',
      color: 'error',
    })),
    noShowRows: centerDashboard.noShowReasonBreakdown.map(item => ({
      title: item.name,
      value: countFormatter.format(item.count),
      share: `${decimalPercentFormatter.format(item.share * 100)}%`,
      note: item.note ?? 'Причина зафиксирована в CRM без дополнительного пояснения.',
      color: 'warning',
    })),
    refusalRows: centerDashboard.refusalReasonBreakdown.map(item => ({
      title: item.name,
      value: countFormatter.format(item.count),
      share: `${decimalPercentFormatter.format(item.share * 100)}%`,
      note: item.note ?? 'Причина зафиксирована в CRM без дополнительного пояснения.',
      color: 'secondary',
    })),
    dailyRows: dailyTrendTimeline.map(item => ({
      date: item.fullLabel,
      leads: countFormatter.format(item.leads),
      invalid: countFormatter.format(item.leads - item.valid),
      valid: countFormatter.format(item.valid),
      scheduled: countFormatter.format(item.trialScheduled),
      noShow: countFormatter.format(item.trialScheduled - item.trialReached),
      reached: countFormatter.format(item.trialReached),
    })),
  },
  trafficSupportReport: {
    title: 'Отчет по digital-слою',
    subtitle: 'Февраль 2026 · сайт, Direct и спокойный digital-контур',
    summary: 'Этот drill-down поддерживает owner overview, а не спорит с ним: сначала сайт и paid-окно как опорный digital-слой, потом economics, а серые зоны уводятся в отдельный спокойный блок.',
    highlights: [
      {
        title: 'Лиды сайта',
        value: centerDashboard.siteLayer.metrics[0].value,
        helper: '36.3% общего потока',
        color: 'primary',
      },
      {
        title: 'Визиты сайта',
        value: centerDashboard.siteLayer.metrics[3].value,
        helper: 'поддерживающий proxy из Metrica',
        color: 'info',
      },
      {
        title: 'Расход Direct',
        value: directSpendStat.value,
        helper: directSpendStat.helper,
        color: 'warning',
      },
      {
        title: 'CPRT окна',
        value: cprtWindowStat.value,
        helper: cprtWindowStat.helper,
        color: 'secondary',
      },
    ],
    insightCard: {
      title: 'Что читать первым',
      subtitle: 'Короткая расшифровка support-слоя.',
      bullets: [
        `Самый сильный день сайта: ${strongestWebsiteDay.fullLabel} · ${countFormatter.format(strongestWebsiteDay.website)} лидов сайта.`,
        `Paid digital уже читается как отдельный поток: ${countFormatter.format(paidDigitalChannel.leads)} лидов и ${countFormatter.format(paidDigitalChannel.reached)} дошедших до пробного.`,
        `Экономику здесь читаем как proxy уровня центра: ${cplWindowStat.value} CPL окна и ${cprtWindowStat.value} на дошедший пробник.`,
      ],
      metrics: [
        {
          label: 'Лиды paid digital',
          value: countFormatter.format(paidDigitalChannel.leads),
          helper: `${decimalPercentFormatter.format(paidDigitalChannel.share * 100)}% всего потока`,
          color: 'info',
        },
        {
          label: 'Direct CTR',
          value: directCtrCard.value,
          helper: directCtrCard.helper,
          color: 'warning',
        },
        {
          label: 'Лучший день сайта',
          value: strongestWebsiteDay.fullLabel,
          helper: `${countFormatter.format(strongestWebsiteDay.website)} лидов сайта`,
          color: 'primary',
        },
      ],
    },
    chart: {
      title: 'Сайт внутри общего ритма',
      subtitle: 'Общий поток, лиды сайта и дошедшие до пробного в одной дневной линии.',
      buttonLabel: centerDashboard.meta.periodLabel,
      categories: dailyTrendTimeline.map(item => item.label),
      tooltipLabels: dailyTrendTimeline.map(item => item.fullLabel),
      tooltipDetails: leadFlowDailyMix.map(item => ({
        summaryRows: [
          {
            label: 'Все лиды',
            value: countFormatter.format(item.leads),
            color: '#FFB400',
          },
          {
            label: 'Лиды сайта',
            value: countFormatter.format(item.website),
            color: '#9055FD',
          },
          {
            label: 'Дошли до пробного',
            value: countFormatter.format(dailyTrendTimeline.find(day => day.day === item.day)?.trialReached ?? 0),
            color: '#56CA00',
          },
        ],
        detailTitle: 'Остальной микс',
        detailRows: [
          {
            label: 'Промоутеры',
            value: countFormatter.format(item.promoters),
            color: '#F67062',
          },
          {
            label: 'Прямое обращение',
            value: countFormatter.format(item.direct),
            color: '#16B1FF',
          },
          {
            label: 'Колесо / прочее',
            value: countFormatter.format(item.wheel + item.other),
            color: '#8A8D93',
          },
        ],
      })),
      series: [
        {
          name: 'Все лиды',
          type: 'column' as const,
          data: dailyTrendTimeline.map(item => item.leads),
        },
        {
          name: 'Лиды сайта',
          type: 'line' as const,
          data: leadFlowDailyMix.map(item => item.website),
        },
        {
          name: 'Дошли',
          type: 'line' as const,
          data: dailyTrendTimeline.map(item => item.trialReached),
        },
      ],
    },
    siteRows: centerDashboard.siteLayer.metrics.map(item => ({
      title: item.label,
      value: item.value,
      helper: item.helper,
      color: item.color,
    })),
    paidRows: [
      {
        title: 'Лиды paid digital',
        value: countFormatter.format(paidDigitalChannel.leads),
        helper: `${decimalPercentFormatter.format(paidDigitalChannel.share * 100)}% всего потока`,
        color: 'info',
      },
      {
        title: 'Валидные paid digital',
        value: countFormatter.format(paidDigitalChannel.valid),
        helper: `${decimalPercentFormatter.format((paidDigitalChannel.valid / paidDigitalChannel.leads) * 100)}% валидности paid`,
        color: 'success',
      },
      {
        title: 'Дошли из paid digital',
        value: countFormatter.format(paidDigitalChannel.reached),
        helper: `${decimalPercentFormatter.format((paidDigitalChannel.reached / paidDigitalChannel.leads) * 100)}% от paid leads`,
        color: 'primary',
      },
      {
        title: directCtrCard.title,
        value: directCtrCard.value,
        helper: directCtrCard.helper,
        color: 'warning',
      },
    ],
    economicsRows: centerDashboard.economics.stats.map(item => ({
      title: item.label,
      value: item.value,
      helper: item.helper,
      color: item.color,
    })),
    greyZoneItems: greyZoneOverviewItems,
    notes: centerDashboard.economics.notes,
  },
  channelEfficiency: {
    title: 'Каналы центра',
    subtitle: 'Какие каналы приносят не просто лиды, а уже движение к пробному.',
    rows: centerDashboard.channelPerformance.map(item => ({
      avatarIcon: item.channel.includes('сайта')
        ? 'tabler-world-www'
        : item.channel.includes('Промо')
          ? 'tabler-megaphone'
          : item.channel.includes('Яндекс')
            ? 'tabler-brand-yandex'
            : 'tabler-building-store',
      avatarColor: item.tone,
      title: item.channel,
      subtitle: `${countFormatter.format(item.reached)} дошли из ${countFormatter.format(item.leads)} лидов`,
      metric: `${countFormatter.format(item.valid)} валидных · ${countFormatter.format(item.scheduled)} записаны`,
      progress: Number((((item.reached / item.leads) || 0) * 100).toFixed(1)),
      progressColor: item.tone,
    })),
  },
  economicsList: {
    title: 'Маркетинг и unit economics',
    subtitle: 'Direct fact и proxy economics в одном месте.',
    warningTitle: 'Важно про CPL на этом экране',
    warningText: 'Пока это center-level proxy: расход делится на лиды, валидные и дошедших в том же окне.',
    detailsRoute: '/reports/traffic-support',
    rows: centerDashboard.economics.stats.map(item => ({
      avatarIcon: item.label.includes('Расход')
        ? 'tabler-wallet'
        : item.label.includes('Клики')
          ? 'tabler-cursor-text'
          : item.label.includes('Показы')
            ? 'tabler-eye'
            : item.label.includes('CPM')
              ? 'tabler-brand-speedtest'
              : item.label.includes('CPC')
                ? 'tabler-click'
                : item.label.includes('CPVL')
                  ? 'tabler-badge-ad'
                  : item.label.includes('CPRT')
                    ? 'tabler-target-arrow'
                    : 'tabler-chart-donut-3',
      avatarColor: item.color,
      title: item.label,
      subtitle: item.helper,
      stats: item.value,
    })),
    notes: centerDashboard.economics.notes,
  },
  alertTimeline: {
    title: 'Сигналы и действия',
    subtitle: 'Короткий action-layer: что болит сейчас и куда идти первым.',
    items: centerDashboard.alerts.map(item => ({
      color: item.tone,
      title: item.title,
      meta: truthGradeLabelMap[item.truthGrade],
      description: item.detail,
      footer: item.action,
    })),
  },
  ownerActionTimeline: {
    title: 'Owner action queue',
    subtitle: 'Короткая CRM-очередь: что разбирать первым по текущему потоку.',
    items: [
      {
        color: 'error',
        title: 'Разобрать промо-поток',
        meta: '122 лида',
        description: 'Промо дает крупный объем, но до пробного доводит заметно слабее базового потока центра.',
        footer: 'Смотреть field execution, первый контакт и повторную обработку после неответа.',
      },
      {
        color: 'warning',
        title: 'Снизить no-show',
        meta: `${countFormatter.format(noShowVolume)} кейсов`,
        description: 'Потери после записи уже достаточно велики, чтобы влиять не только на конверсию, но и на загрузку пробных окон.',
        footer: 'Подтверждение записи, reminder cadence и отдельный разбор причин перед занятием.',
      },
      {
        color: 'warning',
        title: 'Починить слой невалидности',
        meta: '209 лидов',
        description: 'Главные причины невалидности здесь не абстрактные: дубли и глухой недозвон уже бьют по объему валидных.',
        footer: 'Проверить дедупликацию, intake discipline и первую попытку связи.',
      },
      {
        color: 'info',
        title: 'Дожать зависшие сделки',
        meta: centerDashboard.stuckLeadLayer.metrics[1].value,
        description: 'Объем stuck небольшой, но каждая зависшая сделка уже слишком старая, чтобы жить без ручного решения.',
        footer: 'Пройти все сделки в работе и закрыть хвост поштучно, а не ждать новый слой автоматизации.',
      },
    ],
  },
  greyZoneTimeline: {
    title: 'Серые зоны обзора',
    subtitle: 'Видим их на экране, но не даем им ломать основную обзорную картину.',
    detailsRoute: '/reports/traffic-support',
    items: greyZoneOverviewItems,
  },
  controlTimeline: {
    title: 'Центр управления',
    subtitle: 'Слои данных и ближайшие интеграции в одной ленте.',
    items: [
      ...centerDashboard.freshnessLayers.slice(0, 5).map(item => ({
        color: freshnessToneMap[item.status],
        title: item.source,
        meta: freshnessLabelMap[item.status],
        description: item.updatedAt,
        footer: item.note,
      })),
      ...dashboardSnapshot.workstreams.map(item => ({
        color: item.status === 'ready'
          ? 'success'
          : item.status === 'in-progress'
            ? 'info'
            : 'error',
        title: workstreamTitleMap[item.name as keyof typeof workstreamTitleMap] ?? item.name,
        meta: workstreamLabelMap[item.status],
        description: item.impact,
        footer: item.nextStep,
      })),
    ],
  },
  opsPanels: [
    centerDashboard.siteLayer,
    centerDashboard.promoLayer,
    centerDashboard.contactCenterLayer,
    centerDashboard.capacityLayer,
    centerDashboard.stuckLeadLayer,
  ].map(panel => ({
    ...panel,
    title: opsPanelTitleMap[panel.title as keyof typeof opsPanelTitleMap] ?? panel.title,
    subtitle: opsPanelSubtitleMap[panel.title as keyof typeof opsPanelSubtitleMap] ?? panel.subtitle,
    truthLabel: truthGradeLabelMap[panel.truthGrade],
    metrics: panel.metrics.map(metric => ({
      ...metric,
      label: opsMetricLabelMap[metric.label as keyof typeof opsMetricLabelMap] ?? metric.label,
    })),
  })),
  diagnosticSections: [
    {
      key: 'sources',
      tab: 'Источники',
      title: 'Источники лидов',
      subtitle: 'Полный слой каналов, а не только top-источники.',
      color: 'primary',
      footer: 'Сайт и промоутеры дают 67.6% объема. Этого уже достаточно, чтобы разделять digital и field execution.',
      rows: centerDashboard.sourceBreakdown,
    },
    {
      key: 'funnel',
      tab: 'Воронка',
      title: 'Состояние funnel в CRM',
      subtitle: 'Финальный статус февральской когорты без разлета по экранам.',
      color: 'success',
      footer: 'Следующий слой здесь: причины отказа и no-show, иначе закрытый объем остается слишком монолитным.',
      rows: centerDashboard.funnelBreakdown,
    },
    {
      key: 'invalid',
      tab: 'Невалид',
      title: 'Причины невалидности',
      subtitle: 'Реальный reason layer по невалидности, а не абстрактные потери качества.',
      color: 'error',
      footer: 'Главные buckets — дубли и недозвон. Значит это уже не только трафик, но и intake discipline.',
      rows: centerDashboard.invalidReasonBreakdown,
    },
    {
      key: 'noshow',
      tab: 'Срывы',
      title: 'Причины no-show',
      subtitle: 'Потери после записи вынесены в отдельный операционный слой.',
      color: 'warning',
      footer: '51 no-show в феврале — это отдельная операционная задача, а не хвост воронки.',
      rows: centerDashboard.noShowReasonBreakdown,
    },
    {
      key: 'refusals',
      tab: 'Отказы',
      title: 'Причины отказа',
      subtitle: 'Refusal layer, чтобы закрытый объем не выглядел одной серой массой.',
      color: 'secondary',
      footer: 'Здесь уже разговор про offer, расписание и post-trial follow-up, а не только про трафик.',
      rows: centerDashboard.refusalReasonBreakdown,
    },
  ],
  dataLayerControl: {
    truthLayers: centerDashboard.truthLayers.map(layer => ({
      ...layer,
      gradeLabel: truthGradeLabelMap[layer.grade],
    })),
    pendingLayers: centerDashboard.pendingLayers,
    freshness: centerDashboard.freshnessLayers.map(item => ({
      ...item,
      statusLabel: freshnessLabelMap[item.status],
    })),
  },
  supportTracker: {
    title: 'Валидность и запись',
    subtitle: centerDashboard.meta.periodLabel,
    total: countFormatter.format(validLeads),
    totalLabel: 'Валидных лидов',
    radialValue: 85.8,
    radialLabel: 'Запись из валидных',
    detailsRoute: '/reports/crm-overview',
    items: [
      {
        avatarColor: 'error',
        avatarIcon: 'tabler-circle-x',
        title: 'Невалидные лиды',
        subtitle: '209',
      },
      {
        avatarColor: 'info',
        avatarIcon: 'tabler-calendar-event',
        title: 'Записаны',
        subtitle: countFormatter.format(scheduledTrials),
      },
      {
        avatarColor: 'success',
        avatarIcon: 'tabler-flag-3',
        title: 'Дошли до пробного',
        subtitle: countFormatter.format(reachedTrials),
      },
    ],
  },
  crmSignals: {
    title: 'Обзор ключевых метрик',
    subtitle: 'Компактная сводка по прямым выгрузкам из CRM, Direct и Metrica.',
    cards: [
      {
        icon: 'tabler-users',
        color: 'primary',
        title: 'Лиды',
        value: countFormatter.format(totalLeads),
        helper: 'входящий поток февраля',
        badge: 'факт',
      },
      {
        icon: 'tabler-circle-check',
        color: 'success',
        title: 'Валидность',
        value: '56.1%',
        helper: '275 валидных из 490 лидов',
        badge: 'факт',
      },
      {
        icon: 'tabler-calendar-event',
        color: 'info',
        title: 'Запись из валидных',
        value: '85.8%',
        helper: '236 записаны на пробный',
        badge: 'факт',
      },
      {
        icon: 'tabler-route-2',
        color: 'secondary',
        title: 'Доходимость',
        value: '70.4%',
        helper: '185 дошли из 236 записанных',
        badge: 'факт',
      },
      {
        icon: 'tabler-user-off',
        color: 'warning',
        title: 'No-show',
        value: countFormatter.format(noShowVolume),
        helper: 'потери после записи',
        badge: 'факт',
      },
      {
        icon: 'tabler-hourglass-empty',
        color: 'error',
        title: 'Stuck leads',
        value: centerDashboard.stuckLeadLayer.metrics[0].value,
        helper: '4 сделки в статусе "Согласован перезвон"',
        badge: 'факт',
      },
    ],
  },
  marketingSignals: {
    title: 'Маркетинговые сигналы',
    subtitle: 'Attribution и economics слой рядом с core funnel.',
    cards: centerDashboard.marketingSignalCards.map(item => ({
      icon: item.icon,
      color: item.color,
      title: item.title,
      value: item.value,
      helper: item.helper,
      badge: item.badge === truthGradeLabelMap[item.truthGrade]
        ? item.badge
        : `${item.badge} · ${truthGradeLabelMap[item.truthGrade]}`,
    })),
  },
  invalidReasonState: {
    title: 'Почему лиды невалидны',
    subtitle: 'Top reason buckets по февральской когорте.',
    detailsRoute: '/reports/loss-map',
    rows: centerDashboard.invalidReasonBreakdown.slice(0, 4).map((item, index) => ({
      avatarColor: index === 0 ? 'error' : index === 1 ? 'warning' : 'secondary',
      avatarIcon: index === 0 ? 'tabler-copy' : index === 1 ? 'tabler-phone-off' : 'tabler-alert-circle',
      title: item.name,
      count: countFormatter.format(item.count),
      stats: `${decimalPercentFormatter.format(item.share * 100)}%`,
      statsColor: index < 2 ? 'error' : 'secondary',
    })),
  },
  noShowReasonState: {
    title: 'Почему не доходят до пробного',
    subtitle: 'Что именно роняет доходимость после записи.',
    detailsRoute: '/reports/loss-map',
    rows: centerDashboard.noShowReasonBreakdown.slice(0, 4).map((item, index) => ({
      avatarColor: index === 0 ? 'error' : index === 1 ? 'warning' : 'secondary',
      avatarIcon: index === 0 ? 'tabler-user-off' : index === 1 ? 'tabler-phone-pause' : 'tabler-clock-exclamation',
      title: item.name,
      count: countFormatter.format(item.count),
      stats: `${decimalPercentFormatter.format(item.share * 100)}%`,
      statsColor: index < 2 ? 'warning' : 'secondary',
    })),
  },
  refusalReasonState: {
    title: 'Почему отказываются',
    subtitle: 'Top refusal buckets после первичной коммуникации.',
    detailsRoute: '/reports/loss-map',
    rows: centerDashboard.refusalReasonBreakdown.slice(0, 4).map((item, index) => ({
      avatarColor: index === 0 ? 'secondary' : index === 1 ? 'warning' : 'info',
      avatarIcon: index === 0 ? 'tabler-mood-sad' : index === 1 ? 'tabler-calendar-time' : 'tabler-message-x',
      title: item.name,
      count: countFormatter.format(item.count),
      stats: `${decimalPercentFormatter.format(item.share * 100)}%`,
      statsColor: index === 1 ? 'warning' : 'secondary',
    })),
  },
  creativeWorkbench: {
    title: 'Креативы и гипотезы',
    subtitle: 'Testing layer до строгой атрибуции по кампании и креативу.',
    rows: centerDashboard.creativeSignals.map(item => ({
      avatarIcon: item.icon,
      avatarColor: item.color,
      title: item.title,
      subtitle: item.subtitle,
      metric: item.helper,
      progress: item.progress,
      progressColor: item.color,
    })),
  },
  campaignOpsTimeline: {
    title: 'РК и Zoom-контур',
    subtitle: 'Короткий action log по РК, креативам и owner escalation.',
    items: centerDashboard.campaignTimeline.map(item => ({
      color: item.tone,
      title: item.title,
      meta: item.meta,
      description: item.detail,
      footer: item.action,
    })),
  },
}
