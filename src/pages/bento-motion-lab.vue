<script setup lang="ts">
import { Flip } from 'gsap/Flip'
import { gsap } from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

gsap.registerPlugin(Flip)

const tileIds = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

type TileId = typeof tileIds[number]
type LayoutKey = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type LabPhase = 'overview' | 'animating' | 'expanded'

interface TileRect {
  x: number
  y: number
  w: number
  h: number
}

interface LayoutSlot {
  owner: TileId
  rect: TileRect
}

const GRID_COLUMNS = 12
const GRID_ROWS = 8
const staticTileIds: TileId[] = [1, 5]

const initialRects: Record<TileId, TileRect> = {
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

const layoutOwners: Record<LayoutKey, TileId> = {
  'top-left': 1,
  'top-right': 3,
  'bottom-left': 6,
  'bottom-right': 5,
}

const tileTones: Record<TileId, 'dark' | 'light' | 'soft'> = {
  1: 'dark',
  2: 'light',
  3: 'soft',
  4: 'light',
  5: 'dark',
  6: 'light',
  7: 'light',
  8: 'light',
  9: 'light',
}

const cloneLayout = (layout: Record<TileId, TileRect>) => Object.fromEntries(
  tileIds.map(id => [id, { ...layout[id] }]),
) as Record<TileId, TileRect>

const sameRect = (first: TileRect, second: TileRect) =>
  first.x === second.x
  && first.y === second.y
  && first.w === second.w
  && first.h === second.h

const sameSize = (first: TileRect, second: TileRect) => first.w === second.w && first.h === second.h

const layoutKeyFor = (id: TileId): LayoutKey => {
  if (id === 1 || id === 2)
    return 'top-left'

  if (id === 3 || id === 4)
    return 'top-right'

  if (id === 6 || id === 7 || id === 8)
    return 'bottom-left'

  return 'bottom-right'
}

const expandedLayoutFor = (selected: TileId) => {
  const key = layoutKeyFor(selected)
  const originalOwner = layoutOwners[key]
  const result = {} as Record<TileId, TileRect>

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

const placements = ref(cloneLayout(initialRects))
const board = ref<HTMLElement | null>(null)
const phase = ref<LabPhase>('overview')
const selectedId = ref<TileId | null>(null)
const speedFactor = ref<1 | 100>(1)
const statusMessage = ref('Плитки 1 и 5 статичны · остальные меняют готовое состояние')
const prefersReducedMotion = ref(false)
const testMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('test')

let activeAnimation: gsap.core.Timeline | null = null
let finishActiveAnimation: (() => void) | null = null
let motionQuery: MediaQueryList | null = null
let runEpoch = 0

const isBusy = computed(() => phase.value === 'animating')

const emptyCells = computed(() => GRID_COLUMNS * GRID_ROWS - tileIds.reduce((sum, id) => {
  const rect = placements.value[id]

  return sum + rect.w * rect.h
}, 0))

const phaseLabel = computed(() => {
  if (phase.value === 'animating')
    return 'GSAP Flip перестраивает сетку'

  if (phase.value === 'expanded')
    return `Плитка ${selectedId.value} раскрыта`

  return 'Готовые состояния · 12 колонок'
})

const tileStyle = (id: TileId) => {
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

const animateTo = async (target: Record<TileId, TileRect>) => {
  const epoch = ++runEpoch
  const elements = board.value?.querySelectorAll<HTMLElement>('.bento-card')

  if (!elements)
    return false

  stopAnimation()

  if (testMode || prefersReducedMotion.value) {
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
      duration: 0.66 * speedFactor.value,
      ease: 'power2.inOut',
      onComplete: finish,
      prune: true,
      scale: false,
      simple: true,
      stagger: 0.045 * speedFactor.value,
    })
  })

  return epoch === runEpoch
}

const openTile = async (id: TileId) => {
  const target = expandedLayoutFor(id)

  selectedId.value = id
  statusMessage.value = 'Меняем только готовую раскладку; Flip делает переход'

  if (!await animateTo(target))
    return

  const unchanged = tileIds.filter(tileId => sameRect(initialRects[tileId], target[tileId]))
  const retainedSize = tileIds.filter(tileId => sameSize(initialRects[tileId], target[tileId]))

  phase.value = 'expanded'
  statusMessage.value = `Заполнено 96/96 · на месте: ${unchanged.join(', ')} · сохранили размер: ${retainedSize.join(', ')}`
}

const closeLayout = async () => {
  statusMessage.value = 'Возвращаем исходную геометрию'

  if (!await animateTo(initialRects))
    return

  selectedId.value = null
  phase.value = 'overview'
  statusMessage.value = 'Исходная сетка · плитки 1 и 5 статичны'
}

const handleTileClick = (id: TileId) => {
  if (isBusy.value || staticTileIds.includes(id))
    return

  if (selectedId.value) {
    closeLayout()

    return
  }

  openTile(id)
}

const resetLayout = () => {
  runEpoch += 1
  stopAnimation()
  placements.value = cloneLayout(initialRects)
  selectedId.value = null
  phase.value = 'overview'
  statusMessage.value = 'Сетка сброшена · плитки 1 и 5 статичны'
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
})

onBeforeUnmount(() => {
  runEpoch += 1
  stopAnimation()
  motionQuery?.removeEventListener('change', handleMotionPreference)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <main class="motion-demo">
    <header class="motion-hud">
      <div
        class="motion-hud__status"
        aria-live="polite"
      >
        <span>{{ phaseLabel }}</span>
        <strong>{{ statusMessage }}</strong>
      </div>

      <div class="motion-hud__legend">
        <span>2/12</span>
        <span>3/12</span>
        <span>4/12</span>
        <span>6/12</span>
        <strong>Свободно {{ emptyCells }}/96</strong>
      </div>

      <div class="motion-hud__controls">
        <div
          class="speed-control"
          aria-label="Скорость диагностики"
        >
          <button
            type="button"
            :aria-pressed="speedFactor === 1"
            :disabled="isBusy"
            @click="speedFactor = 1"
          >
            1×
          </button>
          <button
            type="button"
            :aria-pressed="speedFactor === 100"
            :disabled="isBusy"
            @click="speedFactor = 100"
          >
            100× slow
          </button>
        </div>

        <button
          class="reset-button"
          type="button"
          :disabled="phase === 'overview'"
          @click="resetLayout"
        >
          Сброс
        </button>
      </div>
    </header>

    <section
      ref="board"
      class="bento-grid"
      :data-phase="phase"
      :data-empty-cells="emptyCells"
      aria-label="Демо плотной bento-сетки на GSAP Flip"
    >
      <button
        v-for="id in tileIds"
        :key="id"
        class="card bento-card"
        :data-tile="id"
        :data-tone="tileTones[id]"
        :data-static="staticTileIds.includes(id) || undefined"
        :data-x="placements[id].x"
        :data-y="placements[id].y"
        :data-w="placements[id].w"
        :data-h="placements[id].h"
        :style="tileStyle(id)"
        type="button"
        :disabled="isBusy || staticTileIds.includes(id)"
        :aria-label="staticTileIds.includes(id) ? `Статичная плитка ${id}` : selectedId ? `Вернуть исходную сетку через плитку ${id}` : `Раскрыть плитку ${id}`"
        :aria-pressed="selectedId === id"
        @click="handleTileClick(id)"
      >
        <span class="bento-card__number">{{ id }}</span>
      </button>
    </section>
  </main>
</template>

<style scoped>
.motion-demo {
  --canvas: #101411;
  --grid-line: rgb(235 241 233 / 4.5%);
  display: grid;
  min-block-size: 100dvh;
  padding: 76px 18px 18px;
  place-items: center;
  background:
    radial-gradient(circle at 22% 4%, rgb(73 111 137 / 30%), transparent 39%),
    radial-gradient(circle at 80% 50%, rgb(45 105 68 / 20%), transparent 46%),
    var(--canvas);
  color: #f4f7f1;
}

.motion-hud {
  position: fixed;
  z-index: 20;
  inset-block-start: 14px;
  inset-inline: 18px;
  display: grid;
  min-block-size: 48px;
  align-items: center;
  grid-template-columns: minmax(280px, 1fr) auto minmax(250px, 1fr);
  gap: 18px;
  pointer-events: none;
}

.motion-hud__status {
  display: grid;
  gap: 2px;
}

.motion-hud__status span,
.motion-hud__legend {
  color: rgb(237 242 234 / 55%);
  font: 650 10px/1.2 Inter, system-ui, sans-serif;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.motion-hud__status strong {
  overflow: hidden;
  color: rgb(248 250 246 / 88%);
  font: 560 13px/1.25 Inter, system-ui, sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.motion-hud__legend {
  display: flex;
  align-items: center;
  gap: 10px;
}

.motion-hud__legend strong {
  color: rgb(248 250 246 / 84%);
}

.motion-hud__controls {
  display: flex;
  justify-content: end;
  gap: 8px;
  pointer-events: auto;
}

.speed-control {
  display: flex;
  padding: 3px;
  border: 1px solid rgb(255 255 255 / 11%);
  border-radius: 10px;
  background: rgb(2 5 3 / 45%);
}

.speed-control button,
.reset-button {
  min-block-size: 32px;
  padding: 0 11px;
  border: 0;
  border-radius: 7px;
  color: rgb(245 248 243 / 62%);
  background: transparent;
  cursor: pointer;
  font: 650 11px/1 Inter, system-ui, sans-serif;
}

.speed-control button[aria-pressed="true"] {
  color: #17211d;
  background: #dbe1da;
}

.speed-control button:disabled,
.reset-button:disabled {
  cursor: default;
  opacity: .35;
}

.reset-button {
  border: 1px solid rgb(255 255 255 / 11%);
  background: rgb(2 5 3 / 45%);
}

.bento-grid {
  display: grid;
  inline-size: min(1560px, calc(100vw - 36px), calc((100dvh - 94px) * 1.945));
  aspect-ratio: 1560 / 802;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-rows: repeat(8, minmax(0, 1fr));
  gap: clamp(7px, .65vw, 11px);
  padding: clamp(7px, .65vw, 11px);
  border: 1px solid rgb(255 255 255 / 7%);
  border-radius: clamp(14px, 1.3vw, 24px);
  background-color: rgb(5 9 6 / 44%);
  background-image:
    linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
  background-size: calc(100% / 12) calc(100% / 8);
  box-shadow: 0 32px 90px rgb(0 0 0 / 24%);
  isolation: isolate;
}

.bento-card {
  position: relative;
  display: flex;
  min-inline-size: 0;
  min-block-size: 0;
  align-items: start;
  padding: clamp(14px, 1.4vw, 26px);
  border: 1px solid transparent;
  border-radius: clamp(13px, 1.2vw, 21px);
  color: #2e3331;
  background: #d8dad4;
  box-shadow: 0 8px 22px rgb(0 0 0 / 10%);
  cursor: pointer;
  overflow: hidden;
  text-align: start;
  transform-origin: center;
}

.bento-card[data-tone="dark"] {
  border-color: #3b4d48;
  color: #e9efea;
  background: #263733;
}

.bento-card[data-tone="soft"] {
  border-color: #d1dfd6;
  background: #bed0c5;
}

.bento-card:hover:not(:disabled) {
  filter: brightness(1.035);
}

.bento-card:focus-visible,
.speed-control button:focus-visible,
.reset-button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.bento-card:disabled {
  cursor: default;
}

.bento-card[data-static="true"] {
  filter: none;
}

.bento-card__number {
  font: 650 clamp(23px, 2.2vw, 42px)/1 Inter, system-ui, sans-serif;
}

@media (max-width: 760px) {
  .motion-demo {
    padding-block-start: 112px;
  }

  .motion-hud {
    grid-template-columns: 1fr auto;
  }

  .motion-hud__legend {
    display: none;
  }

  .motion-hud__controls {
    grid-column: 2;
    grid-row: 1;
  }

  .motion-hud__status strong {
    max-inline-size: 56vw;
  }

  .bento-grid {
    inline-size: calc(100vw - 24px);
    gap: 5px;
    padding: 5px;
  }

  .bento-card {
    padding: 9px;
    border-radius: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bento-card {
    scroll-behavior: auto;
  }
}
</style>
