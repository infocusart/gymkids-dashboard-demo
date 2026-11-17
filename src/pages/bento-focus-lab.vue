<script setup lang="ts">
import { Flip } from 'gsap/Flip'
import { gsap } from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import gymkidsWhiteLogoUrl from '@images/gymkids/white-logo.png'
import { useGymkidsDashboard } from '@/composables/useGymkidsDashboard'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

gsap.registerPlugin(Flip)

const cardIds = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

type CardId = typeof cardIds[number]
type LayoutKey = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type FocusPhase = 'overview' | 'animating' | 'focused'
type FocusRole = 'primary' | 'related' | 'ambient' | 'anchor'

interface CardRect {
  x: number
  y: number
  w: number
  h: number
}

interface LayoutSlot {
  owner: CardId
  rect: CardRect
}

interface MetricRow {
  label: string
  value: string
}

interface DashboardCard {
  id: CardId
  eyebrow: string
  title: string
  value: string
  unit: string
  note: string
  progress: number
  rows: MetricRow[]
  tone: 'ink' | 'paper' | 'mint' | 'lime'
}

const GRID_COLUMNS = 12
const GRID_ROWS = 8
const staticCardIds: CardId[] = [1, 5]

const initialRects: Record<CardId, CardRect> = {
  1: { x: 0, y: 0, w: 3, h: 4 },
  2: { x: 3, y: 0, w: 4, h: 2 },
  3: { x: 7, y: 0, w: 2, h: 2 },
  4: { x: 9, y: 0, w: 3, h: 6 },
  5: { x: 3, y: 2, w: 6, h: 4 },
  6: { x: 0, y: 4, w: 3, h: 2 },
  7: { x: 0, y: 6, w: 3, h: 2 },
  8: { x: 3, y: 6, w: 3, h: 2 },
  9: { x: 6, y: 6, w: 6, h: 2 },
}

const sourcesFocusRects: Record<CardId, CardRect> = {
  1: { x: 6, y: 4, w: 4, h: 2 },
  2: { x: 0, y: 0, w: 6, h: 6 },
  3: { x: 10, y: 4, w: 2, h: 2 },
  4: { x: 9, y: 2, w: 3, h: 2 },
  5: { x: 6, y: 0, w: 6, h: 2 },
  6: { x: 6, y: 2, w: 3, h: 2 },
  7: { x: 0, y: 6, w: 3, h: 2 },
  8: { x: 3, y: 6, w: 3, h: 2 },
  9: { x: 6, y: 6, w: 6, h: 2 },
}

const siteFocusRects: Record<CardId, CardRect> = {
  1: { x: 0, y: 0, w: 3, h: 2 },
  2: { x: 6, y: 0, w: 4, h: 2 },
  3: { x: 10, y: 0, w: 2, h: 2 },
  4: { x: 6, y: 2, w: 6, h: 2 },
  5: { x: 3, y: 0, w: 3, h: 2 },
  6: { x: 0, y: 2, w: 6, h: 6 },
  7: { x: 10, y: 4, w: 2, h: 2 },
  8: { x: 6, y: 4, w: 4, h: 2 },
  9: { x: 6, y: 6, w: 6, h: 2 },
}

const bookingFocusRects: Record<CardId, CardRect> = {
  1: { x: 0, y: 0, w: 3, h: 4 },
  2: { x: 3, y: 4, w: 3, h: 2 },
  3: { x: 6, y: 0, w: 4, h: 4 },
  4: { x: 6, y: 4, w: 6, h: 4 },
  5: { x: 3, y: 0, w: 3, h: 4 },
  6: { x: 0, y: 4, w: 3, h: 2 },
  7: { x: 0, y: 6, w: 3, h: 2 },
  8: { x: 3, y: 6, w: 3, h: 2 },
  9: { x: 10, y: 0, w: 2, h: 4 },
}

const validityFocusRects: Record<CardId, CardRect> = {
  1: { x: 0, y: 0, w: 3, h: 2 },
  2: { x: 0, y: 2, w: 4, h: 2 },
  3: { x: 4, y: 2, w: 2, h: 2 },
  4: { x: 6, y: 0, w: 6, h: 8 },
  5: { x: 3, y: 0, w: 3, h: 2 },
  6: { x: 0, y: 4, w: 3, h: 2 },
  7: { x: 3, y: 4, w: 3, h: 2 },
  8: { x: 0, y: 6, w: 3, h: 2 },
  9: { x: 3, y: 6, w: 3, h: 2 },
}

const pathFocusRects: Record<CardId, CardRect> = {
  1: { x: 0, y: 0, w: 3, h: 4 },
  2: { x: 3, y: 0, w: 3, h: 4 },
  3: { x: 10, y: 0, w: 2, h: 2 },
  4: { x: 6, y: 0, w: 4, h: 2 },
  5: { x: 3, y: 4, w: 3, h: 2 },
  6: { x: 0, y: 4, w: 3, h: 2 },
  7: { x: 0, y: 6, w: 3, h: 2 },
  8: { x: 3, y: 6, w: 3, h: 2 },
  9: { x: 6, y: 2, w: 6, h: 6 },
}

const layoutTemplates: Record<LayoutKey, LayoutSlot[]> = {
  'top-left': [
    { owner: 1, rect: { x: 0, y: 0, w: 6, h: 4 } },
    { owner: 5, rect: { x: 6, y: 0, w: 6, h: 4 } },
    { owner: 6, rect: { x: 0, y: 4, w: 3, h: 2 } },
    { owner: 4, rect: { x: 3, y: 4, w: 3, h: 2 } },
    { owner: 7, rect: { x: 0, y: 6, w: 3, h: 2 } },
    { owner: 8, rect: { x: 3, y: 6, w: 3, h: 2 } },
    { owner: 2, rect: { x: 6, y: 4, w: 4, h: 2 } },
    { owner: 3, rect: { x: 10, y: 4, w: 2, h: 2 } },
    { owner: 9, rect: { x: 6, y: 6, w: 6, h: 2 } },
  ],
  'top-right': [
    { owner: 3, rect: { x: 6, y: 0, w: 6, h: 4 } },
    { owner: 1, rect: { x: 0, y: 0, w: 3, h: 4 } },
    { owner: 5, rect: { x: 3, y: 0, w: 3, h: 4 } },
    { owner: 6, rect: { x: 0, y: 4, w: 3, h: 2 } },
    { owner: 2, rect: { x: 3, y: 4, w: 3, h: 2 } },
    { owner: 7, rect: { x: 0, y: 6, w: 3, h: 2 } },
    { owner: 8, rect: { x: 3, y: 6, w: 3, h: 2 } },
    { owner: 4, rect: { x: 6, y: 4, w: 4, h: 4 } },
    { owner: 9, rect: { x: 10, y: 4, w: 2, h: 4 } },
  ],
  'bottom-left': [
    { owner: 6, rect: { x: 0, y: 4, w: 6, h: 4 } },
    { owner: 1, rect: { x: 0, y: 0, w: 3, h: 4 } },
    { owner: 5, rect: { x: 3, y: 0, w: 3, h: 4 } },
    { owner: 2, rect: { x: 6, y: 0, w: 4, h: 2 } },
    { owner: 3, rect: { x: 10, y: 0, w: 2, h: 2 } },
    { owner: 4, rect: { x: 6, y: 2, w: 6, h: 2 } },
    { owner: 8, rect: { x: 6, y: 4, w: 4, h: 2 } },
    { owner: 7, rect: { x: 10, y: 4, w: 2, h: 2 } },
    { owner: 9, rect: { x: 6, y: 6, w: 6, h: 2 } },
  ],
  'bottom-right': [
    { owner: 5, rect: { x: 6, y: 4, w: 6, h: 4 } },
    { owner: 1, rect: { x: 0, y: 0, w: 3, h: 4 } },
    { owner: 2, rect: { x: 3, y: 0, w: 3, h: 4 } },
    { owner: 4, rect: { x: 6, y: 0, w: 4, h: 4 } },
    { owner: 3, rect: { x: 10, y: 0, w: 2, h: 4 } },
    { owner: 6, rect: { x: 0, y: 4, w: 3, h: 2 } },
    { owner: 9, rect: { x: 3, y: 4, w: 3, h: 2 } },
    { owner: 7, rect: { x: 0, y: 6, w: 3, h: 2 } },
    { owner: 8, rect: { x: 3, y: 6, w: 3, h: 2 } },
  ],
}

const layoutOwners: Record<LayoutKey, CardId> = {
  'top-left': 1,
  'top-right': 3,
  'bottom-left': 6,
  'bottom-right': 5,
}

const relatedCards: Record<CardId, CardId[]> = {
  1: [],
  2: [1, 6, 7, 9],
  3: [1, 4, 8, 9],
  4: [1, 3, 8, 9],
  5: [],
  6: [1, 2, 4, 9],
  7: [1, 2, 4, 9],
  8: [3, 4, 5, 9],
  9: [1, 3, 4, 8],
}

const route = useRoute()
const board = ref<HTMLElement | null>(null)
const placements = ref(cloneLayout(initialRects))
const phase = ref<FocusPhase>('overview')
const selectedId = ref<CardId | null>(null)
const prefersReducedMotion = ref(false)

const {
  state: loadState,
  error: loadError,
  dashboard,
  selectedCenterId,
  selectedPeriod,
  selectedDate,
  centers,
  periods,
  initialize,
  selectCenter,
  selectPeriod,
  selectDate,
  retry,
} = useGymkidsDashboard()

let activeAnimation: gsap.core.Timeline | null = null
let finishActiveAnimation: (() => void) | null = null
let motionQuery: MediaQueryList | null = null
let runEpoch = 0

function cloneLayout(layout: Record<CardId, CardRect>) {
  return Object.fromEntries(cardIds.map(id => [id, { ...layout[id] }])) as Record<CardId, CardRect>
}

const queryValue = (value: unknown) => Array.isArray(value) ? value[0] : typeof value === 'string' ? value : null
const formatNumber = (value: number) => value.toLocaleString('ru-RU')
const rate = (value: number, total: number) => total ? Math.round((value / total) * 1000) / 10 : 0
const rateLabel = (value: number, total: number) => `${String(rate(value, total)).replace('.', ',')}%`
const clampProgress = (value: number) => Math.max(0, Math.min(100, value))

const cards = computed<DashboardCard[]>(() => {
  const data = dashboard.value

  if (!data)
    return []

  const topSources = data.sources.slice(0, 4)
  const leadToScheduled = rate(data.cohort.scheduled, data.leads.fact)
  const reachedFromLeads = rate(data.cohort.reached, data.leads.fact)

  return [
    {
      id: 1,
      eyebrow: 'План / факт',
      title: 'Лиды',
      value: data.leads.factLabel,
      unit: `из ${data.leads.planLabel}`,
      note: `${data.meta.dayLabel} · срез ${data.meta.availableThroughDate}`,
      progress: clampProgress(data.leads.progress),
      rows: [
        { label: 'В день сейчас', value: data.leads.dailyFactLabel },
        { label: 'Нужно в день', value: data.leads.dailyPlanLabel },
        { label: 'Среднее', value: data.leads.averageLabel },
      ],
      tone: 'ink',
    },
    {
      id: 2,
      eyebrow: 'Привлечение',
      title: 'Источники',
      value: topSources[0]?.label ?? '—',
      unit: topSources[0] ? `${topSources[0].factLabel} лидов` : 'нет данных',
      note: 'Каналы, которые формируют общий поток',
      progress: clampProgress(topSources[0]?.share ?? 0),
      rows: topSources.map(source => ({
        label: source.label,
        value: `${source.factLabel} · ${source.shareLabel}`,
      })),
      tone: 'paper',
    },
    {
      id: 3,
      eyebrow: 'Конверсия',
      title: 'Запись',
      value: rateLabel(data.cohort.scheduled, data.leads.fact),
      unit: 'лид → запись',
      note: 'Переход из входящего потока в пробное занятие',
      progress: clampProgress(leadToScheduled),
      rows: [
        { label: 'Лиды', value: data.leads.factLabel },
        { label: 'Записаны', value: formatNumber(data.cohort.scheduled) },
        { label: 'Дошли', value: formatNumber(data.cohort.reached) },
      ],
      tone: 'mint',
    },
    {
      id: 4,
      eyebrow: 'Качество',
      title: 'Валидность',
      value: data.quality.validRateLabel,
      unit: 'валидных лидов',
      note: 'Показывает, насколько входящий поток пригоден для работы',
      progress: clampProgress(data.quality.validRate),
      rows: [
        { label: 'Валидные', value: formatNumber(data.quality.valid) },
        { label: 'Невалидные', value: formatNumber(data.quality.invalid) },
        { label: 'В работе', value: formatNumber(data.quality.inWork) },
        { label: 'Записаны', value: formatNumber(data.quality.scheduled) },
      ],
      tone: 'paper',
    },
    {
      id: 5,
      eyebrow: 'Темп месяца',
      title: 'Прогноз',
      value: data.leads.forecastLabel,
      unit: `лидов к концу · ${data.leads.forecastRateLabel} плана`,
      note: `План ${data.leads.planLabel} · текущий факт ${data.leads.factLabel}`,
      progress: clampProgress(data.leads.forecastRate),
      rows: [
        { label: 'Текущий факт', value: data.leads.factLabel },
        { label: 'Прогноз', value: data.leads.forecastLabel },
        { label: 'План', value: data.leads.planLabel },
      ],
      tone: 'ink',
    },
    {
      id: 6,
      eyebrow: 'Источник',
      title: 'Сайт',
      value: data.website.factLabel,
      unit: `лидов · ${data.website.shareLabel}`,
      note: 'Качество и движение заявок с сайта',
      progress: clampProgress(data.website.validRate),
      rows: [
        { label: 'Валидные', value: formatNumber(data.website.valid) },
        { label: 'Записаны', value: formatNumber(data.website.scheduled) },
        { label: 'Дошли', value: formatNumber(data.website.reached) },
      ],
      tone: 'paper',
    },
    {
      id: 7,
      eyebrow: 'Источник',
      title: 'Промо',
      value: data.promo.factLabel,
      unit: `лидов · ${data.promo.shareLabel}`,
      note: 'Локальный поток от промо-команды',
      progress: clampProgress(data.promo.validRate),
      rows: [
        { label: 'Валидные', value: formatNumber(data.promo.valid) },
        { label: 'Записаны', value: formatNumber(data.promo.scheduled) },
        { label: 'Дошли', value: formatNumber(data.promo.reached) },
      ],
      tone: 'paper',
    },
    {
      id: 8,
      eyebrow: 'Пробные',
      title: 'Доходимость',
      value: data.trial.attendanceRateLabel,
      unit: 'пришли на занятие',
      note: 'Связь записи, подтверждения и фактического визита',
      progress: clampProgress(data.trial.attendanceRate),
      rows: [
        { label: 'Записаны', value: formatNumber(data.trial.scheduled) },
        { label: 'Дошли', value: formatNumber(data.trial.reached) },
        { label: 'Без подтверждения', value: formatNumber(data.trial.noConfirmation) },
      ],
      tone: 'paper',
    },
    {
      id: 9,
      eyebrow: 'Сквозной путь',
      title: 'Лид → занятие',
      value: `${String(reachedFromLeads).replace('.', ',')}%`,
      unit: 'от лида до визита',
      note: 'Главная цепочка результата центра',
      progress: clampProgress(reachedFromLeads),
      rows: [
        { label: 'Лиды', value: data.leads.factLabel },
        { label: 'Валидные', value: formatNumber(data.quality.valid) },
        { label: 'Записаны', value: formatNumber(data.cohort.scheduled) },
        { label: 'Дошли', value: formatNumber(data.cohort.reached) },
      ],
      tone: 'lime',
    },
  ]
})

const siteFocus = computed(() => {
  const data = dashboard.value

  if (!data)
    return null

  const site = data.website
  const scaleMax = Math.max(site.plan, site.forecast, site.fact, 1)

  const stages = [
    { label: 'Лиды', value: site.fact, rate: 100 },
    { label: 'Валидные', value: site.valid, rate: site.validRate },
    { label: 'Записаны', value: site.scheduled, rate: site.scheduledRate },
    { label: 'Дошли', value: site.reached, rate: site.reachedRate },
  ].map(stage => ({
    ...stage,
    valueLabel: formatNumber(stage.value),
    rateLabel: `${String(Math.round(stage.rate * 10) / 10).replace('.', ',')}%`,
  }))

  const losses = [
    { label: 'на этапе валидности', value: Math.max(0, site.fact - site.valid) },
    { label: 'между валидностью и записью', value: Math.max(0, site.valid - site.scheduled) },
    { label: 'между записью и визитом', value: Math.max(0, site.scheduled - site.reached) },
  ]

  const largestLoss = losses.reduce((largest, item) => item.value > largest.value ? item : largest, losses[0])
  const forecastAbovePlan = site.plan > 0 && site.forecast >= site.plan

  return {
    factLabel: site.factLabel,
    shareLabel: site.shareLabel,
    planLabel: site.plan > 0 ? formatNumber(site.plan) : '—',
    forecastLabel: site.forecastLabel,
    forecastRateLabel: site.forecastRateLabel,
    deltaLabel: site.deltaLabel,
    cplLabel: site.cplLabel,
    cplBasis: site.cplBasis,
    factPosition: clampProgress(rate(site.fact, scaleMax)),
    planPosition: clampProgress(rate(site.plan, scaleMax)),
    forecastPosition: clampProgress(rate(site.forecast, scaleMax)),
    scaleMaxLabel: formatNumber(scaleMax),
    stages,
    largestLossLabel: `−${formatNumber(largestLoss.value)} ${largestLoss.label}`,
    reachedRateLabel: rateLabel(site.reached, site.fact),
    paceSummary: forecastAbovePlan
      ? `При текущем темпе сайт завершит месяц выше плана — ${site.forecastRateLabel}.`
      : `Прогноз по сайту ниже плана — ${site.forecastRateLabel}.`,
    cplSummary: site.cpl === null
      ? 'CPL пока не рассчитан — ждём связку расхода Direct с лидами CRM.'
      : `CPL рассчитан как ${site.cplBasis}.`,
    periodLabel: `${data.meta.periodLabel} · ${data.meta.dayLabel}`,
  }
})

const isBusy = computed(() => phase.value === 'animating')

const emptyCells = computed(() => GRID_COLUMNS * GRID_ROWS - cardIds.reduce((sum, id) => {
  const rect = placements.value[id]

  return sum + rect.w * rect.h
}, 0))

const focusTitle = computed(() => cards.value.find(card => card.id === selectedId.value)?.title ?? '')

const interactionLabel = computed(() => selectedId.value
  ? `${focusTitle.value} — в фокусе · связанные показатели подсвечены`
  : 'Нажмите на карточку, чтобы перестроить взгляд')

const layoutKeyFor = (id: CardId): LayoutKey => {
  if (id === 1 || id === 2)
    return 'top-left'

  if (id === 3 || id === 4)
    return 'top-right'

  if (id === 6 || id === 7 || id === 8)
    return 'bottom-left'

  return 'bottom-right'
}

const expandedLayoutFor = (selected: CardId) => {
  if (selected === 2)
    return cloneLayout(sourcesFocusRects)

  if (selected === 3)
    return cloneLayout(bookingFocusRects)

  if (selected === 4)
    return cloneLayout(validityFocusRects)

  if (selected === 6)
    return cloneLayout(siteFocusRects)

  if (selected === 9)
    return cloneLayout(pathFocusRects)

  const key = layoutKeyFor(selected)
  const originalOwner = layoutOwners[key]
  const result = {} as Record<CardId, CardRect>

  layoutTemplates[key].forEach(slot => {
    const id = slot.owner === originalOwner
      ? selected
      : slot.owner === selected
        ? originalOwner
        : slot.owner

    result[id] = { ...slot.rect }
  })

  return result
}

const roleFor = (id: CardId): FocusRole => {
  if (selectedId.value === id)
    return 'primary'

  if (selectedId.value && relatedCards[selectedId.value].includes(id))
    return 'related'

  if (staticCardIds.includes(id))
    return 'anchor'

  return 'ambient'
}

const cardStyle = (id: CardId) => {
  const rect = placements.value[id]

  return {
    gridColumn: `${rect.x + 1} / span ${rect.w}`,
    gridRow: `${rect.y + 1} / span ${rect.h}`,
  }
}

const stopAnimation = () => {
  activeAnimation?.kill()
  activeAnimation = null
  finishActiveAnimation?.()
  finishActiveAnimation = null
}

const animateTo = async (target: Record<CardId, CardRect>) => {
  const epoch = ++runEpoch
  const elements = board.value?.querySelectorAll<HTMLElement>('.focus-card')

  if (!elements)
    return false

  stopAnimation()

  if (prefersReducedMotion.value || window.matchMedia('(max-width: 820px)').matches) {
    placements.value = cloneLayout(target)
    await nextTick()

    return epoch === runEpoch
  }

  const previousState = Flip.getState(elements)

  placements.value = cloneLayout(target)
  await nextTick()
  phase.value = 'animating'

  await new Promise<void>(resolve => {
    const finish = () => {
      if (finishActiveAnimation === finish)
        finishActiveAnimation = null

      activeAnimation = null
      resolve()
    }

    finishActiveAnimation = finish
    activeAnimation = Flip.from(previousState, {
      absolute: true,
      duration: 0.72,
      ease: 'power3.inOut',
      onComplete: finish,
      prune: true,
      scale: false,
      simple: true,
      stagger: 0.035,
    })
  })

  return epoch === runEpoch
}

const focusCard = async (id: CardId) => {
  if (staticCardIds.includes(id) || isBusy.value)
    return

  if (selectedId.value) {
    selectedId.value = null

    if (await animateTo(initialRects))
      phase.value = 'overview'

    return
  }

  selectedId.value = id

  if (await animateTo(expandedLayoutFor(id)))
    phase.value = 'focused'
}

const resetLayout = () => {
  runEpoch += 1
  stopAnimation()
  placements.value = cloneLayout(initialRects)
  selectedId.value = null
  phase.value = 'overview'
}

const handleCenterChange = async (event: Event) => {
  resetLayout()
  await selectCenter((event.target as HTMLSelectElement).value)
}

const handlePeriodChange = async (event: Event) => {
  resetLayout()
  await selectPeriod((event.target as HTMLSelectElement).value)
}

const handleDateChange = (event: Event) => {
  resetLayout()
  selectDate((event.target as HTMLInputElement).value)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape')
    resetLayout()
}

const handleMotionPreference = (event: MediaQueryListEvent) => {
  prefersReducedMotion.value = event.matches
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionPreference)
  window.addEventListener('keydown', handleKeydown)

  initialize({
    centerId: queryValue(route.query.center),
    period: queryValue(route.query.period),
    date: queryValue(route.query.date),
  })
})

onBeforeUnmount(() => {
  runEpoch += 1
  stopAnimation()
  motionQuery?.removeEventListener('change', handleMotionPreference)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <main class="focus-lab">
    <header class="focus-header">
      <a
        class="brand"
        href="/bento-preview"
        aria-label="Вернуться к текущему дашборду"
      >
        <img
          :src="gymkidsWhiteLogoUrl"
          alt="GYMKiDs"
        >
        <span>semantic grid / probe</span>
      </a>

      <div
        v-if="dashboard"
        class="snapshot"
      >
        <strong>{{ dashboard.meta.centerName }}</strong>
        <span>{{ dashboard.meta.periodLabel }} · данные по {{ dashboard.meta.selectedDate }}</span>
      </div>

      <div class="focus-controls">
        <select
          aria-label="Центр"
          :disabled="loadState === 'loading'"
          :value="selectedCenterId"
          @change="handleCenterChange"
        >
          <option
            v-for="center in centers"
            :key="center.center_id"
            :value="center.center_id"
          >
            {{ center.display_name }}
          </option>
        </select>

        <select
          aria-label="Период"
          :disabled="loadState === 'loading'"
          :value="selectedPeriod"
          @change="handlePeriodChange"
        >
          <option
            v-for="period in periods"
            :key="period.month"
            :value="period.month"
          >
            {{ period.month }}
          </option>
        </select>

        <input
          aria-label="Дата среза"
          type="date"
          :disabled="loadState === 'loading'"
          :max="dashboard?.meta.availableThroughDate"
          :value="selectedDate"
          @change="handleDateChange"
        >

        <button
          class="reset-control"
          type="button"
          :disabled="!selectedId || isBusy"
          @click="resetLayout"
        >
          Обзор
        </button>
      </div>
    </header>

    <section
      v-if="loadState === 'loading' && !dashboard"
      class="state-panel"
      aria-live="polite"
    >
      <span class="state-panel__pulse" />
      <strong>Подключаем текущий снимок</strong>
      <p>Карточки появятся в той же смысловой структуре, что и рабочий дашборд.</p>
    </section>

    <section
      v-else-if="loadState === 'error'"
      class="state-panel"
      role="alert"
    >
      <strong>Снимок не загрузился</strong>
      <p>{{ loadError }}</p>
      <button
        type="button"
        @click="retry"
      >
        Повторить
      </button>
    </section>

    <template v-else-if="dashboard">
      <div class="focus-caption">
        <div>
          <span>{{ selectedId ? 'Фокус собран' : 'Свободный обзор' }}</span>
          <strong aria-live="polite">{{ interactionLabel }}</strong>
        </div>
        <p>
          <span class="legend-dot legend-dot--primary" /> главный
          <span class="legend-dot legend-dot--related" /> связанный
          <span class="legend-dot legend-dot--ambient" /> контекст
        </p>
      </div>

      <section
        ref="board"
        class="focus-grid"
        :data-phase="phase"
        :data-empty-cells="emptyCells"
        aria-label="Дашборд GYMKiDs с семантической bento-сеткой"
      >
        <button
          v-for="card in cards"
          :key="card.id"
          class="focus-card"
          :data-card="card.id"
          :data-tone="card.tone"
          :data-role="roleFor(card.id)"
          :data-static="staticCardIds.includes(card.id) || undefined"
          :data-w="placements[card.id].w"
          :data-h="placements[card.id].h"
          :style="cardStyle(card.id)"
          type="button"
          :disabled="isBusy || staticCardIds.includes(card.id)"
          :aria-pressed="selectedId === card.id"
          :aria-label="staticCardIds.includes(card.id) ? `${card.title}: статичная опорная карточка` : selectedId ? `Вернуть общий обзор через ${card.title}` : `Сфокусироваться на ${card.title}`"
          @click="focusCard(card.id)"
        >
          <span class="card-topline">
            <span class="card-eyebrow">{{ card.eyebrow }}</span>
            <span
              v-if="roleFor(card.id) === 'related'"
              class="relation-mark"
            >связано</span>
            <span
              v-else-if="staticCardIds.includes(card.id)"
              class="anchor-mark"
            >опора</span>
            <span
              v-else
              class="card-index"
            >0{{ card.id }}</span>
          </span>

          <span
            v-if="card.id === 6 && selectedId === 6 && siteFocus"
            class="site-focus"
          >
            <span class="site-focus__hero">
              <span>
                <strong class="site-focus__title">Сайт</strong>
                <span class="site-focus__period">{{ siteFocus.periodLabel }}</span>
              </span>
              <span class="site-focus__headline">
                <strong>{{ siteFocus.factLabel }}</strong>
                <span>лидов · {{ siteFocus.shareLabel }} всего потока</span>
              </span>
            </span>

            <span class="site-focus__kpis">
              <span>
                <small>План месяца</small>
                <strong>{{ siteFocus.planLabel }}</strong>
              </span>
              <span>
                <small>Прогноз</small>
                <strong>{{ siteFocus.forecastLabel }}</strong>
              </span>
              <span>
                <small>К плану</small>
                <strong>{{ siteFocus.forecastRateLabel }}</strong>
              </span>
              <span>
                <small>CPL Яндекс</small>
                <strong>{{ siteFocus.cplLabel }}</strong>
              </span>
            </span>

            <span class="site-focus__trajectory">
              <span class="site-panel__heading">
                <strong>Траектория месяца</strong>
                <span>отклонение {{ siteFocus.deltaLabel }}</span>
              </span>
              <span class="site-focus__scale">
                <span
                  class="site-focus__scale-fill"
                  :style="{ inlineSize: `${siteFocus.factPosition}%` }"
                />
                <span
                  class="site-focus__marker site-focus__marker--plan"
                  :style="{ insetInlineStart: `${siteFocus.planPosition}%` }"
                  aria-hidden="true"
                />
                <span
                  class="site-focus__marker site-focus__marker--forecast"
                  :style="{ insetInlineStart: `${siteFocus.forecastPosition}%` }"
                  aria-hidden="true"
                />
              </span>
              <span class="site-focus__scale-labels">
                <span>0</span>
                <span class="site-focus__scale-key">
                  <span>факт {{ siteFocus.factLabel }}</span>
                  <span>план {{ siteFocus.planLabel }}</span>
                  <span>прогноз {{ siteFocus.forecastLabel }}</span>
                </span>
                <span>{{ siteFocus.scaleMaxLabel }} лидов</span>
              </span>
            </span>

            <span class="site-focus__lower">
              <span class="site-focus__funnel">
                <span class="site-panel__heading">
                  <strong>Движение заявок</strong>
                  <span>{{ siteFocus.reachedRateLabel }} от лида до визита</span>
                </span>
                <span class="site-focus__stages">
                  <span
                    v-for="stage in siteFocus.stages"
                    :key="stage.label"
                    class="site-focus__stage"
                  >
                    <span class="site-focus__stage-topline">
                      <span>{{ stage.label }}</span>
                      <small>{{ stage.rateLabel }}</small>
                    </span>
                    <strong>{{ stage.valueLabel }}</strong>
                    <span class="site-focus__stage-bar">
                      <span :style="{ inlineSize: `${Math.max(stage.rate, 5)}%` }" />
                    </span>
                  </span>
                </span>
              </span>

              <span class="site-focus__report">
                <span class="site-panel__heading">
                  <strong>Краткий отчёт</strong>
                  <span>черновик структуры</span>
                </span>
                <strong class="site-focus__loss">{{ siteFocus.largestLossLabel }}</strong>
                <span>Главная потеря в текущей цепочке</span>
                <span class="site-focus__report-copy">{{ siteFocus.paceSummary }}</span>
                <span class="site-focus__report-copy">{{ siteFocus.cplSummary }}</span>
              </span>
            </span>
          </span>

          <template v-else>
            <span class="card-heading">
              <span class="card-title">{{ card.title }}</span>
              <span class="card-value">{{ card.value }}</span>
              <span class="card-unit">{{ card.unit }}</span>
            </span>

            <span
              class="progress-track"
              aria-hidden="true"
            >
              <span :style="{ inlineSize: `${card.progress}%` }" />
            </span>

            <span class="metric-list">
              <span
                v-for="row in card.rows"
                :key="row.label"
                class="metric-row"
              >
                <span>{{ row.label }}</span>
                <strong>{{ row.value }}</strong>
              </span>
            </span>

            <span class="card-note">{{ card.note }}</span>
          </template>
        </button>
      </section>
    </template>
  </main>
</template>

<style scoped>
.focus-lab {
  --canvas: #101512;
  --paper: #e8e9e2;
  --paper-strong: #f3f4ee;
  --ink: #202925;
  --mint: #bcd2c5;
  --lime: #d8ee87;
  display: grid;
  min-block-size: 100dvh;
  padding: 110px 18px 18px;
  place-items: start center;
  background:
    radial-gradient(circle at 18% 4%, rgb(66 119 139 / 28%), transparent 38%),
    radial-gradient(circle at 84% 70%, rgb(77 130 76 / 22%), transparent 42%),
    var(--canvas);
  color: #f6f8f4;
  font-family: Inter, system-ui, sans-serif;
}

.focus-header {
  position: fixed;
  z-index: 30;
  inset-block-start: 0;
  inset-inline: 0;
  display: grid;
  min-block-size: 70px;
  align-items: center;
  grid-template-columns: minmax(230px, .75fr) minmax(260px, 1fr) auto;
  gap: 22px;
  padding: 12px 20px;
  border-block-end: 1px solid rgb(255 255 255 / 8%);
  background: rgb(12 18 14 / 76%);
  backdrop-filter: blur(22px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 13px;
  color: inherit;
  text-decoration: none;
}

.brand img {
  inline-size: 74px;
  block-size: auto;
}

.brand span,
.snapshot span,
.focus-caption span,
.card-eyebrow,
.card-index,
.anchor-mark,
.relation-mark {
  color: rgb(244 248 242 / 54%);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .11em;
  text-transform: uppercase;
}

.snapshot {
  display: grid;
  gap: 2px;
}

.snapshot strong {
  font-size: 13px;
  font-weight: 650;
}

.focus-controls {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 7px;
}

.focus-controls select,
.focus-controls input,
.reset-control,
.state-panel button {
  min-block-size: 34px;
  padding-inline: 10px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 9px;
  color: rgb(248 250 246 / 82%);
  background: rgb(2 6 3 / 35%);
  font: 600 11px/1 Inter, system-ui, sans-serif;
}

.focus-controls select:first-child {
  max-inline-size: 180px;
}

.reset-control,
.state-panel button {
  cursor: pointer;
}

.reset-control:disabled {
  cursor: default;
  opacity: .34;
}

.focus-caption {
  position: fixed;
  z-index: 10;
  inset-block-start: 91px;
  inset-inline: max(26px, calc((100vw - min(1560px, calc(100vw - 36px))) / 2 + 10px));
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}

.focus-caption > div {
  display: grid;
  gap: 2px;
}

.focus-caption strong {
  color: rgb(248 250 246 / 84%);
  font-size: 12px;
  font-weight: 600;
}

.focus-caption p {
  display: flex;
  margin: 0;
  align-items: center;
  gap: 7px;
  color: rgb(244 248 242 / 45%);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.legend-dot {
  display: inline-block;
  inline-size: 7px;
  block-size: 7px;
  margin-inline-start: 7px;
  border-radius: 99px;
}

.legend-dot--primary {
  background: var(--lime);
  box-shadow: 0 0 12px rgb(216 238 135 / 60%);
}

.legend-dot--related {
  border: 1px solid var(--lime);
}

.legend-dot--ambient {
  background: rgb(255 255 255 / 24%);
}

.focus-grid {
  display: grid;
  inline-size: min(1560px, calc(100vw - 36px), calc((100dvh - 108px) * 1.945));
  aspect-ratio: 1560 / 802;
  margin-block-start: 20px;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-rows: repeat(8, minmax(0, 1fr));
  gap: clamp(7px, .62vw, 11px);
  padding: clamp(7px, .62vw, 11px);
  border: 1px solid rgb(255 255 255 / 7%);
  border-radius: clamp(17px, 1.5vw, 26px);
  background: rgb(4 9 6 / 42%);
  box-shadow: 0 36px 100px rgb(0 0 0 / 28%);
  isolation: isolate;
}

.focus-card {
  position: relative;
  display: flex;
  min-inline-size: 0;
  min-block-size: 0;
  flex-direction: column;
  padding: clamp(13px, 1.25vw, 23px);
  border: 1px solid rgb(25 36 31 / 10%);
  border-radius: clamp(14px, 1.15vw, 21px);
  color: var(--ink);
  background: var(--paper);
  box-shadow: 0 9px 24px rgb(0 0 0 / 12%);
  cursor: pointer;
  overflow: hidden;
  text-align: start;
  transform-origin: center;
  transition: border-color 240ms ease, box-shadow 240ms ease, filter 240ms ease, opacity 240ms ease;
}

.focus-card[data-tone="ink"] {
  border-color: rgb(134 169 151 / 22%);
  color: #eef4ef;
  background: #273b34;
}

.focus-card[data-tone="mint"] {
  background: var(--mint);
}

.focus-card[data-tone="lime"] {
  background: var(--lime);
}

.focus-grid[data-phase="focused"] .focus-card[data-role="primary"] {
  z-index: 3;
  border-color: rgb(225 245 150 / 84%);
  box-shadow: 0 18px 48px rgb(0 0 0 / 24%), 0 0 0 2px rgb(216 238 135 / 34%);
}

.focus-grid[data-phase="focused"] .focus-card[data-role="related"] {
  z-index: 2;
  border-color: rgb(215 238 135 / 70%);
  box-shadow: inset 0 0 0 1px rgb(215 238 135 / 28%), 0 9px 24px rgb(0 0 0 / 12%);
}

.focus-grid[data-phase="focused"] .focus-card[data-role="ambient"],
.focus-grid[data-phase="focused"] .focus-card[data-role="anchor"] {
  filter: saturate(.7);
  opacity: .62;
}

.focus-card:hover:not(:disabled) {
  filter: brightness(1.025);
}

.focus-card:focus-visible,
.focus-controls :focus-visible,
.state-panel button:focus-visible {
  outline: 2px solid var(--lime);
  outline-offset: 2px;
}

.focus-card:disabled {
  cursor: default;
}

.card-topline {
  display: flex;
  min-block-size: 14px;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}

.focus-card:not([data-tone="ink"]) .card-eyebrow,
.focus-card:not([data-tone="ink"]) .card-index,
.focus-card:not([data-tone="ink"]) .anchor-mark {
  color: rgb(30 43 37 / 54%);
}

.relation-mark {
  padding: 4px 6px;
  border: 1px solid currentColor;
  border-radius: 99px;
  color: #5b6e1b;
  letter-spacing: .06em;
}

.focus-card[data-tone="ink"] .relation-mark {
  color: var(--lime);
}

.anchor-mark {
  letter-spacing: .06em;
}

.site-focus {
  display: grid;
  min-block-size: 0;
  flex: 1;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: clamp(8px, .6vw, 10px);
  margin-block-start: clamp(7px, .65vw, 11px);
}

.site-focus__hero,
.site-panel__heading,
.site-focus__stage-topline,
.site-focus__scale-labels {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.site-focus__title {
  display: block;
  font-size: clamp(22px, 2vw, 36px);
  font-weight: 680;
  letter-spacing: -.055em;
  line-height: .95;
}

.site-focus__period,
.site-panel__heading > span,
.site-focus__scale-labels,
.site-focus__report > span,
.site-focus__stage-topline,
.site-focus__stage-topline small {
  color: rgb(31 43 37 / 52%);
  font-size: clamp(8px, .62vw, 10px);
  font-weight: 620;
  line-height: 1.35;
}

.site-focus__period {
  display: block;
  margin-block-start: 7px;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.site-focus__headline {
  display: grid;
  justify-items: end;
  text-align: end;
}

.site-focus__headline strong {
  font-size: clamp(38px, 3.6vw, 62px);
  font-weight: 680;
  letter-spacing: -.075em;
  line-height: .84;
}

.site-focus__headline span {
  margin-block-start: 8px;
  color: rgb(31 43 37 / 58%);
  font-size: clamp(9px, .7vw, 11px);
  font-weight: 620;
}

.site-focus__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-block: 1px solid rgb(31 43 37 / 18%);
}

.site-focus__kpis > span {
  display: grid;
  min-inline-size: 0;
  gap: 4px;
  padding: clamp(7px, .58vw, 9px) clamp(6px, .65vw, 10px);
  border-inline-start: 1px solid rgb(31 43 37 / 12%);
}

.site-focus__kpis > span:first-child {
  padding-inline-start: 0;
  border-inline-start: 0;
}

.site-focus__kpis small {
  color: rgb(31 43 37 / 48%);
  font-size: clamp(8px, .6vw, 10px);
  font-weight: 650;
  letter-spacing: .05em;
  text-transform: uppercase;
}

.site-focus__kpis strong {
  overflow: hidden;
  font-size: clamp(16px, 1.45vw, 25px);
  font-weight: 700;
  letter-spacing: -.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.site-focus__trajectory,
.site-focus__funnel,
.site-focus__report {
  display: grid;
  min-block-size: 0;
  border: 1px solid rgb(31 43 37 / 13%);
  border-radius: clamp(11px, .9vw, 16px);
  background: rgb(255 255 255 / 22%);
}

.site-focus__trajectory {
  gap: 7px;
  padding: clamp(9px, .7vw, 11px);
}

.site-panel__heading {
  align-items: baseline;
}

.site-panel__heading > strong {
  font-size: clamp(10px, .75vw, 12px);
  font-weight: 720;
  letter-spacing: -.015em;
}

.site-panel__heading > span {
  text-align: end;
}

.site-focus__scale {
  position: relative;
  display: block;
  block-size: 7px;
  margin-block-start: 10px;
  border-radius: 99px;
  background: rgb(31 43 37 / 10%);
}

.site-focus__scale-fill {
  display: block;
  min-inline-size: 4px;
  block-size: 100%;
  border-radius: inherit;
  background: #718729;
}

.site-focus__marker {
  position: absolute;
  inset-block-end: -1px;
  display: block;
  block-size: 14px;
  border-inline-start: 1px solid currentColor;
  color: rgb(31 43 37 / 48%);
  transform: translateX(-1px);
}

.site-focus__marker--forecast {
  color: #718729;
  transform: translateX(-100%);
}

.site-focus__scale-labels {
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
}

.site-focus__scale-key {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 1vw, 16px);
}

.site-focus__scale-key > span::before {
  display: inline-block;
  inline-size: 5px;
  block-size: 5px;
  margin-inline-end: 4px;
  border-radius: 99px;
  background: rgb(31 43 37 / 28%);
  content: '';
}

.site-focus__scale-key > span:first-child::before {
  background: #718729;
}

.site-focus__scale-key > span:last-child::before {
  border: 1px solid #718729;
  background: transparent;
}

.site-focus__lower {
  display: grid;
  min-block-size: 0;
  grid-template-columns: minmax(0, 1.42fr) minmax(190px, .86fr);
  gap: clamp(8px, .6vw, 10px);
}

.site-focus__funnel {
  align-content: stretch;
  grid-template-rows: auto minmax(0, 1fr);
  gap: clamp(10px, .75vw, 12px);
  padding: clamp(10px, .75vw, 12px);
}

.site-focus__stages {
  display: grid;
  align-items: center;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(7px, .7vw, 12px);
}

.site-focus__stage {
  display: grid;
  min-inline-size: 0;
  align-content: end;
  gap: 7px;
}

.site-focus__stage + .site-focus__stage {
  padding-inline-start: clamp(7px, .7vw, 12px);
  border-inline-start: 1px solid rgb(31 43 37 / 12%);
}

.site-focus__stage > strong {
  font-size: clamp(22px, 2.15vw, 38px);
  font-weight: 680;
  letter-spacing: -.06em;
  line-height: .95;
}

.site-focus__stage-bar {
  display: block;
  block-size: 3px;
  border-radius: 99px;
  background: rgb(31 43 37 / 10%);
  overflow: hidden;
}

.site-focus__stage-bar > span {
  display: block;
  block-size: 100%;
  border-radius: inherit;
  background: #718729;
}

.site-focus__report {
  align-content: start;
  gap: 6px;
  padding: clamp(10px, .75vw, 12px);
  color: #eef4ef;
  background: #273b34;
}

.site-focus__report .site-panel__heading > span,
.site-focus__report > span {
  color: rgb(238 244 239 / 53%);
}

.site-focus__loss {
  margin-block-start: clamp(3px, .4vw, 7px);
  color: var(--lime);
  font-size: clamp(18px, 1.55vw, 28px);
  font-weight: 680;
  letter-spacing: -.045em;
  line-height: 1;
}

.site-focus__report-copy {
  display: block;
  padding-block-start: 6px;
  border-block-start: 1px solid rgb(255 255 255 / 11%);
}

.card-heading {
  display: grid;
  margin-block-start: auto;
  gap: 1px;
}

.card-title {
  margin-block-end: clamp(5px, .6vw, 11px);
  font-size: clamp(13px, 1vw, 17px);
  font-weight: 650;
  letter-spacing: -.025em;
}

.card-value {
  overflow: hidden;
  font-size: clamp(25px, 2.7vw, 51px);
  font-weight: 670;
  letter-spacing: -.065em;
  line-height: .98;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-unit {
  min-block-size: 16px;
  margin-block-start: 5px;
  color: currentColor;
  font-size: clamp(9px, .72vw, 12px);
  font-weight: 560;
  opacity: .58;
}

.progress-track {
  display: block;
  block-size: 3px;
  margin-block: clamp(9px, .9vw, 15px);
  border-radius: 99px;
  background: rgb(25 39 32 / 12%);
  overflow: hidden;
}

.focus-card[data-tone="ink"] .progress-track {
  background: rgb(255 255 255 / 11%);
}

.progress-track > span {
  display: block;
  min-inline-size: 3px;
  max-inline-size: 100%;
  block-size: 100%;
  border-radius: inherit;
  background: #718729;
}

.focus-card[data-tone="ink"] .progress-track > span {
  background: var(--lime);
}

.metric-list {
  display: grid;
  gap: 0;
}

.metric-row {
  display: flex;
  min-block-size: 27px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-block-start: 1px solid currentColor;
  font-size: clamp(9px, .68vw, 11px);
  opacity: .72;
}

.metric-row strong {
  font-weight: 700;
}

.card-note {
  display: block;
  margin-block-start: auto;
  padding-block-start: 9px;
  font-size: clamp(9px, .66vw, 11px);
  line-height: 1.35;
  opacity: .48;
}

.focus-card[data-w="2"] .card-title,
.focus-card[data-w="2"] .card-note,
.focus-card[data-w="2"] .metric-row:nth-child(n + 2),
.focus-card[data-h="3"] .card-note,
.focus-card[data-h="2"] .card-note,
.focus-card[data-h="2"] .metric-row:nth-child(n + 3) {
  display: none;
}

.focus-card[data-w="2"] .card-value {
  font-size: clamp(20px, 2vw, 35px);
}

.focus-card[data-w="2"] .card-unit {
  max-inline-size: 14ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.focus-card[data-h="2"] .progress-track {
  margin-block: 8px 4px;
}

.focus-card[data-h="2"] .metric-row {
  min-block-size: 22px;
}

.focus-card[data-h="2"][data-card="1"] .metric-list,
.focus-card[data-h="2"][data-card="4"] .metric-list,
.focus-card[data-h="2"][data-card="5"] .metric-list {
  display: none;
}

.state-panel {
  display: grid;
  inline-size: min(460px, calc(100vw - 36px));
  min-block-size: 260px;
  place-content: center;
  justify-items: start;
  gap: 10px;
  padding: 34px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 24px;
  background: rgb(5 10 7 / 42%);
}

.state-panel strong {
  font-size: 20px;
}

.state-panel p {
  margin: 0;
  color: rgb(248 250 246 / 58%);
  font-size: 13px;
  line-height: 1.5;
}

.state-panel__pulse {
  inline-size: 11px;
  block-size: 11px;
  border-radius: 50%;
  background: var(--lime);
  box-shadow: 0 0 0 0 rgb(216 238 135 / 45%);
  animation: pulse 1.4s infinite;
}

@keyframes pulse {
  70% { box-shadow: 0 0 0 12px rgb(216 238 135 / 0%); }
  100% { box-shadow: 0 0 0 0 rgb(216 238 135 / 0%); }
}

@media (max-width: 1180px) {
  .focus-header {
    grid-template-columns: auto 1fr;
  }

  .snapshot {
    display: none;
  }

  .focus-controls select:first-child {
    max-inline-size: 145px;
  }
}

@media (max-width: 820px) {
  .focus-lab {
    display: block;
    padding: 126px 12px 24px;
  }

  .focus-header {
    min-block-size: 114px;
    align-content: center;
    grid-template-columns: 1fr;
    gap: 9px;
    padding: 10px 12px;
  }

  .brand {
    justify-content: space-between;
  }

  .focus-controls {
    justify-content: start;
    overflow-x: auto;
  }

  .focus-controls select,
  .focus-controls input {
    min-inline-size: 118px;
  }

  .focus-caption {
    position: static;
    margin-block-end: 12px;
  }

  .focus-caption p {
    display: none;
  }

  .focus-grid {
    display: grid;
    inline-size: 100%;
    aspect-ratio: auto;
    margin: 0;
    grid-template-columns: 1fr;
    grid-template-rows: none;
    gap: 8px;
    padding: 7px;
  }

  .focus-card {
    min-block-size: 174px;
    grid-column: 1 !important;
    grid-row: auto !important;
  }

  .focus-card[data-role="primary"] {
    min-block-size: 270px;
    order: -2;
  }

  .focus-card[data-card="6"][data-role="primary"] {
    min-block-size: 760px;
  }

  .focus-card[data-role="related"] {
    order: -1;
  }

  .site-focus {
    grid-template-rows: auto auto auto auto;
  }

  .site-focus__hero {
    align-items: end;
  }

  .site-focus__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .site-focus__kpis > span:nth-child(3) {
    padding-inline-start: 0;
    border-inline-start: 0;
  }

  .site-focus__kpis > span:nth-child(n + 3) {
    border-block-start: 1px solid rgb(31 43 37 / 12%);
  }

  .site-focus__lower {
    grid-template-columns: 1fr;
  }

  .site-focus__stages {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .site-focus__stage:nth-child(3) {
    padding-inline-start: 0;
    border-inline-start: 0;
  }

  .focus-card[data-w="2"] .card-title,
  .focus-card[data-w="2"] .metric-row:nth-child(n + 2),
  .focus-card[data-h="2"] .metric-row:nth-child(n + 3) {
    display: flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .focus-card,
  .state-panel__pulse {
    animation: none;
    transition: none;
  }
}
</style>
