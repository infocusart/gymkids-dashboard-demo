<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type AuroraTone = 'positive' | 'warning' | 'negative' | 'neutral'

interface AuroraDepth {
  name: 'a' | 'b' | 'c'
  x: number
  y: number
}

const props = withDefaults(defineProps<{
  tone?: AuroraTone
  motion?: 'ambient' | 'interactive' | 'static'
}>(), {
  tone: 'negative',
  motion: 'interactive',
})

const DEPTH_VARIABLES = [
  ['a', '--soft-aurora-depth-a-x', '--soft-aurora-depth-a-y'],
  ['b', '--soft-aurora-depth-b-x', '--soft-aurora-depth-b-y'],
  ['c', '--soft-aurora-depth-c-x', '--soft-aurora-depth-c-y'],
] as const

const POINTER_FOLLOW_SPEED = 20
const aurora = ref<HTMLElement | null>(null)

let disposeMotion: (() => void) | undefined

function readDepths(element: HTMLElement): AuroraDepth[] {
  const styles = getComputedStyle(element)

  return DEPTH_VARIABLES.map(([name, xVariable, yVariable]) => ({
    name,
    x: Number.parseFloat(styles.getPropertyValue(xVariable)) || 0,
    y: Number.parseFloat(styles.getPropertyValue(yVariable)) || 0,
  }))
}

onMounted(() => {
  if (props.motion !== 'interactive')
    return

  const element = aurora.value
  const host = element?.parentElement

  if (!element || !host)
    return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const depths = readDepths(element)
  const target = { x: 0.5, y: 0.5 }
  const current = { x: 0.5, y: 0.5 }
  let frameId = 0
  let previousTime = performance.now()

  const writePosition = () => {
    const normalizedX = current.x - 0.5
    const normalizedY = current.y - 0.5

    for (const depth of depths) {
      element.style.setProperty(
        `--soft-aurora-${depth.name}-x`,
        `${(normalizedX * depth.x).toFixed(2)}px`,
      )
      element.style.setProperty(
        `--soft-aurora-${depth.name}-y`,
        `${(normalizedY * depth.y).toFixed(2)}px`,
      )
    }
  }

  const tick = (time: number) => {
    const delta = Math.min(32, Math.max(1, time - previousTime))
    const easing = 1 - Math.exp(-POINTER_FOLLOW_SPEED * delta / 1000)

    previousTime = time
    current.x += (target.x - current.x) * easing
    current.y += (target.y - current.y) * easing
    writePosition()

    const remaining = Math.abs(target.x - current.x) + Math.abs(target.y - current.y)

    frameId = remaining > 0.0005 ? requestAnimationFrame(tick) : 0
  }

  const schedule = () => {
    if (reducedMotion.matches || frameId)
      return

    previousTime = performance.now()
    frameId = requestAnimationFrame(tick)
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !finePointer.matches)
      return

    const bounds = element.getBoundingClientRect()

    target.x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / Math.max(1, bounds.width)))
    target.y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / Math.max(1, bounds.height)))
    schedule()
  }

  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !finePointer.matches)
      return

    target.x = 0.5
    target.y = 0.5
    schedule()
  }

  host.addEventListener('pointermove', handlePointerMove, { passive: true })
  host.addEventListener('pointerleave', handlePointerLeave, { passive: true })

  disposeMotion = () => {
    host.removeEventListener('pointermove', handlePointerMove)
    host.removeEventListener('pointerleave', handlePointerLeave)

    if (frameId)
      cancelAnimationFrame(frameId)
  }
})

onBeforeUnmount(() => disposeMotion?.())
</script>

<template>
  <div
    ref="aurora"
    class="soft-aurora"
    :data-tone="props.tone"
    :data-motion="props.motion"
    aria-hidden="true"
  >
    <span class="soft-aurora__blob soft-aurora__blob--a" />
    <span class="soft-aurora__blob soft-aurora__blob--b" />
    <span class="soft-aurora__blob soft-aurora__blob--c" />
    <span class="soft-aurora__grain" />
    <span class="soft-aurora__vignette" />
  </div>
</template>

<style scoped>
.soft-aurora {
  --soft-aurora-bg: 24 24 24;
  --soft-aurora-blue: 131 195 255;
  --soft-aurora-status: 238 119 107;
  --soft-aurora-status-secondary: 220 92 117;
  --soft-aurora-a-x: 0px;
  --soft-aurora-a-y: 0px;
  --soft-aurora-b-x: 0px;
  --soft-aurora-b-y: 0px;
  --soft-aurora-c-x: 0px;
  --soft-aurora-c-y: 0px;
  --soft-aurora-depth-a-x: 172;
  --soft-aurora-depth-a-y: 133;
  --soft-aurora-depth-b-x: 114;
  --soft-aurora-depth-b-y: 88;
  --soft-aurora-depth-c-x: 70;
  --soft-aurora-depth-c-y: 57;
  position: fixed;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  contain: paint;
  pointer-events: none;
  background:
    radial-gradient(circle at 20% 20%, rgb(var(--soft-aurora-blue) / 22%), transparent 38%),
    radial-gradient(circle at 80% 76%, rgb(var(--soft-aurora-status) / 22%), transparent 40%),
    rgb(var(--soft-aurora-bg));
}

.soft-aurora[data-tone="warning"] {
  --soft-aurora-status: 222 174 82;
  --soft-aurora-status-secondary: 234 137 82;
}

.soft-aurora[data-tone="neutral"] {
  --soft-aurora-status: 126 137 148;
  --soft-aurora-status-secondary: 96 121 140;
}

.soft-aurora[data-tone="positive"] {
  --soft-aurora-status: 63 148 116;
  --soft-aurora-status-secondary: 111 159 135;
}

.soft-aurora__blob {
  position: absolute;
  inline-size: 58%;
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(54px);
  opacity: .64;
  will-change: transform;
}

.soft-aurora__blob--a {
  inset-block-start: -34%;
  inset-inline-start: -8%;
  background: rgb(var(--soft-aurora-blue) / 68%);
  animation: soft-aurora-float-a 11s ease-in-out infinite alternate;
}

.soft-aurora__blob--b {
  inset-block-start: -10%;
  inset-inline-end: -14%;
  background: rgb(var(--soft-aurora-status) / 62%);
  animation: soft-aurora-float-b 14s ease-in-out infinite alternate;
}

.soft-aurora__blob--c {
  inset-block-end: -42%;
  inset-inline-start: 34%;
  background: rgb(var(--soft-aurora-status-secondary) / 50%);
  animation: soft-aurora-float-c 16s ease-in-out infinite alternate;
}

.soft-aurora[data-motion="static"] .soft-aurora__blob {
  animation: none;
  transform: none;
  will-change: auto;
}

.soft-aurora__grain,
.soft-aurora__vignette {
  position: absolute;
  inset: 0;
}

.soft-aurora__grain {
  opacity: .18;
  color: rgb(255 255 255);
  mix-blend-mode: soft-light;
  background-image: repeating-radial-gradient(
    circle at 30% 40%,
    currentColor 0 1px,
    transparent 1px 4px
  );
}

.soft-aurora__vignette {
  background:
    linear-gradient(90deg, rgb(var(--soft-aurora-bg) / 40%), transparent 36%, transparent 64%, rgb(var(--soft-aurora-bg) / 36%)),
    linear-gradient(0deg, rgb(var(--soft-aurora-bg) / 38%), transparent 42%);
}

@keyframes soft-aurora-float-a {
  from {
    transform: translate3d(var(--soft-aurora-a-x), var(--soft-aurora-a-y), 0) scale(1);
  }

  to {
    transform: translate3d(
      calc(28% + var(--soft-aurora-a-x)),
      calc(24% + var(--soft-aurora-a-y)),
      0
    ) scale(1.12);
  }
}

@keyframes soft-aurora-float-b {
  from {
    transform: translate3d(var(--soft-aurora-b-x), var(--soft-aurora-b-y), 0) scale(1);
  }

  to {
    transform: translate3d(
      calc(-30% + var(--soft-aurora-b-x)),
      calc(22% + var(--soft-aurora-b-y)),
      0
    ) scale(.86);
  }
}

@keyframes soft-aurora-float-c {
  from {
    transform: translate3d(var(--soft-aurora-c-x), var(--soft-aurora-c-y), 0) scale(1);
  }

  to {
    transform: translate3d(
      calc(5% + var(--soft-aurora-c-x)),
      calc(-30% + var(--soft-aurora-c-y)),
      0
    ) scale(1.08);
  }
}

@media (max-width: 640px) {
  .soft-aurora__blob {
    inline-size: 82%;
    filter: blur(46px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .soft-aurora__blob {
    animation: none;
  }
}
</style>
