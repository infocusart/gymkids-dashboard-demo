<script setup lang="ts">
import type { DataTruthGrade, OwnerProblemSeverity } from '@/data/dashboard'

interface ThemeNativeProblemBucket {
  title: string
  metric: string
  detail: string
  nextStep: string
  severity: OwnerProblemSeverity
  severityLabel: string
  severityColor: string
  severityIcon: string
  icon: string
  color: string
  truthGrade: DataTruthGrade
  truthGradeLabel: string
  truthGradeColor: string
}

const props = defineProps<{
  buckets: readonly ThemeNativeProblemBucket[]
}>()
</script>

<template>
  <VCard class="theme-problem-map h-100">
    <VCardItem>
      <VCardTitle>Problem map</VCardTitle>
      <VCardSubtitle>
        Traffic, funnel, data quality, capacity и payment blockers в одном owner-слое.
      </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <div class="theme-problem-map__list">
        <article
          v-for="bucket in props.buckets"
          :key="bucket.title"
          class="theme-problem-map__bucket"
          :style="`border-inline-start-color: rgba(var(--v-theme-${bucket.color}), 0.78)`"
        >
          <div class="theme-problem-map__head">
            <VAvatar
              rounded
              variant="tonal"
              :color="bucket.color"
              size="34"
            >
              <VIcon
                :icon="bucket.icon"
                size="19"
              />
            </VAvatar>

            <div class="theme-problem-map__copy">
              <div class="theme-problem-map__title">
                {{ bucket.title }}
              </div>
              <div class="theme-problem-map__detail">
                {{ bucket.detail }}
              </div>
            </div>

            <div class="theme-problem-map__metric">
              {{ bucket.metric }}
            </div>
          </div>

          <div class="theme-problem-map__footer">
            <div class="theme-problem-map__next">
              {{ bucket.nextStep }}
            </div>
            <div class="theme-problem-map__chips">
              <VChip
                label
                size="x-small"
                :color="bucket.severityColor"
              >
                {{ bucket.severityLabel }}
              </VChip>
              <VChip
                label
                size="x-small"
                :color="bucket.truthGradeColor"
              >
                {{ bucket.truthGradeLabel }}
              </VChip>
            </div>
          </div>
        </article>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.theme-problem-map__list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.theme-problem-map__bucket {
  border: 1px solid rgba(201, 214, 255, 0.08);
  border-inline-start: 3px solid rgba(var(--v-theme-primary), 0.78);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.032);
  padding: 0.75rem;
}

.theme-problem-map__head {
  display: grid;
  align-items: start;
  gap: 0.65rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.theme-problem-map__copy {
  min-inline-size: 0;
}

.theme-problem-map__title {
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.theme-problem-map__detail {
  display: -webkit-box;
  overflow: hidden;
  margin-block-start: 0.25rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.76rem;
  line-height: 1.32;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.theme-problem-map__metric {
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  font-weight: 750;
  line-height: 1.1;
  max-inline-size: 4.5rem;
  overflow-wrap: anywhere;
  text-align: end;
}

.theme-problem-map__footer {
  display: grid;
  align-items: center;
  gap: 0.65rem;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-block-start: 0.6rem;
}

.theme-problem-map__next {
  display: -webkit-box;
  overflow: hidden;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.72rem;
  line-height: 1.3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.theme-problem-map__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.3rem;
}

@media (width <= 480px) {
  .theme-problem-map__footer {
    align-items: start;
    grid-template-columns: 1fr;
  }

  .theme-problem-map__chips {
    justify-content: flex-start;
  }
}
</style>
