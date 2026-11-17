<script setup lang="ts">
import type { DataFreshnessStatus, DataTruthGrade } from '@/data/dashboard'

interface ThemeNativeBaselineMetric {
  label: string
  value: string
  helper: string
  truthGrade: DataTruthGrade
  truthGradeLabel: string
  truthGradeColor: string
}

interface ThemeNativeBaselineSource {
  label: string
  value: string
  helper: string
  truthGrade: DataTruthGrade
  truthGradeLabel: string
  truthGradeColor: string
  freshnessStatus: DataFreshnessStatus
  freshnessStatusLabel: string
  freshnessStatusColor: string
}

const props = defineProps<{
  overline: string
  title: string
  periodRange: string
  center: string
  cohortLogic: string
  summary: string
  metrics: readonly ThemeNativeBaselineMetric[]
  sources: readonly ThemeNativeBaselineSource[]
  caveats: readonly string[]
}>()
</script>

<template>
  <VCard class="theme-historical-baseline">
    <VCardText>
      <div class="theme-historical-baseline__layout">
        <section class="theme-historical-baseline__lead">
          <div class="d-flex align-center gap-3 flex-wrap">
            <VAvatar
              rounded
              variant="tonal"
              color="primary"
              size="42"
            >
              <VIcon
                icon="tabler-calendar-stats"
                size="24"
              />
            </VAvatar>

            <div class="theme-historical-baseline__heading">
              <div class="theme-historical-baseline__overline">
                {{ props.overline }}
              </div>
              <h1 class="theme-historical-baseline__title">
                {{ props.title }}
              </h1>
            </div>
          </div>

          <div class="theme-historical-baseline__chips">
            <VChip
              label
              size="small"
              color="primary"
            >
              {{ props.periodRange }}
            </VChip>
            <VChip
              label
              size="small"
              color="info"
            >
              {{ props.center }}
            </VChip>
          </div>

          <p class="theme-historical-baseline__cohort">
            {{ props.cohortLogic }}
          </p>
          <p class="theme-historical-baseline__summary">
            {{ props.summary }}
          </p>

          <div class="theme-historical-baseline__caveats">
            <span
              v-for="caveat in props.caveats"
              :key="caveat"
              class="theme-historical-baseline__caveat"
            >
              <VIcon
                icon="tabler-alert-circle"
                size="15"
              />
              {{ caveat }}
            </span>
          </div>
        </section>

        <section class="theme-historical-baseline__metrics">
          <article
            v-for="metric in props.metrics"
            :key="metric.label"
            class="theme-historical-baseline__metric"
          >
            <div class="theme-historical-baseline__metric-label">
              {{ metric.label }}
            </div>
            <div class="theme-historical-baseline__metric-value">
              {{ metric.value }}
            </div>
            <div class="theme-historical-baseline__metric-helper">
              {{ metric.helper }}
            </div>
            <VChip
              label
              size="x-small"
              :color="metric.truthGradeColor"
            >
              {{ metric.truthGradeLabel }}
            </VChip>
          </article>
        </section>

        <section class="theme-historical-baseline__sources">
          <article
            v-for="source in props.sources"
            :key="source.label"
            class="theme-historical-baseline__source"
          >
            <div>
              <div class="theme-historical-baseline__source-label">
                {{ source.label }}
              </div>
              <div class="theme-historical-baseline__source-value">
                {{ source.value }}
              </div>
              <div class="theme-historical-baseline__source-helper">
                {{ source.helper }}
              </div>
            </div>

            <div class="theme-historical-baseline__source-chips">
              <VChip
                label
                size="x-small"
                :color="source.truthGradeColor"
              >
                {{ source.truthGradeLabel }}
              </VChip>
              <VChip
                label
                size="x-small"
                :color="source.freshnessStatusColor"
              >
                {{ source.freshnessStatusLabel }}
              </VChip>
            </div>
          </article>
        </section>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.theme-historical-baseline {
  overflow: hidden;
  letter-spacing: 0;
}

.theme-historical-baseline__layout {
  display: grid;
  align-items: stretch;
  gap: 1rem;
  grid-template-areas:
    "lead metrics"
    "lead sources";
  grid-template-columns: minmax(20rem, 0.62fr) minmax(0, 1fr);
}

.theme-historical-baseline__lead,
.theme-historical-baseline__metrics,
.theme-historical-baseline__sources {
  min-inline-size: 0;
}

.theme-historical-baseline__lead {
  display: flex;
  flex-direction: column;
  grid-area: lead;
}

.theme-historical-baseline__heading {
  min-inline-size: 0;
}

.theme-historical-baseline__overline {
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.theme-historical-baseline__title {
  margin: 0.15rem 0 0;
  font-size: clamp(1.14rem, 1.45vw, 1.62rem);
  font-weight: 750;
  letter-spacing: 0;
  line-height: 1.16;
  overflow-wrap: anywhere;
}

.theme-historical-baseline__chips,
.theme-historical-baseline__caveats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  min-inline-size: 0;
}

.theme-historical-baseline__chips {
  margin-block-start: 0.85rem;
}

.theme-historical-baseline__cohort,
.theme-historical-baseline__summary {
  margin: 0.75rem 0 0;
  color: rgba(var(--v-theme-on-surface), 0.75);
  font-size: 0.84rem;
  line-height: 1.42;
  overflow-wrap: anywhere;
}

.theme-historical-baseline__summary {
  margin-block-start: 0.45rem;
  color: rgba(var(--v-theme-on-surface), 0.68);
}

.theme-historical-baseline__caveats {
  margin-block-start: auto;
  padding-block-start: 0.85rem;
}

.theme-historical-baseline__caveat {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(var(--v-theme-warning), 0.18);
  border-radius: 0.55rem;
  background: rgba(var(--v-theme-warning), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-size: 0.72rem;
  gap: 0.25rem;
  line-height: 1.25;
  padding: 0.35rem 0.45rem;
}

.theme-historical-baseline__metrics {
  display: grid;
  gap: 0.65rem;
  grid-area: metrics;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.theme-historical-baseline__metric,
.theme-historical-baseline__source {
  border: 1px solid rgba(201, 214, 255, 0.08);
  border-radius: 0.75rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02)),
    rgba(255, 255, 255, 0.025);
}

.theme-historical-baseline__metric {
  display: flex;
  min-block-size: 6.45rem;
  flex-direction: column;
  padding: 0.62rem;
}

.theme-historical-baseline__metric-label,
.theme-historical-baseline__source-label {
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
}

.theme-historical-baseline__metric-label {
  text-transform: uppercase;
}

.theme-historical-baseline__source-label {
  color: rgba(var(--v-theme-on-surface), 0.84);
  font-size: 0.78rem;
  text-transform: none;
}

.theme-historical-baseline__metric-value {
  margin-block-start: 0.38rem;
  font-size: clamp(1rem, 1.15vw, 1.32rem);
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.05;
  overflow-wrap: anywhere;
}

.theme-historical-baseline__metric-helper,
.theme-historical-baseline__source-helper,
.theme-historical-baseline__source-value {
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 0.74rem;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.theme-historical-baseline__metric-helper {
  display: -webkit-box;
  overflow: hidden;
  margin-block: 0.3rem 0.45rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.theme-historical-baseline__metric :deep(.v-chip) {
  align-self: flex-start;
  margin-block-start: auto;
}

.theme-historical-baseline__sources {
  display: grid;
  gap: 0.65rem;
  grid-area: sources;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.theme-historical-baseline__source {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 0.42rem;
  min-block-size: 4.25rem;
  padding: 0.58rem;
}

.theme-historical-baseline__source-value {
  margin-block-start: 0.18rem;
  color: rgba(var(--v-theme-on-surface), 0.86);
  font-weight: 700;
}

.theme-historical-baseline__source-helper {
  display: -webkit-box;
  overflow: hidden;
  margin-block-start: 0.18rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.theme-historical-baseline__source-chips {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0.3rem;
  margin-block-start: auto;
}

@media (width <= 1260px) {
  .theme-historical-baseline__layout {
    grid-template-areas:
      "lead"
      "metrics"
      "sources";
    grid-template-columns: 1fr;
  }

  .theme-historical-baseline__metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .theme-historical-baseline__sources {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 700px) {
  .theme-historical-baseline__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .theme-historical-baseline__sources {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .theme-historical-baseline__metric {
    min-block-size: 5.65rem;
    padding: 0.55rem;
  }

  .theme-historical-baseline__source {
    min-block-size: 4.15rem;
    padding: 0.52rem;
  }

  .theme-historical-baseline__source-helper {
    display: none;
  }

  .theme-historical-baseline__cohort,
  .theme-historical-baseline__summary {
    font-size: 0.8rem;
    line-height: 1.35;
  }
}

@media (width <= 360px) {
  .theme-historical-baseline__metrics,
  .theme-historical-baseline__sources {
    grid-template-columns: 1fr;
  }
}
</style>
