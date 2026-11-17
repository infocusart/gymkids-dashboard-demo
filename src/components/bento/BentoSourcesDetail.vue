<script setup lang="ts">
import { computed } from 'vue'
import type { DeepReadonly } from 'vue'
import { buildGymkidsSourcesDetailView } from '@/data/gymkidsDetailViews'
import type { GymkidsDashboardView } from '@/data/gymkidsSnapshot'

const props = defineProps<{
  dashboard: DeepReadonly<GymkidsDashboardView>
}>()

const emit = defineEmits<{
  close: []
}>()

const detail = computed(() => buildGymkidsSourcesDetailView(props.dashboard))
</script>

<template>
  <section
    class="bento-layer bento-detail-layer"
    data-bento-detail-view="sources"
  >
    <div class="bento-detail-grid sources-detail-grid">
      <article
        class="bento-detail-card bento-detail-hero sources-detail-hero"
        data-bento-detail-anchor="sources"
      >
        <header class="sources-detail-hero__header">
          <button
            class="bento-detail-back"
            type="button"
            @click="emit('close')"
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="m12.5 4.5-5.5 5.5 5.5 5.5M7.5 10H17" />
            </svg>
            <span>К обзору</span>
          </button>
          <span>{{ detail.periodLabel }} · срез по {{ detail.selectedDateLabel }}</span>
        </header>

        <div class="sources-detail-title">
          <span>Внутренняя аналитика</span>
          <h1
            tabindex="-1"
            data-bento-detail-focus
          >
            Откуда пришли лиды
          </h1>
        </div>

        <div class="sources-detail-total">
          <strong>{{ detail.totalLabel }}</strong>
          <span>лида<br>в выбранной когорте</span>
        </div>

        <div
          class="sources-detail-mix"
          aria-label="Распределение лидов по источникам"
        >
          <div
            v-for="row in detail.rows"
            :key="row.key"
            class="sources-detail-mix__row"
          >
            <span>{{ row.label }}</span>
            <i><b :style="{ inlineSize: `${row.share}%` }" /></i>
            <strong>{{ row.factLabel }}</strong>
            <em>{{ row.shareLabel }}</em>
          </div>
        </div>
      </article>

      <article class="bento-detail-card sources-funnel-card">
        <header class="sources-detail-section-heading">
          <div>
            <span>Качество каналов</span>
            <h2>Путь каждого источника</h2>
          </div>
          <small>Конверсии считаются от лидов</small>
        </header>

        <div
          class="sources-funnel-head"
          aria-hidden="true"
        >
          <span>Канал</span><span>Лиды</span><span>Валидные</span><span>Записаны</span><span>Дошли</span>
        </div>

        <div class="sources-funnel-body">
          <div
            v-for="row in detail.rows"
            :key="row.key"
            class="sources-funnel-row"
          >
            <strong>{{ row.label }}</strong>
            <span><b>{{ row.fact }}</b><small>{{ row.shareLabel }}</small></span>
            <span><b>{{ row.valid }}</b><small>{{ String(row.validRate).replace('.', ',') }}%</small></span>
            <span><b>{{ row.scheduled }}</b><small>{{ String(row.scheduledRate).replace('.', ',') }}%</small></span>
            <span><b>{{ row.reached }}</b><small>{{ String(row.reachedRate).replace('.', ',') }}%</small></span>
          </div>
        </div>

        <footer class="sources-funnel-note">
          <span>Доходимость считается отдельно: дошли / записаны.</span>
          <span>Источник данных — опубликованный агрегированный snapshot.</span>
        </footer>
      </article>

      <article
        v-for="insight in detail.insights"
        :key="insight.key"
        class="bento-detail-card sources-insight-card"
        :data-insight="insight.key"
      >
        <span>{{ insight.eyebrow }}</span>
        <div>
          <h2>{{ insight.label }}</h2>
          <strong>{{ insight.value }}</strong>
        </div>
        <p>{{ insight.helper }}</p>
      </article>
    </div>
  </section>
</template>
