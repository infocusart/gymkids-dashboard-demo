<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import earthOrbitImage from '@images/gymkids/earth-orbit-dashboard-v1.png'

const host = ref<HTMLElement | null>(null)

let disposeMotion: (() => void) | undefined

onMounted(() => {
  const hostElement = host.value

  if (!hostElement)
    return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(pointer: fine)')
  const target = { x: 0, y: 0 }
  const current = { ...target }
  let animationFrame = 0

  const draw = () => {
    const deltaX = target.x - current.x
    const deltaY = target.y - current.y
    const settled = Math.abs(deltaX) < 0.08 && Math.abs(deltaY) < 0.08
    const easing = reducedMotion.matches || settled ? 1 : 0.075

    current.x += deltaX * easing
    current.y += deltaY * easing
    hostElement.style.setProperty('--earth-shift-x', `${current.x.toFixed(2)}px`)
    hostElement.style.setProperty('--earth-shift-y', `${current.y.toFixed(2)}px`)
    animationFrame = 0

    if (!reducedMotion.matches && !settled)
      animationFrame = window.requestAnimationFrame(draw)
  }

  const requestDraw = () => {
    window.cancelAnimationFrame(animationFrame)
    animationFrame = window.requestAnimationFrame(draw)
  }

  const updateTarget = (event: PointerEvent) => {
    if (!finePointer.matches || reducedMotion.matches)
      return

    target.x = (0.5 - event.clientX / window.innerWidth) * 28
    target.y = (0.5 - event.clientY / window.innerHeight) * 18
    requestDraw()
  }

  const resetTarget = () => {
    target.x = 0
    target.y = 0
    requestDraw()
  }

  window.addEventListener('pointermove', updateTarget, { passive: true })
  window.addEventListener('blur', resetTarget)
  reducedMotion.addEventListener('change', resetTarget)

  disposeMotion = () => {
    window.cancelAnimationFrame(animationFrame)
    window.removeEventListener('pointermove', updateTarget)
    window.removeEventListener('blur', resetTarget)
    reducedMotion.removeEventListener('change', resetTarget)
  }
})

onBeforeUnmount(() => disposeMotion?.())
</script>

<template>
  <div
    ref="host"
    class="earth-orbit"
  >
    <img
      :src="earthOrbitImage"
      alt=""
      decoding="async"
    >
  </div>
</template>

<style scoped>
.earth-orbit,
.earth-orbit img {
  inline-size: 100%;
  block-size: 100%;
}

.earth-orbit {
  --earth-shift-x: 0px;
  --earth-shift-y: 0px;
  position: relative;
  overflow: hidden;
  background: #030609;
}

.earth-orbit::after {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgb(2 4 7 / 42%), transparent 27%, rgb(7 5 4 / 8%) 72%, rgb(8 5 4 / 26%)),
    linear-gradient(90deg, rgb(2 4 6 / 16%), transparent 52%, rgb(4 3 3 / 9%));
  content: "";
}

.earth-orbit img {
  display: block;
  object-fit: cover;
  object-position: 52% 54%;
  filter: saturate(.76) contrast(1.04) brightness(.78);
  transform: translate3d(var(--earth-shift-x), var(--earth-shift-y), 0) scale(1.075);
  transform-origin: center;
  transition: filter .3s ease;
  will-change: transform;
}

@media (max-width: 720px) {
  .earth-orbit img {
    object-position: 64% 50%;
    transform: translate3d(var(--earth-shift-x), var(--earth-shift-y), 0) scale(1.16);
  }
}

@media (prefers-reduced-motion: reduce) {
  .earth-orbit img {
    transform: scale(1.075);
    will-change: auto;
  }
}
</style>
