<script setup lang="ts">
import type { DataTruthGrade, OwnerRankStatus } from '@/data/dashboard'

interface ThemeNativeCenterRankingRow {
  center: string
  status: OwnerRankStatus
  statusLabel: string
  statusColor: string
  statusIcon: string
  spend: string
  leads: string
  validRate: string
  reachedTrials: string
  costPerLead: string
  costPerReachedTrial: string
  problemSignal: string
  truthGrade: DataTruthGrade
  truthGradeLabel: string
  truthGradeColor: string
}

const props = defineProps<{
  rows: readonly ThemeNativeCenterRankingRow[]
}>()
</script>

<template>
  <VCard class="theme-center-ranking h-100">
    <VCardItem>
      <VCardTitle>Срез центра</VCardTitle>
      <VCardSubtitle>
        Planning-grade baseline: это пока не сетевой рейтинг, а проверка формы блока на одном центре.
      </VCardSubtitle>
    </VCardItem>

    <VCardText class="theme-center-ranking__body">
      <div
        v-for="row in props.rows"
        :key="row.center"
        class="theme-center-ranking__row"
      >
        <div class="theme-center-ranking__head">
          <VAvatar
            rounded
            variant="tonal"
            :color="row.statusColor"
            size="38"
          >
            <VIcon
              :icon="row.statusIcon"
              size="21"
            />
          </VAvatar>

          <div class="theme-center-ranking__title-wrap">
            <div class="theme-center-ranking__center">
              {{ row.center }}
            </div>
            <div class="theme-center-ranking__signal">
              {{ row.problemSignal }}
            </div>
          </div>

          <div class="theme-center-ranking__chips">
            <VChip
              label
              size="x-small"
              :color="row.statusColor"
            >
              {{ row.statusLabel }}
            </VChip>
            <VChip
              label
              size="x-small"
              :color="row.truthGradeColor"
            >
              {{ row.truthGradeLabel }}
            </VChip>
          </div>
        </div>

        <div class="theme-center-ranking__metrics">
          <div class="theme-center-ranking__metric">
            <span>Spend</span>
            <strong>{{ row.spend }}</strong>
          </div>
          <div class="theme-center-ranking__metric">
            <span>Leads</span>
            <strong>{{ row.leads }}</strong>
          </div>
          <div class="theme-center-ranking__metric">
            <span>Valid rate</span>
            <strong>{{ row.validRate }}</strong>
          </div>
          <div class="theme-center-ranking__metric">
            <span>Reached</span>
            <strong>{{ row.reachedTrials }}</strong>
          </div>
          <div class="theme-center-ranking__metric">
            <span>CPL</span>
            <strong>{{ row.costPerLead }}</strong>
          </div>
          <div class="theme-center-ranking__metric">
            <span>CPRT</span>
            <strong>{{ row.costPerReachedTrial }}</strong>
          </div>
        </div>
      </div>

      <div class="theme-center-ranking__caveat">
        <VIcon
          icon="tabler-info-circle"
          size="18"
          color="info"
        />
        <span>Multi-center directory не подключен, поэтому этот блок не делает network-wide выводов.</span>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.theme-center-ranking__body {
  display: flex;
  block-size: 100%;
  flex-direction: column;
  gap: 0.875rem;
}

.theme-center-ranking__row {
  border: 1px solid rgba(201, 214, 255, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.035);
  padding: 0.9rem;
}

.theme-center-ranking__head {
  display: grid;
  align-items: start;
  gap: 0.75rem;
  grid-template-columns: auto minmax(0, 1fr);
}

.theme-center-ranking__title-wrap {
  min-inline-size: 0;
}

.theme-center-ranking__center {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.theme-center-ranking__signal {
  margin-block-start: 0.35rem;
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 0.82rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.theme-center-ranking__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  grid-column: 1 / -1;
}

.theme-center-ranking__metrics {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-block-start: 0.85rem;
}

.theme-center-ranking__metric {
  min-inline-size: 0;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.035);
  padding: 0.58rem;
}

.theme-center-ranking__metric span {
  display: block;
  color: rgba(var(--v-theme-on-surface), 0.58);
  font-size: 0.68rem;
  line-height: 1.2;
  text-transform: uppercase;
}

.theme-center-ranking__metric strong {
  display: block;
  margin-block-start: 0.2rem;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.16;
  overflow-wrap: anywhere;
}

.theme-center-ranking__caveat {
  display: grid;
  align-items: start;
  gap: 0.5rem;
  grid-template-columns: 1.125rem minmax(0, 1fr);
  margin-block-start: auto;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.78rem;
  line-height: 1.35;
}

@media (width <= 480px) {
  .theme-center-ranking__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
