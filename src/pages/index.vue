<script setup lang="ts">
import { themeNativeDashboard } from '@/data/dashboardThemeNative'
import ThemeNativeAverageDailySales from '@/views/dashboard/theme-native/ThemeNativeAverageDailySales.vue'
import ThemeNativeCampaignState from '@/views/dashboard/theme-native/ThemeNativeCampaignState.vue'
import ThemeNativeCenterRanking from '@/views/dashboard/theme-native/ThemeNativeCenterRanking.vue'
import ThemeNativeChannelEfficiency from '@/views/dashboard/theme-native/ThemeNativeChannelEfficiency.vue'
import ThemeNativeDataLayerTable from '@/views/dashboard/theme-native/ThemeNativeDataLayerTable.vue'
import ThemeNativeDecisionGate from '@/views/dashboard/theme-native/ThemeNativeDecisionGate.vue'
import ThemeNativeDiagnosticsFocus from '@/views/dashboard/theme-native/ThemeNativeDiagnosticsFocus.vue'
import ThemeNativeEconomicsList from '@/views/dashboard/theme-native/ThemeNativeEconomicsList.vue'
import ThemeNativeHistoricalBaseline from '@/views/dashboard/theme-native/ThemeNativeHistoricalBaseline.vue'
import ThemeNativeOpsWorkbench from '@/views/dashboard/theme-native/ThemeNativeOpsWorkbench.vue'
import ThemeNativeOwnerActionQueue from '@/views/dashboard/theme-native/ThemeNativeOwnerActionQueue.vue'
import ThemeNativeOwnerKpiStrip from '@/views/dashboard/theme-native/ThemeNativeOwnerKpiStrip.vue'
import ThemeNativePlanProgress from '@/views/dashboard/theme-native/ThemeNativePlanProgress.vue'
import ThemeNativeProblemMap from '@/views/dashboard/theme-native/ThemeNativeProblemMap.vue'
import ThemeNativeSalesOverview from '@/views/dashboard/theme-native/ThemeNativeSalesOverview.vue'
import ThemeNativeShipmentStatistics from '@/views/dashboard/theme-native/ThemeNativeShipmentStatistics.vue'
import ThemeNativeSignalCardGrid from '@/views/dashboard/theme-native/ThemeNativeSignalCardGrid.vue'
import ThemeNativeSourceVisits from '@/views/dashboard/theme-native/ThemeNativeSourceVisits.vue'
import ThemeNativeSupportTracker from '@/views/dashboard/theme-native/ThemeNativeSupportTracker.vue'
import ThemeNativeTimelineCard from '@/views/dashboard/theme-native/ThemeNativeTimelineCard.vue'
import ThemeNativeWebsiteAnalytics from '@/views/dashboard/theme-native/ThemeNativeWebsiteAnalytics.vue'
import ThemeNativeWeeklyOverview from '@/views/dashboard/theme-native/ThemeNativeWeeklyOverview.vue'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <div class="center-dashboard-page">
    <div class="center-dashboard-shell">
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

        <VCol
          cols="12"
          md="6"
        >
          <ThemeNativeWeeklyOverview
            :title="themeNativeDashboard.weeklyOverview.title"
            :subtitle="themeNativeDashboard.weeklyOverview.subtitle"
            :total="themeNativeDashboard.weeklyOverview.total"
            :delta="themeNativeDashboard.weeklyOverview.delta"
            :summary="themeNativeDashboard.weeklyOverview.summary"
            :categories="themeNativeDashboard.weeklyOverview.categories"
            :series="themeNativeDashboard.weeklyOverview.series"
            :items="themeNativeDashboard.weeklyOverview.items"
          />
        </VCol>

        <VCol
          cols="12"
          md="6"
        >
          <ThemeNativeSupportTracker
            :title="themeNativeDashboard.supportTracker.title"
            :subtitle="themeNativeDashboard.supportTracker.subtitle"
            :total="themeNativeDashboard.supportTracker.total"
            :total-label="themeNativeDashboard.supportTracker.totalLabel"
            :radial-value="themeNativeDashboard.supportTracker.radialValue"
            :radial-label="themeNativeDashboard.supportTracker.radialLabel"
            :items="themeNativeDashboard.supportTracker.items"
          />
        </VCol>

        <VCol cols="12">
          <ThemeNativeHistoricalBaseline v-bind="themeNativeDashboard.ownerOverview.historicalBaseline" />
        </VCol>

        <VCol
          cols="12"
          lg="5"
        >
          <ThemeNativeDecisionGate
            class="h-100"
            v-bind="themeNativeDashboard.ownerOverview.decisionGate"
          />
        </VCol>

        <VCol
          cols="12"
          lg="7"
        >
          <ThemeNativeOwnerKpiStrip
            class="h-100"
            :items="themeNativeDashboard.ownerOverview.kpis"
          />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <ThemeNativeCenterRanking
            class="h-100"
            :rows="themeNativeDashboard.ownerOverview.centerRanking"
          />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <ThemeNativeProblemMap
            class="h-100"
            :buckets="themeNativeDashboard.ownerOverview.problemBuckets"
          />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <ThemeNativeOwnerActionQueue
            class="h-100"
            :items="themeNativeDashboard.ownerOverview.actionQueue"
            :hooks="themeNativeDashboard.ownerOverview.drilldownHooks"
          />
        </VCol>

        <VCol
          cols="12"
          lg="8"
        >
          <ThemeNativeShipmentStatistics
            :title="themeNativeDashboard.shipmentStatistics.title"
            :subtitle="themeNativeDashboard.shipmentStatistics.subtitle"
            :button-label="themeNativeDashboard.shipmentStatistics.buttonLabel"
            :categories="themeNativeDashboard.shipmentStatistics.categories"
            :tooltip-labels="themeNativeDashboard.shipmentStatistics.tooltipLabels"
            :series="themeNativeDashboard.shipmentStatistics.series"
          />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <ThemeNativeSourceVisits
            :title="themeNativeDashboard.sourceVisits.title"
            :subtitle="themeNativeDashboard.sourceVisits.subtitle"
            :rows="themeNativeDashboard.sourceVisits.rows"
          />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <ThemeNativeCampaignState
            :title="themeNativeDashboard.campaignState.title"
            :subtitle="themeNativeDashboard.campaignState.subtitle"
            :rows="themeNativeDashboard.campaignState.rows"
          />
        </VCol>

        <VCol
          cols="12"
          lg="8"
        >
          <ThemeNativePlanProgress
            :title="themeNativeDashboard.planProgress.title"
            :subtitle="themeNativeDashboard.planProgress.subtitle"
            :total="themeNativeDashboard.planProgress.total"
            :delta="themeNativeDashboard.planProgress.delta"
            :categories="themeNativeDashboard.planProgress.categories"
            :progress-series="themeNativeDashboard.planProgress.progressSeries"
            :remainder-series="themeNativeDashboard.planProgress.remainderSeries"
            :items="themeNativeDashboard.planProgress.items"
          />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <ThemeNativeEconomicsList
            :title="themeNativeDashboard.economicsList.title"
            :subtitle="themeNativeDashboard.economicsList.subtitle"
            :warning-title="themeNativeDashboard.economicsList.warningTitle"
            :warning-text="themeNativeDashboard.economicsList.warningText"
            :rows="themeNativeDashboard.economicsList.rows"
            :notes="themeNativeDashboard.economicsList.notes"
          />
        </VCol>

        <VCol
          cols="12"
          lg="8"
        >
          <ThemeNativeSignalCardGrid
            :title="themeNativeDashboard.marketingSignals.title"
            :subtitle="themeNativeDashboard.marketingSignals.subtitle"
            :cards="themeNativeDashboard.marketingSignals.cards"
          />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <ThemeNativeTimelineCard
            :title="themeNativeDashboard.ownerActionTimeline.title"
            :subtitle="themeNativeDashboard.ownerActionTimeline.subtitle"
            :items="themeNativeDashboard.ownerActionTimeline.items"
          />
        </VCol>

        <VCol
          cols="12"
          lg="8"
        >
          <ThemeNativeChannelEfficiency
            :title="themeNativeDashboard.channelEfficiency.title"
            :subtitle="themeNativeDashboard.channelEfficiency.subtitle"
            :rows="themeNativeDashboard.channelEfficiency.rows"
          />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <ThemeNativeTimelineCard
            :title="themeNativeDashboard.campaignOpsTimeline.title"
            :subtitle="themeNativeDashboard.campaignOpsTimeline.subtitle"
            :items="themeNativeDashboard.campaignOpsTimeline.items"
          />
        </VCol>

        <VCol
          cols="12"
          lg="8"
        >
          <ThemeNativeChannelEfficiency
            :title="themeNativeDashboard.creativeWorkbench.title"
            :subtitle="themeNativeDashboard.creativeWorkbench.subtitle"
            :rows="themeNativeDashboard.creativeWorkbench.rows"
          />
        </VCol>

        <VCol
          cols="12"
          lg="8"
        >
          <ThemeNativeOpsWorkbench :panels="themeNativeDashboard.opsPanels" />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <ThemeNativeTimelineCard
            :title="themeNativeDashboard.controlTimeline.title"
            :subtitle="themeNativeDashboard.controlTimeline.subtitle"
            :items="themeNativeDashboard.controlTimeline.items"
          />
        </VCol>

        <VCol
          cols="12"
          lg="8"
        >
          <ThemeNativeDiagnosticsFocus :sections="themeNativeDashboard.diagnosticSections" />
        </VCol>

        <VCol
          cols="12"
          lg="4"
        >
          <ThemeNativeDataLayerTable
            :truth-layers="themeNativeDashboard.dataLayerControl.truthLayers"
            :pending-layers="themeNativeDashboard.dataLayerControl.pendingLayers"
            :freshness="themeNativeDashboard.dataLayerControl.freshness"
          />
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

@media (width <= 960px) {
  .center-dashboard-page {
    padding: 1rem;
  }

  .center-dashboard-shell {
    max-inline-size: 100%;
  }
}
</style>
