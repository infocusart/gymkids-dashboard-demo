import { Flip } from 'gsap/Flip'
import { gsap } from 'gsap'
import { nextTick } from 'vue'
import type { Ref } from 'vue'
import type { BentoSpatialMotionContext } from './bentoViewTypes'

gsap.registerPlugin(Flip)

interface SiteMotionContext extends BentoSpatialMotionContext {
  supportsSpatialReflow: Ref<boolean>
  siteGridIsExpanded: Ref<boolean>
}

export const createBentoSpatialSite = ({
  bentoStageRef, spatialReflowIsBusy, spatialMotionPhase, spatialMotionDirection,
  resetCardNumberAnimations, suppressHoverEffectsUntil, supportsSpatialReflow, siteGridIsExpanded,
}: SiteMotionContext) => {
  let siteFlipAnimation: gsap.core.Animation | null = null
  let finishSiteFlipAnimation: (() => void) | null = null

  const stopSiteFlipAnimation = () => {
    siteFlipAnimation?.kill()
    siteFlipAnimation = null
    finishSiteFlipAnimation?.()
    finishSiteFlipAnimation = null
  }

  const transitionSpatialSite = async (opening: boolean) => {
    const grid = bentoStageRef.value?.querySelector<HTMLElement>('.dashboard-grid')

    const cards = grid
      ? Array.from(grid.querySelectorAll<HTMLElement>(':scope > .dashboard-card')).filter(card => card.offsetParent !== null)
      : []

    if (!grid || cards.length === 0)
      return

    stopSiteFlipAnimation()
    resetCardNumberAnimations()
    suppressHoverEffectsUntil(performance.now() + 1200)
    spatialReflowIsBusy.value = true
    spatialMotionPhase.value = 'move'
    spatialMotionDirection.value = opening ? 'opening' : 'closing'

    const previousState = Flip.getState(cards)

    siteGridIsExpanded.value = opening
    await nextTick()

    try {
      await new Promise<void>(resolve => {
        const finish = () => {
          if (finishSiteFlipAnimation === finish)
            finishSiteFlipAnimation = null

          siteFlipAnimation = null
          resolve()
        }

        finishSiteFlipAnimation = finish
        siteFlipAnimation = Flip.from(previousState, {
          absolute: supportsSpatialReflow.value,
          duration: 0.76,
          ease: 'sine.inOut',
          onComplete: finish,
          prune: true,
          scale: !supportsSpatialReflow.value,
          simple: true,
        })
      })
    }
    finally {
      gsap.set(cards, { clearProps: 'willChange' })
      resetCardNumberAnimations()
      suppressHoverEffectsUntil(performance.now() + 300)
      spatialMotionPhase.value = 'idle'
      spatialMotionDirection.value = 'idle'
      spatialReflowIsBusy.value = false
    }

    await nextTick()
    bentoStageRef.value?.querySelector<HTMLElement>('[data-bento-open="site"]')?.focus({ preventScroll: true })
  }

  return { transitionSpatialSite, stopSiteFlipAnimation }
}
