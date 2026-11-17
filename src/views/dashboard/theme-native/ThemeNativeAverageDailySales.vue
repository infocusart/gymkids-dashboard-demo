<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const props = defineProps<{
  title: string
  subtitle: string
  value: string
  helper: string
  categories?: string[]
  series: number[]
  tooltipLabels?: string[]
  detailsRoute?: string
}>()

const vuetifyTheme = useTheme()
const router = useRouter()

const currentTheme = computed(() => vuetifyTheme.current.value.colors)
const isInteractive = computed(() => Boolean(props.detailsRoute))

const chartSeries = computed(() => [
  {
    name: 'Лиды',
    data: props.series,
  },
])

const openDetailReport = () => {
  if (!props.detailsRoute)
    return

  router.push(props.detailsRoute)
}

const handleCardKeydown = (event: KeyboardEvent) => {
  if (!isInteractive.value)
    return

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openDetailReport()
  }
}

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: {
      show: false,
    },
    sparkline: {
      enabled: true,
    },
  },
  markers: {
    colors: 'transparent',
    strokeColors: 'transparent',
  },
  grid: {
    show: false,
  },
  colors: [currentTheme.value.success],
  tooltip: {
    theme: 'dark',
    x: {
      formatter: (_value: string, { dataPointIndex }: { dataPointIndex: number }) => props.tooltipLabels?.[dataPointIndex] ?? _value,
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.8,
      opacityFrom: 0.6,
      opacityTo: 0.1,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 2,
    curve: 'smooth',
  },
  xaxis: {
    categories: props.categories,
    show: true,
    lines: {
      show: false,
    },
    labels: {
      show: false,
    },
    stroke: {
      width: 0,
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    stroke: {
      width: 0,
    },
    show: false,
  },
  responsive: [
    {
      breakpoint: 1387,
      options: {
        chart: {
          height: 80,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        chart: {
          height: 120,
        },
      },
    },
  ],
}))
</script>

<template>
  <VCard
    class="average-daily-sales-card"
    :class="{ 'average-daily-sales-card--interactive': isInteractive }"
    :role="isInteractive ? 'button' : undefined"
    :tabindex="isInteractive ? 0 : undefined"
    @click="openDetailReport"
    @keydown="handleCardKeydown"
  >
    <VCardText>
      <h5 class="text-h5 mb-3">
        {{ title }}
      </h5>
      <p class="mb-0">
        {{ subtitle }}
      </p>
      <h4 class="text-h4">
        {{ value }}
      </h4>
      <p class="text-sm text-disabled mb-0">
        {{ helper }}
      </p>
    </VCardText>

    <VCardText class="pt-0">
      <VueApexCharts
        :options="chartOptions"
        :series="chartSeries"
        :height="80"
      />

      <div
        v-if="isInteractive"
        class="average-daily-sales-card__footer d-flex align-center justify-space-between gap-3 pt-2"
      >
        <span class="text-sm text-medium-emphasis">
          Клик — открыть отчет по потоку лидов
        </span>

        <VIcon
          icon="tabler-arrow-up-right"
          size="18"
          class="text-medium-emphasis"
        />
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">
.average-daily-sales-card--interactive {
  cursor: pointer;
}

.average-daily-sales-card--interactive:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.88);
  outline-offset: 3px;
}

.average-daily-sales-card__footer {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
