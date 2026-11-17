<script setup lang="ts">
import type { DataFreshnessStatus, DataTruthGrade } from '@/data/dashboard'

interface ThemeNativeOwnerKpi {
  title: string
  value: string
  helper: string
  source: string
  grain: string
  icon: string
  color: string
  truthGrade: DataTruthGrade
  truthGradeLabel: string
  truthGradeColor: string
  freshnessStatus: DataFreshnessStatus
  freshnessStatusLabel: string
  freshnessStatusColor: string
}

const props = defineProps<{
  items: readonly ThemeNativeOwnerKpi[]
}>()
</script>

<template>
  <VCard class="theme-owner-kpi h-100">
    <VCardItem>
      <VCardTitle>Короткий owner-срез</VCardTitle>
      <VCardSubtitle>
        Первые метрики для чтения экрана: только источник, зерно данных и уровень доверия рядом с числом.
      </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <div class="theme-owner-kpi__grid">
        <article
          v-for="item in props.items"
          :key="item.title"
          class="theme-owner-kpi__item"
          :style="`border-block-start-color: rgba(var(--v-theme-${item.color}), 0.7)`"
        >
          <div class="theme-owner-kpi__topline">
            <VAvatar
              rounded
              variant="tonal"
              :color="item.color"
              size="36"
            >
              <VIcon
                :icon="item.icon"
                size="20"
              />
            </VAvatar>

            <div class="theme-owner-kpi__badges">
              <VChip
                label
                size="x-small"
                :color="item.truthGradeColor"
              >
                {{ item.truthGradeLabel }}
              </VChip>
              <VChip
                label
                size="x-small"
                :color="item.freshnessStatusColor"
              >
                {{ item.freshnessStatusLabel }}
              </VChip>
            </div>
          </div>

          <div class="theme-owner-kpi__value">
            {{ item.value }}
          </div>
          <div class="theme-owner-kpi__title">
            {{ item.title }}
          </div>
          <div class="theme-owner-kpi__helper">
            {{ item.helper }}
          </div>

          <div class="theme-owner-kpi__meta">
            <span>{{ item.source }}</span>
            <span>{{ item.grain }}</span>
          </div>
        </article>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.theme-owner-kpi {
  letter-spacing: 0;
}

.theme-owner-kpi__grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.theme-owner-kpi__item {
  display: flex;
  min-block-size: 10.85rem;
  min-inline-size: 0;
  flex-direction: column;
  border: 1px solid rgba(201, 214, 255, 0.08);
  border-block-start: 3px solid rgba(var(--v-theme-primary), 0.7);
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02)),
    rgba(255, 255, 255, 0.025);
  padding: 0.75rem;
}

.theme-owner-kpi__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.theme-owner-kpi__badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.3rem;
  min-inline-size: 0;
}

.theme-owner-kpi__badges :deep(.v-chip) {
  max-inline-size: 100%;
  flex-shrink: 0;
}

.theme-owner-kpi__value {
  margin-block-start: 0.78rem;
  font-size: clamp(1.18rem, 1.35vw, 1.48rem);
  font-variant-numeric: tabular-nums;
  font-weight: 750;
  letter-spacing: 0;
  line-height: 1.05;
  overflow-wrap: anywhere;
}

.theme-owner-kpi__title {
  margin-block-start: 0.35rem;
  font-size: 0.86rem;
  font-weight: 650;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.theme-owner-kpi__helper {
  display: -webkit-box;
  overflow: hidden;
  margin-block-start: 0.28rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.77rem;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.theme-owner-kpi__meta {
  display: grid;
  gap: 0.25rem;
  margin-block-start: auto;
  padding-block-start: 0.65rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.68rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

@media (width <= 1200px) {
  .theme-owner-kpi__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 360px) {
  .theme-owner-kpi__grid {
    grid-template-columns: 1fr;
  }

  .theme-owner-kpi__item {
    min-block-size: 11.6rem;
  }
}
</style>
