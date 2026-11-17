<script setup lang="ts">
import '@/styles/bento-recovery.css'
import '@/styles/bento-source-labels.css'
import '@/styles/bento-mobile-order.css'
import { onKeyStroke } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gymkidsWhiteLogoUrl from '@images/gymkids/white-logo.png'
import BentoConversionReflow from '@/components/bento/BentoConversionReflow.vue'
import BentoMetricDetail from '@/components/bento/BentoMetricDetail.vue'
import BentoSourcesDetail from '@/components/bento/BentoSourcesDetail.vue'
import BentoSourceCardContent from '@/components/bento/BentoSourceCardContent.vue'
import { getFeaturedSourceCards } from '@/data/gymkidsFeaturedSources'
import BentoTrialDetails from '@/components/bento/BentoTrialDetails.vue'
import GymkidsDemoState from '@/components/GymkidsDemoState.vue'
import GymkidsSoftAurora from '@/components/GymkidsSoftAurora.vue'
import { useBentoFocusMotion } from '@/composables/useBentoFocusMotion'
import type { BentoFocusCardId } from '@/composables/useBentoFocusMotion'
import { useGymkidsDashboard } from '@/composables/useGymkidsDashboard'
import type { DashboardSourceRow } from '@/data/gymkidsSnapshot'
import { compactDashboardSourceRows, compactReasonRows, compactSourceCardRows, sourceCardRows } from '@/data/sourceBreakdown'

import { queryValue, useBentoSelectionQuery } from '@/composables/useBentoSelectionQuery'
import { useBentoReportSelection } from '@/composables/useBentoReportSelection'
import { useBentoMcpPreview } from '@/composables/useBentoMcpPreview'

import { useBentoCardHover } from '@/composables/useBentoCardHover'

import { createBentoSpatialSite } from '@/lib/bentoSpatialSite'
import { createBentoSpatialConversion } from '@/lib/bentoSpatialConversion'
import type { BentoDetailView, BentoTransitionPhase, BentoView, SpatialMotionDirection, SpatialMotionPhase } from '@/lib/bentoViewTypes'

const props = withDefaults(defineProps<{
  interactionMode?: 'details' | 'focus-reflow'
}>(), {
  interactionMode: 'details',
})

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

type PreviewState = 'ready' | 'loading' | 'empty' | 'partial' | 'unavailable' | 'error'
const route = useRoute()
const router = useRouter()
const planGateEnabled = true
const focusMotionEnabled = computed(() => props.interactionMode === 'focus-reflow')
const previewStates: readonly PreviewState[] = ['ready', 'loading', 'empty', 'partial', 'unavailable', 'error']
const requestedBentoView = computed<BentoView>(() => 'overview')
const settledBentoView = ref<BentoView>(requestedBentoView.value)
const bentoTransitionPhase = ref<BentoTransitionPhase>('idle')
const bentoStageRef = ref<HTMLElement | null>(null)

const {
  isActive: focusMotionIsActive,
  isBusy: focusMotionIsBusy,
  phase: focusMotionPhase,
  rectFor: focusMotionRectFor,
  reset: resetFocusMotion,
  roleFor: focusMotionRoleFor,
  selectedId: focusMotionSelectedId,
  styleFor: focusMotionStyleFor,
  toggle: toggleFocusMotion,
} = useBentoFocusMotion({
  enabled: focusMotionEnabled,
  stageRef: bentoStageRef,
})

const supportsSpatialReflow = ref(false)
const supportsSiteSpatialReflow = ref(false)
const spatialGridIsExpanded = ref(false)
const siteGridIsExpanded = ref(false)
const spatialReflowIsBusy = ref(false)
const spatialMotionPhase = ref<SpatialMotionPhase>('idle')
const spatialMotionDirection = ref<SpatialMotionDirection>('idle')
const isSpatialConversionView = computed(() => supportsSpatialReflow.value && settledBentoView.value === 'conversion')
const isSpatialSiteView = computed(() => supportsSiteSpatialReflow.value && siteGridIsExpanded.value)
const overviewLayerIsActive = computed(() => settledBentoView.value === 'overview' || isSpatialConversionView.value)
const bentoIsBusy = computed(() => bentoTransitionPhase.value !== 'idle' || spatialReflowIsBusy.value || focusMotionIsBusy.value)

const activeBentoDetail = computed<BentoDetailView>(() => {
  if (requestedBentoView.value !== 'overview')
    return requestedBentoView.value

  return settledBentoView.value === 'overview' ? 'sources' : settledBentoView.value
})

const BENTO_TRANSITION_MS = 460
const lastOpenedBentoDetail = ref<BentoDetailView>(activeBentoDetail.value)
let bentoTransitionTimer: number | undefined
let spatialMediaQuery: MediaQueryList | undefined
let siteSpatialMediaQuery: MediaQueryList | undefined

const {
  state: loadState,
  error: loadError,
  dashboard,
  current,
  selectedCenterId,
  selectedPeriod,
  selectedDate,
  centers,
  periods,
  initialize,
  selectCenter,
  selectPeriod,
  selectDate: selectDashboardDate,
  retry,
} = useGymkidsDashboard()

const trialsPerHundredLeadsLabel = computed(() => {
  const view = dashboard.value
  if (!view?.trial.available || !view.leads.fact)
    return '—'

  const percentage = Math.round((view.trial.reached / view.leads.fact) * 100)

  return `${percentage.toLocaleString('ru-RU')}%`
})

const funnelRate = (value: number, previous: number) => previous
  ? `${String(Math.round((value / previous) * 1000) / 10).replace('.', ',')}%`
  : '—'

const conversionFunnelStages = computed(() => {
  if (!dashboard.value)
    return []

  const leads = dashboard.value.leads.fact
  const valid = dashboard.value.quality.valid
  const scheduled = dashboard.value.cohort.validScheduled
  const reached = dashboard.value.cohort.validReached

  return [
    { key: 'leads', label: 'Лиды', value: leads, rateToNext: funnelRate(valid, leads) },
    { key: 'valid', label: 'Валидные', value: valid, rateToNext: scheduled === null ? '—' : funnelRate(scheduled, valid) },
    { key: 'scheduled', label: 'Записаны', value: scheduled, rateToNext: scheduled === null || reached === null ? '—' : funnelRate(reached, scheduled) },
    { key: 'reached', label: 'Дошли', value: reached, rateToNext: null },
  ]
})

const conversionFunnelExpanded = computed(() => focusMotionEnabled.value && focusMotionSelectedId.value === 3 && focusMotionRectFor(3) !== undefined)
const featuredSourceCards = computed(() => dashboard.value ? getFeaturedSourceCards(dashboard.value) : [])
type DashboardSource = DashboardSourceRow

const visibleSourceRows = computed(() => {
  if (!dashboard.value)
    return []

  return sourceCardRows(
    dashboard.value.sources,
    dashboard.value.leads.fact,
    selectedCenterId.value,
    selectedPeriod.value,
    selectedDate.value,
    current.value?.release_id,
  )
})

const compactLeadSourceRows = computed(() => compactSourceCardRows(
  visibleSourceRows.value,
  dashboard.value?.leads.fact ?? 0,
))

const compactPathSourceRows = computed(() => compactDashboardSourceRows(
  dashboard.value?.sources ?? [],
  dashboard.value?.leads.fact ?? 0,
))

const compactInvalidReasonRows = computed(() => compactReasonRows(
  dashboard.value?.quality.reasons ?? [],
  dashboard.value?.quality.invalid ?? 0,
))

const sourceListExpanded = computed(() => focusMotionEnabled.value && focusMotionSelectedId.value === 2 && focusMotionRectFor(2) !== undefined)
const trialDetailsExpanded = computed(() => focusMotionEnabled.value && focusMotionSelectedId.value === 8 && focusMotionRectFor(8) !== undefined)

const siteDetailsExpanded = computed(() => focusMotionEnabled.value
  ? focusMotionSelectedId.value === 6 && focusMotionRectFor(6) !== undefined
  : siteGridIsExpanded.value)

const promoDetailsExpanded = computed(() => focusMotionEnabled.value && focusMotionSelectedId.value === 7 && focusMotionRectFor(7) !== undefined)

const {
  motionNumberProgress, sourceBarsAnimating, resetCardNumberAnimations,
  formatAnimatedInteger, formatAnimatedPercent,
  startCardHoverEffects, finishCardHoverEffects, suppressHoverEffectsUntil,
} = useBentoCardHover(bentoIsBusy, trialDetailsExpanded)

const sourceSummaryLabel = (label: string) => ({
  'Прямое обращение в центр': 'Прямое',
  'По рекомендации': 'Рекомендации',
  'Заявка с сайта': 'Сайт',
  'Колесо фортуны': 'Колесо',
  'Остальные источники': 'Остальные',
}[label] ?? label)

const pathSourceLabel = (label: string) => ({
  'Прямое обращение в центр': 'Прямое',
  'По рекомендации': 'Рекомендации',
  'Заявка с сайта': 'Сайт',
  'Промоутеры': 'Промо',
  'Колесо фортуны': 'Колесо',
  'Остальные источники': 'Остальное',
}[label] ?? label)

const focusBentoView = (view: BentoView) => {
  const selector = view === 'overview' ? `[data-bento-open="${lastOpenedBentoDetail.value}"]` : '[data-bento-detail-focus]'

  bentoStageRef.value?.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true })
}

const focusBentoViewAfterPaint = async (view: BentoView) => {
  await nextTick()
  await new Promise<void>(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())))
  focusBentoView(view)
}

const usesSimpleBentoTransition = () => window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 1319px)').matches

const isSpatialConversionRoute = (target: BentoView) => supportsSpatialReflow.value
  && ((settledBentoView.value === 'overview' && target === 'conversion')
    || (settledBentoView.value === 'conversion' && target === 'overview'))

const { transitionSpatialSite, stopSiteFlipAnimation } = createBentoSpatialSite({
  bentoStageRef,
  spatialReflowIsBusy,
  spatialMotionPhase,
  spatialMotionDirection,
  resetCardNumberAnimations,
  suppressHoverEffectsUntil,
  supportsSpatialReflow,
  siteGridIsExpanded,
})

const { transitionSpatialConversion, cancelSpatialMotionFrame } = createBentoSpatialConversion({
  bentoStageRef,
  spatialReflowIsBusy,
  spatialMotionPhase,
  spatialMotionDirection,
  resetCardNumberAnimations,
  suppressHoverEffectsUntil,
  settledBentoView,
  requestedBentoView,
  spatialGridIsExpanded,
  focusBentoViewAfterPaint,
  transitionToBentoView: view => transitionToBentoView(view),
})

async function transitionToBentoView(target: BentoView) {
  if (bentoTransitionPhase.value !== 'idle' || spatialReflowIsBusy.value || target === settledBentoView.value)
    return

  if (target !== 'overview')
    lastOpenedBentoDetail.value = target

  await nextTick()

  if (isSpatialConversionRoute(target)) {
    await transitionSpatialConversion(target)

    return
  }

  if (usesSimpleBentoTransition()) {
    settledBentoView.value = target
    await nextTick()
    focusBentoView(target)

    return
  }

  bentoTransitionPhase.value = target === 'overview' ? 'to-overview' : 'to-detail'
  bentoTransitionTimer = window.setTimeout(async () => {
    settledBentoView.value = target
    bentoTransitionPhase.value = 'idle'
    bentoTransitionTimer = undefined
    await nextTick()
    focusBentoView(target)

    if (requestedBentoView.value !== target)
      transitionToBentoView(requestedBentoView.value)
  }, BENTO_TRANSITION_MS)
}

const focusCardByDetail: Record<BentoDetailView, BentoFocusCardId> = {
  sources: 2,
  conversion: 3,
  validity: 4,
  site: 6,
  promo: 7,
  trial: 8,
  path: 9,
}

const focusCardTitles: Record<BentoFocusCardId, string> = {
  1: 'Лиды на сегодня',
  2: 'Откуда пришли лиды',
  3: 'Конверсия',
  4: 'Валидность',
  5: 'Прогноз месяца',
  6: 'Сайт',
  7: 'Промо',
  8: 'Пробное',
  9: 'Путь до пробного',
}

const focusCardAriaLabel = (id: BentoFocusCardId) => {
  const title = id === 6 || id === 7 ? featuredSourceCards.value[id - 6]?.label : focusCardTitles[id]

  return focusMotionSelectedId.value ? `Вернуть общий обзор через «${title}»` : `Сфокусироваться на «${title}»`
}

const handleFocusCard = async (id: BentoFocusCardId) => {
  if (!focusMotionEnabled.value || bentoIsBusy.value)
    return

  await toggleFocusMotion(id)
}

const openBentoDetail = (view: BentoDetailView) => {
  if (bentoIsBusy.value)
    return

  if (focusMotionEnabled.value)
    return handleFocusCard(focusCardByDetail[view])

  if (siteGridIsExpanded.value)
    return transitionSpatialSite(false)

  if (view === 'site' && supportsSiteSpatialReflow.value) {
    lastOpenedBentoDetail.value = 'site'

    return transitionSpatialSite(true)
  }

  return router.push({
    query: {
      ...route.query,
      view,
    },
  })
}

const closeBentoDetail = () => {
  if (bentoIsBusy.value)
    return

  if (focusMotionEnabled.value)
    return resetFocusMotion()

  const query = { ...route.query }

  delete query.view

  return router.push({ query })
}

watch(requestedBentoView, transitionToBentoView)

const { syncSelectionQuery, replaceSelectionDate } = useBentoSelectionQuery({
  route, router, dashboard, selectedCenterId, selectedPeriod,
})

const {
  centerPickerRef, centerButtonRef, centerListboxRef, isCenterMenuOpen, activeCenterIndex,
  selectedCenterLabel, centerTriggerLabel, centerOptionId, activeCenterOptionId,
  calendarWeekdays, periodPickerRef, periodButtonRef, isCalendarOpen, selectedDay,
  calendarCells, selectedDateLabel, availableThroughDay, lastAvailableDateLabel,
  selectedDayLabel, dataFreshnessLabel, periodTriggerLabel, formatPeriodOption,
  calendarDayId, calendarDayLabel, leadDayTooltipLabel, toggleCenterMenu, toggleCalendar,
  selectReportDay, selectCenterOption, setActiveCenterIndex, handleCenterButtonKeydown, handleCenterListboxKeydown,
  handlePeriodChange, handleCalendarDayKeydown, closeCenterMenu, closeCalendar,
} = useBentoReportSelection({
  dashboard,
  centers,
  selectedCenterId,
  selectCenter,
  selectPeriod,
  selectDate: selectDashboardDate,
  resetFocusMotion,
  syncSelectionQuery,
  replaceSelectionDate,
})

onKeyStroke('Escape', () => {
  if (isCenterMenuOpen.value) {
    closeCenterMenu(true)

    return
  }

  if (isCalendarOpen.value) {
    closeCalendar(true)

    return
  }

  if (focusMotionSelectedId.value) {
    resetFocusMotion().catch(() => undefined)

    return
  }

  if (siteGridIsExpanded.value) {
    transitionSpatialSite(false).catch(() => undefined)

    return
  }

  if (requestedBentoView.value !== 'overview')
    closeBentoDetail()
})

const pathRetentionRate = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0

const pathStages = [
  { key: 'fact', label: 'Лид' },
  { key: 'valid', label: 'Валидный' },
  { key: 'scheduled', label: 'Записан' },
  { key: 'reached', label: 'Дошёл' },
] as const

type PathStageKey = typeof pathStages[number]['key']

const pathStageValue = (source: DashboardSource, stage: PathStageKey) => source[stage]

const pathTransitionRate = (source: DashboardSource, stageIndex: number) => {
  const fromStage = pathStages[stageIndex]
  const toStage = pathStages[stageIndex + 1]

  return fromStage && toStage
    ? pathRetentionRate(pathStageValue(source, toStage.key), pathStageValue(source, fromStage.key))
    : 0
}

const previewState = computed<PreviewState>(() => {
  const state = queryValue(route.query.state)

  if (previewStates.includes(state as PreviewState))
    return state as PreviewState

  if (loadState.value === 'loading')
    return 'loading'

  if (loadState.value === 'error')
    return 'error'

  return 'ready'
})

const {
  mcpPreviewMatchesSelection, ownerReviewRequested, mcpPreviewState, mcpPreviewRequested, mcpPreviewStatusLabel,
  mcpTitle, mcpVisible, mcpLayoutClass, initializeMcpPreview,
} = useBentoMcpPreview({ route, selectedCenterId, selectedPeriod })

const forecastMessage = computed(() => {
  const delta = (dashboard.value?.leads.forecast ?? 0) - (dashboard.value?.leads.plan ?? 0)
  const count = Math.abs(delta)
  const amount = count.toLocaleString('ru-RU')

  const unit = count % 10 === 1 && count % 100 !== 11
    ? 'лид'
    : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'лида' : 'лидов'

  if (delta < 0) {
    return {
      title: 'Ниже плана',
      description: `Прогноз ниже утверждённого плана на ${amount} ${unit}.`,
    }
  }

  if (delta > 0) {
    return {
      title: 'Выше плана',
      description: `Прогноз выше утверждённого плана на ${amount} ${unit}.`,
    }
  }

  return {
    title: 'На уровне плана',
    description: 'Прогноз совпадает с утверждённым планом.',
  }
})

const forecastDelta = computed(() => (dashboard.value?.leads.forecast ?? 0) - (dashboard.value?.leads.plan ?? 0))
const forecastDeltaLabel = computed(() => `${forecastDelta.value > 0 ? '+' : ''}${forecastDelta.value}`)
const forecastDeltaCaption = computed(() => forecastDelta.value > 0 ? 'лидов запас' : forecastDelta.value < 0 ? 'лидов разрыв' : 'лидов разницы')

const forecastDeltaPosition = computed(() => {
  const target = 'плана'

  return forecastDelta.value > 0 ? `выше ${target}` : forecastDelta.value < 0 ? `ниже ${target}` : `на уровне ${target}`
})

watch(trialDetailsExpanded, expanded => {
  if (expanded)
    finishCardHoverEffects('trialSecondary')
})

onBeforeUnmount(() => {
  stopSiteFlipAnimation()

  spatialMediaQuery?.removeEventListener('change', syncSpatialReflowSupport)
  siteSpatialMediaQuery?.removeEventListener('change', syncSpatialReflowSupport)

  cancelSpatialMotionFrame()

  if (bentoTransitionTimer !== undefined)
    window.clearTimeout(bentoTransitionTimer)
})

function syncSpatialReflowSupport() {
  supportsSpatialReflow.value = spatialMediaQuery?.matches ?? false
  supportsSiteSpatialReflow.value = siteSpatialMediaQuery?.matches ?? false

  if (!supportsSiteSpatialReflow.value)
    siteGridIsExpanded.value = false

  if (!spatialReflowIsBusy.value)
    spatialGridIsExpanded.value = supportsSpatialReflow.value && settledBentoView.value === 'conversion'
}

onMounted(async () => {
  spatialMediaQuery = window.matchMedia('(min-width: 1440px) and (prefers-reduced-motion: no-preference)')
  siteSpatialMediaQuery = window.matchMedia('(min-width: 821px) and (max-width: 1179px) and (prefers-reduced-motion: no-preference), (min-width: 1440px) and (prefers-reduced-motion: no-preference)')
  syncSpatialReflowSupport()
  spatialMediaQuery.addEventListener('change', syncSpatialReflowSupport)
  siteSpatialMediaQuery.addEventListener('change', syncSpatialReflowSupport)

  await initialize({
    centerId: queryValue(route.query.center),
    period: queryValue(route.query.period) ?? '2026-10',
    date: queryValue(route.query.date),
  })

  await initializeMcpPreview()
  if (['center', 'period', 'date'].some(key => key in route.query))
    syncSelectionQuery()
})
</script>

<template>
  <main
    v-if="!dashboard"
    class="dashboard-canvas dashboard-canvas-state"
    data-tone="neutral"
  >
    <GymkidsSoftAurora
      tone="neutral"
      motion="ambient"
    />

    <section
      class="dashboard-shell dashboard-shell-state"
      aria-live="polite"
    >
      <header class="dashboard-header">
        <div class="brand-context">
          <img
            class="brand-logo"
            :src="gymkidsWhiteLogoUrl"
            alt="GYMKiDs"
          >
        </div>
      </header>

      <article
        class="dashboard-card data-load-card"
        :data-state="loadState"
      >
        <span>{{ loadState === 'error' ? 'Источник данных' : 'Дашборд центра' }}</span>
        <h1>{{ loadState === 'error' ? 'Не удалось загрузить данные' : 'Загружаем фактические показатели' }}</h1>
        <p>{{ loadState === 'error' ? loadError : 'Читаем каталог центров и опубликованный снимок периода.' }}</p>
        <button
          v-if="loadState === 'error'"
          type="button"
          @click="retry"
        >
          Повторить
        </button>
      </article>
    </section>
  </main>

  <main
    v-else
    class="dashboard-canvas"
    :data-static-cards="!focusMotionEnabled || undefined"
    :data-tone="dashboard.leads.tone"
  >
    <GymkidsSoftAurora
      :tone="dashboard.leads.tone"
      motion="interactive"
    />

    <section
      class="dashboard-shell"
      aria-label="Дашборд центра GYMKiDs"
    >
      <header class="dashboard-header">
        <div class="brand-context">
          <img
            class="brand-logo"
            :src="gymkidsWhiteLogoUrl"
            alt="GYMKiDs"
          >
        </div>

        <div class="screen-context">
          <div
            ref="centerPickerRef"
            class="center-picker"
          >
            <span
              id="center-picker-label"
              class="visually-hidden"
            >Центр</span>
            <button
              id="center-picker-button"
              ref="centerButtonRef"
              class="center-picker-trigger"
              :class="{ 'is-open': isCenterMenuOpen }"
              type="button"
              aria-haspopup="listbox"
              :aria-expanded="isCenterMenuOpen"
              aria-controls="center-picker-listbox"
              :aria-label="centerTriggerLabel"
              @click.stop="toggleCenterMenu"
              @keydown="handleCenterButtonKeydown"
            >
              <span>{{ selectedCenterLabel }}</span>
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="m4 6 4 4 4-4" />
              </svg>
            </button>

            <Transition name="center-menu-popover">
              <div
                v-if="isCenterMenuOpen"
                id="center-picker-listbox"
                ref="centerListboxRef"
                class="center-picker-listbox"
                role="listbox"
                tabindex="0"
                aria-labelledby="center-picker-label center-picker-button"
                :aria-activedescendant="activeCenterOptionId"
                @click.stop
                @keydown="handleCenterListboxKeydown"
              >
                <div
                  v-for="(center, centerIndex) in centers"
                  :id="centerOptionId(center.center_id)"
                  :key="center.center_id"
                  class="center-picker-option"
                  :class="{
                    'is-active': centerIndex === activeCenterIndex,
                    'is-selected': center.center_id === selectedCenterId,
                  }"
                  role="option"
                  :aria-selected="center.center_id === selectedCenterId"
                  @mouseenter="setActiveCenterIndex(centerIndex)"
                  @mousedown.prevent
                  @click="selectCenterOption(center.center_id)"
                >
                  <span>{{ center.display_name }}</span>
                  <svg
                    v-if="center.center_id === selectedCenterId"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path d="m3.5 8.25 2.75 2.75 6.25-6.25" />
                  </svg>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <div class="period-context">
          <div
            ref="periodPickerRef"
            class="period-picker"
          >
            <button
              ref="periodButtonRef"
              class="period-trigger"
              :class="{ 'is-open': isCalendarOpen }"
              type="button"
              aria-haspopup="dialog"
              :aria-expanded="isCalendarOpen"
              :aria-label="periodTriggerLabel"
              @click.stop="toggleCalendar"
            >
              <svg
                class="period-trigger-calendar"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7 3v3M17 3v3M4.5 9h15M6.5 5h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
              </svg>
              <span class="period-trigger-copy">
                <span>{{ dashboard.meta.periodLabel }}</span>
                <strong>{{ selectedDayLabel }}</strong>
              </span>
              <svg
                class="period-trigger-chevron"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="m4 6 4 4 4-4" />
              </svg>
            </button>

            <Transition name="calendar-popover">
              <section
                v-if="isCalendarOpen"
                class="calendar-popover"
                role="dialog"
                aria-label="Выбор даты отчёта"
              >
                <div class="calendar-heading">
                  <div>
                    <span>Дата отчёта</span>
                    <label class="period-select-label">
                      <span class="visually-hidden">Месяц отчёта</span>
                      <select
                        :value="selectedPeriod"
                        aria-label="Выбрать месяц"
                        @change="handlePeriodChange"
                      >
                        <option
                          v-for="period in periods"
                          :key="period.month"
                          :value="period.month"
                        >
                          {{ formatPeriodOption(period.month) }}
                        </option>
                      </select>
                    </label>
                  </div>
                  <span>Данные по {{ lastAvailableDateLabel }}</span>
                </div>

                <div
                  class="calendar-weekdays"
                  aria-hidden="true"
                >
                  <span
                    v-for="weekday in calendarWeekdays"
                    :key="weekday"
                  >{{ weekday }}</span>
                </div>

                <div
                  class="calendar-days"
                  role="grid"
                  :aria-label="dashboard.meta.periodLabel"
                >
                  <template
                    v-for="(day, index) in calendarCells"
                    :key="day ?? `empty-${index}`"
                  >
                    <span
                      v-if="day === null"
                      class="calendar-day-spacer"
                      aria-hidden="true"
                    />
                    <button
                      v-else
                      :id="calendarDayId(day)"
                      class="calendar-day"
                      :class="{
                        'is-selected': day === selectedDay,
                        'is-latest': day === availableThroughDay,
                      }"
                      type="button"
                      role="gridcell"
                      :disabled="day > availableThroughDay"
                      :aria-selected="day === selectedDay"
                      :aria-label="calendarDayLabel(day)"
                      :tabindex="day === selectedDay ? 0 : -1"
                      @click="selectReportDay(day)"
                      @keydown="handleCalendarDayKeydown($event, day)"
                    >
                      {{ day }}
                    </button>
                  </template>
                </div>

                <footer class="calendar-footer">
                  <span aria-live="polite">Выбрано: <b>{{ selectedDateLabel }}</b></span>
                  <button
                    type="button"
                    @click="selectReportDay(availableThroughDay)"
                  >
                    Последние данные
                  </button>
                </footer>
              </section>
            </Transition>
            <span
              class="data-freshness"
              aria-live="polite"
            >Демо-данные · {{ dataFreshnessLabel }}</span>
          </div>
        </div>
      </header>

      <section
        v-if="planGateEnabled && !dashboard.meta.planReady"
        class="plan-required-card"
        role="status"
        aria-live="polite"
      >
        <span>Доступ к дашборду</span>
        <h1>Сначала заполните план на {{ dashboard.meta.periodLabel.toLowerCase() }}</h1>
        <p>{{ dashboard.meta.planNote }}. После утверждения плана показатели откроются автоматически.</p>
        <div>
          <strong>{{ dashboard.meta.centerName }}</strong>
          <small>{{ dashboard.meta.periodLabel }}</small>
        </div>
      </section>

      <template v-else>
        <aside
          v-if="mcpPreviewRequested"
          class="mcp-preview-banner"
          :data-state="mcpPreviewState === 'applied' && !mcpPreviewMatchesSelection ? 'paused' : mcpPreviewState"
          role="status"
          aria-live="polite"
        >
          <strong>{{ ownerReviewRequested ? 'Owner preview' : 'MCP preview' }}</strong>
          <span>{{ mcpPreviewStatusLabel }}</span>
        </aside>

        <div
          ref="bentoStageRef"
          class="bento-stage"
          :data-view="settledBentoView"
          :data-phase="bentoTransitionPhase"
          :data-spatial-view="isSpatialConversionView ? 'conversion' : isSpatialSiteView ? 'site' : undefined"
          :data-spatial-busy="spatialReflowIsBusy || undefined"
          :data-spatial-phase="spatialMotionPhase !== 'idle' ? spatialMotionPhase : undefined"
          :data-spatial-direction="spatialMotionDirection !== 'idle' ? spatialMotionDirection : undefined"
        >
          <div
            class="bento-layer bento-overview-layer"
            :aria-hidden="!overviewLayerIsActive || bentoTransitionPhase !== 'idle'"
            :inert="!overviewLayerIsActive || bentoTransitionPhase !== 'idle'"
          >
            <div
              class="dashboard-grid"
              :data-expanded="focusMotionEnabled ? undefined : siteGridIsExpanded ? 'site' : spatialGridIsExpanded ? 'conversion' : undefined"
              :data-focus-motion="focusMotionEnabled || undefined"
              :data-focus-active="focusMotionIsActive || undefined"
              :data-focus-phase="focusMotionEnabled ? focusMotionPhase : undefined"
            >
              <article
                v-show="mcpVisible('main.plan-fact')"
                class="dashboard-card lead-card"
                :class="mcpLayoutClass('main.plan-fact')"
                data-gk-block="main.plan-fact"
                :data-focus-card="focusMotionEnabled ? 1 : undefined"
                :data-focus-role="focusMotionRoleFor(1)"
                :data-focus-w="focusMotionRectFor(1)?.w"
                :data-focus-h="focusMotionRectFor(1)?.h"
                :style="focusMotionStyleFor(1)"
                :data-demo-state="previewState"
                :data-tone="dashboard.leads.tone"
              >
                <div class="card-heading card-heading-inverse">
                  <div>
                    <h2 data-gk-copy="title">
                      {{ mcpTitle('main.plan-fact', 'Лиды на сегодня') }}
                    </h2>
                  </div>
                  <b class="lead-status">{{ dashboard.leads.forecastRateLabel }} к плану</b>
                </div>

                <div class="lead-story">
                  <div class="lead-primary">
                    <div class="lead-number">
                      <strong>{{ dashboard.leads.factLabel }}</strong>
                      <span>из {{ dashboard.leads.planLabel }}<small>план месяца</small></span>
                    </div>
                    <p class="lead-daily-metrics">
                      <span>План: <b>{{ dashboard.leads.dailyPlanLabel }}</b></span>
                      <span>Факт: <b>{{ dashboard.leads.dailyFactLabel }}</b><small>лида в день</small></span>
                    </p>
                  </div>
                </div>

                <div
                  class="lead-chart"
                  role="img"
                  :style="{ '--plan-line': `${dashboard.leads.chart[0]?.planHeight ?? 0}%` }"
                  :aria-label="`Лиды по ${dashboard.meta.daysInPeriod} дням месяца: ${dashboard.meta.elapsedDays} прошедших дней заполнены фактом, ${dashboard.meta.daysInPeriod - dashboard.meta.elapsedDays} будущих дней показаны контуром. План ${dashboard.leads.dailyPlanLabel}, факт ${dashboard.leads.dailyFactLabel} лида в день.`"
                >
                  <div class="lead-chart-plot">
                    <div
                      v-for="(bar, barIndex) in dashboard.leads.chart"
                      :key="bar.day"
                      class="lead-day"
                      :data-state="bar.state"
                      :style="{
                        '--day-height': `${bar.displayHeight}%`,
                        '--day-delay': `${barIndex * 18}ms`,
                        '--day-rise-first': `${2 + barIndex % 3}%`,
                        '--day-fall-first': `${1 + barIndex % 3}%`,
                        '--day-rise-second': `${2 + (barIndex + 1) % 3}%`,
                        '--day-fall-second': `${1 + (barIndex + 1) % 3}%`,
                      }"
                      aria-hidden="true"
                    >
                      <i class="day-bar" />
                      <span
                        v-if="bar.state === 'elapsed' && bar.value !== null"
                        class="lead-day-tooltip"
                        aria-hidden="true"
                      >
                        {{ leadDayTooltipLabel(bar.day, bar.value) }}
                      </span>
                    </div>
                  </div>
                </div>

                <GymkidsDemoState
                  v-if="previewState !== 'ready'"
                  :state="previewState"
                  label="Лиды и план"
                />
              </article>

              <article
                class="dashboard-card forecast-card"
                :data-focus-card="focusMotionEnabled ? 5 : undefined"
                :data-focus-role="focusMotionRoleFor(5)"
                :data-focus-w="focusMotionRectFor(5)?.w"
                :data-focus-h="focusMotionRectFor(5)?.h"
                :style="focusMotionStyleFor(5)"
                :data-demo-state="previewState"
                :data-tone="dashboard.leads.tone"
              >
                <div class="forecast-copy">
                  <span class="forecast-kicker">Прогноз месяца</span>
                  <h2>{{ forecastMessage.title }}</h2>

                  <div class="forecast-value">
                    <strong>{{ dashboard.leads.forecastLabel }}</strong>
                    <span>лидов</span>
                  </div>

                  <p>{{ forecastMessage.description }}</p>
                </div>

                <div class="forecast-facts">
                  <span>
                    <i
                      class="motion-border-trail"
                      aria-hidden="true"
                    ><i /></i>
                    <b>{{ dashboard.leads.forecastRateLabel }}</b> к плану
                  </span>
                  <span>
                    <i
                      class="motion-border-trail"
                      aria-hidden="true"
                    ><i /></i>
                    <b>{{ forecastDeltaLabel }}</b> {{ forecastDeltaCaption }}
                  </span>
                </div>

                <div
                  class="forecast-emblem"
                  aria-hidden="true"
                >
                  <small>{{ forecastDeltaPosition }}</small>
                  <strong>{{ forecastDeltaLabel }}</strong>
                </div>

                <div
                  class="forecast-scale"
                  role="img"
                  :aria-label="`Шкала от 0 до ${dashboard.leads.scaleMax} лидов: план ${dashboard.leads.planLabel}, прогноз ${dashboard.leads.forecastLabel}`"
                >
                  <div class="forecast-scale-head">
                    <span>План <b>{{ dashboard.leads.planLabel }}</b></span>
                    <span>Прогноз <b>{{ dashboard.leads.forecastLabel }}</b></span>
                  </div>
                  <div class="forecast-track">
                    <i :style="{ inlineSize: `${dashboard.leads.forecastPosition}%` }" />
                    <b :style="{ insetInlineStart: `${dashboard.leads.planPosition}%` }" />
                    <em :style="{ insetInlineStart: `${dashboard.leads.forecastPosition}%` }" />
                  </div>
                  <div class="forecast-axis">
                    <span>0</span><span>{{ dashboard.leads.scaleMax }} лидов</span>
                  </div>
                </div>

                <GymkidsDemoState
                  v-if="previewState !== 'ready'"
                  :state="previewState"
                  label="Прогноз месяца"
                />
              </article>

              <article
                v-show="mcpVisible('main.lead-sources')"
                class="dashboard-card motion-card sources-card"
                :class="[mcpLayoutClass('main.lead-sources'), { 'is-source-bars-animating': sourceBarsAnimating }]"
                data-gk-block="main.lead-sources"
                :data-focus-card="focusMotionEnabled ? 2 : undefined"
                :data-focus-role="focusMotionRoleFor(2)"
                :data-focus-w="focusMotionRectFor(2)?.w"
                :data-focus-h="focusMotionRectFor(2)?.h"
                :data-source-expanded="sourceListExpanded"
                :style="focusMotionStyleFor(2)"
                :data-demo-state="previewState"
                @mouseenter="startCardHoverEffects('sources')"
                @mouseleave="finishCardHoverEffects('sources')"
              >
                <span
                  class="motion-border-trail"
                  aria-hidden="true"
                ><i /></span>

                <div class="card-heading">
                  <div>
                    <h2
                      class="motion-title"
                      data-gk-copy="title"
                    >
                      {{ mcpTitle('main.lead-sources', 'Откуда пришли лиды') }}
                    </h2>
                  </div>
                  <div class="card-total">
                    <strong
                      class="motion-primary motion-shimmer"
                      :data-shimmer-text="dashboard.leads.factLabel"
                    >{{ dashboard.leads.factLabel }}</strong><span>всего</span>
                  </div>
                </div>

                <div
                  class="source-head"
                  aria-hidden="true"
                >
                  <span>Канал</span><span>Объём</span><span>Лиды</span><span>Доля</span>
                </div>

                <div class="source-list">
                  <div
                    v-for="(source, sourceIndex) in compactLeadSourceRows"
                    :key="source.key"
                    class="source-row"
                    :data-tone="source.tone"
                  >
                    <span :title="source.label">{{ sourceSummaryLabel(source.label) }}</span>
                    <i class="source-track"><b :style="{ 'inlineSize': `${source.share}%`, '--source-delay': `${sourceIndex * 80}ms` }" /></i>
                    <strong>{{ formatAnimatedInteger(source.fact, 'sources') }}</strong>
                    <em>{{ source.shareLabel }}</em>
                  </div>
                </div>

                <GymkidsDemoState
                  v-if="previewState !== 'ready'"
                  :state="previewState"
                  label="Источники лидов"
                />

                <button
                  v-if="focusMotionEnabled"
                  class="card-open-trigger"
                  type="button"
                  data-bento-open="sources"
                  :disabled="previewState !== 'ready' || bentoIsBusy"
                  :aria-label="focusMotionEnabled ? focusCardAriaLabel(2) : 'Открыть внутреннюю страницу «Откуда пришли лиды»'"
                  :aria-pressed="focusMotionEnabled ? focusMotionSelectedId === 2 : undefined"
                  @click="openBentoDetail('sources')"
                />
              </article>

              <article
                v-show="mcpVisible('main.trial-cohorts')"
                class="dashboard-card motion-card trial-card conversion-card"
                :class="mcpLayoutClass('main.trial-cohorts')"
                data-gk-block="main.trial-cohorts"
                data-spatial-card="conversion"
                :data-focus-card="focusMotionEnabled ? 3 : undefined"
                :data-focus-role="focusMotionRoleFor(3)"
                :data-focus-w="focusMotionRectFor(3)?.w"
                :data-focus-h="focusMotionRectFor(3)?.h"
                :data-conversion-expanded="conversionFunnelExpanded"
                :style="focusMotionStyleFor(3)"
                :data-demo-state="previewState"
                @mouseenter="startCardHoverEffects('trial')"
                @mouseleave="finishCardHoverEffects('trial')"
              >
                <div class="conversion-card-summary">
                  <span
                    class="motion-border-trail"
                    aria-hidden="true"
                  ><i /></span>

                  <div class="card-heading compact-heading">
                    <div>
                      <h2
                        class="motion-title"
                        data-gk-copy="title"
                      >
                        {{ mcpTitle('main.trial-cohorts', 'Конверсия') }}
                      </h2>
                    </div>
                  </div>

                  <div class="trial-value">
                    <strong
                      class="motion-primary motion-shimmer"
                      :data-shimmer-text="trialsPerHundredLeadsLabel"
                    >{{ trialsPerHundredLeadsLabel }}</strong>
                    <span>Пробных к<br>лидам</span>
                  </div>

                  <div
                    class="conversion-flow"
                    :title="!dashboard.trial.available ? dashboard.trial.coverageNote : dashboard.leads.fact ? undefined : 'За выбранный период нет новых лидов.'"
                  >
                    <span><b>{{ dashboard.trial.available ? formatAnimatedInteger(dashboard.trial.reached, 'trial') : '—' }}</b><small>пробных</small></span>
                    <i aria-hidden="true">÷</i>
                    <span><b>{{ formatAnimatedInteger(dashboard.leads.fact, 'trial') }}</b><small>новых лидов</small></span>
                  </div>

                  <div
                    v-if="focusMotionEnabled"
                    class="conversion-funnel"
                    :aria-hidden="!conversionFunnelExpanded"
                    :inert="!conversionFunnelExpanded"
                  >
                    <div
                      class="conversion-funnel__route"
                      role="img"
                      :aria-label="`Когорта: ${dashboard.leads.fact} лидов, ${dashboard.quality.valid} валидных, из валидных записаны ${dashboard.cohort.validScheduled ?? 'нет данных'}, дошли ${dashboard.cohort.validReached ?? 'нет данных'}`"
                    >
                      <template
                        v-for="(stage, index) in conversionFunnelStages"
                        :key="stage.key"
                      >
                        <span class="conversion-funnel__station">
                          <small>{{ stage.label }}</small>
                          <b>{{ stage.value === null ? '—' : stage.value.toLocaleString('ru-RU') }}</b>
                          <i aria-hidden="true" />
                        </span>
                        <span
                          v-if="index < conversionFunnelStages.length - 1"
                          class="conversion-funnel__link"
                          :data-available="stage.rateToNext !== '—'"
                          aria-hidden="true"
                        >
                          <em>{{ stage.rateToNext }}</em>
                          <i />
                        </span>
                      </template>
                    </div>
                    <p class="conversion-funnel__note">
                      Переходы рассчитаны среди валидных лидов выбранного месяца.
                    </p>
                  </div>
                </div>

                <BentoConversionReflow
                  v-if="isSpatialConversionView && (spatialGridIsExpanded || spatialReflowIsBusy)"
                  :dashboard="dashboard"
                  @close="closeBentoDetail"
                  @open-path="openBentoDetail('path')"
                />

                <GymkidsDemoState
                  v-if="previewState !== 'ready'"
                  :state="previewState"
                  label="Конверсия до пробного"
                />

                <button
                  v-if="focusMotionEnabled && !isSpatialConversionView"
                  class="card-open-trigger"
                  type="button"
                  data-bento-open="conversion"
                  :disabled="previewState !== 'ready' || bentoIsBusy"
                  :aria-label="focusMotionEnabled ? focusCardAriaLabel(3) : 'Раскрыть путь лидов к пробному'"
                  :aria-pressed="focusMotionEnabled ? focusMotionSelectedId === 3 : undefined"
                  @click="openBentoDetail('conversion')"
                />
              </article>

              <article
                v-show="mcpVisible('main.funnel-validity')"
                class="dashboard-card motion-card quality-card"
                :class="mcpLayoutClass('main.funnel-validity')"
                data-gk-block="main.funnel-validity"
                data-spatial-card="validity"
                :data-focus-card="focusMotionEnabled ? 4 : undefined"
                :data-focus-role="focusMotionRoleFor(4)"
                :data-focus-w="focusMotionRectFor(4)?.w"
                :data-focus-h="focusMotionRectFor(4)?.h"
                :style="focusMotionStyleFor(4)"
                :data-demo-state="previewState"
                @mouseenter="startCardHoverEffects('quality')"
                @mouseleave="finishCardHoverEffects('quality')"
              >
                <span
                  class="motion-border-trail"
                  aria-hidden="true"
                ><i /></span>

                <div class="card-heading compact-heading">
                  <div>
                    <h2
                      class="motion-title quality-title-static"
                      data-gk-copy="title"
                    >
                      {{ mcpTitle('main.funnel-validity', 'Валидность') }}
                    </h2>
                  </div>
                </div>

                <div class="quality-value">
                  <strong
                    class="motion-primary motion-shimmer quality-primary-rate"
                    :data-shimmer-text="dashboard.quality.validRateLabel"
                  >{{ dashboard.quality.validRateLabel }}</strong>
                  <span>валидных<br>заявок</span>
                </div>

                <div
                  class="quality-bar"
                  role="img"
                  :aria-label="`${dashboard.quality.validRateLabel} валидных, ${dashboard.quality.invalidRateLabel} невалидных, ${dashboard.quality.inWorkRateLabel} в работе или без статуса`"
                >
                  <i
                    class="quality-valid"
                    :style="{ inlineSize: `${dashboard.quality.validRate}%` }"
                  />
                  <i
                    class="quality-invalid"
                    :style="{ inlineSize: `${dashboard.quality.invalidRate}%` }"
                  />
                  <i
                    class="quality-work"
                    :style="{ inlineSize: `${dashboard.quality.inWorkRate}%` }"
                  />
                </div>

                <div class="quality-states">
                  <span><b>{{ formatAnimatedInteger(dashboard.quality.valid) }}</b> валидные</span>
                  <span><b>{{ formatAnimatedInteger(dashboard.quality.invalid) }}</b> невалидные</span>
                  <span><b>{{ formatAnimatedInteger(dashboard.quality.inWork) }}</b> в работе / без статуса</span>
                </div>

                <section
                  v-show="mcpVisible('main.invalid-reasons')"
                  class="quality-reasons quality-continuous-reasons"
                  data-gk-block="main.invalid-reasons"
                >
                  <header class="quality-continuous-heading">
                    <h3 data-gk-copy="title">
                      {{ mcpTitle('main.invalid-reasons', 'Почему заявки невалидны') }}
                    </h3>
                  </header>
                  <div class="reason-list">
                    <span
                      v-for="reason in compactInvalidReasonRows"
                      :key="reason.key"
                    >
                      <span>{{ reason.label }}</span><b>{{ formatAnimatedInteger(reason.value) }}</b><small>{{ formatAnimatedPercent(reason.share) }}</small>
                    </span>
                  </div>
                </section>

                <section
                  v-show="mcpVisible('main.current-stages')"
                  class="work-zone quality-continuous-crm"
                  data-gk-block="main.current-stages"
                >
                  <header class="quality-continuous-heading">
                    <h3 data-gk-copy="title">
                      {{ mcpTitle('main.current-stages', 'CRM-стадии выбранной когорты') }}
                    </h3>
                  </header>
                  <div class="work-list">
                    <span
                      v-for="stage in dashboard.quality.currentStages"
                      :key="stage.key"
                    ><i />{{ stage.label }} <b>{{ formatAnimatedInteger(stage.value) }}</b></span>
                  </div>
                </section>

                <GymkidsDemoState
                  v-if="previewState !== 'ready'"
                  :state="previewState"
                  label="Качество потока"
                />

                <button
                  v-if="focusMotionEnabled"
                  class="card-open-trigger"
                  type="button"
                  data-bento-open="validity"
                  :disabled="previewState !== 'ready' || bentoIsBusy"
                  :aria-label="focusMotionEnabled ? focusCardAriaLabel(4) : 'Открыть внутреннюю страницу «Валидность»'"
                  :aria-pressed="focusMotionEnabled ? focusMotionSelectedId === 4 : undefined"
                  @click="openBentoDetail('validity')"
                />
              </article>

              <article
                v-show="mcpVisible('main.site-leads')"
                class="dashboard-card motion-card channel-card site-card"
                :class="mcpLayoutClass('main.site-leads')"
                data-gk-block="main.site-leads"
                :data-site-expanded="siteDetailsExpanded"
                :data-focus-card="focusMotionEnabled ? 6 : undefined"
                :data-focus-role="focusMotionRoleFor(6)"
                :data-focus-w="focusMotionRectFor(6)?.w"
                :data-focus-h="focusMotionRectFor(6)?.h"
                :style="focusMotionStyleFor(6)"
                :data-demo-state="previewState"
                :data-source-key="featuredSourceCards[0]?.key"
                :data-tone="featuredSourceCards[0]?.tone ?? 'neutral'"
                @mouseenter="startCardHoverEffects('site')"
                @mouseleave="finishCardHoverEffects('site')"
              >
                <span
                  class="motion-border-trail"
                  aria-hidden="true"
                ><i /></span>

                <BentoSourceCardContent
                  :card="featuredSourceCards[0]!"
                  compact-funnel
                  :number-progress="motionNumberProgress.site"
                />

                <GymkidsDemoState
                  v-if="previewState !== 'ready'"
                  :state="previewState"
                  :label="featuredSourceCards[0]?.label"
                />

                <button
                  v-if="focusMotionEnabled"
                  class="card-open-trigger"
                  type="button"
                  data-bento-open="site"
                  :disabled="previewState !== 'ready' || bentoIsBusy"
                  :aria-label="focusMotionEnabled ? focusCardAriaLabel(6) : siteGridIsExpanded ? 'Свернуть карточку «Сайт»' : 'Развернуть карточку «Сайт» внутри дашборда'"
                  :aria-pressed="focusMotionEnabled ? focusMotionSelectedId === 6 : siteGridIsExpanded"
                  @click="openBentoDetail('site')"
                />
              </article>

              <article
                v-show="mcpVisible('main.promo-leads')"
                class="dashboard-card motion-card channel-card promo-card"
                :data-promo-expanded="promoDetailsExpanded"
                :class="mcpLayoutClass('main.promo-leads')"
                data-gk-block="main.promo-leads"
                data-spatial-card="promo"
                :data-focus-card="focusMotionEnabled ? 7 : undefined"
                :data-focus-role="focusMotionRoleFor(7)"
                :data-focus-w="focusMotionRectFor(7)?.w"
                :data-focus-h="focusMotionRectFor(7)?.h"
                :style="focusMotionStyleFor(7)"
                :data-demo-state="previewState"
                :data-source-key="featuredSourceCards[1]?.key"
                :data-tone="featuredSourceCards[1]?.tone ?? 'neutral'"
                @mouseenter="startCardHoverEffects('promo')"
                @mouseleave="finishCardHoverEffects('promo')"
              >
                <span
                  class="motion-border-trail"
                  aria-hidden="true"
                ><i /></span>

                <BentoSourceCardContent
                  :card="featuredSourceCards[1]!"
                  :number-progress="motionNumberProgress.promo"
                />

                <GymkidsDemoState
                  v-if="previewState !== 'ready'"
                  :state="previewState"
                  :label="featuredSourceCards[1]?.label"
                />

                <button
                  v-if="focusMotionEnabled"
                  class="card-open-trigger"
                  type="button"
                  data-bento-open="promo"
                  :disabled="previewState !== 'ready' || bentoIsBusy"
                  :aria-label="focusMotionEnabled ? focusCardAriaLabel(7) : 'Открыть внутреннюю страницу «Промо»'"
                  :aria-pressed="focusMotionEnabled ? focusMotionSelectedId === 7 : undefined"
                  @click="openBentoDetail('promo')"
                />
              </article>

              <article
                v-show="mcpVisible('main.source-quality')"
                class="dashboard-card motion-card trial-card trial-secondary-card"
                :class="mcpLayoutClass('main.source-quality')"
                data-gk-block="main.source-quality"
                data-spatial-card="trial"
                :data-trial-expanded="trialDetailsExpanded"
                :data-focus-card="focusMotionEnabled ? 8 : undefined"
                :data-focus-role="focusMotionRoleFor(8)"
                :data-focus-w="focusMotionRectFor(8)?.w"
                :data-focus-h="focusMotionRectFor(8)?.h"
                :style="focusMotionStyleFor(8)"
                :data-demo-state="previewState"
                @mouseenter="startCardHoverEffects('trialSecondary')"
                @mouseleave="finishCardHoverEffects('trialSecondary')"
              >
                <span
                  class="motion-border-trail"
                  aria-hidden="true"
                ><i /></span>

                <div class="card-heading compact-heading">
                  <div>
                    <h2
                      class="motion-title"
                      data-gk-copy="title"
                    >
                      {{ mcpTitle('main.source-quality', 'Пробное') }}
                    </h2>
                  </div>
                </div>

                <div class="trial-value">
                  <strong
                    class="motion-primary motion-shimmer"
                    :data-shimmer-text="dashboard.trial.attendanceRateLabel"
                  >{{ dashboard.trial.attendanceRateLabel }}</strong>
                  <span>доходимость<br>до пробного</span>
                </div>

                <div
                  class="trial-progress"
                  role="img"
                  :aria-label="`${dashboard.trial.attendanceRateLabel} записанных дошли до пробного`"
                >
                  <i :style="{ inlineSize: `${dashboard.trial.attendanceRate}%` }" />
                </div>

                <div
                  class="trial-outcome"
                  :title="dashboard.trial.coverageNote"
                  :aria-label="dashboard.trial.available ? `${dashboard.trial.scheduled} назначены на период, ${dashboard.trial.reached} дошли, ${dashboard.trial.noConfirmation} нет подтверждения` : dashboard.trial.coverageNote"
                >
                  <div class="trial-outcome-route">
                    <span><b>{{ dashboard.trial.available ? formatAnimatedInteger(dashboard.trial.scheduled, 'trialSecondary') : '—' }}</b><small>записаны</small></span>
                    <i aria-hidden="true">→</i>
                    <span><b>{{ dashboard.trial.available ? formatAnimatedInteger(dashboard.trial.reached, 'trialSecondary') : '—' }}</b><small>дошли</small></span>
                  </div>

                  <span class="trial-outcome-loss"><b>{{ dashboard.trial.available ? formatAnimatedInteger(dashboard.trial.noConfirmation, 'trialSecondary') : '—' }}</b><small>нет подтверждения</small></span>
                </div>

                <Transition name="trial-details-fade">
                  <BentoTrialDetails
                    v-if="trialDetailsExpanded"
                    :trial="dashboard.trial"
                    @close="openBentoDetail('trial')"
                  />
                </Transition>

                <GymkidsDemoState
                  v-if="previewState !== 'ready'"
                  :state="previewState"
                  label="Пробное"
                />

                <button
                  v-if="focusMotionEnabled"
                  class="card-open-trigger"
                  type="button"
                  data-bento-open="trial"
                  :disabled="previewState !== 'ready' || bentoIsBusy"
                  :aria-label="focusMotionEnabled ? focusCardAriaLabel(8) : 'Открыть внутреннюю страницу «Пробное»'"
                  :aria-pressed="focusMotionEnabled ? focusMotionSelectedId === 8 : undefined"
                  @click="openBentoDetail('trial')"
                />
              </article>

              <article
                class="dashboard-card motion-card path-card"
                :data-focus-card="focusMotionEnabled ? 9 : undefined"
                :data-focus-role="focusMotionRoleFor(9)"
                :data-focus-w="focusMotionRectFor(9)?.w"
                :data-focus-h="focusMotionRectFor(9)?.h"
                :style="focusMotionStyleFor(9)"
                :data-demo-state="previewState"
                :data-tone="dashboard.leads.tone"
                @mouseenter="startCardHoverEffects('path')"
                @mouseleave="finishCardHoverEffects('path')"
              >
                <span
                  class="motion-border-trail"
                  aria-hidden="true"
                ><i /></span>

                <div class="path-heading">
                  <div>
                    <h2 class="motion-title">
                      Путь до пробного
                    </h2>
                  </div>
                  <span class="path-heading-note">Лиды месяца · из валидных</span>
                </div>

                <div class="path-map">
                  <div
                    class="path-stage-head"
                    aria-hidden="true"
                  >
                    <span>Канал</span>
                    <div>
                      <span
                        v-for="stage in pathStages"
                        :key="stage.key"
                      >{{ stage.label }}</span>
                    </div>
                  </div>

                  <div
                    v-for="(source, sourceIndex) in compactPathSourceRows"
                    :key="source.key"
                    class="path-route-row"
                    :style="{ '--path-row-delay': `${sourceIndex * 2800}ms` }"
                  >
                    <strong :title="source.label">{{ pathSourceLabel(source.label) }}</strong>
                    <div
                      class="path-route"
                      role="img"
                      :aria-label="`${source.label}: ${source.fact} лидов, ${source.valid} валидных, ${source.scheduled} записанных, ${source.reached} дошли. Конверсия по переходам: ${pathTransitionRate(source, 0)}%, ${pathTransitionRate(source, 1)}%, ${pathTransitionRate(source, 2)}%`"
                    >
                      <template
                        v-for="(stage, stageIndex) in pathStages"
                        :key="stage.key"
                      >
                        <span
                          class="path-station"
                          :data-stage="stage.key"
                          :style="{ '--path-delay': `${150 + stageIndex * 600}ms` }"
                        >
                          <b>{{ pathStageValue(source, stage.key) }}</b>
                          <i aria-hidden="true" />
                        </span>

                        <span
                          v-if="stageIndex < pathStages.length - 1"
                          class="path-link"
                          :style="{ '--path-delay': `${280 + stageIndex * 600}ms` }"
                          aria-hidden="true"
                        >
                          <em>{{ pathTransitionRate(source, stageIndex) }}%</em>
                          <i />
                        </span>
                      </template>
                    </div>
                  </div>
                </div>

                <GymkidsDemoState
                  v-if="previewState !== 'ready'"
                  :state="previewState"
                  label="Путь до пробного"
                />

                <button
                  v-if="focusMotionEnabled"
                  class="card-open-trigger"
                  type="button"
                  data-bento-open="path"
                  :disabled="previewState !== 'ready' || bentoIsBusy"
                  :aria-label="focusMotionEnabled ? focusCardAriaLabel(9) : 'Открыть внутреннюю страницу «Путь до пробного»'"
                  :aria-pressed="focusMotionEnabled ? focusMotionSelectedId === 9 : undefined"
                  @click="openBentoDetail('path')"
                />
              </article>

              <button
                class="bento-card-scrim"
                type="button"
                :aria-hidden="!isSpatialConversionView"
                :tabindex="isSpatialConversionView ? 0 : -1"
                aria-label="Свернуть увеличенную карточку «Конверсия»"
                @click="closeBentoDetail"
              />
            </div>
          </div>

          <BentoSourcesDetail
            v-if="activeBentoDetail === 'sources'"
            :dashboard="dashboard"
            :aria-hidden="settledBentoView !== 'sources' || bentoTransitionPhase !== 'idle'"
            :inert="settledBentoView !== 'sources' || bentoTransitionPhase !== 'idle'"
            @close="closeBentoDetail"
          />
          <BentoMetricDetail
            v-else-if="!isSpatialConversionView"
            :key="activeBentoDetail"
            :dashboard="dashboard"
            :view="activeBentoDetail"
            :aria-hidden="settledBentoView !== activeBentoDetail || bentoTransitionPhase !== 'idle'"
            :inert="settledBentoView !== activeBentoDetail || bentoTransitionPhase !== 'idle'"
            @close="closeBentoDetail"
          />
        </div>
      </template>
    </section>
  </main>
</template>

<style scoped media="not all" src="../styles/history/bento-preview-historical.css"></style>

<style scoped src="../styles/bento-preview-v2.css"></style>

<style src="../styles/bento-detail-motion.css"></style>

<style src="/src/styles/bento-adaptive-grid.css"></style>

<style src="../styles/bento-mobile-fixes.css"></style>
