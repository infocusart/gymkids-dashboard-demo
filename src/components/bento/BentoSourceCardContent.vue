<script setup lang="ts">
import type { FeaturedSourceCard } from '@/data/gymkidsFeaturedSources'

const props = withDefaults(defineProps<{
  card: FeaturedSourceCard
  compactFunnel?: boolean
  numberProgress?: number
}>(), { numberProgress: 1, compactFunnel: false })

const number = (value: number | null) => value === null ? '—' : Math.round(value * props.numberProgress).toLocaleString('ru-RU')
</script>

<template>
  <div class="channel-heading featured-source-heading">
    <div>
      <h2
        class="motion-title"
        data-gk-copy="title"
        :title="card.fullLabel"
      >
        {{ card.label }}
      </h2>
    </div>
  </div>
  <div class="channel-value">
    <strong
      class="motion-primary motion-shimmer"
      :data-shimmer-text="number(card.fact)"
    >{{ number(card.fact) }}</strong>
    <span
      v-if="!card.available || card.plan !== null"
      class="featured-source-plan"
    >{{ !card.available ? 'Нет лидов' : `из ${number(card.plan)}` }}</span>
  </div>
  <div
    class="channel-progress"
    :aria-label="card.forecastRate === null ? 'Доля источника в общем потоке' : 'Выполнение плана по прогнозу'"
  >
    <i :style="{ inlineSize: `${Math.min(100, Math.max(0, card.forecastRate ?? card.share ?? 0))}%` }" />
  </div>
  <div class="channel-meta">
    <span>Прогноз <b>{{ number(card.forecast) }}</b></span>
  </div>
</template>

<style>
.featured-source-heading > div { min-inline-size: 0; }
.featured-source-heading h2 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.channel-value .featured-source-plan { min-inline-size: 0; line-height: 1; }
.site-card .channel-value .featured-source-plan { align-self: center; }
</style>
