<script setup lang="ts">
import { themeNativeDashboard } from '@/data/dashboardThemeNative'
import { parseReportPercent } from '@/lib/reportPercent'
import ThemeNativeShipmentStatistics from '@/views/dashboard/theme-native/ThemeNativeShipmentStatistics.vue'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const router = useRouter()
const report = themeNativeDashboard.trialPathReport

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()

    return
  }

  router.push('/owner-atlas')
}

const getShowRateTone = (showRate: string) => {
  const numericValue = parseReportPercent(showRate)
  if (numericValue === null)
    return 'secondary'

  if (numericValue >= 70)
    return 'success'

  if (numericValue >= 40)
    return 'warning'

  return 'error'
}
</script>

<template>
  <div class="center-dashboard-page">
    <div class="center-dashboard-shell trial-path-report-page">
      <section class="trial-path-report-hero">
        <div class="d-flex flex-wrap justify-space-between align-start gap-6">
          <div class="trial-path-report-copy">
            <VBtn
              variant="text"
              color="secondary"
              prepend-icon="tabler-arrow-left"
              class="ps-0 mb-4"
              @click="goBack"
            >
              Назад к дашборду
            </VBtn>

            <div class="text-overline mb-3">
              GYMKIDS · TRIAL PATH DRILL-DOWN
            </div>

            <h1 class="trial-path-report-title">
              {{ report.title }}
            </h1>

            <p class="text-h6 text-medium-emphasis mb-3">
              {{ report.subtitle }}
            </p>

            <p class="text-body-1 text-medium-emphasis mb-0 trial-path-report-summary">
              {{ report.summary }}
            </p>
          </div>

          <div class="trial-path-report-highlight-grid">
            <VCard
              v-for="item in report.highlights"
              :key="item.title"
              class="trial-path-highlight-card"
            >
              <VCardText>
                <div class="text-sm text-medium-emphasis mb-2">
                  {{ item.title }}
                </div>
                <div class="text-h3 mb-1">
                  {{ item.value }}
                </div>
                <div class="text-sm text-medium-emphasis">
                  {{ item.helper }}
                </div>
              </VCardText>
            </VCard>
          </div>
        </div>
      </section>

      <VRow class="match-height">
        <VCol
          cols="12"
          lg="8"
        >
          <ThemeNativeShipmentStatistics
            :title="report.chart.title"
            :subtitle="report.chart.subtitle"
            :button-label="report.chart.buttonLabel"
            :categories="report.chart.categories"
            :tooltip-labels="report.chart.tooltipLabels"
            :series="report.chart.series"
          />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <VCard class="h-100">
            <VCardItem
              :title="report.insightCard.title"
              :subtitle="report.insightCard.subtitle"
            />

            <VCardText class="pt-2">
              <div class="trial-path-bullet-list mb-6">
                <div
                  v-for="bullet in report.insightCard.bullets"
                  :key="bullet"
                  class="trial-path-bullet-item"
                >
                  <VIcon
                    icon="tabler-arrow-right"
                    size="16"
                    class="mt-1"
                  />
                  <span class="text-sm text-medium-emphasis">{{ bullet }}</span>
                </div>
              </div>

              <div class="trial-path-metric-stack">
                <div
                  v-for="metric in report.insightCard.metrics"
                  :key="metric.label"
                  class="trial-path-metric-row"
                >
                  <div>
                    <div class="text-sm text-medium-emphasis">
                      {{ metric.label }}
                    </div>
                    <div class="text-h5 mb-1">
                      {{ metric.value }}
                    </div>
                    <div class="text-sm text-medium-emphasis">
                      {{ metric.helper }}
                    </div>
                  </div>

                  <VAvatar
                    size="14"
                    :color="metric.color"
                    variant="tonal"
                  >
                    <VIcon
                      icon="tabler-point-filled"
                      size="10"
                    />
                  </VAvatar>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <VCard class="h-100">
            <VCardItem
              :title="report.opsSummary.title"
              :subtitle="report.opsSummary.subtitle"
            />

            <VCardText class="pt-2">
              <div class="trial-path-ops-stack">
                <div
                  v-for="row in report.opsSummary.rows"
                  :key="row.label"
                  class="trial-path-ops-row"
                >
                  <div>
                    <div class="text-sm text-medium-emphasis">
                      {{ row.label }}
                    </div>
                    <div class="text-h5 mb-1">
                      {{ row.value }}
                    </div>
                    <div class="text-sm text-medium-emphasis">
                      {{ row.helper }}
                    </div>
                  </div>

                  <VAvatar
                    size="14"
                    :color="row.color"
                    variant="tonal"
                  >
                    <VIcon
                      icon="tabler-point-filled"
                      size="10"
                    />
                  </VAvatar>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <VCard class="h-100">
            <VCardItem
              title="Статус недошедших"
              subtitle="Что стало с no-show после срыва окна: ждут перенос, уже перезаписаны или потеряны."
            />

            <VCardText class="pt-2">
              <div class="trial-path-status-stack">
                <div
                  v-for="status in report.noShowStatus"
                  :key="status.title"
                  class="trial-path-status-row"
                >
                  <div class="d-flex justify-space-between align-start gap-3 mb-2">
                    <div class="text-body-1 font-weight-medium">
                      {{ status.title }}
                    </div>

                    <VChip
                      label
                      size="small"
                      :color="status.color"
                      variant="tonal"
                    >
                      {{ status.share }}
                    </VChip>
                  </div>

                  <div class="d-flex justify-space-between align-center gap-3 mb-2">
                    <span class="text-sm text-medium-emphasis">Лидов</span>
                    <span class="text-h6">{{ status.value }}</span>
                  </div>

                  <p class="text-sm text-medium-emphasis mb-0">
                    {{ status.note }}
                  </p>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <VCard class="h-100">
            <VCardItem
              title="Причины no-show"
              subtitle="Reason layer после записи: почему пробники не превращались в посещение."
            />

            <VCardText class="pt-2">
              <div class="trial-path-reason-stack">
                <div
                  v-for="reason in report.noShowReasons"
                  :key="reason.title"
                  class="trial-path-reason-row"
                >
                  <div class="d-flex justify-space-between align-start gap-3 mb-2">
                    <div class="text-body-1 font-weight-medium">
                      {{ reason.title }}
                    </div>

                    <VChip
                      label
                      size="small"
                      color="warning"
                      variant="tonal"
                    >
                      {{ reason.share }}
                    </VChip>
                  </div>

                  <div class="d-flex justify-space-between align-center gap-3 mb-2">
                    <span class="text-sm text-medium-emphasis">Кейсов</span>
                    <span class="text-h6">{{ reason.value }}</span>
                  </div>

                  <p class="text-sm text-medium-emphasis mb-0">
                    {{ reason.note }}
                  </p>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12">
          <VCard>
            <VCardItem
              title="Дневной срез пробного пути"
              subtitle="По каждому дню видно, сколько валидных лидов дошло до записи, где был carry-over, сколько случилось переносов и какой получился show rate."
            />

            <VCardText class="pt-2">
              <div class="trial-path-table-wrap">
                <VTable class="text-no-wrap">
                  <thead>
                    <tr>
                      <th scope="col">
                        Дата
                      </th>
                      <th scope="col">
                        Валидные
                      </th>
                      <th scope="col">
                        Записаны
                      </th>
                      <th scope="col">
                        Из прошлого периода
                      </th>
                      <th scope="col">
                        Перезаписи
                      </th>
                      <th scope="col">
                        Дошли
                      </th>
                      <th scope="col">
                        No-show
                      </th>
                      <th scope="col">
                        Доходимость
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="row in report.dailyRows"
                      :key="row.date"
                    >
                      <td class="font-weight-medium">
                        {{ row.date }}
                      </td>
                      <td>{{ row.valid }}</td>
                      <td>{{ row.scheduled }}</td>
                      <td>{{ row.carryOver }}</td>
                      <td>{{ row.rescheduled }}</td>
                      <td>{{ row.reached }}</td>
                      <td>{{ row.noShow }}</td>
                      <td>
                        <VChip
                          label
                          size="small"
                          :color="getShowRateTone(row.showRate)"
                          variant="tonal"
                        >
                          {{ row.showRate }}
                        </VChip>
                      </td>
                    </tr>
                  </tbody>
                </VTable>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          lg="12"
        >
          <VAlert
            color="secondary"
            variant="tonal"
            rounded="xl"
            border="start"
            icon="tabler-info-circle"
          >
            Этот отчет сознательно отвечает только за путь после валидации: запись, переносы, carry-over и фактическую доходимость до пробного. Поток лидов и mix источников вынесены в отдельный lead-flow report.
          </VAlert>
        </VCol>
      </VRow>
    </div>
  </div>
</template>

<style lang="scss">
.center-dashboard-page {
  position: relative;
  min-block-size: 100vh;
  overflow: hidden;
  padding: 1.75rem;
  background:
    radial-gradient(circle at 8% 10%, rgba(var(--v-theme-primary), 0.22), transparent 24%),
    radial-gradient(circle at 92% 4%, rgba(var(--v-theme-info), 0.16), transparent 20%),
    radial-gradient(circle at 50% 110%, rgba(var(--v-theme-warning), 0.08), transparent 24%),
    linear-gradient(180deg, #2f3f5f 0%, #24344f 20%, #1d2941 54%, #182236 100%);
}

.center-dashboard-page::before {
  position: fixed;
  z-index: 0;
  background:
    linear-gradient(115deg, rgba(255, 255, 255, 0.06), transparent 36%),
    radial-gradient(circle at 20% 12%, rgba(255, 255, 255, 0.06), transparent 18%),
    radial-gradient(circle at 80% 0%, rgba(var(--v-theme-primary), 0.09), transparent 22%);
  content: "";
  inset: 0;
  pointer-events: none;
}

.center-dashboard-page::after {
  position: fixed;
  z-index: 0;
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.045) 0.7px, transparent 0.7px),
    linear-gradient(180deg, transparent, rgba(8, 14, 26, 0.18));
  background-size: 12px 12px, 100% 100%;
  content: "";
  inset: 0;
  mix-blend-mode: soft-light;
  opacity: 0.45;
  pointer-events: none;
}

.center-dashboard-shell {
  position: relative;
  z-index: 1;
  margin-inline: auto;
  max-inline-size: 112rem;
}

.center-dashboard-shell .v-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(201, 214, 255, 0.08);
  border-radius: 1.75rem;
  background:
    linear-gradient(180deg, rgba(60, 67, 100, 0.96), rgba(46, 53, 82, 0.98)),
    linear-gradient(140deg, rgba(255, 255, 255, 0.05), transparent 46%);
  box-shadow:
    0 22px 48px rgba(11, 18, 32, 0.22),
    0 1px 0 rgba(255, 255, 255, 0.04) inset;
}

.center-dashboard-shell .v-card::before {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.045);
  border-radius: calc(1.75rem - 1px);
  content: "";
  inset: 1px;
  pointer-events: none;
}

.center-dashboard-shell .text-h2,
.center-dashboard-shell .text-h3,
.center-dashboard-shell .text-h4,
.center-dashboard-shell .text-h5,
.center-dashboard-shell .text-h6 {
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.center-dashboard-shell .text-h2,
.center-dashboard-shell .text-h3,
.center-dashboard-shell .text-h4 {
  font-variant-numeric: tabular-nums;
}

.center-dashboard-shell .text-overline {
  letter-spacing: 0.16em;
}

.center-dashboard-shell .v-card-title {
  font-weight: 650;
  letter-spacing: -0.02em;
}

.trial-path-report-hero {
  margin-block-end: 1.5rem;
}

.trial-path-report-copy {
  max-inline-size: 42rem;
}

.trial-path-report-title {
  margin-block-end: 0.75rem;
  font-size: clamp(2.4rem, 4vw, 4.1rem);
  line-height: 1;
}

.trial-path-report-summary {
  max-inline-size: 38rem;
}

.trial-path-report-highlight-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(11rem, 1fr));
  inline-size: min(100%, 34rem);
}

.trial-path-highlight-card .v-card-text {
  min-block-size: 9.25rem;
}

.trial-path-bullet-list {
  display: grid;
  gap: 0.9rem;
}

.trial-path-bullet-item {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
}

.trial-path-metric-stack,
.trial-path-reason-stack,
.trial-path-ops-stack,
.trial-path-status-stack {
  display: grid;
  gap: 0.9rem;
}

.trial-path-metric-row,
.trial-path-reason-row,
.trial-path-ops-row,
.trial-path-status-row {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
}

.trial-path-metric-row,
.trial-path-ops-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.trial-path-table-wrap {
  overflow-x: auto;
}

.trial-path-table-wrap table th {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (width <= 960px) {
  .center-dashboard-page {
    padding: 1rem;
  }

  .center-dashboard-shell {
    max-inline-size: 100%;
  }

  .trial-path-report-highlight-grid {
    grid-template-columns: 1fr;
    inline-size: 100%;
  }
}
</style>
