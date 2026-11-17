<script setup lang="ts">
import { computed } from 'vue'

interface TooltipRow {
  label: string
  value: string
  color?: string
}

interface TooltipDetail {
  summaryRows?: TooltipRow[]
  detailTitle?: string
  detailRows?: TooltipRow[]
}

const props = defineProps<{
  title: string
  subtitle: string
  buttonLabel: string
  categories: string[]
  tooltipLabels?: string[]
  tooltipDetails?: TooltipDetail[]
  series: Array<{
    name: string
    type: 'column' | 'line'
    data: number[]
  }>
}>()

const headingColor = 'rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity))'
const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'
const borderColor = 'rgba(var(--v-border-color), var(--v-border-opacity))'
const seriesPalette = ['#FFB400', '#9055FD', '#56CA00', '#16B1FF']

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll('\'', '&#39;')

const renderTooltipRows = (rows: TooltipRow[] = []) => rows
  .map(row => `
    <div class="gymkids-chart-tooltip__row">
      <div class="gymkids-chart-tooltip__label">
        <span class="gymkids-chart-tooltip__dot" style="background:${escapeHtml(row.color ?? '#8A8D93')}"></span>
        <span>${escapeHtml(row.label)}</span>
      </div>
      <strong class="gymkids-chart-tooltip__value">${escapeHtml(row.value)}</strong>
    </div>
  `)
  .join('')

const maxValue = computed(() => {
  const allValues = props.series.flatMap(item => item.data)
  const base = Math.max(...allValues, 0)

  return Math.ceil(base / 5) * 5 + 5
})

const customTooltip = ({ dataPointIndex }: { dataPointIndex: number }) => {
  const detail = props.tooltipDetails?.[dataPointIndex]

  if (!detail)
    return undefined

  const title = escapeHtml(props.tooltipLabels?.[dataPointIndex] ?? props.categories[dataPointIndex] ?? '')
  const summaryRows = renderTooltipRows(detail.summaryRows)
  const detailRows = renderTooltipRows(detail.detailRows)

  const detailTitle = detail.detailTitle
    ? `<div class="gymkids-chart-tooltip__section-title">${escapeHtml(detail.detailTitle)}</div>`
    : ''

  return `
    <div class="gymkids-chart-tooltip">
      <div class="gymkids-chart-tooltip__title">${title}</div>
      <div class="gymkids-chart-tooltip__section">${summaryRows}</div>
      ${detailRows ? `<div class="gymkids-chart-tooltip__divider"></div><div class="gymkids-chart-tooltip__section">${detailTitle}${detailRows}</div>` : ''}
    </div>
  `
}

const shipmentConfig = computed(() => ({
  chart: {
    type: 'line',
    stacked: false,
    parentHeightOffset: 0,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  markers: {
    size: props.series.map(item => item.type === 'column' ? 0 : 5),
    colors: '#fff',
    strokeColors: props.series.map((_, index) => seriesPalette[index % seriesPalette.length]),
    hover: {
      size: 6,
    },
    borderRadius: 4,
  },
  stroke: {
    curve: 'smooth',
    width: props.series.map(item => item.type === 'column' ? 0 : 3),
    lineCap: 'round',
  },
  legend: {
    show: true,
    position: 'bottom',
    markers: {
      width: 8,
      height: 8,
      offsetX: -3,
    },
    height: 40,
    itemMargin: {
      horizontal: 10,
      vertical: 0,
    },
    fontSize: '15px',
    fontFamily: 'Open Sans',
    fontWeight: 400,
    labels: {
      colors: headingColor,
      useSeriesColors: false,
    },
    offsetY: 10,
  },
  grid: {
    strokeDashArray: 8,
    borderColor,
  },
  colors: props.series.map((_, index) => seriesPalette[index % seriesPalette.length]),
  fill: {
    opacity: [1, 1],
  },
  plotOptions: {
    bar: {
      columnWidth: props.categories.length > 14 ? '48%' : '30%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    theme: 'dark',
    x: {
      formatter: (_value: string, { dataPointIndex }: { dataPointIndex: number }) => props.tooltipLabels?.[dataPointIndex] ?? _value,
    },
    custom: props.tooltipDetails?.length ? customTooltip : undefined,
  },
  xaxis: {
    tickAmount: Math.min(props.categories.length, 10),
    categories: props.categories,
    labels: {
      style: {
        colors: labelColor,
        fontSize: props.categories.length > 14 ? '11px' : '13px',
        fontWeight: 400,
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    tickAmount: 5,
    min: 0,
    max: maxValue.value,
    labels: {
      style: {
        colors: labelColor,
        fontSize: '13px',
        fontWeight: 400,
      },
      formatter(val: number) {
        return `${Math.round(val)}`
      },
    },
  },
  responsive: [
    {
      breakpoint: 1400,
      options: {
        chart: {
          height: 320,
        },
        xaxis: {
          labels: {
            style: {
              fontSize: '10px',
            },
          },
        },
        legend: {
          itemMargin: {
            vertical: 0,
            horizontal: 10,
          },
          fontSize: '13px',
          offsetY: 12,
        },
      },
    },
    {
      breakpoint: 1025,
      options: {
        chart: {
          height: 415,
        },
        plotOptions: {
          bar: {
            columnWidth: '50%',
          },
        },
      },
    },
    {
      breakpoint: 982,
      options: {
        plotOptions: {
          bar: {
            columnWidth: '30%',
          },
        },
      },
    },
    {
      breakpoint: 480,
      options: {
        chart: {
          height: 250,
        },
        legend: {
          offsetY: 7,
        },
      },
    },
  ],
}))
</script>

<template>
  <VCard>
    <VCardItem
      :title="title"
      :subtitle="subtitle"
    >
      <template #append>
        <VBtn
          variant="tonal"
          append-icon="tabler-chevron-down"
        >
          {{ buttonLabel }}
        </VBtn>
      </template>
    </VCardItem>

    <VCardText>
      <VueApexCharts
        id="gymkids-shipment-statistics"
        type="line"
        height="320"
        :options="shipmentConfig"
        :series="series"
      />
    </VCardText>
  </VCard>
</template>

<style lang="scss">
#gymkids-shipment-statistics {
  .apexcharts-legend-text {
    font-size: 16px !important;
  }

  .apexcharts-legend-series {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 0.375rem;
    block-size: 83%;
    padding-block: 4px;
    padding-inline: 16px 12px;
  }

  .apexcharts-tooltip,
  .apexcharts-xaxistooltip {
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
    background: rgb(var(--v-theme-surface)) !important;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.24) !important;
    color: rgba(var(--v-theme-on-surface), 0.96) !important;
  }

  .apexcharts-tooltip-title {
    background: rgba(var(--v-theme-on-surface), 0.06) !important;
    color: rgba(var(--v-theme-on-surface), 0.96) !important;
  }

  .apexcharts-tooltip-text,
  .apexcharts-tooltip-text-y-label,
  .apexcharts-tooltip-text-y-value,
  .apexcharts-tooltip-text-x-label,
  .apexcharts-xaxistooltip-text {
    color: rgba(var(--v-theme-on-surface), 0.96) !important;
    fill: rgba(var(--v-theme-on-surface), 0.96) !important;
  }

  .gymkids-chart-tooltip {
    min-inline-size: 15rem;
    padding: 0.15rem;
  }

  .gymkids-chart-tooltip__title {
    border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    font-size: 0.95rem;
    font-weight: 700;
    margin-block-end: 0.5rem;
    padding: 0.2rem 0.05rem 0.55rem;
  }

  .gymkids-chart-tooltip__section {
    display: grid;
    gap: 0.45rem;
    padding-inline: 0.05rem;
  }

  .gymkids-chart-tooltip__divider {
    border-block-start: 1px solid rgba(var(--v-border-color), 0.52);
    margin-block: 0.55rem;
  }

  .gymkids-chart-tooltip__section-title {
    color: rgba(var(--v-theme-on-surface), 0.68);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-block-end: 0.05rem;
    text-transform: uppercase;
  }

  .gymkids-chart-tooltip__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem;
  }

  .gymkids-chart-tooltip__label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    line-height: 1.2;
  }

  .gymkids-chart-tooltip__dot {
    border-radius: 999px;
    block-size: 0.62rem;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.14);
    flex: 0 0 0.62rem;
    inline-size: 0.62rem;
  }

  .gymkids-chart-tooltip__value {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    white-space: nowrap;
  }
}
</style>
