/** Illustrative sample values, unrelated to operational figures. */
export type DataTruthGrade = 'fact' | 'manual_fact' | 'proxy' | 'partial' | 'missing' | 'stale' | 'demo'
export type DataFreshnessStatus = 'fresh' | 'partial' | 'manual' | 'stale' | 'missing'

export interface DashboardKpi {
  title: string
  value: string
  delta: string
  helper: string
  icon: string
  color: string
  trend: 'up' | 'down' | 'steady'
  series?: number[]
  size?: 'primary' | 'secondary'
}

export interface CenterMeta {
  brand: string
  center: string
  region: string
  periodLabel: string
  periodFrom: string
  periodTo: string
  comparisonLabel: string
  sliceLabel: string
  headline: string
  summary: string
}

export interface HeroSignal {
  label: string
  value: string
  helper: string
  color: string
}

export interface DailyTrendPoint {
  day: string
  label: string
  leads: number
  valid: number
  trialScheduled: number
  trialReached: number
}

export interface BreakdownRow {
  name: string
  count: number
  share: number
  note?: string
}

export interface DashboardTimelinePoint {
  month: string
  revenue: number
  leads: number
}

export interface DashboardFunnelStage {
  stage: string
  volume: number
  conversion: number
  note: string
  color: string
}

export interface DashboardWorkstream {
  name: string
  owner: string
  status: 'ready' | 'in-progress' | 'blocked'
  impact: string
  nextStep: string
}

export interface DashboardSource {
  name: string
  status: 'connected' | 'partial' | 'planned'
  freshness: string
  owner: string
  nextStep: string
}

export interface MetricDefinition {
  metric: string
  definition: string
  source: string
  cadence: string
}

export interface TruthLayer {
  title: string
  grade: DataTruthGrade
  owner: string
  summary: string
  note: string
}

export interface PendingLayer {
  title: string
  blocker: string
  nextStep: string
  metrics: string[]
}

export interface EconomicsStat {
  label: string
  value: string
  helper: string
  color: string
}

export interface MetricSignalCard {
  icon: string
  color: string
  title: string
  value: string
  helper: string
  badge: string
  truthGrade: DataTruthGrade
}

export interface ProgressSignal {
  icon: string
  color: string
  title: string
  subtitle: string
  helper: string
  progress: number
  truthGrade: DataTruthGrade
}

export interface TimelineEvent {
  title: string
  meta: string
  detail: string
  action: string
  tone: 'success' | 'info' | 'warning' | 'error'
  truthGrade: DataTruthGrade
}

export interface SourcePathItem {
  label: string
  path: string
  truthGrade: DataTruthGrade
}

export interface PlanCheckpoint {
  label: string
  value: number
  target: string
  color: string
}

export interface PlanSnapshot {
  truthGrade: DataTruthGrade
  plan: string
  fact: string
  completion: string
  forecast: string
  pace: string
  yoy: string
  reachedYoy: string
  notes: string[]
  checkpoints: PlanCheckpoint[]
}

export interface ChannelPerformanceRow {
  channel: string
  leads: number
  valid: number
  scheduled: number
  reached: number
  share: number
  note: string
  tone: string
  truthGrade: DataTruthGrade
}

export interface PanelMetric {
  label: string
  value: string
  helper: string
  color: string
}

export interface OpsPanel {
  title: string
  subtitle: string
  truthGrade: DataTruthGrade
  metrics: PanelMetric[]
  notes: string[]
}

export interface AlertItem {
  title: string
  detail: string
  action: string
  tone: 'success' | 'info' | 'warning' | 'error'
  truthGrade: DataTruthGrade
}

export interface FreshnessItem {
  source: string
  updatedAt: string
  status: DataFreshnessStatus
  note: string
}

export type OwnerDecisionMode = 'safe_to_decide' | 'read_with_caveats' | 'blocked'
export type OwnerRankStatus = 'lead' | 'watch' | 'risk' | 'blocked'
export type OwnerProblemSeverity = 'watch' | 'risk' | 'critical'
export type OwnerActionStatus = 'ready' | 'in_progress' | 'blocked'
export type OwnerDrilldownStatus = 'ready' | 'planned' | 'blocked'

export interface OwnerDecisionGate {
  mode: OwnerDecisionMode
  title: string
  summary: string
  allowedDecisions: string[]
  blockedDecisions: string[]
  freshness: FreshnessItem[]
  truthGrade: DataTruthGrade
}

export interface OwnerKpiItem {
  title: string
  value: string
  helper: string
  source: string
  grain: string
  icon: string
  color: string
  truthGrade: DataTruthGrade
  freshnessStatus: DataFreshnessStatus
}

export interface OwnerCenterRankingItem {
  center: string
  status: OwnerRankStatus
  statusLabel: string
  spend: string
  leads: string
  validRate: string
  reachedTrials: string
  costPerLead: string
  costPerReachedTrial: string
  problemSignal: string
  truthGrade: DataTruthGrade
}

export interface OwnerProblemBucket {
  title: string
  metric: string
  detail: string
  nextStep: string
  severity: OwnerProblemSeverity
  icon: string
  color: string
  truthGrade: DataTruthGrade
}

export interface OwnerActionQueueItem {
  title: string
  owner: string
  priority: string
  status: OwnerActionStatus
  due: string
  detail: string
  truthGrade: DataTruthGrade
}

export interface OwnerDrilldownHook {
  title: string
  route: string
  status: OwnerDrilldownStatus
  helper: string
  truthGrade: DataTruthGrade
}

export interface HistoricalBaselineMetric {
  label: string
  value: string
  helper: string
  truthGrade: DataTruthGrade
}

export interface HistoricalBaselineSource {
  label: string
  value: string
  helper: string
  truthGrade: DataTruthGrade
  freshnessStatus: DataFreshnessStatus
}

export interface HistoricalBaseline {
  overline: string
  title: string
  periodRange: string
  center: string
  cohortLogic: string
  summary: string
  metrics: HistoricalBaselineMetric[]
  sources: HistoricalBaselineSource[]
  caveats: string[]
}

export interface OwnerOverview {
  historicalBaseline: HistoricalBaseline
  decisionGate: OwnerDecisionGate
  kpis: OwnerKpiItem[]
  centerRanking: OwnerCenterRankingItem[]
  problemBuckets: OwnerProblemBucket[]
  actionQueue: OwnerActionQueueItem[]
  drilldownHooks: OwnerDrilldownHook[]
}

export const centerDashboard = {
  meta: {
    brand: 'GYMKiDs',
    center: 'Ново-Переделкино',
    region: 'Москва',
    periodLabel: 'Февраль 50',
    periodFrom: '2026-02-01',
    periodTo: '2026-02-28',
    comparisonLabel: '50-50 января 50',
    sliceLabel: 'Когорта лидов, созданных в периоде',
    headline: 'Операционная стена одного центра',
    summary: 'Демонстрационные данные',
  } satisfies CenterMeta,
  heroSignals: [
    {
      label: 'Дошли до пробного',
      value: '50',
      helper: 'Демонстрационные данные',
      color: 'success',
    },
    {
      label: 'План месяца',
      value: '50%',
      helper: 'Демонстрационные данные',
      color: 'primary',
    },
    {
      label: 'Attribution gap',
      value: '50%',
      helper: 'Демонстрационные данные',
      color: 'warning',
    },
    {
      label: 'YoY по лидам',
      value: '50',
      helper: 'Демонстрационные данные',
      color: 'info',
    },
  ] satisfies HeroSignal[],
  ownerOverview: {
    historicalBaseline: {
      overline: 'Historical baseline',
      title: 'Февраль 50 — опорный месяц',
      periodRange: '2026-02-01 -> 2026-02-28',
      center: 'Ново-Переделкино · Москва',
      cohortLogic: 'Когорта: лиды, созданные 50-50.50; trial path читаем внутри этого owner-среза.',
      summary: 'Демонстрационные данные',
      metrics: [
        {
          label: 'Лиды',
          value: '50',
          helper: 'Демонстрационные данные',
          truthGrade: 'fact',
        },
        {
          label: 'Валидные',
          value: '50',
          helper: 'Демонстрационные данные',
          truthGrade: 'fact',
        },
        {
          label: 'Записаны',
          value: '50',
          helper: 'Демонстрационные данные',
          truthGrade: 'fact',
        },
        {
          label: 'Дошли',
          value: '50',
          helper: 'Демонстрационные данные',
          truthGrade: 'fact',
        },
        {
          label: 'Direct spend',
          value: '50 50 ₽',
          helper: 'Демонстрационные данные',
          truthGrade: 'fact',
        },
        {
          label: 'Attribution gap',
          value: '50%',
          helper: 'Демонстрационные данные',
          truthGrade: 'partial',
        },
      ],
      sources: [
        {
          label: 'amoCRM',
          value: 'cohort export',
          helper: 'Демонстрационные данные',
          truthGrade: 'fact',
          freshnessStatus: 'fresh',
        },
        {
          label: 'Yandex Direct',
          value: 'fact window',
          helper: 'Демонстрационные данные',
          truthGrade: 'fact',
          freshnessStatus: 'fresh',
        },
        {
          label: 'Owner plan',
          value: 'manual target',
          helper: 'Демонстрационные данные',
          truthGrade: 'manual_fact',
          freshnessStatus: 'manual',
        },
        {
          label: 'Payment / capacity',
          value: 'not connected',
          helper: 'Демонстрационные данные',
          truthGrade: 'missing',
          freshnessStatus: 'missing',
        },
      ],
      caveats: [
        'Один центр, не рейтинг сети.',
        'CAC / ROMI без payments не закрываем.',
        'Загрузка без capacity не закрыта.',
      ],
    } satisfies HistoricalBaseline,
    decisionGate: {
      mode: 'read_with_caveats',
      title: 'Можно читать, но не закрывать сильные выводы',
      summary: 'Демонстрационные данные',
      allowedDecisions: [
        'Оценить поток, валидность и запись на пробный',
        'Разобрать no-show и потери после записи',
        'Использовать Direct spend как paid baseline февраля',
      ],
      blockedDecisions: [
        'Финальная CAC / ROMI оценка',
        'Рейтинг всех центров сети',
        'Оплаты, договоры и paid / won без payment mapping',
      ],
      freshness: [
        {
          source: 'Демонстрационные данные',
          updatedAt: 'build 50-50-50',
          status: 'fresh',
          note: 'Демонстрационные данные',
        },
        {
          source: 'Демонстрационные данные',
          updatedAt: '2026-02-28 fact window',
          status: 'fresh',
          note: 'Демонстрационные данные',
        },
        {
          source: 'Демонстрационные данные',
          updatedAt: 'owner input 50-50-50',
          status: 'manual',
          note: 'Демонстрационные данные',
        },
        {
          source: 'Демонстрационные данные',
          updatedAt: 'not connected',
          status: 'missing',
          note: 'Демонстрационные данные',
        },
      ],
      truthGrade: 'partial',
    } satisfies OwnerDecisionGate,
    kpis: [
      {
        title: 'Лиды',
        value: '50',
        helper: 'Демонстрационные данные',
        source: 'Демонстрационные данные',
        grain: 'lead_id',
        icon: 'tabler-users-plus',
        color: 'primary',
        truthGrade: 'fact',
        freshnessStatus: 'fresh',
      },
      {
        title: 'Валидные лиды',
        value: '50',
        helper: 'Демонстрационные данные',
        source: 'Демонстрационные данные',
        grain: 'lead_status',
        icon: 'tabler-circle-check',
        color: 'success',
        truthGrade: 'fact',
        freshnessStatus: 'fresh',
      },
      {
        title: 'Записаны',
        value: '50',
        helper: 'Демонстрационные данные',
        source: 'Демонстрационные данные',
        grain: 'trial_status',
        icon: 'tabler-calendar-event',
        color: 'info',
        truthGrade: 'fact',
        freshnessStatus: 'fresh',
      },
      {
        title: 'Дошли до пробного',
        value: '50',
        helper: 'Демонстрационные данные',
        source: 'Демонстрационные данные',
        grain: 'trial_reached',
        icon: 'tabler-flag-3',
        color: 'primary',
        truthGrade: 'fact',
        freshnessStatus: 'fresh',
      },
      {
        title: 'No-show',
        value: '50',
        helper: 'Демонстрационные данные',
        source: 'Демонстрационные данные',
        grain: 'trial_path',
        icon: 'tabler-user-off',
        color: 'warning',
        truthGrade: 'fact',
        freshnessStatus: 'fresh',
      },
      {
        title: 'Direct spend',
        value: '50 50 ₽',
        helper: 'Демонстрационные данные',
        source: 'Демонстрационные данные',
        grain: 'center_month',
        icon: 'tabler-badge-ad',
        color: 'info',
        truthGrade: 'fact',
        freshnessStatus: 'fresh',
      },
      {
        title: 'План месяца',
        value: '50%',
        helper: 'Демонстрационные данные',
        source: 'Демонстрационные данные',
        grain: 'manual_month',
        icon: 'tabler-target-arrow',
        color: 'warning',
        truthGrade: 'manual_fact',
        freshnessStatus: 'manual',
      },
      {
        title: 'Attribution gap',
        value: '50%',
        helper: 'Демонстрационные данные',
        source: 'Демонстрационные данные',
        grain: '_ym_uid',
        icon: 'tabler-route-x',
        color: 'error',
        truthGrade: 'fact',
        freshnessStatus: 'partial',
      },
    ] satisfies OwnerKpiItem[],
    centerRanking: [
      {
        center: 'Ново-Переделкино',
        status: 'watch',
        statusLabel: 'single-center baseline',
        spend: '50 50 ₽',
        leads: '50',
        validRate: '50%',
        reachedTrials: '50',
        costPerLead: '50 ₽',
        costPerReachedTrial: '50 50 ₽',
        problemSignal: 'Промо и no-show требуют отдельного owner-review.',
        truthGrade: 'partial',
      },
    ] satisfies OwnerCenterRankingItem[],
    problemBuckets: [
      {
        title: 'Traffic / attribution',
        metric: '50%',
        detail: 'Демонстрационные данные',
        nextStep: 'Досопоставить _ym_uid, metrika_conversion и campaign_id до owner reporting.',
        severity: 'risk',
        icon: 'tabler-route-x',
        color: 'warning',
        truthGrade: 'fact',
      },
      {
        title: 'No-show после записи',
        metric: '50',
        detail: 'Демонстрационные данные',
        nextStep: 'Разобрать reminders, переносы и причины неявки перед занятием.',
        severity: 'risk',
        icon: 'tabler-user-off',
        color: 'warning',
        truthGrade: 'fact',
      },
      {
        title: 'Promo source quality',
        metric: '50',
        detail: 'Демонстрационные данные',
        nextStep: 'Разделить точки, смены, первый контакт и повторную обработку.',
        severity: 'risk',
        icon: 'tabler-megaphone',
        color: 'warning',
        truthGrade: 'partial',
      },
      {
        title: 'Capacity source missing',
        metric: 'нет',
        detail: 'Демонстрационные данные',
        nextStep: 'Подключить slot capacity layer до выводов о загрузке центра.',
        severity: 'critical',
        icon: 'tabler-calendar-off',
        color: 'error',
        truthGrade: 'missing',
      },
      {
        title: 'Payment layer missing',
        metric: 'нет',
        detail: 'Демонстрационные данные',
        nextStep: 'Связать trial_reached -> paid / won перед CAC и ROMI.',
        severity: 'critical',
        icon: 'tabler-cash-off',
        color: 'error',
        truthGrade: 'missing',
      },
    ] satisfies OwnerProblemBucket[],
    actionQueue: [
      {
        title: 'Поднять board / sheet plan source',
        owner: 'Ops',
        priority: 'P50',
        status: 'ready',
        due: 'до owner review',
        detail: 'Демонстрационные данные',
        truthGrade: 'manual_fact',
      },
      {
        title: 'Закрыть payment mapping',
        owner: 'Finance / CRM',
        priority: 'P50',
        status: 'blocked',
        due: 'до CAC / ROMI',
        detail: 'Демонстрационные данные',
        truthGrade: 'missing',
      },
      {
        title: 'Разобрать промо и no-show',
        owner: 'Marketing / Center',
        priority: 'P50',
        status: 'ready',
        due: 'следующий Zoom',
        detail: 'Демонстрационные данные',
        truthGrade: 'fact',
      },
    ] satisfies OwnerActionQueueItem[],
    drilldownHooks: [
      {
        title: 'Lead flow',
        route: '/reports/lead-flow',
        status: 'ready',
        helper: 'Демонстрационные данные',
        truthGrade: 'fact',
      },
      {
        title: 'Trial path',
        route: '/reports/trial-path',
        status: 'ready',
        helper: 'Демонстрационные данные',
        truthGrade: 'fact',
      },
      {
        title: 'Loss map',
        route: '/reports/loss-map',
        status: 'ready',
        helper: 'Демонстрационные данные',
        truthGrade: 'fact',
      },
      {
        title: 'Traffic support',
        route: '/reports/traffic-support',
        status: 'ready',
        helper: 'Демонстрационные данные',
        truthGrade: 'partial',
      },
      {
        title: 'Owner atlas',
        route: '/owner-atlas',
        status: 'planned',
        helper: 'Демонстрационные данные',
        truthGrade: 'partial',
      },
      {
        title: 'Payment mapping',
        route: '/reports/payment-mapping',
        status: 'blocked',
        helper: 'Демонстрационные данные',
        truthGrade: 'missing',
      },
    ] satisfies OwnerDrilldownHook[],
  } satisfies OwnerOverview,
  primaryKpis: [
    {
      title: 'Лиды',
      value: '50',
      delta: '+50%',
      helper: 'Демонстрационные данные',
      icon: 'tabler-users-plus',
      color: 'primary',
      trend: 'up',
      size: 'primary',
      series: [60, 70, 80, 90, 100, 110, 120],
    },
    {
      title: 'Валидные лиды',
      value: '50',
      delta: '50%',
      helper: 'Демонстрационные данные',
      icon: 'tabler-circle-check',
      color: 'success',
      trend: 'steady',
      size: 'primary',
      series: [3, 3, 130, 3, 140, 150, 160],
    },
    {
      title: 'Дошли до пробного',
      value: '50',
      delta: '50%',
      helper: 'Демонстрационные данные',
      icon: 'tabler-flag-3',
      color: 'info',
      trend: 'up',
      size: 'primary',
      series: [3, 3, 3, 3, 3, 3, 3],
    },
    {
      title: 'Стоимость дошедшего',
      value: '50 50 ₽',
      delta: 'прокси',
      helper: 'Демонстрационные данные',
      icon: 'tabler-coins',
      color: 'warning',
      trend: 'steady',
      size: 'primary',
      series: [50, 60, 70, 80, 90, 100, 110],
    },
  ] satisfies DashboardKpi[],
  secondaryKpis: [
    {
      title: 'Записаны на пробный',
      value: '50',
      delta: '50%',
      helper: 'Демонстрационные данные',
      icon: 'tabler-calendar-event',
      color: 'secondary',
      trend: 'up',
      size: 'secondary',
      series: [3, 3, 3, 3, 3, 3, 120],
    },
    {
      title: 'Доходимость на пробный',
      value: '50%',
      delta: '50 no-show',
      helper: 'Демонстрационные данные',
      icon: 'tabler-route-2',
      color: 'error',
      trend: 'steady',
      size: 'secondary',
      series: [3, 3, 3, 3, 3, 3, 3],
    },
    {
      title: 'Расход Direct',
      value: '50 50 ₽',
      delta: '50 50 кликов',
      helper: 'Демонстрационные данные',
      icon: 'tabler-badge-ad',
      color: 'info',
      trend: 'steady',
      size: 'secondary',
      series: [3, 3, 3, 3, 3, 130, 3],
    },
    {
      title: 'Выполнение плана',
      value: '50%',
      delta: 'ручной ориентир',
      helper: 'Демонстрационные данные',
      icon: 'tabler-target-arrow',
      color: 'primary',
      trend: 'steady',
      size: 'secondary',
      series: [3, 3, 3, 3, 3, 3, 3],
    },
  ] satisfies DashboardKpi[],
  dailyTrend: [
    { day: '2026-02-01', label: '50', leads: 140, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-02', label: '50', leads: 150, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-03', label: '50', leads: 160, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-04', label: '50', leads: 50, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-05', label: '50', leads: 3, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-06', label: '50', leads: 60, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-07', label: '50', leads: 70, valid: 80, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-08', label: '50', leads: 90, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-09', label: '50', leads: 100, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-10', label: '50', leads: 110, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-11', label: '50', leads: 3, valid: 3, trialScheduled: 3, trialReached: 0 },
    { day: '2026-02-12', label: '50', leads: 120, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-13', label: '50', leads: 130, valid: 140, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-14', label: '50', leads: 150, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-15', label: '50', leads: 3, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-16', label: '50', leads: 3, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-17', label: '50', leads: 160, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-18', label: '50', leads: 50, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-19', label: '50', leads: 60, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-20', label: '50', leads: 70, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-21', label: '50', leads: 80, valid: 90, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-22', label: '50', leads: 3, valid: 3, trialScheduled: 3, trialReached: 0 },
    { day: '2026-02-23', label: '50', leads: 3, valid: 3, trialScheduled: 0, trialReached: 0 },
    { day: '2026-02-24', label: '50', leads: 100, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-25', label: '50', leads: 3, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-26', label: '50', leads: 110, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-27', label: '50', leads: 120, valid: 3, trialScheduled: 3, trialReached: 3 },
    { day: '2026-02-28', label: '50', leads: 130, valid: 140, trialScheduled: 150, trialReached: 3 },
  ] satisfies DailyTrendPoint[],
  planSnapshot: {
    truthGrade: 'manual_fact',
    plan: '50 лидов',
    fact: '50',
    completion: '50%',
    forecast: '50',
    pace: 'закрытый месяц выше ручного target',
    yoy: 'source-backed февральский срез',
    reachedYoy: '50 дошедших в когорте',
    notes: [
      'Февральский план 50 на этом экране пока задан вручную, чтобы owner видел темп без ожидания board layer.',
      'Факт 50 взят из historical month-center metric pack за февраль 50.',
      'После подключения board / sheet export этот блок должен перейти из manual_fact в полноценный факт.',
    ],
    checkpoints: [
      { label: 'Лиды к плану', value: 160, target: '50 / 50', color: 'primary' },
      { label: 'Валидность', value: 50, target: '50 / 50', color: 'success' },
      { label: 'Конверсия в пробный', value: 60, target: '50 / 50', color: 'info' },
      { label: 'Доходимость', value: 70, target: '50 / 50', color: 'warning' },
    ],
  } satisfies PlanSnapshot,
  channelPerformance: [
    {
      channel: 'Заявка с сайта',
      leads: 80,
      valid: 90,
      scheduled: 100,
      reached: 110,
      share: 0.5,
      note: 'Демонстрационные данные',
      tone: 'primary',
      truthGrade: 'fact',
    },
    {
      channel: 'Промоутеры',
      leads: 120,
      valid: 130,
      scheduled: 140,
      reached: 150,
      share: 0.5,
      note: 'Демонстрационные данные',
      tone: 'warning',
      truthGrade: 'fact',
    },
    {
      channel: 'Яндекс / paid digital',
      leads: 160,
      valid: 50,
      scheduled: 60,
      reached: 70,
      share: 0.5,
      note: 'Демонстрационные данные',
      tone: 'info',
      truthGrade: 'partial',
    },
    {
      channel: 'Прямое обращение в центр',
      leads: 80,
      valid: 90,
      scheduled: 100,
      reached: 110,
      share: 0.5,
      note: 'Демонстрационные данные',
      tone: 'success',
      truthGrade: 'fact',
    },
  ] satisfies ChannelPerformanceRow[],
  siteLayer: {
    title: 'Сайт и digital',
    subtitle: 'Лиды сайта уже читаются как опора, а визиты и качество трафика пока остаются слоем приближений.',
    truthGrade: 'partial',
    metrics: [
      { label: 'Лиды с сайта', value: '50', helper: 'Демонстрационные данные', color: 'primary' },
      { label: 'Валидные', value: '50', helper: 'Демонстрационные данные', color: 'success' },
      { label: 'Дошли до пробного', value: '50', helper: 'Демонстрационные данные', color: 'info' },
      { label: 'Визиты сайта', value: '50 50', helper: 'Демонстрационные данные', color: 'warning' },
      { label: 'Конверсия сайта', value: '50%', helper: 'Демонстрационные данные', color: 'secondary' },
      { label: 'Вовлеченные сессии', value: '50%', helper: 'Демонстрационные данные', color: 'secondary' },
    ],
    notes: [
      'Первые три метрики берутся из CRM факт-слоя и уже пригодны для чтения по центру.',
      'Visits / conversion / engagement пока считаются как приближенный слой, потому что site analytics еще не подключен.',
    ],
  } satisfies OpsPanel,
  promoLayer: {
    title: 'Оффлайн и промо',
    subtitle: 'Этот блок нужен, чтобы полевая лидогенерация перестала теряться внутри общей структуры каналов.',
    truthGrade: 'partial',
    metrics: [
      { label: 'Промо-лиды', value: '50', helper: 'Демонстрационные данные', color: 'warning' },
      { label: 'Валидные', value: '50', helper: 'Демонстрационные данные', color: 'success' },
      { label: 'Дошли до пробного', value: '50', helper: 'Демонстрационные данные', color: 'error' },
      { label: 'Бюджет промо', value: '50 50 ₽', helper: 'Демонстрационные данные', color: 'secondary' },
      { label: 'Цена промо-лида', value: '50 ₽', helper: 'Демонстрационные данные', color: 'info' },
      { label: 'Цена промо-пробника', value: '50 50 ₽', helper: 'Демонстрационные данные', color: 'primary' },
    ],
    notes: [
      'Лиды, валидность и дошедшие читаются из CRM-факта.',
      'Бюджет и стоимость промо пока остаются ручным ориентиром, чтобы слой не пропал в backlog.',
    ],
  } satisfies OpsPanel,
  contactCenterLayer: {
    title: 'Контакт-центр и SLA',
    subtitle: 'Appointment rate и объем зависших лидов уже видны, но event layer по касаниям еще отсутствует.',
    truthGrade: 'partial',
    metrics: [
      { label: 'Appointment rate', value: '50%', helper: 'Демонстрационные данные', color: 'success' },
      { label: 'Зависшие in-work', value: '50', helper: 'Демонстрационные данные', color: 'warning' },
      { label: 'Contact rate', value: '50%', helper: 'Демонстрационные данные', color: 'info' },
      { label: 'Первый ответ', value: '50 мин', helper: 'Демонстрационные данные', color: 'primary' },
      { label: 'Звонков в день', value: '50', helper: 'Демонстрационные данные', color: 'secondary' },
      { label: 'Сообщений в день', value: '50', helper: 'Демонстрационные данные', color: 'secondary' },
      { label: 'Касаний на лид', value: '50', helper: 'Демонстрационные данные', color: 'secondary' },
    ],
    notes: [
      'На этом экране appointment rate уже честный факт, а SLA и касания все еще остаются переходным слоем.',
      'Следующая обязательная выгрузка: first_contact_at, operator mapping, event history.',
    ],
  } satisfies OpsPanel,
  capacityLayer: {
    title: 'Пробники как capacity-контур',
    subtitle: 'Здесь намеренно смешаны факт и seed, чтобы уже видеть вместимость как ограничение, а не только как конверсию.',
    truthGrade: 'partial',
    metrics: [
      { label: 'Доступные слоты', value: '50', helper: 'Демонстрационные данные', color: 'secondary' },
      { label: 'Записаны на пробный', value: '50', helper: 'Демонстрационные данные', color: 'info' },
      { label: 'Дошли до пробного', value: '50', helper: 'Демонстрационные данные', color: 'success' },
      { label: 'Заполнение слотов', value: '50%', helper: 'Демонстрационные данные', color: 'primary' },
      { label: 'No-show нагрузка', value: '50', helper: 'Демонстрационные данные', color: 'error' },
      { label: 'Capacity flag', value: 'amber', helper: 'Демонстрационные данные', color: 'warning' },
    ],
    notes: [
      'Для production здесь нужен реальный slot schedule по дням, тренерам и доступным окнам.',
      'Даже текущий ориентир уже показывает, что no-show влияет не только на воронку, но и на вместимость.',
    ],
  } satisfies OpsPanel,
  stuckLeadLayer: {
    title: 'Stuck leads',
    subtitle: 'Небольшой, но важный операционный долг: в феврале почти все лиды уже закрыты, зато оставшиеся зависли очень надолго.',
    truthGrade: 'fact',
    metrics: [
      { label: 'Stuck leads', value: '50', helper: 'Демонстрационные данные', color: 'warning' },
      { label: 'Avg age', value: '50 дн', helper: 'Демонстрационные данные', color: 'error' },
      { label: '50+ day bucket', value: '50', helper: 'Демонстрационные данные', color: 'secondary' },
      { label: 'Main status', value: '50', helper: 'Демонстрационные данные', color: 'info' },
    ],
    notes: [
      'Если оставить этот слой без event history, он будет выглядеть маленьким, но останется невидимой точкой операционного распада.',
    ],
  } satisfies OpsPanel,
  sourceBreakdown: [
    { name: 'Заявка с сайта', count: 120, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Промоутеры', count: 130, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Прямое обращение в центр', count: 140, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Колесо фортуны', count: 150, share: 0.5 },
    { name: 'Телеграм', count: 160, share: 0.5 },
    { name: 'Повторная проработка', count: 50, share: 0.5 },
    { name: 'Возобновление общения', count: 60, share: 0.5 },
    { name: 'Вотсап', count: 3, share: 0.5 },
    { name: 'По рекомендации', count: 3, share: 0.5 },
    { name: 'ВК', count: 3, share: 0.5 },
  ] satisfies BreakdownRow[],
  utmSourceBreakdown: [
    { name: 'Не заполнено', count: 70, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'yandex', count: 80, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'maps', count: 90, share: 0.5 },
    { name: 'geoadv_maps', count: 3, share: 0.5 },
    { name: 'ya', count: 3, share: 0.5 },
  ] satisfies BreakdownRow[],
  campaignBreakdown: [
    { name: '50', count: 100, share: 0.5 },
    { name: '50', count: 110, share: 0.5 },
    { name: '50', count: 120, share: 0.5 },
    { name: '50', count: 130, share: 0.5 },
    { name: '50', count: 140, share: 0.5 },
    { name: '50', count: 3, share: 0.5 },
    { name: '50', count: 3, share: 0.5 },
    { name: '50', count: 3, share: 0.5 },
  ] satisfies BreakdownRow[],
  invalidReasonBreakdown: [
    { name: 'Дубль, уже есть сделка', count: 150, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Глухой недозвон', count: 160, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Причина не установлена / бросает тлф, нет ответа', count: 50, share: 0.5 },
    { name: 'Расположение / неудобно ездить', count: 60, share: 0.5 },
    { name: 'Ошибка, заявку не оставляли', count: 3, share: 0.5 },
    { name: 'Уже были на пробном / члены клуба', count: 3, share: 0.5 },
  ] satisfies BreakdownRow[],
  noShowReasonBreakdown: [
    { name: 'Не дошел до пробного', count: 70, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Пропала потребность / не выходит на связь', count: 80, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Свяжутся сами', count: 3, share: 0.5 },
    { name: 'Дубль, уже есть сделка', count: 3, share: 0.5 },
    { name: 'Глухой недозвон', count: 3, share: 0.5 },
    { name: 'Хронически не доходят до пробного', count: 3, share: 0.5 },
    { name: 'Медицинские противопоказания', count: 3, share: 0.5 },
  ] satisfies BreakdownRow[],
  refusalReasonBreakdown: [
    { name: 'Потеряли интерес / передумали', count: 90, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Не подходит расписание', count: 100, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Цена / семейный бюджет', count: 110, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Выбрали другой кружок', count: 120, share: 0.5 },
    { name: 'После пробного не вернулись', count: 3, share: 0.5 },
    { name: 'Логистика / дорога', count: 3, share: 0.5 },
  ] satisfies BreakdownRow[],
  funnelBreakdown: [
    { name: 'Закрыто и не реализовано', count: 130, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Посетил пробное занятие', count: 140, share: 0.5, note: 'Демонстрационные данные' },
    { name: 'Согласован перезвон', count: 3, share: 0.5 },
  ] satisfies BreakdownRow[],
  economics: {
    stats: [
      { label: 'Расход Direct', value: '50 50 ₽', helper: 'Демонстрационные данные', color: 'secondary' },
      { label: 'Клики', value: '50 50', helper: 'Демонстрационные данные', color: 'info' },
      { label: 'Показы', value: '50 50', helper: 'Демонстрационные данные', color: 'primary' },
      { label: 'CPM', value: '50 ₽', helper: 'Демонстрационные данные', color: 'warning' },
      { label: 'CPC', value: '50 ₽', helper: 'Демонстрационные данные', color: 'warning' },
      { label: 'CPL окна', value: '50 ₽', helper: 'Демонстрационные данные', color: 'primary' },
      { label: 'CPVL окна', value: '50 ₽', helper: 'Демонстрационные данные', color: 'success' },
      { label: 'CPRT proxy', value: '50 50 ₽', helper: 'Демонстрационные данные', color: 'error' },
    ] satisfies EconomicsStat[],
    notes: [
      'Direct слой за февраль закрыт фактом: 50 кампании, полное окно до 50-50-50.',
      'CPL / CPVL / CPRT на этом экране пока считать только как center-level proxy, а не как строгую атрибуцию до кампании.',
      'Платежный слой по февралю не подключен, поэтому payment proxy здесь сознательно не выводится как business outcome.',
    ],
  },
  marketingSignalCards: [
    {
      icon: 'tabler-percentage',
      color: 'info',
      title: 'Direct CTR',
      value: '50%',
      helper: 'Демонстрационные данные',
      badge: 'факт',
      truthGrade: 'fact',
    },
    {
      icon: 'tabler-chart-arrows-vertical',
      color: 'primary',
      title: 'Direct CR в лид',
      value: '50%',
      helper: 'Демонстрационные данные',
      badge: 'частично',
      truthGrade: 'partial',
    },
    {
      icon: 'tabler-link-check',
      color: 'warning',
      title: 'Attribution match rate',
      value: '50%',
      helper: 'Демонстрационные данные',
      badge: 'частично',
      truthGrade: 'partial',
    },
    {
      icon: 'tabler-wallet',
      color: 'secondary',
      title: 'Бюджет других каналов',
      value: '50 50 ₽',
      helper: 'Демонстрационные данные',
      badge: 'демо',
      truthGrade: 'demo',
    },
    {
      icon: 'tabler-cash',
      color: 'success',
      title: 'Revenue proxy',
      value: '50 50 ₽',
      helper: 'Демонстрационные данные',
      badge: 'прокси',
      truthGrade: 'proxy',
    },
    {
      icon: 'tabler-target-arrow',
      color: 'error',
      title: 'CAC proxy',
      value: '50 50 ₽',
      helper: 'Демонстрационные данные',
      badge: 'прокси',
      truthGrade: 'proxy',
    },
  ] satisfies MetricSignalCard[],
  creativeSignals: [
    {
      icon: 'tabler-bolt',
      color: 'primary',
      title: 'Мама и энергия',
      subtitle: 'status: winner · 50 лидов · 50 дошли',
      helper: 'Демонстрационные данные',
      progress: 150,
      truthGrade: 'partial',
    },
    {
      icon: 'tabler-school',
      color: 'success',
      title: 'Подготовка к школе',
      subtitle: 'status: scaling · 50 лидов · 50 дошли',
      helper: 'Демонстрационные данные',
      progress: 160,
      truthGrade: 'partial',
    },
    {
      icon: 'tabler-calendar-time',
      color: 'warning',
      title: 'Гибкое расписание',
      subtitle: 'status: test · 50 лидов · 50 дошли',
      helper: 'Демонстрационные данные',
      progress: 50,
      truthGrade: 'demo',
    },
    {
      icon: 'tabler-mood-sad',
      color: 'error',
      title: 'Безопасный no-show reminder',
      subtitle: 'status: risk · 50 лидов · 50 дошел',
      helper: 'Демонстрационные данные',
      progress: 60,
      truthGrade: 'demo',
    },
  ] satisfies ProgressSignal[],
  campaignTimeline: [
    {
      title: 'Запущен paid baseline февраля',
      meta: '2026-02-03',
      detail: 'Демонстрационные данные',
      action: 'Держать этот слой как финансовый anchor до полного attribution bridge.',
      tone: 'success',
      truthGrade: 'fact',
    },
    {
      title: 'Первая чистка слабого креатива',
      meta: '2026-02-11',
      detail: 'Демонстрационные данные',
      action: 'Снять проигравший креатив и перенести бюджет в победителя.',
      tone: 'warning',
      truthGrade: 'partial',
    },
    {
      title: 'Zoom alert по промо и no-show',
      meta: '2026-02-18',
      detail: 'Демонстрационные данные',
      action: 'Поднять Zoom-разбор: точка, скрипт, reminder cadence и повторная проработка.',
      tone: 'error',
      truthGrade: 'fact',
    },
    {
      title: 'Пересобран call-center reminder flow',
      meta: '2026-02-24',
      detail: 'Демонстрационные данные',
      action: 'Дальше нужен event-layer, иначе улучшение не подтвердить цифрами.',
      tone: 'info',
      truthGrade: 'demo',
    },
    {
      title: 'Очистка атрибуции поставлена в работу',
      meta: '2026-06-25',
      detail: 'Демонстрационные данные',
      action: 'Приоритет: пустой utm_source, numeric campaign mapping, strict match rate.',
      tone: 'warning',
      truthGrade: 'partial',
    },
  ] satisfies TimelineEvent[],
  truthLayers: [
    {
      title: 'CRM cohort слой',
      grade: 'fact',
      owner: 'amoCRM yearly export',
      summary: 'Демонстрационные данные',
      note: 'Демонстрационные данные',
    },
    {
      title: 'Historical YoY CRM слой',
      grade: 'fact',
      owner: '50 + 50 CRM exports',
      summary: 'Демонстрационные данные',
      note: 'Демонстрационные данные',
    },
    {
      title: 'Слой расхода Direct',
      grade: 'fact',
      owner: 'Yandex Direct DB',
      summary: 'Демонстрационные данные',
      note: 'Демонстрационные данные',
    },
    {
      title: 'Attribution bridge слой',
      grade: 'partial',
      owner: 'CRM + marketing join',
      summary: 'Демонстрационные данные',
      note: 'Демонстрационные данные',
    },
    {
      title: 'Слой unit economics',
      grade: 'proxy',
      owner: 'center-level join',
      summary: 'Демонстрационные данные',
      note: 'Демонстрационные данные',
    },
    {
      title: 'План / pacing слой',
      grade: 'manual_fact',
      owner: 'ручной owner target',
      summary: 'Демонстрационные данные',
      note: 'Демонстрационные данные',
    },
    {
      title: 'Event-слой контакт-центра',
      grade: 'partial',
      owner: 'event layer pending',
      summary: 'Демонстрационные данные',
      note: 'Демонстрационные данные',
    },
  ] satisfies TruthLayer[],
  freshnessLayers: [
    {
      source: 'Демонстрационные данные',
      updatedAt: 'build 50-50-50',
      status: 'fresh',
      note: 'Демонстрационные данные',
    },
    {
      source: 'Демонстрационные данные',
      updatedAt: '2026-02-28 fact window',
      status: 'fresh',
      note: 'Демонстрационные данные',
    },
    {
      source: 'Демонстрационные данные',
      updatedAt: 'export 50-50-50',
      status: 'partial',
      note: 'Демонстрационные данные',
    },
    {
      source: 'Демонстрационные данные',
      updatedAt: 'owner input 50-50-50',
      status: 'manual',
      note: 'Демонстрационные данные',
    },
    {
      source: 'Демонстрационные данные',
      updatedAt: 'build 50-50-50',
      status: 'partial',
      note: 'Демонстрационные данные',
    },
    {
      source: 'Демонстрационные данные',
      updatedAt: 'not connected',
      status: 'missing',
      note: 'Демонстрационные данные',
    },
  ] satisfies FreshnessItem[],
  pendingLayers: [
    {
      title: 'Strict plan / fact слой',
      blocker: 'Февральский план на этом экране пока только seed, а не board or sheet fact.',
      nextStep: 'Подтянуть monthly board source или historical Google Sheet export по конкретному центру.',
      metrics: ['План лидов', 'Выполнение плана', 'Forecast', 'Owner KPI'],
    },
    {
      title: 'Истина по site analytics',
      blocker: 'Visits / conversion / engagement не имеют подключенного первичного источника.',
      nextStep: 'Подключить Метрику / GA export по посадочным и событиям.',
      metrics: ['Site visits', 'Site conversion to lead', 'Bounce / engagement'],
    },
    {
      title: 'Промо-экономика strict',
      blocker: 'Нет факта по payroll / shifts / точкам промоутеров, поэтому budget layer только seeded.',
      nextStep: 'Подтянуть source sheet по точкам, сменам и расходу.',
      metrics: ['Promo budget', 'Promo CPL', 'Promo CPRT'],
    },
    {
      title: 'Истина по событиям контакт-центра',
      blocker: 'В amoCRM export нет готового event layer по касаниям и скорости реакции.',
      nextStep: 'Добавить first_contact_at, event history и operator mapping.',
      metrics: ['Contact rate', 'First response time', 'Calls per day', 'Messages per day', 'Touches per lead'],
    },
    {
      title: 'Истина по capacity',
      blocker: 'Нет расписания слотов и загрузки тренеров, поэтому capacity block сейчас seed.',
      nextStep: 'Подключить slot capacity layer по датам, тренерам и доступным окнам.',
      metrics: ['Trial slots capacity', 'Slot fill rate', 'Capacity flag'],
    },
    {
      title: 'Strict attribution bridge',
      blocker: 'Часть paid лидов все еще живет без связки utm_source / campaign_id / creative.',
      nextStep: 'Досопоставить paid leads и поднять match rate до управляемого слоя.',
      metrics: ['Attribution match rate', 'Direct CR в лид', 'Creative-to-trial signal', 'Campaign economics'],
    },
    {
      title: 'Выручка после пробного',
      blocker: 'На экране revenue и CAC пока только proxy без платежного слоя по февральской когорте.',
      nextStep: 'Подтянуть договоры / оплаты после пробного и связать с окном привлечения.',
      metrics: ['Revenue proxy', 'CAC proxy', 'Sale conversion'],
    },
  ] satisfies PendingLayer[],
  alerts: [
    {
      title: 'Пустой UTM source все еще доминирует',
      detail: 'Демонстрационные данные',
      action: 'Сначала чинить CRM sync и enrichment полей, а уже потом спорить о CPL по каналам.',
      tone: 'warning',
      truthGrade: 'fact',
    },
    {
      title: 'Промо дает объем, но не доводит до пробного',
      detail: 'Демонстрационные данные',
      action: 'Разнести field execution, cost по точкам и повторную обработку no-show.',
      tone: 'error',
      truthGrade: 'fact',
    },
    {
      title: 'No-show уже съедает вместимость',
      detail: 'Демонстрационные данные',
      action: 'Добавить reminder cadence, confirm flow и отдельный разбор причин перед занятием.',
      tone: 'warning',
      truthGrade: 'fact',
    },
    {
      title: 'Нужен Zoom-разбор по промо и no-show',
      detail: 'Демонстрационные данные',
      action: 'Провести Zoom-сессию: поле, скрипт, подтверждение пробного и повторная проработка.',
      tone: 'error',
      truthGrade: 'fact',
    },
    {
      title: 'Плановый слой виден, но пока seed',
      detail: 'Демонстрационные данные',
      action: 'До owner reporting обязательно заменить на board / sheet source.',
      tone: 'info',
      truthGrade: 'manual_fact',
    },
    {
      title: 'Direct fact по февралю уже надежен',
      detail: 'Демонстрационные данные',
      action: 'Использовать этот слой как anchor, пока attribution bridge еще очищается.',
      tone: 'success',
      truthGrade: 'fact',
    },
  ] satisfies AlertItem[],
  actionTracks: [
    '50 лидов здесь важны только вместе со 50 дошедшими до пробного.',
    '50 лидов без _ym_uid — главный разрыв attribution bridge прямо сейчас.',
    'Промо слишком велико, чтобы жить без отдельного cost и execution layer.',
  ],
  sourcePaths: [
    {
      label: 'Metrics catalog',
      path: 'demo://sample-data',
      truthGrade: 'fact',
    },
    {
      label: 'CRM / Direct builder',
      path: 'demo://sample-data',
      truthGrade: 'fact',
    },
    {
      label: 'Current v50 dashboard dataset',
      path: 'demo://sample-data',
      truthGrade: 'fact',
    },
    {
      label: 'Historical CRM 50 export',
      path: 'demo://sample-data',
      truthGrade: 'fact',
    },
    {
      label: 'Plan seed in dashboard code',
      path: 'repository://src/data/dashboard.ts',
      truthGrade: 'manual_fact',
    },
  ] satisfies SourcePathItem[],
} as const

export const dashboardSnapshot = {
  headline: {
    title: `${centerDashboard.meta.brand} · ${centerDashboard.meta.center}`,
    subtitle: 'Служебный snapshot для blueprint-страницы и docs-контекста.',
  },
  kpis: [...centerDashboard.primaryKpis, ...centerDashboard.secondaryKpis],
  timeline: [
    { month: 'W1', revenue: 70, leads: 80 },
    { month: 'W2', revenue: 90, leads: 100 },
    { month: 'W3', revenue: 110, leads: 120 },
    { month: 'W4', revenue: 130, leads: 140 },
  ] satisfies DashboardTimelinePoint[],
  funnel: [
    {
      stage: 'Лиды',
      volume: 150,
      conversion: 160,
      note: 'Демонстрационные данные',
      color: 'primary',
    },
    {
      stage: 'Валидные',
      volume: 50,
      conversion: 60,
      note: 'Демонстрационные данные',
      color: 'success',
    },
    {
      stage: 'Записаны',
      volume: 70,
      conversion: 80,
      note: 'Демонстрационные данные',
      color: 'warning',
    },
    {
      stage: 'Дошли',
      volume: 90,
      conversion: 100,
      note: 'Демонстрационные данные',
      color: 'info',
    },
  ] satisfies DashboardFunnelStage[],
  workstreams: [
    {
      name: 'Strict plan / fact join',
      owner: 'Ops',
      status: 'in-progress',
      impact: 'Переводит верхний plan block из ручного ориентира в подтвержденный monthly fact',
      nextStep: 'Подключить board seed или sheet export по февралю',
    },
    {
      name: 'Call center event layer',
      owner: 'CRM',
      status: 'blocked',
      impact: 'Нужен для contact rate, SLA и отделения плохого трафика от плохой обработки',
      nextStep: 'Добавить first_contact_at и event history по лидам',
    },
    {
      name: 'Attribution cleanup',
      owner: 'Marketing',
      status: 'ready',
      impact: 'Сужает разрыв между Direct fact и cohort economics и поднимает match rate',
      nextStep: 'Разобрать пустые utm source и сопоставить numeric campaigns',
    },
  ] satisfies DashboardWorkstream[],
  sources: [
    {
      name: 'amoCRM cohort export',
      status: 'connected',
      freshness: '50-50 cohort ready',
      owner: 'CRM',
      nextStep: 'Держать статусы, валидность и trial fields в одном контракте',
    },
    {
      name: 'Yandex Direct facts',
      status: 'connected',
      freshness: '50-50 full fact window',
      owner: 'Marketing',
      nextStep: 'Свести campaign spend с strict reached-trial attribution',
    },
    {
      name: 'Plan board source',
      status: 'planned',
      freshness: 'not connected',
      owner: 'Ops',
      nextStep: 'Заменить dashboard seed на owner sheet / board export',
    },
    {
      name: 'Call center events',
      status: 'partial',
      freshness: 'частично, без event layer',
      owner: 'Call center',
      nextStep: 'Собрать first response, messages и touches per lead',
    },
    {
      name: 'Attribution bridge',
      status: 'partial',
      freshness: 'campaign layer visible, strict join not done',
      owner: 'Marketing',
      nextStep: 'Поднять strict match rate и creative signal до управляемого состояния',
    },
  ] satisfies DashboardSource[],
} as const

export const dashboardBlueprint = {
  coreQuestions: [
    'Как выглядит один center screen, когда на нем уже видны и визуал, и truth-grade, и управленческие next moves?',
    'Какие метрики уже можно читать как факт, какие как ручной ориентир, а какие пока остаются proxy или demo?',
    'Какие joins и источники должны превратить этот экран из editing wall в owner-grade operational dashboard?',
  ],
  widgetLanes: [
    {
      title: 'Pulse hero lane',
      description: 'Большой первый блок с планом месяца, reached trial, attribution gap и управленческим фокусом.',
      originalSource: 'Демонстрационные данные',
    },
    {
      title: 'Performance lane',
      description: 'KPI strip и дневной cohort rhythm показывают ритм, качество и экономику без дробления по страницам.',
      originalSource: 'Демонстрационные данные',
    },
    {
      title: 'Diagnostics lane',
      description: 'Каналы, причины потерь, no-show, contact center и capacity собраны как operational widgets.',
      originalSource: 'Демонстрационные данные',
    },
    {
      title: 'Truth lane',
      description: 'Показывает, где метрика уже опорная, где она ручная, а где экран пока живет на proxy или backlog.',
      originalSource: 'Демонстрационные данные',
    },
  ],
  metricDefinitions: [
    {
      metric: 'Лиды',
      definition: 'Количество лидов, созданных в периоде 50-50 февраля 50 для центра Ново-Переделкино.',
      source: 'Демонстрационные данные',
      cadence: 'batch refresh',
    },
    {
      metric: 'Дошли до пробного',
      definition: 'Лиды когорты февраля, у которых есть факт посещения пробного или финальный trial status.',
      source: 'Демонстрационные данные',
      cadence: 'batch refresh',
    },
    {
      metric: 'Plan completion',
      definition: 'Пока ручной ориентир: 50 факт лидов против target 50 до подключения board source.',
      source: 'Демонстрационные данные',
      cadence: 'manual',
    },
    {
      metric: 'Cost / reached trial',
      definition: 'Пока proxy: direct spend центра за февраль / reached trial по той же февральской когорте.',
      source: 'Демонстрационные данные',
      cadence: 'batch refresh',
    },
    {
      metric: 'Attribution match rate',
      definition: 'Доля paid leads окна, где источник и campaign surface уже позволяют строить строгую связку spend -> lead.',
      source: 'Демонстрационные данные',
      cadence: 'batch refresh',
    },
    {
      metric: 'Revenue proxy',
      definition: 'Промежуточная оценка выручки после пробного по февральской когорте до подключения платежного слоя.',
      source: 'Демонстрационные данные',
      cadence: 'manual',
    },
    {
      metric: 'CAC proxy',
      definition: 'Пока proxy: общий spend по digital + other channels / пробные договоры февраля.',
      source: 'Демонстрационные данные',
      cadence: 'manual',
    },
  ] satisfies MetricDefinition[],
} as const
