<script setup lang="ts">
import type { DeepReadonly } from 'vue'
import type { GymkidsSiteEconomics } from '@/data/gymkidsSiteEconomics'

defineProps<{ economics: DeepReadonly<GymkidsSiteEconomics> }>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <section
    class="site-details"
    aria-label="Экономика интернет-привлечения"
    @click="emit('close')"
  >
    <header class="site-details__heading">
      <h3>Экономика привлечения</h3>
    </header>

    <div class="site-details__spend">
      <span>Расход Директа</span>
      <strong>{{ economics.spendLabel }}</strong>
    </div>

    <dl
      class="site-details__costs"
      :title="economics.basis"
    >
      <div
        v-for="cost in economics.costs"
        :key="cost.key"
        :title="cost.key === 'trial' ? economics.trialBasis : economics.basis"
      >
        <dt>{{ cost.label }}<small>{{ cost.countLabel }} {{ cost.unit }}</small></dt>
        <dd>{{ cost.valueLabel }}</dd>
      </div>
    </dl>

    <section
      class="site-details__channels"
      aria-labelledby="site-channels-title"
    >
      <h3 id="site-channels-title">
        Состав обращений
      </h3>
      <div
        v-for="channel in economics.channels"
        :key="channel.key"
        class="site-details__channel"
      >
        <span>{{ channel.label }}</span><b>{{ channel.countLabel }}</b><small>{{ channel.shareLabel }}</small>
      </div>
    </section>

    <section
      class="site-details__traffic"
      aria-labelledby="site-traffic-title"
    >
      <h3 id="site-traffic-title">
        Реклама
      </h3>
      <dl>
        <div
          v-for="metric in economics.traffic"
          :key="metric.key"
          :data-metric="metric.key"
        >
          <dt>{{ metric.label }}</dt>
          <dd>{{ metric.valueLabel }}</dd>
        </div>
      </dl>
    </section>
  </section>
</template>

<style scoped>
.site-details { position: relative; z-index: 9; min-block-size: 0; overflow: auto; margin-block-start: 18px; padding-block-start: 14px; border-block-start: 1px solid var(--line); color: var(--ink); scrollbar-width: thin; font-variant-numeric: tabular-nums; }
.site-details h3 { margin: 0; color: var(--ink); font-size: 16px; font-weight: 700; letter-spacing: -.035em; line-height: 1.2; }
.site-details__spend { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-block: 12px 6px; }
.site-details__spend > span { color: var(--muted); font-size: 12px; }
.site-details__spend strong { font-size: 20px; font-weight: 650; letter-spacing: -.06em; line-height: 1.1; white-space: nowrap; }
.site-details dl { margin: 0; }
.site-details dd { margin: 0; font-weight: 650; white-space: nowrap; }
.site-details__costs > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-block: 7px; border-block-end: 1px solid var(--line); }
.site-details__costs dt { font-size: 13px; line-height: 1.2; }
.site-details__costs small { display: block; margin-block-start: 3px; color: var(--muted); font-size: 10px; line-height: 1.2; }
.site-details__costs dd { font-size: 18px; letter-spacing: -.045em; line-height: 1.1; }
.site-details__costs > div:last-child { border: 0; }
.site-details__traffic, .site-details__channels { margin-block-start: 14px; }
.site-details__channels h3 { margin-block-end: 9px; }
.site-details__channel { display: grid; grid-template-columns: minmax(0, 1fr) auto 42px; align-items: baseline; gap: 9px; padding-block: 7px; border-block-end: 1px solid var(--line); font-size: 12px; line-height: 1.25; }
.site-details__channel small { color: var(--muted); text-align: end; font-size: 11px; }
.site-details__channel:last-child { border: 0; }
.site-details__traffic dl { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px 8px; margin-block-start: 10px; }
.site-details__traffic dt { color: var(--muted); font-size: 11px; line-height: 1.3; }
.site-details__traffic dd { margin-block-start: 3px; font-size: 18px; letter-spacing: -.035em; line-height: 1.15; }
.site-details__traffic [data-metric="cpc"] dd { font-size: 16px; }
.site-details-fade-enter-active { transition: opacity 280ms ease 380ms; }
.site-details-fade-leave-active { position: absolute; transition: opacity 160ms ease; }
.site-details-fade-enter-from, .site-details-fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .site-details-fade-enter-active, .site-details-fade-leave-active { transition: none; } }
</style>
