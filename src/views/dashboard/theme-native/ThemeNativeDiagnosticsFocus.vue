<script setup lang="ts">
import type { BreakdownRow } from '@/data/dashboard'

interface DiagnosticSection {
  key: string
  tab: string
  title: string
  subtitle: string
  color: string
  footer: string
  rows: readonly BreakdownRow[]
}

const props = defineProps<{
  sections: readonly DiagnosticSection[]
}>()

const activeTab = ref(props.sections[0]?.key ?? 'sources')

const countFormatter = new Intl.NumberFormat('ru-RU')

const percentFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const currentSection = computed(() => (
  props.sections.find(section => section.key === activeTab.value) ?? props.sections[0]
))

const topBucket = computed(() => currentSection.value?.rows[0])
const topThreeShare = computed(() => currentSection.value?.rows.slice(0, 3).reduce((sum, row) => sum + row.share, 0) ?? 0)
const chartRows = computed(() => currentSection.value?.rows.slice(0, 8) ?? [])

const borderColor = 'rgba(var(--v-border-color), var(--v-border-opacity))'

const topicsChartConfig = computed(() => ({
  chart: {
    height: 340,
    type: 'bar',
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '70%',
      distributed: true,
      borderRadius: 7,
      borderRadiusApplication: 'end',
    },
  },
  colors: [
    'rgba(var(--v-theme-primary),1)',
    'rgba(var(--v-theme-info),1)',
    'rgba(var(--v-theme-success),1)',
    'rgba(var(--v-theme-secondary),1)',
    'rgba(var(--v-theme-error),1)',
    'rgba(var(--v-theme-warning),1)',
  ],
  grid: {
    borderColor,
    strokeDashArray: 10,
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: false,
      },
    },
    padding: {
      top: -35,
      bottom: -12,
    },
  },
  dataLabels: {
    enabled: true,
    style: {
      colors: ['#fff'],
      fontWeight: 200,
      fontSize: '13px',
    },
    offsetX: 0,
    dropShadow: {
      enabled: false,
    },
    formatter(_val: string, opt: { dataPointIndex: number }) {
      return chartRows.value[opt.dataPointIndex]?.name ?? ''
    },
  },
  xaxis: {
    categories: chartRows.value.map((_, index) => `${index + 1}`),
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: 'rgba(var(--v-theme-on-background), var(--v-disabled-opacity))',
        fontSize: '13px',
      },
      formatter(val: string) {
        return `${val}`
      },
    },
  },
  yaxis: {
    max: Math.max(...chartRows.value.map(item => item.share * 100), 10),
    labels: {
      style: {
        colors: 'rgba(var(--v-theme-on-background), var(--v-disabled-opacity))',
        fontSize: '13px',
      },
      formatter(val: number) {
        return `${Math.round(val)}%`
      },
    },
  },
  tooltip: {
    enabled: true,
    theme: 'dark',
    style: {
      fontSize: '12px',
    },
    onDatasetHover: {
      highlightDataSeries: false,
    },
  },
  legend: {
    show: false,
  },
}))

const topicsChartSeries = computed(() => [
  {
    data: chartRows.value.map(item => Number((item.share * 100).toFixed(1))),
  },
])

const moreList = [
  { title: 'Обновить', value: 'refresh' },
  { title: 'Развернуть', value: 'expand' },
]
</script>

<template>
  <VCard class="h-100">
    <VCardItem title="Диагностический центр">
      <VCardSubtitle>
        Все слои детализации собраны в одном рабочем блоке вместо длинной простыни одинаковых карточек.
      </VCardSubtitle>

      <template #append>
        <div class="mt-n4 me-n2">
          <MoreBtn
            size="small"
            :menu-list="moreList"
          />
        </div>
      </template>
    </VCardItem>

    <VTabs
      v-model="activeTab"
      class="disable-tab-transition px-4"
    >
      <VTab
        v-for="section in props.sections"
        :key="section.key"
        :value="section.key"
        class="text-none"
      >
        {{ section.tab }}
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="activeTab">
        <VWindowItem
          v-for="section in props.sections"
          :key="section.key"
          :value="section.key"
        >
          <div class="d-flex align-center justify-space-between gap-4 flex-wrap mb-4">
            <div class="theme-diagnostics-copy">
              <div class="text-h5 mb-2">
                {{ section.title }}
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0 theme-diagnostics-subtitle">
                {{ section.subtitle }}
              </p>
            </div>

            <div class="d-flex gap-2 flex-wrap">
              <VChip
                label
                color="primary"
                variant="tonal"
              >
                Крупнейший слой: {{ countFormatter.format(topBucket?.count ?? 0) }}
              </VChip>
              <VChip
                label
                color="info"
                variant="tonal"
              >
                Доля top-3: {{ percentFormatter.format(topThreeShare * 100) }}%
              </VChip>
            </div>
          </div>

          <VRow>
            <VCol
              cols="12"
              md="7"
            >
              <VueApexCharts
                type="bar"
                height="330"
                :options="topicsChartConfig"
                :series="topicsChartSeries"
              />
            </VCol>

            <VCol
              cols="12"
              md="5"
            >
              <VList class="card-list">
                <VListItem
                  v-for="row in chartRows"
                  :key="`${section.key}-${row.name}`"
                >
                  <template #prepend>
                    <VBadge
                      dot
                      inline
                      class="mt-1 me-4"
                      :color="section.color"
                    />
                  </template>

                  <VListItemTitle class="font-weight-medium text-wrap">
                    {{ row.name }}
                  </VListItemTitle>
                  <VListItemSubtitle class="text-wrap theme-diagnostics-note">
                    {{ row.note ?? 'Отдельный слой детализации по февральской когорте.' }}
                  </VListItemSubtitle>

                  <template #append>
                    <div class="text-end">
                      <div class="text-body-1 font-weight-medium">
                        {{ countFormatter.format(row.count) }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ percentFormatter.format(row.share * 100) }}%
                      </div>
                    </div>
                  </template>
                </VListItem>
              </VList>
            </VCol>
          </VRow>

          <VAlert
            variant="tonal"
            :color="section.color"
            class="mt-4"
          >
            {{ section.footer }}
          </VAlert>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1rem;
}

.theme-diagnostics-subtitle,
.theme-diagnostics-note {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.theme-diagnostics-copy {
  max-inline-size: 34rem;
}
</style>
