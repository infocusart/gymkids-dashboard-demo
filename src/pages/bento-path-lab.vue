<script setup lang="ts">
import GymkidsSoftAurora from '@/components/GymkidsSoftAurora.vue'
import { gymkidsDemoView as dashboard } from '@/data/gymkidsDemo'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

type Source = typeof dashboard.sources[number]

const stages = [
  { key: 'fact', label: 'Лид' },
  { key: 'valid', label: 'Валидный' },
  { key: 'scheduled', label: 'Записан' },
  { key: 'reached', label: 'Дошёл' },
] as const

const stageValue = (source: Source, stageIndex: number) => {
  const key = stages[stageIndex]?.key ?? 'fact'

  return source[key]
}

const rate = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0
const rateLabel = (value: number, total: number) => `${rate(value, total)}%`
const width = (value: number, total: number) => `${rate(value, total)}%`

const transitionRate = (source: Source, transitionIndex: number) => {
  const values = [source.fact, source.valid, source.scheduled, source.reached]

  return rateLabel(values[transitionIndex + 1] ?? 0, values[transitionIndex] ?? 0)
}

const ribbonPoints = (source: Source) => {
  const values = [source.fact, source.valid, source.scheduled, source.reached]
  const x = [0, 333, 666, 1000]
  const thickness = values.map(value => Math.max(8, 30 * value / source.fact))
  const top = thickness.map(value => 22 - value / 2)
  const bottom = thickness.map(value => 22 + value / 2)

  return [
    ...x.map((value, index) => `${value},${top[index]}`),
    ...x.slice().reverse().map((value, reverseIndex) => {
      const index = x.length - 1 - reverseIndex

      return `${value},${bottom[index]}`
    }),
  ].join(' ')
}

const retentionMarkers = (source: Source) => [
  { key: 'reached', label: 'Дошёл', value: source.reached, position: rate(source.reached, source.fact) },
  { key: 'scheduled', label: 'Записан', value: source.scheduled, position: rate(source.scheduled, source.fact) },
  { key: 'valid', label: 'Валидный', value: source.valid, position: rate(source.valid, source.fact) },
  { key: 'fact', label: 'Лид', value: source.fact, position: 100 },
]

const losses = (source: Source) => [
  { key: 'fact', label: 'Лид', value: source.fact, kind: 'total' },
  { key: 'invalid', label: 'Невалидные', value: source.fact - source.valid, kind: 'loss' },
  { key: 'unbooked', label: 'Не записались', value: source.valid - source.scheduled, kind: 'loss' },
  { key: 'no-show', label: 'Не дошли', value: source.scheduled - source.reached, kind: 'loss' },
  { key: 'reached', label: 'Дошли', value: source.reached, kind: 'result' },
]
</script>

<template>
  <main class="path-lab">
    <GymkidsSoftAurora :tone="dashboard.leads.tone" />

    <div class="path-lab__shell">
      <header class="path-lab__header">
        <div>
          <RouterLink
            class="path-lab__back"
            to="/bento-preview"
          >
            <span aria-hidden="true">←</span>
            Пульс центра
          </RouterLink>
          <p class="path-lab__eyebrow">
            Лаборатория блока · Ново-Переделкино
          </p>
          <h1>Путь до пробного — 4 подхода</h1>
          <p class="path-lab__intro">
            Одинаковые данные, четыре способа показать переходы между этапами и потери каждого канала.
          </p>
        </div>

        <div class="path-lab__period">
          <span>Демо-данные</span>
          <strong>{{ dashboard.meta.periodLabel }}</strong>
        </div>
      </header>

      <section
        class="path-lab__grid"
        aria-label="Сравнение четырёх вариантов визуализации"
      >
        <article class="lab-card lab-card--metro">
          <header class="lab-card__header">
            <div>
              <span class="lab-card__index">01</span>
              <h2>Метро-линия</h2>
            </div>
            <p>Главное — последовательность переходов</p>
          </header>

          <div
            class="metro-legend"
            aria-hidden="true"
          >
            <span
              v-for="stage in stages"
              :key="stage.key"
            >{{ stage.label }}</span>
          </div>

          <div class="metro-list">
            <div
              v-for="source in dashboard.sources"
              :key="source.key"
              class="metro-row"
            >
              <strong class="source-name">{{ source.label }}</strong>

              <div class="metro-route">
                <template
                  v-for="(stage, stageIndex) in stages"
                  :key="stage.key"
                >
                  <div class="metro-station">
                    <span class="metro-station__value">{{ stageValue(source, stageIndex) }}</span>
                    <span class="metro-station__dot" />
                  </div>
                  <div
                    v-if="stageIndex < stages.length - 1"
                    class="metro-link"
                  >
                    <span>{{ transitionRate(source, stageIndex) }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </article>

        <article class="lab-card lab-card--ribbon">
          <header class="lab-card__header">
            <div>
              <span class="lab-card__index">02</span>
              <h2>Метро-лента</h2>
            </div>
            <p>Толщина маршрута показывает удержание</p>
          </header>

          <div
            class="ribbon-legend"
            aria-hidden="true"
          >
            <span
              v-for="stage in stages"
              :key="stage.key"
            >{{ stage.label }}</span>
          </div>

          <div class="ribbon-list">
            <div
              v-for="source in dashboard.sources"
              :key="source.key"
              class="ribbon-row"
            >
              <strong class="source-name">{{ source.label }}</strong>
              <div class="ribbon-route">
                <svg
                  viewBox="0 0 1000 44"
                  preserveAspectRatio="none"
                  role="img"
                  :aria-label="`Путь источника ${source.label}`"
                >
                  <polygon :points="ribbonPoints(source)" />
                  <line
                    v-for="x in [0, 333, 666, 1000]"
                    :key="x"
                    :x1="x"
                    y1="5"
                    :x2="x"
                    y2="39"
                  />
                </svg>
                <div class="ribbon-values">
                  <span
                    v-for="(_, stageIndex) in stages"
                    :key="stageIndex"
                  >{{ stageValue(source, stageIndex) }}</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article class="lab-card lab-card--ruler">
          <header class="lab-card__header">
            <div>
              <span class="lab-card__index">03</span>
              <h2>Линейка удержания</h2>
            </div>
            <p>Все каналы сравниваются на шкале 0–100%</p>
          </header>

          <div class="ruler-key">
            <span data-stage="reached">Дошёл</span>
            <span data-stage="scheduled">Записан</span>
            <span data-stage="valid">Валидный</span>
            <span data-stage="fact">Лид</span>
          </div>

          <div
            class="ruler-scale"
            aria-hidden="true"
          >
            <span
              v-for="tick in [0, 25, 50, 75, 100]"
              :key="tick"
            >{{ tick }}</span>
          </div>

          <div class="ruler-list">
            <div
              v-for="source in dashboard.sources"
              :key="source.key"
              class="ruler-row"
            >
              <strong class="source-name">{{ source.label }}</strong>
              <div class="retention-ruler">
                <span class="retention-ruler__line" />
                <span
                  v-for="marker in retentionMarkers(source)"
                  :key="marker.key"
                  class="retention-marker"
                  :data-stage="marker.key"
                  :style="{ '--marker-position': `${marker.position}%` }"
                  :title="`${marker.label}: ${marker.value} · ${marker.position}% от лидов`"
                >
                  <b>{{ marker.position }}%</b>
                  <i />
                </span>
              </div>
            </div>
          </div>
        </article>

        <article class="lab-card lab-card--waterfall">
          <header class="lab-card__header">
            <div>
              <span class="lab-card__index">04</span>
              <h2>Водопад потерь</h2>
            </div>
            <p>Главное — где именно теряются обращения</p>
          </header>

          <div class="waterfall-table">
            <div class="waterfall-head">
              <span>Канал</span>
              <span
                v-for="loss in losses(dashboard.sources[0])"
                :key="loss.key"
              >{{ loss.label }}</span>
            </div>

            <div
              v-for="source in dashboard.sources"
              :key="source.key"
              class="waterfall-row"
            >
              <strong class="source-name">{{ source.label }}</strong>
              <div
                v-for="loss in losses(source)"
                :key="loss.key"
                class="waterfall-cell"
                :data-kind="loss.kind"
                :style="{ '--fill-width': width(loss.value, source.fact) }"
              >
                <span>{{ loss.kind === 'loss' ? '−' : '' }}{{ loss.value }}</span>
                <small v-if="loss.kind === 'loss'">{{ rateLabel(loss.value, source.fact) }}</small>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  </main>
</template>

<style scoped>
.path-lab {
  position: relative;
  min-block-size: 100vh;
  overflow: hidden;
  color: #1a1c1a;
  background: #171918;
  font-family: Inter, Arial, sans-serif;
}

.path-lab::before {
  position: fixed;
  z-index: 0;
  inset: 0;
  background: rgb(8 10 9 / 12%);
  content: '';
  pointer-events: none;
}

.path-lab__shell {
  position: relative;
  z-index: 1;
  inline-size: min(1600px, calc(100% - 56px));
  margin-inline: auto;
  padding-block: 38px 54px;
}

.path-lab__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  margin-block-end: 28px;
  color: #f7f3ed;
}

.path-lab__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-block-end: 28px;
  color: rgb(247 243 237 / 72%);
  font-size: 14px;
  text-decoration: none;
  transition: color 180ms ease, transform 180ms ease;
}

.path-lab__back:hover {
  color: #fff;
  transform: translateX(-3px);
}

.path-lab__eyebrow {
  margin: 0 0 6px;
  color: rgb(247 243 237 / 58%);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.path-lab h1 {
  margin: 0;
  font-size: clamp(34px, 4vw, 62px);
  font-weight: 780;
  letter-spacing: -.055em;
  line-height: .98;
}

.path-lab__intro {
  max-inline-size: 740px;
  margin: 14px 0 0;
  color: rgb(247 243 237 / 68%);
  font-size: 16px;
  line-height: 1.45;
}

.path-lab__period {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  padding-block-end: 2px;
  color: rgb(247 243 237 / 64%);
  font-size: 13px;
}

.path-lab__period span {
  padding: 7px 12px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 999px;
}

.path-lab__period strong {
  color: #fff;
  font-size: 16px;
}

.path-lab__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.lab-card {
  position: relative;
  min-block-size: 490px;
  overflow: hidden;
  padding: 28px;
  border: 1px solid rgb(255 255 255 / 44%);
  border-radius: 30px;
  background: rgb(243 241 236 / 78%);
  box-shadow: 0 20px 52px rgb(5 12 9 / 15%);
  backdrop-filter: blur(17px) saturate(.8);
  transition: background-color 320ms ease, box-shadow 320ms ease, transform 320ms cubic-bezier(.2, .75, .25, 1);
}

.lab-card::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(120deg, transparent 28%, rgb(255 255 255 / 18%) 48%, transparent 67%);
  content: '';
  opacity: 0;
  pointer-events: none;
  transform: translateX(-45%);
  transition: opacity 260ms ease, transform 760ms cubic-bezier(.2, .7, .2, 1);
}

.lab-card:hover {
  z-index: 2;
  background: rgb(248 246 242 / 88%);
  box-shadow: 0 26px 64px rgb(5 12 9 / 22%);
  transform: translateY(-4px);
}

.lab-card:hover::after {
  opacity: 1;
  transform: translateX(48%);
}

.lab-card__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  min-block-size: 66px;
}

.lab-card__header > div {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.lab-card__index {
  color: #2e765e;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .1em;
}

.lab-card h2 {
  margin: 0;
  color: #1a1c1a;
  font-size: clamp(24px, 2vw, 32px);
  letter-spacing: -.045em;
  line-height: 1;
}

.lab-card__header p {
  max-inline-size: 230px;
  margin: 1px 0 0;
  color: rgb(26 28 26 / 58%);
  font-size: 13px;
  line-height: 1.35;
  text-align: end;
}

.source-name {
  font-size: 14px;
  letter-spacing: -.02em;
}

.metro-legend,
.ribbon-legend {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 12px 8px 4px 94px;
  color: rgb(26 28 26 / 48%);
  font-size: 11px;
  text-align: center;
}

.metro-list,
.ribbon-list,
.ruler-list {
  position: relative;
  z-index: 1;
  display: grid;
}

.metro-row,
.ribbon-row,
.ruler-row {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  align-items: center;
  min-block-size: 65px;
  border-block-start: 1px solid rgb(26 28 26 / 9%);
}

.metro-route {
  display: grid;
  grid-template-columns: 42px 1fr 42px 1fr 42px 1fr 42px;
  align-items: center;
  padding-inline: 6px;
}

.metro-station {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 5px;
}

.metro-station__value {
  font-size: 14px;
  font-weight: 760;
  line-height: 1;
}

.metro-station__dot {
  position: relative;
  z-index: 2;
  inline-size: 12px;
  block-size: 12px;
  border: 3px solid #f0eee9;
  border-radius: 50%;
  background: #626a66;
  box-shadow: 0 0 0 1px #626a66;
  transition: background-color 220ms ease, box-shadow 220ms ease, transform 220ms ease;
}

.metro-link {
  position: relative;
  block-size: 3px;
  margin-block-start: 19px;
  background: #858b87;
  transition: background-color 280ms ease, transform 280ms ease;
}

.metro-link span {
  position: absolute;
  inset-block-end: 7px;
  inset-inline-start: 50%;
  color: rgb(26 28 26 / 58%);
  font-size: 11px;
  font-weight: 700;
  transform: translateX(-50%);
}

.metro-row:hover .metro-link,
.metro-row:hover .metro-station__dot {
  background: #359c77;
}

.metro-row:hover .metro-link {
  transform: scaleX(1.04);
}

.metro-row:hover .metro-station__dot {
  box-shadow: 0 0 0 1px #359c77, 0 0 0 6px rgb(53 156 119 / 12%);
  transform: scale(1.14);
}

.ribbon-row {
  min-block-size: 65px;
}

.ribbon-route {
  position: relative;
  block-size: 52px;
}

.ribbon-route svg {
  position: absolute;
  inset: 4px 9px;
  inline-size: calc(100% - 18px);
  block-size: 44px;
  overflow: visible;
}

.ribbon-route polygon {
  fill: #727a76;
  transition: fill 300ms ease, filter 300ms ease;
}

.ribbon-route line {
  stroke: rgb(243 241 236 / 78%);
  stroke-width: 5;
}

.ribbon-values {
  position: absolute;
  z-index: 1;
  inset: 0 2px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
  text-shadow: 0 1px 3px rgb(0 0 0 / 32%);
}

.ribbon-row:hover .ribbon-route polygon {
  fill: #399d79;
  filter: drop-shadow(0 5px 8px rgb(38 114 87 / 22%));
}

.ruler-key {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 13px 0 9px 82px;
  color: rgb(26 28 26 / 58%);
  font-size: 11px;
}

.ruler-key span::before {
  display: inline-block;
  inline-size: 7px;
  block-size: 7px;
  margin-inline-end: 5px;
  border-radius: 50%;
  background: var(--stage-color);
  content: '';
}

[data-stage='reached'] { --stage-color: #2d8f6b; }
[data-stage='scheduled'] { --stage-color: #747d79; }
[data-stage='valid'] { --stage-color: #a7aeaa; }
[data-stage='fact'] { --stage-color: #202321; }

.ruler-scale {
  display: flex;
  justify-content: space-between;
  margin-inline: 88px 6px;
  padding-block-end: 3px;
  color: rgb(26 28 26 / 36%);
  font-size: 9px;
}

.ruler-row {
  min-block-size: 60px;
}

.retention-ruler {
  position: relative;
  block-size: 45px;
  margin-inline: 8px 17px;
}

.retention-ruler::before {
  position: absolute;
  inset: 5px 0;
  background: repeating-linear-gradient(90deg, rgb(26 28 26 / 7%) 0 1px, transparent 1px 25%);
  content: '';
}

.retention-ruler__line {
  position: absolute;
  inset-block-start: 25px;
  inset-inline: 0;
  block-size: 2px;
  background: rgb(26 28 26 / 17%);
}

.retention-marker {
  position: absolute;
  z-index: 1;
  inset-block-start: 7px;
  inset-inline-start: var(--marker-position);
  display: grid;
  justify-items: center;
  color: var(--stage-color);
  transform: translateX(-50%);
  transition: transform 240ms cubic-bezier(.2, .7, .2, 1);
}

.retention-marker b {
  font-size: 9px;
  line-height: 1;
}

.retention-marker i {
  inline-size: 8px;
  block-size: 8px;
  margin-block-start: 6px;
  border: 2px solid #eeece7;
  border-radius: 50%;
  background: var(--stage-color);
  box-shadow: 0 0 0 1px var(--stage-color);
}

.ruler-row:hover .retention-marker {
  transform: translate(-50%, -4px) scale(1.12);
}

.waterfall-table {
  position: relative;
  z-index: 1;
  min-inline-size: 0;
  margin-block-start: 14px;
}

.waterfall-head,
.waterfall-row {
  display: grid;
  grid-template-columns: 70px repeat(5, minmax(52px, 1fr));
  gap: 6px;
  align-items: center;
}

.waterfall-head {
  min-block-size: 37px;
  color: rgb(26 28 26 / 48%);
  font-size: 10px;
  line-height: 1.1;
  text-align: center;
}

.waterfall-head span:first-child {
  text-align: start;
}

.waterfall-row {
  min-block-size: 64px;
  border-block-start: 1px solid rgb(26 28 26 / 9%);
}

.waterfall-cell {
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
  min-block-size: 34px;
  overflow: hidden;
  border-block-end: 2px solid rgb(26 28 26 / 20%);
}

.waterfall-cell::before {
  position: absolute;
  inset-block-end: 0;
  inset-inline-start: 0;
  inline-size: var(--fill-width);
  block-size: 100%;
  background: rgb(92 101 96 / 12%);
  content: '';
  transform: scaleY(.18);
  transform-origin: bottom;
  transition: transform 420ms cubic-bezier(.2, .75, .2, 1), background-color 260ms ease;
}

.waterfall-cell > * {
  position: relative;
  z-index: 1;
}

.waterfall-cell span {
  font-size: 17px;
  font-weight: 780;
}

.waterfall-cell small {
  color: rgb(26 28 26 / 48%);
  font-size: 9px;
}

.waterfall-cell[data-kind='loss'] {
  color: #734e49;
  border-color: rgb(165 90 80 / 34%);
}

.waterfall-cell[data-kind='loss']::before {
  background: rgb(182 98 87 / 14%);
}

.waterfall-cell[data-kind='result'] {
  color: #246c53;
  border-color: rgb(45 143 107 / 48%);
}

.waterfall-cell[data-kind='result']::before {
  background: rgb(45 143 107 / 18%);
}

.waterfall-row:hover .waterfall-cell::before {
  transform: scaleY(1);
}

@media (max-width: 1180px) {
  .path-lab__grid {
    grid-template-columns: 1fr;
  }

  .lab-card {
    min-block-size: auto;
  }
}

@media (max-width: 720px) {
  .path-lab__shell {
    inline-size: min(100% - 24px, 620px);
    padding-block: 22px 36px;
  }

  .path-lab__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .path-lab__period {
    align-items: flex-start;
  }

  .lab-card {
    padding: 22px 18px;
    border-radius: 24px;
  }

  .lab-card__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .lab-card__header p {
    max-inline-size: none;
    text-align: start;
  }

  .metro-legend,
  .ribbon-legend {
    margin-inline-start: 75px;
  }

  .metro-row,
  .ribbon-row,
  .ruler-row {
    grid-template-columns: 68px minmax(0, 1fr);
  }

  .metro-route {
    grid-template-columns: 32px 1fr 32px 1fr 32px 1fr 32px;
  }

  .metro-link span {
    display: none;
  }

  .ruler-key {
    margin-inline-start: 68px;
  }

  .ruler-scale {
    margin-inline-start: 75px;
  }

  .lab-card--waterfall {
    overflow-x: auto;
  }

  .waterfall-table {
    min-inline-size: 600px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lab-card,
  .lab-card::after,
  .metro-link,
  .metro-station__dot,
  .ribbon-route polygon,
  .retention-marker,
  .waterfall-cell::before {
    transition: none;
  }
}
</style>
