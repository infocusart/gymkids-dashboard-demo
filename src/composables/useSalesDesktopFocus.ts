import { type Ref, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import type { SalesCardKey } from '@/lib/salesDesktop'

gsap.registerPlugin(Flip)

export function useSalesDesktopFocus(desktop: Ref<boolean>) {
  const grid = ref<HTMLElement>()
  const focusedCard = ref<SalesCardKey | null>(null)
  const busy = ref(false)
  let animation: gsap.core.Timeline | undefined
  let origin: HTMLElement | null = null

  const clearDimensions = () => {
    const elements = grid.value?.querySelectorAll<HTMLElement>('[data-sales-card]')
    if (elements?.length)
      gsap.set(elements, { clearProps: 'transform,width,height,minWidth,maxWidth,minHeight,maxHeight' })
  }

  async function toggleCard(key: SalesCardKey | null) {
    if (!desktop.value || busy.value || !grid.value)
      return
    const next = key === focusedCard.value ? null : key
    if (next)
      origin = document.activeElement as HTMLElement
    const elements = grid.value.querySelectorAll<HTMLElement>('[data-sales-card]')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const state = reduced ? null : Flip.getState(elements)

    busy.value = true
    focusedCard.value = next
    await nextTick()
    if (next)
      grid.value.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' })

    const finish = () => {
      clearDimensions()
      busy.value = false
      animation = undefined
      if (!next)
        origin?.focus({ preventScroll: true })
    }

    if (state)
      animation = Flip.from(state, { duration: 0.78, ease: 'power3.inOut', scale: false, onComplete: finish })
    else finish()
  }
  function resetFocus() {
    animation?.kill()
    animation = undefined
    clearDimensions()
    focusedCard.value = null
    busy.value = false
  }

  const escape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.defaultPrevented && focusedCard.value)
      void toggleCard(null)
  }

  window.addEventListener('keydown', escape)

  const resize = () => {
    if (busy.value)
      resetFocus()
  }

  window.addEventListener('resize', resize)
  watch(desktop, value => {
    if (!value)
      resetFocus()
  })
  onBeforeUnmount(() => {
    resetFocus()
    window.removeEventListener('keydown', escape)
    window.removeEventListener('resize', resize)
  })

  return { grid, focusedCard, busy, toggleCard, resetFocus }
}
