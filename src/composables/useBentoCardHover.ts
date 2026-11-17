import { onBeforeUnmount, reactive, ref } from 'vue'
import type { Ref } from 'vue'

export type MotionCardKey = 'sources' | 'trial' | 'trialSecondary' | 'quality' | 'site' | 'promo' | 'path'

export const useBentoCardHover = (bentoIsBusy: Ref<boolean>, trialDetailsExpanded: Ref<boolean>) => {
  const motionNumberProgress = reactive<Record<MotionCardKey, number>>({
    sources: 1,
    trial: 1,
    trialSecondary: 1,
    quality: 1,
    site: 1,
    promo: 1,
    path: 1,
  })

  const motionNumberFrames: Partial<Record<MotionCardKey, number>> = {}
  let suppressCardHoverEffectsUntil = 0
  const sourceBarsAnimating = ref(false)
  let sourceBarsAnimationFrame: number | undefined
  const animatedValue = (value: number, card: MotionCardKey) => value * motionNumberProgress[card]
  const formatAnimatedInteger = (value: number, card: MotionCardKey = 'quality') => Math.round(animatedValue(value, card)).toLocaleString('ru-RU')
  const formatAnimatedPercent = (value: number, card: MotionCardKey = 'quality') => `${String(Math.round(animatedValue(value, card) * 10) / 10).replace('.', ',')}%`

  const formatAnimatedSignedPercent = (value: number, card: MotionCardKey) => {
    const animated = Math.round(animatedValue(value, card) * 10) / 10

    return `${animated > 0 ? '+' : ''}${String(animated).replace('.', ',')}%`
  }

  const formatAnimatedMoney = (value: number, card: MotionCardKey) => `${Math.round(animatedValue(value, card)).toLocaleString('ru-RU')} ₽`

  const stopCardNumberAnimation = (card: MotionCardKey) => {
    const frame = motionNumberFrames[card]

    if (frame !== undefined)
      cancelAnimationFrame(frame)

    delete motionNumberFrames[card]
  }

  const resetCardNumberAnimations = () => {
    (Object.keys(motionNumberProgress) as MotionCardKey[]).forEach(card => {
      stopCardNumberAnimation(card)
      motionNumberProgress[card] = 1
    })
  }

  const startCardHoverEffects = (card: MotionCardKey) => {
    stopCardNumberAnimation(card)

    if (bentoIsBusy.value
      || (card === 'trialSecondary' && trialDetailsExpanded.value)
      || performance.now() < suppressCardHoverEffectsUntil
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      motionNumberProgress[card] = 1

      return
    }

    if (card === 'sources') {
      sourceBarsAnimating.value = false
      if (sourceBarsAnimationFrame !== undefined)
        window.cancelAnimationFrame(sourceBarsAnimationFrame)
      sourceBarsAnimationFrame = requestAnimationFrame(() => {
        sourceBarsAnimating.value = true
        sourceBarsAnimationFrame = undefined
      })
    }

    motionNumberProgress[card] = 0

    const startedAt = performance.now()
    const duration = 1300

    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - startedAt) / duration)

      motionNumberProgress[card] = 1 - (1 - elapsed) ** 2

      if (elapsed < 1)
        motionNumberFrames[card] = requestAnimationFrame(tick)
      else
        delete motionNumberFrames[card]
    }

    motionNumberFrames[card] = requestAnimationFrame(tick)
  }

  const finishCardHoverEffects = (card: MotionCardKey) => {
    stopCardNumberAnimation(card)
    motionNumberProgress[card] = 1

    if (card === 'sources') {
      if (sourceBarsAnimationFrame !== undefined)
        window.cancelAnimationFrame(sourceBarsAnimationFrame)
      sourceBarsAnimationFrame = undefined
      sourceBarsAnimating.value = false
    }
  }

  const suppressHoverEffectsUntil = (timestamp: number) => {
    suppressCardHoverEffectsUntil = timestamp
  }

  onBeforeUnmount(() => {
    if (sourceBarsAnimationFrame !== undefined)
      window.cancelAnimationFrame(sourceBarsAnimationFrame)
    ;(Object.keys(motionNumberFrames) as MotionCardKey[]).forEach(stopCardNumberAnimation)
  })

  return {
    motionNumberProgress,
    sourceBarsAnimating,
    resetCardNumberAnimations,
    formatAnimatedInteger,
    formatAnimatedPercent,
    formatAnimatedSignedPercent,
    formatAnimatedMoney,
    startCardHoverEffects,
    finishCardHoverEffects,
    suppressHoverEffectsUntil,
  }
}
