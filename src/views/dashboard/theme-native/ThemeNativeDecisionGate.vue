<script setup lang="ts">
import type { DataFreshnessStatus, DataTruthGrade, OwnerDecisionMode } from '@/data/dashboard'

interface ThemeNativeGateFreshness {
  source: string
  updatedAt: string
  status: DataFreshnessStatus
  note: string
  statusLabel: string
  statusColor: string
}

const props = defineProps<{
  mode: OwnerDecisionMode
  modeLabel: string
  modeColor: string
  modeIcon: string
  title: string
  summary: string
  allowedDecisions: readonly string[]
  blockedDecisions: readonly string[]
  freshness: readonly ThemeNativeGateFreshness[]
  truthGrade: DataTruthGrade
  truthGradeLabel: string
  truthGradeColor: string
}>()
</script>

<template>
  <VCard class="theme-owner-gate h-100">
    <VCardText class="theme-owner-gate__body">
      <div class="theme-owner-gate__header">
        <VAvatar
          rounded
          variant="tonal"
          :color="props.modeColor"
          class="theme-owner-gate__avatar"
        >
          <VIcon
            :icon="props.modeIcon"
            size="28"
          />
        </VAvatar>

        <div class="theme-owner-gate__heading">
          <div class="theme-owner-gate__eyebrow">
            Decision gate
          </div>
          <h2 class="theme-owner-gate__title">
            {{ props.title }}
          </h2>
          <p class="theme-owner-gate__summary">
            {{ props.summary }}
          </p>

          <div class="theme-owner-gate__chips">
            <VChip
              label
              size="small"
              :color="props.modeColor"
            >
              {{ props.modeLabel }}
            </VChip>
            <VChip
              label
              size="small"
              :color="props.truthGradeColor"
            >
              {{ props.truthGradeLabel }}
            </VChip>
          </div>
        </div>
      </div>

      <VDivider class="my-4" />

      <div class="theme-owner-gate__freshness">
        <div
          v-for="item in props.freshness"
          :key="item.source"
          class="theme-owner-gate__freshness-item"
        >
          <div class="d-flex align-center justify-space-between gap-3">
            <div class="theme-owner-gate__source">
              {{ item.source }}
            </div>
            <VChip
              label
              size="x-small"
              :color="item.statusColor"
            >
              {{ item.statusLabel }}
            </VChip>
          </div>
          <div class="theme-owner-gate__updated">
            {{ item.updatedAt }}
          </div>
          <div class="theme-owner-gate__note">
            {{ item.note }}
          </div>
        </div>
      </div>

      <div class="theme-owner-gate__lists">
        <section class="theme-owner-gate__list">
          <div class="theme-owner-gate__list-title">
            Можно решать
          </div>
          <div
            v-for="decision in props.allowedDecisions"
            :key="decision"
            class="theme-owner-gate__list-row"
          >
            <VIcon
              icon="tabler-check"
              color="success"
              size="18"
            />
            <span>{{ decision }}</span>
          </div>
        </section>

        <section class="theme-owner-gate__list">
          <div class="theme-owner-gate__list-title">
            Пока нельзя
          </div>
          <div
            v-for="decision in props.blockedDecisions"
            :key="decision"
            class="theme-owner-gate__list-row"
          >
            <VIcon
              icon="tabler-lock"
              color="warning"
              size="18"
            />
            <span>{{ decision }}</span>
          </div>
        </section>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.theme-owner-gate {
  letter-spacing: 0;
}

.theme-owner-gate__body {
  display: flex;
  block-size: 100%;
  flex-direction: column;
  padding: 1.15rem;
}

.theme-owner-gate__header {
  display: grid;
  align-items: start;
  gap: 1rem;
  grid-template-columns: auto minmax(0, 1fr);
}

.theme-owner-gate__avatar {
  block-size: 3rem;
  inline-size: 3rem;
}

.theme-owner-gate__heading {
  min-inline-size: 0;
}

.theme-owner-gate__eyebrow {
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0;
  text-transform: uppercase;
}

.theme-owner-gate__title {
  margin: 0.2rem 0 0;
  font-size: clamp(1.18rem, 1.4vw, 1.55rem);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.18;
  overflow-wrap: anywhere;
}

.theme-owner-gate__summary {
  margin: 0.5rem 0 0;
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 0.88rem;
  line-height: 1.42;
  overflow-wrap: anywhere;
}

.theme-owner-gate__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0.5rem;
  margin-block-start: 0.65rem;
  min-inline-size: 0;
}

.theme-owner-gate__freshness {
  display: grid;
  gap: 0.625rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.theme-owner-gate__freshness-item,
.theme-owner-gate__list {
  border: 1px solid rgba(201, 214, 255, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.035);
  padding: 0.65rem;
}

.theme-owner-gate__source,
.theme-owner-gate__list-title {
  font-size: 0.8rem;
  font-weight: 650;
  line-height: 1.25;
  min-inline-size: 0;
  overflow-wrap: anywhere;
}

.theme-owner-gate__freshness-item :deep(.v-chip),
.theme-owner-gate__chips :deep(.v-chip) {
  flex-shrink: 0;
}

.theme-owner-gate__updated {
  margin-block-start: 0.25rem;
  color: rgba(var(--v-theme-on-surface), 0.64);
  font-size: 0.7rem;
  overflow-wrap: anywhere;
}

.theme-owner-gate__note {
  display: -webkit-box;
  overflow: hidden;
  margin-block-start: 0.36rem;
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 0.75rem;
  line-height: 1.34;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.theme-owner-gate__lists {
  display: grid;
  gap: 0.625rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-block-start: 0.625rem;
}

.theme-owner-gate__list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.theme-owner-gate__list-row {
  display: grid;
  align-items: start;
  color: rgba(var(--v-theme-on-surface), 0.76);
  column-gap: 0.5rem;
  font-size: 0.76rem;
  grid-template-columns: 1.125rem minmax(0, 1fr);
  line-height: 1.25;
  overflow-wrap: anywhere;
}

@media (width <= 360px) {
  .theme-owner-gate__freshness,
  .theme-owner-gate__lists {
    grid-template-columns: 1fr;
  }
}
</style>
