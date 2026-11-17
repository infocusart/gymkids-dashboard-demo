<script setup lang="ts">
import { themeNativeDashboard } from '@/data/dashboardThemeNative'
import ThemeNativeAverageDailySales from '@/views/dashboard/theme-native/ThemeNativeAverageDailySales.vue'
import ThemeNativeCampaignState from '@/views/dashboard/theme-native/ThemeNativeCampaignState.vue'
import ThemeNativeDiagnosticsFocus from '@/views/dashboard/theme-native/ThemeNativeDiagnosticsFocus.vue'
import ThemeNativeEconomicsList from '@/views/dashboard/theme-native/ThemeNativeEconomicsList.vue'
import ThemeNativeSalesOverview from '@/views/dashboard/theme-native/ThemeNativeSalesOverview.vue'
import ThemeNativeShipmentStatistics from '@/views/dashboard/theme-native/ThemeNativeShipmentStatistics.vue'
import ThemeNativeSourceVisits from '@/views/dashboard/theme-native/ThemeNativeSourceVisits.vue'
import ThemeNativeSupportTracker from '@/views/dashboard/theme-native/ThemeNativeSupportTracker.vue'
import ThemeNativeTimelineCard from '@/views/dashboard/theme-native/ThemeNativeTimelineCard.vue'
import ThemeNativeWebsiteAnalytics from '@/views/dashboard/theme-native/ThemeNativeWebsiteAnalytics.vue'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const atlasFamilies = [
  'Owner overview',
  'CRM overview',
  'Loss map',
  'Traffic support',
  'Grey zones',
  'Diagnostics',
]
</script>

<template>
  <div class="center-dashboard-page atlas-page">
    <div class="center-dashboard-shell">
      <section class="atlas-page-header">
        <div class="text-overline atlas-page-overline">
          GYMKIDS · MASTER SCREEN ATLAS
        </div>

        <div class="d-flex align-start justify-space-between gap-6 flex-wrap">
          <div class="atlas-page-copy">
            <h1 class="atlas-page-title">
              Owner Atlas
            </h1>
            <p class="atlas-page-subtitle text-body-1 text-medium-emphasis mb-0">
              Обзорная система по прямым выгрузкам из CRM, Yandex Direct и Yandex Metrica: сначала даем человеку максимум метрик
              и структуры, а серые зоны показываем спокойно и отдельно.
            </p>
          </div>

          <div class="atlas-chip-cloud">
            <VChip
              v-for="family in atlasFamilies"
              :key="family"
              label
              color="primary"
              variant="tonal"
              size="small"
              class="atlas-family-chip"
            >
              {{ family }}
            </VChip>
          </div>
        </div>
      </section>

      <section class="atlas-band">
        <header class="atlas-band-header">
          <div class="atlas-band-overline">
            01 · Owner Overview
          </div>
          <h2 class="atlas-band-title">
            Главный обзор центра
          </h2>
          <p class="atlas-band-copy">
            Верхний слой должен за несколько секунд показать объем, ритм и путь до пробного, чтобы человек сразу увидел общую картину месяца.
          </p>
        </header>

        <VRow class="match-height">
          <VCol
            cols="12"
            md="6"
          >
            <ThemeNativeWebsiteAnalytics
              class="h-100"
              :overline="themeNativeDashboard.websiteAnalytics.overline"
              :title="themeNativeDashboard.websiteAnalytics.title"
              :subtitle="themeNativeDashboard.websiteAnalytics.subtitle"
              :chip="themeNativeDashboard.websiteAnalytics.chip"
              :slides="themeNativeDashboard.websiteAnalytics.slides"
            />
          </VCol>

          <VCol
            cols="12"
            md="3"
            sm="6"
          >
            <ThemeNativeAverageDailySales
              class="h-100"
              :title="themeNativeDashboard.averageDailySales.title"
              :subtitle="themeNativeDashboard.averageDailySales.subtitle"
              :value="themeNativeDashboard.averageDailySales.value"
              :helper="themeNativeDashboard.averageDailySales.helper"
              :categories="themeNativeDashboard.averageDailySales.categories"
              :series="themeNativeDashboard.averageDailySales.series"
              :tooltip-labels="themeNativeDashboard.averageDailySales.tooltipLabels"
              :details-route="themeNativeDashboard.averageDailySales.detailsRoute"
            />
          </VCol>

          <VCol
            cols="12"
            md="3"
            sm="6"
          >
            <ThemeNativeSalesOverview
              class="h-100"
              :title="themeNativeDashboard.salesOverview.title"
              :delta="themeNativeDashboard.salesOverview.delta"
              :total="themeNativeDashboard.salesOverview.total"
              :details-route="themeNativeDashboard.salesOverview.detailsRoute"
              :left="themeNativeDashboard.salesOverview.left"
              :right="themeNativeDashboard.salesOverview.right"
              :progress="themeNativeDashboard.salesOverview.progress"
              :progress-color="themeNativeDashboard.salesOverview.progressColor"
              :progress-bg-color="themeNativeDashboard.salesOverview.progressBgColor"
            />
          </VCol>
        </VRow>
      </section>

      <section class="atlas-band atlas-band-seamless">
        <header class="atlas-band-header">
          <div class="atlas-band-overline">
            02 · CRM Overview
          </div>
          <h2 class="atlas-band-title">
            Источники, валидация и текущие хвосты
          </h2>
          <p class="atlas-band-copy">
            Первый обзорный ряд после hero: откуда пришли лиды, как они проходят середину воронки и где уже виден текущий операционный хвост.
          </p>
        </header>

        <VRow class="match-height">
          <VCol
            cols="12"
            lg="4"
          >
            <ThemeNativeSourceVisits
              class="h-100"
              :title="themeNativeDashboard.atlasLeadSources.title"
              :subtitle="themeNativeDashboard.atlasLeadSources.subtitle"
              :rows="themeNativeDashboard.atlasLeadSources.rows"
              :details-route="themeNativeDashboard.atlasLeadSources.detailsRoute"
              details-label="Клик — открыть CRM-слой"
            />
          </VCol>

          <VCol
            cols="12"
            lg="4"
          >
            <ThemeNativeSupportTracker
              class="h-100"
              :title="themeNativeDashboard.supportTracker.title"
              :subtitle="themeNativeDashboard.supportTracker.subtitle"
              :total="themeNativeDashboard.supportTracker.total"
              :total-label="themeNativeDashboard.supportTracker.totalLabel"
              :radial-value="themeNativeDashboard.supportTracker.radialValue"
              :radial-label="themeNativeDashboard.supportTracker.radialLabel"
              :items="themeNativeDashboard.supportTracker.items"
              :details-route="themeNativeDashboard.supportTracker.detailsRoute"
              details-label="Клик — открыть CRM-слой"
            />
          </VCol>

          <VCol
            cols="12"
            lg="4"
          >
            <ThemeNativeCampaignState
              class="h-100"
              :title="themeNativeDashboard.crmQueueState.title"
              :subtitle="themeNativeDashboard.crmQueueState.subtitle"
              :rows="themeNativeDashboard.crmQueueState.rows"
              :details-route="themeNativeDashboard.crmQueueState.detailsRoute"
              details-label="Клик — открыть CRM-слой"
            />
          </VCol>
        </VRow>
      </section>

      <section class="atlas-band">
        <header class="atlas-band-header">
          <div class="atlas-band-overline">
            03 · Loss Map
          </div>
          <h2 class="atlas-band-title">
            Где теряем лидов по пути
          </h2>
          <p class="atlas-band-copy">
            Второй обзорный ряд: не абстрактные сигналы, а реальные buckets потерь из CRM по невалидности, no-show и отказам.
          </p>
        </header>

        <VRow class="match-height">
          <VCol
            cols="12"
            lg="4"
          >
            <ThemeNativeCampaignState
              class="h-100"
              :title="themeNativeDashboard.invalidReasonState.title"
              :subtitle="themeNativeDashboard.invalidReasonState.subtitle"
              :rows="themeNativeDashboard.invalidReasonState.rows"
              :details-route="themeNativeDashboard.invalidReasonState.detailsRoute"
              details-label="Клик — открыть карту потерь"
            />
          </VCol>

          <VCol
            cols="12"
            lg="4"
          >
            <ThemeNativeCampaignState
              class="h-100"
              :title="themeNativeDashboard.noShowReasonState.title"
              :subtitle="themeNativeDashboard.noShowReasonState.subtitle"
              :rows="themeNativeDashboard.noShowReasonState.rows"
              :details-route="themeNativeDashboard.noShowReasonState.detailsRoute"
              details-label="Клик — открыть карту потерь"
            />
          </VCol>

          <VCol
            cols="12"
            lg="4"
          >
            <ThemeNativeCampaignState
              class="h-100"
              :title="themeNativeDashboard.refusalReasonState.title"
              :subtitle="themeNativeDashboard.refusalReasonState.subtitle"
              :rows="themeNativeDashboard.refusalReasonState.rows"
              :details-route="themeNativeDashboard.refusalReasonState.detailsRoute"
              details-label="Клик — открыть карту потерь"
            />
          </VCol>
        </VRow>
      </section>

      <section class="atlas-band">
        <header class="atlas-band-header">
          <div class="atlas-band-overline">
            04 · Traffic Support
          </div>
          <h2 class="atlas-band-title">
            Direct, Metrica и поддерживающий digital слой
          </h2>
          <p class="atlas-band-copy">
            Здесь не главный сюжет, а обзорная поддержка: как выглядит сайт, что дает paid-окно и какие серые зоны важно видеть, но не ставить в центр экрана.
          </p>
        </header>

        <VRow class="match-height">
          <VCol
            cols="12"
            lg="4"
          >
            <ThemeNativeCampaignState
              class="h-100"
              :title="themeNativeDashboard.sitePerformanceState.title"
              :subtitle="themeNativeDashboard.sitePerformanceState.subtitle"
              :rows="themeNativeDashboard.sitePerformanceState.rows"
              :details-route="themeNativeDashboard.sitePerformanceState.detailsRoute"
              details-label="Клик — открыть digital-слой"
            />
          </VCol>

          <VCol
            cols="12"
            lg="4"
          >
            <ThemeNativeEconomicsList
              class="h-100"
              :title="themeNativeDashboard.economicsList.title"
              :subtitle="themeNativeDashboard.economicsList.subtitle"
              :warning-title="themeNativeDashboard.economicsList.warningTitle"
              :warning-text="themeNativeDashboard.economicsList.warningText"
              :rows="themeNativeDashboard.economicsList.rows"
              :notes="themeNativeDashboard.economicsList.notes"
              :details-route="themeNativeDashboard.economicsList.detailsRoute"
              details-label="Клик — открыть digital-слой"
            />
          </VCol>
          <VCol
            cols="12"
            lg="4"
          >
            <ThemeNativeTimelineCard
              class="h-100"
              :title="themeNativeDashboard.greyZoneTimeline.title"
              :subtitle="themeNativeDashboard.greyZoneTimeline.subtitle"
              :items="themeNativeDashboard.greyZoneTimeline.items"
              :details-route="themeNativeDashboard.greyZoneTimeline.detailsRoute"
              details-label="Клик — открыть digital-слой"
            />
          </VCol>
        </VRow>
      </section>

      <section class="atlas-band">
        <header class="atlas-band-header">
          <div class="atlas-band-overline">
            05 · Deep Dive
          </div>
          <h2 class="atlas-band-title">
            Ритм когорты и детализация
          </h2>
          <p class="atlas-band-copy">
            Нижний слой уже для спокойного чтения: сначала дневной ритм, затем tabs-блок с причинами, breakdown и полной детализацией по CRM.
          </p>
        </header>

        <VRow class="match-height">
          <VCol cols="12">
            <ThemeNativeShipmentStatistics
              :title="themeNativeDashboard.shipmentStatistics.title"
              :subtitle="themeNativeDashboard.shipmentStatistics.subtitle"
              :button-label="themeNativeDashboard.shipmentStatistics.buttonLabel"
              :categories="themeNativeDashboard.shipmentStatistics.categories"
              :tooltip-labels="themeNativeDashboard.shipmentStatistics.tooltipLabels"
              :series="themeNativeDashboard.shipmentStatistics.series"
            />
          </VCol>
        </VRow>

        <VRow class="match-height mt-2">
          <VCol cols="12">
            <ThemeNativeDiagnosticsFocus :sections="themeNativeDashboard.diagnosticSections" />
          </VCol>
        </VRow>
      </section>
    </div>
  </div>
</template>

<style lang="scss">
.atlas-page {
  position: relative;
}

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
  transition:
    transform 320ms cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 320ms cubic-bezier(0.32, 0.72, 0, 1),
    border-color 320ms cubic-bezier(0.32, 0.72, 0, 1);
}

.center-dashboard-shell .v-card::before {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.045);
  border-radius: calc(1.75rem - 1px);
  content: "";
  inset: 1px;
  pointer-events: none;
}

.center-dashboard-shell .v-card:hover {
  transform: translateY(-2px);
  border-color: rgba(201, 214, 255, 0.13);
  box-shadow:
    0 28px 60px rgba(8, 14, 28, 0.28),
    0 1px 0 rgba(255, 255, 255, 0.06) inset;
}

.center-dashboard-shell .bg-primary {
  background:
    radial-gradient(circle at 75% 28%, rgba(255, 255, 255, 0.12), transparent 18%),
    linear-gradient(135deg, rgba(138, 119, 255, 0.94), rgba(102, 83, 232, 0.96));
  box-shadow:
    0 28px 58px rgba(56, 43, 130, 0.34),
    0 1px 0 rgba(255, 255, 255, 0.08) inset;
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

.center-dashboard-shell .v-card-subtitle,
.center-dashboard-shell .text-body-2,
.center-dashboard-shell .text-medium-emphasis {
  text-wrap: pretty;
}

.atlas-page-header {
  margin-block-end: 2rem;
  padding-inline: 0.125rem;
}

.atlas-page-overline {
  margin-block-end: 0.7rem;
  color: rgba(231, 236, 255, 0.7);
}

.atlas-page-copy {
  max-inline-size: 52rem;
}

.atlas-page-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 0.98;
}

.atlas-page-subtitle {
  max-inline-size: 44rem;
  margin-block-start: 0.75rem;
}

.atlas-chip-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  max-inline-size: 28rem;
}

.atlas-family-chip {
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.atlas-band + .atlas-band {
  margin-block-start: 2rem;
}

.atlas-band-seamless {
  margin-block-start: 1rem !important;
}

.atlas-band-header {
  margin-block-end: 1rem;
  padding-inline: 0.125rem;
}

.atlas-band-overline {
  margin-block-end: 0.4rem;
  color: rgba(182, 194, 255, 0.72);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.atlas-band-title {
  margin: 0;
  font-size: clamp(1.25rem, 1.6vw, 1.65rem);
  font-weight: 650;
  letter-spacing: -0.035em;
}

.atlas-band-copy {
  max-inline-size: 48rem;
  margin: 0.4rem 0 0;
  color: rgba(220, 227, 255, 0.72);
  font-size: 0.98rem;
  line-height: 1.55;
}

.atlas-placeholder-card .v-card-text {
  padding: 1.5rem;
}

.atlas-placeholder-body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
  border: 1px dashed rgba(184, 194, 255, 0.18);
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.01)),
    radial-gradient(circle at 100% 0%, rgba(var(--v-theme-secondary), 0.08), transparent 28%);
  padding: 1.25rem;
  min-block-size: 15rem;
}

.atlas-placeholder-dash {
  inline-size: 5.5rem;
  block-size: 0.32rem;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(var(--v-theme-secondary), 0.9), rgba(255, 255, 255, 0.18));
  margin-block-end: 1rem;
}

.atlas-placeholder-note {
  max-inline-size: 17rem;
  line-height: 1.65;
}

@media (width <= 960px) {
  .center-dashboard-page {
    padding: 1rem;
  }

  .center-dashboard-shell {
    max-inline-size: 100%;
  }

  .atlas-page-header {
    margin-block-end: 1.5rem;
  }

  .atlas-band + .atlas-band {
    margin-block-start: 1.5rem;
  }
}
</style>
