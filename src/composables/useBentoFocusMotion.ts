import { Flip } from 'gsap/Flip'
import { gsap } from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { closeBentoLayout } from '@/lib/bentoLayoutLifecycle'
import { bentoFocusLayoutFor } from '@/lib/bentoFocusLayouts'
import type { BentoFocusCardId, BentoFocusRect } from '@/lib/bentoFocusLayouts'
import { validityFocusLayout } from '@/lib/bentoValidityLayout'
import { createValidityTransition, validityRects } from '@/lib/bentoValidityTransition'
import { conversionFocusLayout } from '@/lib/bentoConversionLayout'
import { createConversionTransition } from '@/lib/bentoConversionTransition'
import { siteFocusLayout } from '@/lib/bentoSiteLayout'
import { createSiteTransition, freezeSiteDetails } from '@/lib/bentoSiteTransition'
import { promoFocusLayout } from '@/lib/bentoPromoLayout'
import { createPromoTransition, freezePromoDetails } from '@/lib/bentoPromoTransition'
import { sourcesFocusLayout } from '@/lib/bentoSourcesLayout'
import { createSourcesTransition, sourcesContentRects } from '@/lib/bentoSourcesTransition'
import { trialFocusLayout } from '@/lib/bentoTrialLayout'
import { createTrialTransition } from '@/lib/bentoTrialTransition'
import { freezeTrialDetails, trialContentRects } from '@/lib/bentoTrialContent'
import { pathFocusLayout } from '@/lib/bentoPathLayout'
import { createPathTransition } from '@/lib/bentoPathTransition'

gsap.registerPlugin(Flip)

export type BentoFocusPhase = 'overview' | 'animating' | 'focused'
export type BentoFocusRole = 'primary' | 'related' | 'ambient' | 'anchor'
export type { BentoFocusCardId } from '@/lib/bentoFocusLayouts'

interface UseBentoFocusMotionOptions {
  enabled: ComputedRef<boolean>
  stageRef: Ref<HTMLElement | null>
}

const interactiveCardIds: BentoFocusCardId[] = [2, 3, 4, 6, 7, 8, 9]

const relatedCards: Record<BentoFocusCardId, BentoFocusCardId[]> = {
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

export const useBentoFocusMotion = ({ enabled, stageRef }: UseBentoFocusMotionOptions) => {
  const selectedId = ref<BentoFocusCardId | null>(null)
  const phase = ref<BentoFocusPhase>('overview')
  const placements = ref<Record<BentoFocusCardId, BentoFocusRect> | null>(null)
  const compactViewport = ref(false)
  const diagnosticStaticLayout = ref(false)
  const forceReducedMotion = ref(false)
  const motionSpeed = ref(1)
  const isActive = computed(() => enabled.value && placements.value !== null)
  const isBusy = computed(() => enabled.value && phase.value === 'animating')
  let activeAnimation: gsap.core.Animation | null = null
  let compactMediaQuery: MediaQueryList | null = null
  let finishActiveAnimation: (() => void) | null = null
  let runEpoch = 0
  let validityLayoutIsActive = false
  let validityCloseRequested = false
  let conversionLayoutIsActive = false
  let conversionCloseRequested = false
  let siteLayoutIsActive = false
  let siteCloseRequested = false
  let siteHiddenPromo: { element: HTMLElement; inert: string | null; ariaHidden: string | null } | null = null
  let promoLayoutIsActive = false
  let promoCloseRequested = false
  let promoHiddenSite: { element: HTMLElement; inert: string | null; ariaHidden: string | null } | null = null
  let sourcesLayoutIsActive = false
  let sourcesCloseRequested = false
  let trialLayoutIsActive = false
  let trialCloseRequested = false
  let pathLayoutIsActive = false
  let pathCloseRequested = false
  let pathHiddenNodes: { element: HTMLElement; inert: string | null; ariaHidden: string | null }[] = []

  const clearPathLayout = () => {
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')

    if (grid) {
      delete grid.dataset.pathLayout
      grid.style.removeProperty('--path-overview-rows')
    }
    for (const { element, inert, ariaHidden } of pathHiddenNodes) {
      if (inert === null)
        element.removeAttribute('inert')
      else
        element.setAttribute('inert', inert)
      if (ariaHidden === null)
        element.removeAttribute('aria-hidden')
      else
        element.setAttribute('aria-hidden', ariaHidden)
    }
    pathHiddenNodes = []
    pathLayoutIsActive = false
    pathCloseRequested = false
  }

  const clearTrialLayout = () => {
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')

    if (grid) {
      delete grid.dataset.trialLayout
      grid.style.removeProperty('--trial-overview-rows')
      grid.style.removeProperty('--trial-copy-width')
    }
    trialLayoutIsActive = false
    trialCloseRequested = false
  }

  const clearSourcesLayout = () => {
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')

    if (grid) {
      delete grid.dataset.sourcesLayout
      grid.style.removeProperty('--sources-overview-rows')
    }
    sourcesLayoutIsActive = false
    sourcesCloseRequested = false
  }

  const clearPromoLayout = () => {
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')

    if (grid) {
      delete grid.dataset.promoLayout
      grid.style.removeProperty('--promo-overview-rows')
    }
    if (promoHiddenSite) {
      const { element, inert, ariaHidden } = promoHiddenSite
      if (inert === null)
        element.removeAttribute('inert')
      else
        element.setAttribute('inert', inert)
      if (ariaHidden === null)
        element.removeAttribute('aria-hidden')
      else
        element.setAttribute('aria-hidden', ariaHidden)
      promoHiddenSite = null
    }
    promoLayoutIsActive = false
    promoCloseRequested = false
  }

  const clearSiteLayout = () => {
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')

    if (grid) {
      delete grid.dataset.siteLayout
      grid.style.removeProperty('--site-overview-rows')
    }
    if (siteHiddenPromo) {
      const { element, inert, ariaHidden } = siteHiddenPromo
      if (inert === null)
        element.removeAttribute('inert')
      else
        element.setAttribute('inert', inert)
      if (ariaHidden === null)
        element.removeAttribute('aria-hidden')
      else
        element.setAttribute('aria-hidden', ariaHidden)
      siteHiddenPromo = null
    }
    siteLayoutIsActive = false
    siteCloseRequested = false
  }

  const clearConversionLayout = () => {
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')

    if (grid) {
      delete grid.dataset.conversionLayout
      grid.style.removeProperty('--conversion-overview-rows')
      grid.style.removeProperty('--conversion-copy-width')
    }
    conversionLayoutIsActive = false
    conversionCloseRequested = false
  }

  const clearValidityLayout = () => {
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')

    if (grid) {
      delete grid.dataset.validityLayout
      grid.style.removeProperty('--validity-overview-rows')
    }
    validityLayoutIsActive = false
    validityCloseRequested = false
  }

  const syncCompactViewport = (event?: MediaQueryListEvent) => {
    compactViewport.value = event?.matches ?? compactMediaQuery?.matches ?? false
  }

  const stopAnimation = () => {
    activeAnimation?.kill()
    activeAnimation = null
    finishActiveAnimation?.()
    finishActiveAnimation = null
  }

  const visibleCards = () => Array.from(
    stageRef.value?.querySelectorAll<HTMLElement>('.dashboard-grid > .dashboard-card[data-focus-card]') ?? [],
  ).filter(card => card.offsetParent !== null)

  const transitionCompletion = (restore: () => void, resolve: () => void) => {
    const finish = () => {
      restore()
      if (finishActiveAnimation === finish)
        finishActiveAnimation = null
      activeAnimation = null
      resolve()
    }

    return finish
  }

  const animateMutation = async (mutate: () => void) => {
    const epoch = ++runEpoch
    const cards = visibleCards()

    stopAnimation()

    if (cards.length === 0) {
      mutate()
      await nextTick()

      return epoch === runEpoch
    }

    const previousState = Flip.getState(cards)

    phase.value = 'animating'
    mutate()
    await nextTick()

    if (compactViewport.value || forceReducedMotion.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return epoch === runEpoch

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
        duration: 0.72 / motionSpeed.value,
        ease: 'power3.inOut',
        onComplete: finish,
        prune: true,
        scale: false,
        simple: true,
        stagger: 0.035 / motionSpeed.value,
      })
    })

    return epoch === runEpoch
  }

  const animateValidity = async (opening: boolean) => {
    const epoch = ++runEpoch
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')
    const cards = visibleCards()

    if (!grid || cards.length !== 9)
      return false

    stopAnimation()

    if (opening)
      grid.style.setProperty('--validity-overview-rows', getComputedStyle(grid).gridTemplateRows)

    grid.dataset.validityLayout = 'true'

    // Keep the entry animation disabled after returning, otherwise removing the
    // focus styles would replay it and make all nine cards jump on completion.
    grid.dataset.validityVisited = 'true'
    gsap.set(cards, { clearProps: 'transform,translate,rotate,scale' })

    const firstState = Flip.getState(cards)
    const firstRects = validityRects(cards, grid)

    validityLayoutIsActive = true
    phase.value = 'animating'
    placements.value = opening ? structuredClone(validityFocusLayout) : null
    await nextTick()

    const shouldAnimate = !compactViewport.value && !forceReducedMotion.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (shouldAnimate) {
      await new Promise<void>(resolve => {
        const { timeline, restore } = createValidityTransition({
          cards,
          grid,
          firstState,
          firstRects,
          opening,
          speed: motionSpeed.value,
          audit: import.meta.env.DEV && new URLSearchParams(window.location.search).get('motionAudit') === '1',
        })

        const finish = transitionCompletion(restore, resolve)

        finishActiveAnimation = finish
        activeAnimation = timeline
        timeline.eventCallback('onComplete', finish)
        timeline.play()
      })
    }
    else {
      const expansionDetails = grid.querySelectorAll<HTMLElement>('.quality-card .quality-expansion-only')

      gsap.set(expansionDetails, { autoAlpha: opening ? 1 : 0, y: 0 })
    }

    if (epoch !== runEpoch)
      return false

    if (!opening)
      clearValidityLayout()

    return true
  }

  const animateConversion = async (opening: boolean) => {
    const epoch = ++runEpoch
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')
    const cards = visibleCards()

    if (!grid || cards.length !== 9)
      return false

    stopAnimation()

    if (opening) {
      grid.style.setProperty('--conversion-overview-rows', getComputedStyle(grid).gridTemplateRows)

      const copy = grid.querySelector<HTMLElement>('.forecast-copy')!

      grid.style.setProperty('--conversion-copy-width', getComputedStyle(copy).width)
    }

    grid.dataset.conversionLayout = 'true'
    grid.dataset.conversionVisited = 'true'
    gsap.set(cards, { clearProps: 'transform,translate,rotate,scale' })

    const firstRects = validityRects(cards, grid)
    const firstEmblemInset = Number.parseFloat(getComputedStyle(grid.querySelector<HTMLElement>('.forecast-emblem')!).right)

    conversionLayoutIsActive = true
    phase.value = 'animating'
    placements.value = opening ? structuredClone(conversionFocusLayout) : null
    await nextTick()

    if (!compactViewport.value && !forceReducedMotion.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise<void>(resolve => {
        const { timeline, restore } = createConversionTransition({
          cards,
          grid,
          firstRects,
          firstEmblemInset,
          opening,
          speed: motionSpeed.value,
          audit: import.meta.env.DEV && new URLSearchParams(window.location.search).get('motionAudit') === '1',
        })

        const finish = transitionCompletion(restore, resolve)

        finishActiveAnimation = finish
        activeAnimation = timeline
        timeline.eventCallback('onComplete', finish)
        timeline.play()
      })
    }

    if (epoch !== runEpoch)
      return false
    if (!opening)
      clearConversionLayout()

    return true
  }

  const animateSite = async (opening: boolean) => {
    const epoch = ++runEpoch
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')
    const cards = visibleCards()

    if (!grid || cards.length !== 9)
      return false

    stopAnimation()

    if (opening) {
      grid.style.setProperty('--site-overview-rows', getComputedStyle(grid).gridTemplateRows)

      const promo = grid.querySelector<HTMLElement>('.promo-card')!

      siteHiddenPromo = { element: promo, inert: promo.getAttribute('inert'), ariaHidden: promo.getAttribute('aria-hidden') }
      promo.setAttribute('inert', '')
      promo.setAttribute('aria-hidden', 'true')
    }

    grid.dataset.siteLayout = 'true'
    grid.dataset.siteVisited = 'true'

    const firstRects = validityRects(cards, grid)
    const chartStyle = getComputedStyle(grid.querySelector<HTMLElement>('.lead-chart')!)
    const firstChartHeight = Number.parseFloat(chartStyle.height)
    const firstChartOpacity = Number.parseFloat(chartStyle.opacity)

    siteLayoutIsActive = true
    phase.value = 'animating'
    if (!opening)
      freezeSiteDetails(cards.find(card => card.dataset.focusCard === '6')!)
    placements.value = opening ? structuredClone(siteFocusLayout) : null
    await nextTick()

    if (!compactViewport.value && !forceReducedMotion.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise<void>(resolve => {
        const { timeline, restore } = createSiteTransition({
          cards,
          grid,
          firstRects,
          firstChartHeight,
          firstChartOpacity,
          opening,
          speed: motionSpeed.value,
          audit: import.meta.env.DEV && new URLSearchParams(window.location.search).get('motionAudit') === '1',
        })

        const finish = transitionCompletion(restore, resolve)

        finishActiveAnimation = finish
        activeAnimation = timeline
        timeline.eventCallback('onComplete', finish)
        timeline.play()
      })
    }

    if (epoch !== runEpoch)
      return false
    if (!opening)
      clearSiteLayout()

    return true
  }

  const animatePromo = async (opening: boolean) => {
    const epoch = ++runEpoch
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')
    const cards = visibleCards()

    if (!grid || cards.length !== 9)
      return false

    stopAnimation()

    if (opening) {
      const gridStyle = getComputedStyle(grid)

      grid.style.setProperty('--promo-overview-rows', gridStyle.gridTemplateRows)

      const site = grid.querySelector<HTMLElement>('.site-card')!

      promoHiddenSite = { element: site, inert: site.getAttribute('inert'), ariaHidden: site.getAttribute('aria-hidden') }
      site.setAttribute('inert', '')
      site.setAttribute('aria-hidden', 'true')
    }

    grid.dataset.promoLayout = 'true'
    grid.dataset.promoVisited = 'true'
    gsap.set(cards, { clearProps: 'transform,translate,rotate,scale' })

    const firstRects = validityRects(cards, grid)
    const chartStyle = getComputedStyle(grid.querySelector<HTMLElement>('.lead-chart')!)
    const firstChartHeight = Number.parseFloat(chartStyle.height)
    const firstChartOpacity = Number.parseFloat(chartStyle.opacity)

    promoLayoutIsActive = true
    phase.value = 'animating'
    if (!opening)
      freezePromoDetails(cards.find(card => card.dataset.focusCard === '7')!)
    placements.value = opening ? structuredClone(promoFocusLayout) : null
    await nextTick()

    if (!compactViewport.value && !forceReducedMotion.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise<void>(resolve => {
        const { timeline, restore } = createPromoTransition({
          cards,
          grid,
          firstRects,
          firstChartHeight,
          firstChartOpacity,
          opening,
          speed: motionSpeed.value,
          audit: import.meta.env.DEV && new URLSearchParams(window.location.search).get('motionAudit') === '1',
        })

        const finish = transitionCompletion(restore, resolve)

        finishActiveAnimation = finish
        activeAnimation = timeline
        timeline.eventCallback('onComplete', finish)
        timeline.play()
      })
    }

    if (epoch !== runEpoch)
      return false
    if (!opening)
      clearPromoLayout()

    return true
  }

  const animateSources = async (opening: boolean) => {
    const epoch = ++runEpoch
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')
    const cards = visibleCards()

    if (!grid || cards.length !== 9)
      return false

    stopAnimation()

    if (opening)
      grid.style.setProperty('--sources-overview-rows', getComputedStyle(grid).gridTemplateRows)

    grid.dataset.sourcesLayout = 'true'
    grid.dataset.sourcesVisited = 'true'
    gsap.set(cards, { clearProps: 'transform,translate,rotate,scale' })

    const firstRects = validityRects(cards, grid)
    const firstContent = sourcesContentRects(grid)

    sourcesLayoutIsActive = true
    phase.value = 'animating'
    placements.value = opening ? structuredClone(sourcesFocusLayout) : null
    await nextTick()

    if (!compactViewport.value && !forceReducedMotion.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise<void>(resolve => {
        const { timeline, restore } = createSourcesTransition({
          cards,
          grid,
          firstRects,
          firstContent,
          opening,
          speed: motionSpeed.value,
          audit: import.meta.env.DEV && new URLSearchParams(window.location.search).get('motionAudit') === '1',
        })

        const finish = transitionCompletion(restore, resolve)

        finishActiveAnimation = finish
        activeAnimation = timeline
        timeline.eventCallback('onComplete', finish)
        timeline.play()
      })
    }

    if (epoch !== runEpoch)
      return false
    if (!opening)
      clearSourcesLayout()

    return true
  }

  const animateTrial = async (opening: boolean) => {
    const epoch = ++runEpoch
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')
    const cards = visibleCards()

    if (!grid || cards.length !== 9)
      return false

    stopAnimation()

    if (opening) {
      grid.style.setProperty('--trial-overview-rows', getComputedStyle(grid).gridTemplateRows)
      grid.style.setProperty('--trial-copy-width', getComputedStyle(grid.querySelector<HTMLElement>('.forecast-copy')!).width)
    }

    grid.dataset.trialLayout = 'true'
    grid.dataset.trialVisited = 'true'
    gsap.set(cards, { clearProps: 'transform,translate,rotate,scale' })

    const firstRects = validityRects(cards, grid)
    const firstEmblemInset = Number.parseFloat(getComputedStyle(grid.querySelector<HTMLElement>('.forecast-emblem')!).right)

    const primary = cards.find(card => card.dataset.focusCard === '8')!
    const firstTrialContent = opening ? null : trialContentRects(primary)

    if (!opening)
      freezeTrialDetails(primary)

    trialLayoutIsActive = true
    phase.value = 'animating'
    placements.value = opening ? structuredClone(trialFocusLayout) : null
    await nextTick()

    if (!compactViewport.value && !forceReducedMotion.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise<void>(resolve => {
        const { timeline, restore } = createTrialTransition({
          cards,
          grid,
          firstRects,
          firstEmblemInset,
          firstTrialContent,
          opening,
          speed: motionSpeed.value,
          audit: import.meta.env.DEV && new URLSearchParams(window.location.search).get('motionAudit') === '1',
        })

        const finish = transitionCompletion(restore, resolve)

        finishActiveAnimation = finish
        activeAnimation = timeline
        timeline.eventCallback('onComplete', finish)
        timeline.play()
      })
    }

    if (epoch !== runEpoch)
      return false
    if (!opening)
      clearTrialLayout()

    return true
  }

  const animatePath = async (opening: boolean) => {
    const epoch = ++runEpoch
    const grid = stageRef.value?.querySelector<HTMLElement>('.dashboard-grid')
    const cards = visibleCards()

    if (!grid || cards.length !== 9)
      return false

    stopAnimation()

    if (opening) {
      grid.style.setProperty('--path-overview-rows', getComputedStyle(grid).gridTemplateRows)
      pathHiddenNodes = Array.from(grid.querySelectorAll<HTMLElement>('.trial-secondary-card, .work-zone, .forecast-copy p, .forecast-facts')).map(element => ({
        element, inert: element.getAttribute('inert'), ariaHidden: element.getAttribute('aria-hidden'),
      }))
      for (const { element } of pathHiddenNodes) {
        element.setAttribute('inert', '')
        element.setAttribute('aria-hidden', 'true')
      }
    }

    grid.dataset.pathLayout = 'true'
    grid.dataset.pathVisited = 'true'
    gsap.set(cards, { clearProps: 'transform,translate,rotate,scale' })

    const firstRects = validityRects(cards, grid)
    const firstEmblemTop = Number.parseFloat(getComputedStyle(grid.querySelector<HTMLElement>('.forecast-emblem')!).top)
    const firstScaleLeft = Number.parseFloat(getComputedStyle(grid.querySelector<HTMLElement>('.forecast-scale')!).left)

    pathLayoutIsActive = true
    phase.value = 'animating'
    placements.value = opening ? structuredClone(pathFocusLayout) : null
    await nextTick()

    if (!compactViewport.value && !forceReducedMotion.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise<void>(resolve => {
        const { timeline, restore } = createPathTransition({
          cards,
          grid,
          firstRects,
          firstEmblemTop,
          firstScaleLeft,
          opening,
          speed: motionSpeed.value,
          audit: import.meta.env.DEV && new URLSearchParams(window.location.search).get('motionAudit') === '1',
        })

        const finish = transitionCompletion(restore, resolve)

        finishActiveAnimation = finish
        activeAnimation = timeline
        timeline.eventCallback('onComplete', finish)
        timeline.play()
      })
    }

    if (epoch !== runEpoch)
      return false
    if (!opening)
      clearPathLayout()

    return true
  }

  // Priority matches the previous reset branches; each transition keeps its geometry and cleanup.
  const closingLayouts = [
    {
      id: 9,
      isActive: () => pathLayoutIsActive,
      closeRequested: () => pathCloseRequested,
      requestClose: (requested: boolean) => { pathCloseRequested = requested },
      animate: animatePath,
    },
    {
      id: 8,
      isActive: () => trialLayoutIsActive,
      closeRequested: () => trialCloseRequested,
      requestClose: (requested: boolean) => { trialCloseRequested = requested },
      animate: animateTrial,
    },
    {
      id: 2,
      isActive: () => sourcesLayoutIsActive,
      closeRequested: () => sourcesCloseRequested,
      requestClose: (requested: boolean) => { sourcesCloseRequested = requested },
      animate: animateSources,
    },
    {
      id: 7,
      isActive: () => promoLayoutIsActive,
      closeRequested: () => promoCloseRequested,
      requestClose: (requested: boolean) => { promoCloseRequested = requested },
      animate: animatePromo,
    },
    {
      id: 6,
      isActive: () => siteLayoutIsActive,
      closeRequested: () => siteCloseRequested,
      requestClose: (requested: boolean) => { siteCloseRequested = requested },
      animate: animateSite,
    },
    {
      id: 3,
      isActive: () => conversionLayoutIsActive,
      closeRequested: () => conversionCloseRequested,
      requestClose: (requested: boolean) => { conversionCloseRequested = requested },
      animate: animateConversion,
    },
    {
      id: 4,
      isActive: () => validityLayoutIsActive,
      closeRequested: () => validityCloseRequested,
      requestClose: (requested: boolean) => { validityCloseRequested = requested },
      animate: animateValidity,
    },
  ]

  const clearFocusLayouts = () => {
    clearValidityLayout()
    clearConversionLayout()
    clearSiteLayout()
    clearPromoLayout()
    clearSourcesLayout()
    clearTrialLayout()
    clearPathLayout()
  }

  const reset = async (animate = true) => {
    if (!enabled.value || (!selectedId.value && !placements.value))
      return

    if (!animate) {
      runEpoch += 1
      stopAnimation()
      clearFocusLayouts()
      selectedId.value = null
      placements.value = null
      phase.value = 'overview'

      return
    }

    const activeLayout = closingLayouts.find(layout => layout.isActive())

    if (activeLayout) {
      await closeBentoLayout(activeLayout, isBusy.value, () => {
        selectedId.value = null
        phase.value = 'overview'
      })

      return
    }

    selectedId.value = null

    if (await animateMutation(() => {
      placements.value = null
    }))
      phase.value = 'overview'
  }

  const open = async (id: BentoFocusCardId) => {
    if (!enabled.value || isBusy.value || !interactiveCardIds.includes(id))
      return

    selectedId.value = id

    const layout = closingLayouts.find(candidate => candidate.id === id)

    if (layout && window.matchMedia('(min-width: 1180px)').matches && visibleCards().length === 9) {
      if (await layout.animate(true)) {
        phase.value = 'focused'
        if (layout.closeRequested())
          await reset()
      }

      return
    }

    if (await animateMutation(() => {
      placements.value = bentoFocusLayoutFor(id)
    }))
      phase.value = 'focused'
  }

  const toggle = async (id: BentoFocusCardId) => {
    if (!enabled.value || isBusy.value || !interactiveCardIds.includes(id))
      return

    if (selectedId.value) {
      await reset()

      return
    }

    await open(id)
  }

  const roleFor = (id: BentoFocusCardId): BentoFocusRole | undefined => {
    if (!enabled.value || !selectedId.value)
      return undefined

    if (selectedId.value === id)
      return 'primary'

    if (relatedCards[selectedId.value].includes(id))
      return 'related'

    if (id === 1 || id === 5)
      return 'anchor'

    return 'ambient'
  }

  const rectFor = (id: BentoFocusCardId) => placements.value?.[id]

  const styleFor = (id: BentoFocusCardId) => {
    const rect = rectFor(id)

    if (!enabled.value || compactViewport.value || diagnosticStaticLayout.value || !rect)
      return undefined

    return {
      '--bento-focus-column': `${rect.x + 1} / span ${rect.w}`,
      '--bento-focus-row': `${rect.y + 1} / span ${Math.max(1, rect.h)}`,
    }
  }

  const handleResize = () => {
    if (validityLayoutIsActive || conversionLayoutIsActive || siteLayoutIsActive || promoLayoutIsActive || sourcesLayoutIsActive || trialLayoutIsActive || pathLayoutIsActive)
      void reset(false)
  }

  onMounted(() => {
    const diagnostics = import.meta.env.DEV ? new URLSearchParams(window.location.search) : null

    diagnosticStaticLayout.value = diagnostics?.get('motionFault') === 'static'
    forceReducedMotion.value = diagnostics?.get('motionReduced') === '1'
    motionSpeed.value = diagnostics?.get('motionSpeed') === '0.2' ? 0.2 : 1
    compactMediaQuery = window.matchMedia('(max-width: 820px)')
    syncCompactViewport()
    compactMediaQuery.addEventListener('change', syncCompactViewport)
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    runEpoch += 1
    stopAnimation()
    clearFocusLayouts()
    compactMediaQuery?.removeEventListener('change', syncCompactViewport)
    window.removeEventListener('resize', handleResize)
  })

  return {
    isActive,
    isBusy,
    phase,
    rectFor,
    reset,
    roleFor,
    selectedId,
    styleFor,
    toggle,
  }
}
