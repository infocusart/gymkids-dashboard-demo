import { nextTick } from 'vue'
import type { Ref } from 'vue'
import type { BentoSpatialMotionContext, BentoView } from './bentoViewTypes'
import { clamp01, gridAreaRect, interpolateRect, maxPairwiseOverlap, minimumRailGap, rectDrift, snapshotRect, spatialEasing } from '@/lib/bentoSpatialGeometry'
import type { SpatialRect, SpatialTraceFrame, WindowWithGymkidsMotionTrace } from '@/lib/bentoSpatialGeometry'

interface ConversionMotionContext extends BentoSpatialMotionContext {
  settledBentoView: Ref<BentoView>
  requestedBentoView: Ref<BentoView>
  spatialGridIsExpanded: Ref<boolean>
  focusBentoViewAfterPaint: (view: BentoView) => Promise<void>
  transitionToBentoView: (view: BentoView) => Promise<void>
}

const SPATIAL_REFLOW_MS = 520

export const createBentoSpatialConversion = ({
  bentoStageRef, spatialReflowIsBusy, spatialMotionPhase, spatialMotionDirection,
  resetCardNumberAnimations, suppressHoverEffectsUntil, settledBentoView, requestedBentoView,
  spatialGridIsExpanded, focusBentoViewAfterPaint, transitionToBentoView,
}: ConversionMotionContext) => {
  let spatialMotionFrame: number | undefined

  const transitionSpatialConversion = async (target: BentoView) => {
    const opening = target === 'conversion'
    const grid = bentoStageRef.value?.querySelector<HTMLElement>('.dashboard-grid')
    const motionDiagnosticsEnabled = new URLSearchParams(window.location.search).get('motionAudit') === '1'

    if (!grid)
      return

    resetCardNumberAnimations()
    suppressHoverEffectsUntil(performance.now() + 1200)
    spatialReflowIsBusy.value = true
    spatialMotionPhase.value = 'move'
    spatialMotionDirection.value = opening ? 'opening' : 'closing'
    await nextTick()

    const cards = Array.from(grid.querySelectorAll<HTMLElement>(':scope > .conversion-card[data-spatial-card]'))
    const gridRect = grid.getBoundingClientRect()
    const firstRects = new Map(cards.map(card => [card, snapshotRect(card.getBoundingClientRect(), gridRect)]))
    const gridStyle = grid.getAttribute('style')
    const cardStyles = new Map(cards.map(card => [card, card.getAttribute('style')]))

    const lastRect = opening
      ? gridAreaRect(grid, 4, 10, 1, 4)
      : gridAreaRect(grid, 8, 10, 1, 2)

    const lastRects = new Map(cards.map(card => [card, lastRect]))
    const traceFrames: SpatialTraceFrame[] = []

    const primaryKpi = motionDiagnosticsEnabled
      ? grid.querySelector<HTMLElement>('.conversion-card .motion-primary')
      : null

    let maxOverlap = 0
    let minGap = Number.POSITIVE_INFINITY
    let primaryKpiConnectedEveryFrame = true

    grid.style.setProperty('--spatial-open-progress', opening ? '0' : '1')
    grid.style.setProperty('--spatial-detail-opacity', opening ? '0' : '1')
    grid.style.setProperty('--spatial-quality-detail-opacity', opening ? '1' : '0')
    grid.style.setProperty('--spatial-detail-shift', opening ? '10px' : '0px')
    grid.style.setProperty('--spatial-scrim-opacity', opening ? '0' : '1')

    cards.forEach(card => {
      const first = firstRects.get(card)

      if (!first)
        return

      Object.assign(card.style, {
        position: 'absolute',
        gridArea: 'auto',
        gridColumn: 'auto',
        gridRow: 'auto',
        inset: 'auto',
        left: `${first.left}px`,
        top: `${first.top}px`,
        width: `${first.width}px`,
        height: `${first.height}px`,
        margin: '0',
        scale: '1',
        transform: 'translate3d(0, 0, 0)',
        transformOrigin: 'top left',
        transition: 'none',
        animation: 'none',
        contain: 'layout paint',
        willChange: 'transform, height',
        zIndex: card.classList.contains('conversion-card') ? '30' : '20',
      })
    })

    if (opening) {
      spatialGridIsExpanded.value = true
      settledBentoView.value = target
      await nextTick()
    }

    const renderFrame = (linearProgress: number, timestamp: number) => {
      const easedProgress = spatialEasing(linearProgress)
      const openProgress = opening ? easedProgress : 1 - easedProgress
      const frameRects: Record<string, SpatialRect> = {}
      const allRects: SpatialRect[] = []

      cards.forEach(card => {
        const first = firstRects.get(card)
        const last = lastRects.get(card)

        if (!first || !last)
          return

        const interpolated = interpolateRect(first, last, easedProgress)
        const key = card.dataset.spatialCard ?? 'unknown'

        if (motionDiagnosticsEnabled)
          frameRects[key] = interpolated
        if (Math.abs(last.width - first.width) > 0.1)
          card.style.width = `${interpolated.width}px`
        if (Math.abs(last.height - first.height) > 0.1)
          card.style.height = `${interpolated.height}px`
        card.style.transform = `translate3d(${interpolated.left - first.left}px, ${interpolated.top - first.top}px, 0)`
      })

      if (motionDiagnosticsEnabled)
        allRects.push(...Object.values(frameRects))

      const frameOverlap = motionDiagnosticsEnabled ? maxPairwiseOverlap(allRects) : 0
      const frameGap = motionDiagnosticsEnabled ? minimumRailGap(frameRects) : Number.POSITIVE_INFINITY
      const primaryConnected = motionDiagnosticsEnabled ? Boolean(primaryKpi?.isConnected) : true
      const detailOpacity = clamp01((openProgress - 0.52) / 0.24)
      const qualityDetailOpacity = 1 - clamp01(openProgress / 0.24)

      maxOverlap = Math.max(maxOverlap, frameOverlap)
      minGap = Math.min(minGap, frameGap)
      primaryKpiConnectedEveryFrame &&= primaryConnected
      grid.style.setProperty('--spatial-open-progress', `${openProgress}`)
      grid.style.setProperty('--spatial-detail-opacity', `${detailOpacity}`)
      grid.style.setProperty('--spatial-quality-detail-opacity', `${qualityDetailOpacity}`)
      grid.style.setProperty('--spatial-detail-shift', `${(1 - detailOpacity) * 12}px`)
      grid.style.setProperty('--spatial-scrim-opacity', `${openProgress}`)
      if (motionDiagnosticsEnabled) {
        traceFrames.push({
          timestamp,
          linearProgress,
          easedProgress,
          openProgress,
          maxOverlapArea: frameOverlap,
          minimumRailGap: frameGap,
          primaryKpiConnected: primaryConnected,
          rects: frameRects,
        })
      }
    }

    let terminalDrift = Number.POSITIVE_INFINITY
    try {
      await new Promise<void>(resolve => {
        let startedAt: number | undefined

        const step = (timestamp: number) => {
          startedAt ??= timestamp

          const progress = clamp01((timestamp - startedAt) / SPATIAL_REFLOW_MS)

          renderFrame(progress, timestamp)

          if (progress < 1)
            spatialMotionFrame = window.requestAnimationFrame(step)
          else
            resolve()
        }

        spatialMotionFrame = window.requestAnimationFrame(step)
      })
    }
    finally {
      settledBentoView.value = target
      spatialGridIsExpanded.value = opening
      if (spatialMotionFrame !== undefined) {
        window.cancelAnimationFrame(spatialMotionFrame)
        spatialMotionFrame = undefined
      }
      cards.forEach(card => {
        const previousStyle = cardStyles.get(card)

        if (previousStyle === null)
          card.removeAttribute('style')
        else
          card.setAttribute('style', previousStyle ?? '')
      })
      if (gridStyle === null)
        grid.removeAttribute('style')
      else
        grid.setAttribute('style', gridStyle)
      await nextTick()
      if (motionDiagnosticsEnabled) {
        terminalDrift = cards.reduce((maximum, card) => {
          const expected = lastRects.get(card)

          if (!expected)
            return maximum

          return Math.max(maximum, rectDrift(snapshotRect(card.getBoundingClientRect(), grid.getBoundingClientRect()), expected))
        }, 0)
        ;(window as WindowWithGymkidsMotionTrace).__GYMKIDS_MOTION_TRACE__ = {
          direction: opening ? 'opening' : 'closing',
          duration: SPATIAL_REFLOW_MS,
          startedAt: new Date().toISOString(),
          frameCount: traceFrames.length,
          maxOverlapArea: maxOverlap,
          minimumRailGap: minGap,
          terminalDrift,
          primaryKpiConnectedEveryFrame,
          frames: traceFrames,
        }
        grid.dataset.spatialOverlap = maxOverlap.toFixed(3)
        grid.dataset.spatialMinimumGap = Number.isFinite(minGap) ? minGap.toFixed(3) : 'n/a'
        grid.dataset.spatialTerminalDrift = terminalDrift.toFixed(3)
      }
      resetCardNumberAnimations()
      suppressHoverEffectsUntil(performance.now() + 300)
      spatialMotionPhase.value = 'idle'
      spatialMotionDirection.value = 'idle'
      spatialReflowIsBusy.value = false
    }

    await focusBentoViewAfterPaint(target)

    if (requestedBentoView.value !== target)
      await transitionToBentoView(requestedBentoView.value)
  }

  const cancelSpatialMotionFrame = () => {
    if (spatialMotionFrame !== undefined)
      window.cancelAnimationFrame(spatialMotionFrame)
  }

  return { transitionSpatialConversion, cancelSpatialMotionFrame }
}
