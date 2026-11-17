<script setup lang="ts">
import { computed } from 'vue'
import type { DeepReadonly } from 'vue'
import { buildGymkidsMetricDetailView } from '@/data/gymkidsDetailViews'
import type { GymkidsMetricDetailKey } from '@/data/gymkidsDetailViews'
import type { GymkidsDashboardView } from '@/data/gymkidsSnapshot'

const props = defineProps<{
  dashboard: DeepReadonly<GymkidsDashboardView>
  view: GymkidsMetricDetailKey
}>()

const emit = defineEmits<{
  close: []
}>()

const detail = computed(() => buildGymkidsMetricDetailView(props.view, props.dashboard))
const tableColumns = computed(() => ({ '--metric-table-columns': detail.value.columns.length }))
</script>

<template>
  <section
    class="bento-layer bento-detail-layer"
    :data-bento-detail-view="detail.key"
  >
    <div class="bento-detail-grid metric-detail-grid">
      <article
        class="bento-detail-card bento-detail-hero metric-detail-hero"
        :data-bento-detail-anchor="detail.key"
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

        <div class="sources-detail-title metric-detail-title">
          <span>{{ detail.eyebrow }}</span>
          <h1
            tabindex="-1"
            data-bento-detail-focus
          >
            {{ detail.title }}
          </h1>
        </div>

        <div class="metric-detail-kpi">
          <strong>{{ detail.heroValue }}</strong>
          <span>{{ detail.heroUnit }}</span>
          <small>{{ detail.heroHelper }}</small>
        </div>

        <div
          class="metric-detail-steps"
          :data-count="detail.steps.length"
        >
          <div
            v-for="item in detail.steps"
            :key="item.label"
            class="metric-detail-step"
          >
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.helper }}</small>
          </div>
        </div>
      </article>

      <article class="bento-detail-card metric-detail-body">
        <header class="sources-detail-section-heading">
          <div>
            <span>{{ detail.tableEyebrow }}</span>
            <h2>{{ detail.tableTitle }}</h2>
          </div>
          <small>Агрегированный snapshot</small>
        </header>

        <div
          class="metric-detail-table"
          :style="tableColumns"
        >
          <div
            class="metric-detail-table__head"
            aria-hidden="true"
          >
            <span>Срез</span>
            <span
              v-for="column in detail.columns"
              :key="column"
            >{{ column }}</span>
          </div>

          <div
            v-for="row in detail.rows"
            :key="row.key"
            class="metric-detail-table__row"
          >
            <strong>{{ row.label }}</strong>
            <span
              v-for="(cell, cellIndex) in row.cells"
              :key="`${row.key}-${cellIndex}`"
            >
              <b>{{ cell.value }}</b>
              <small>{{ cell.helper }}</small>
            </span>
          </div>
        </div>

        <footer class="metric-detail-note">
          {{ detail.tableNote }}
        </footer>
      </article>

      <article
        v-for="item in detail.insights"
        :key="item.key"
        class="bento-detail-card sources-insight-card"
        :data-insight="item.key"
      >
        <span>{{ item.eyebrow }}</span>
        <div>
          <h2>{{ item.label }}</h2>
          <strong>{{ item.value }}</strong>
        </div>
        <p>{{ item.helper }}</p>
      </article>
    </div>
  </section>
</template>
