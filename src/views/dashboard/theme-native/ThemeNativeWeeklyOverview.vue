<script setup lang="ts">
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'

interface ThemeNativeWeeklyItem {
  color: string
  icon: string
  title: string
  amount: string
  caption: string
  progress: number
}

const props = defineProps<{
  title: string
  subtitle: string
  total: string
  delta: string
  summary: string
  categories: string[]
  series: number[]
  items: ThemeNativeWeeklyItem[]
}>()

const vuetifyTheme = useTheme()

const highlightedIndex = computed(() => {
  const maxValue = Math.max(...props.series)

  return props.series.findIndex(item => item === maxValue)
})

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  return {
    chart: {
      parentHeightOffset: 0,
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        barHeight: '60%',
        columnWidth: '38%',
        startingShape: 'rounded',
        endingShape: 'rounded',
        borderRadius: 4,
        distributed: true,
      },
    },
    grid: {
      show: false,
      padding: {
        top: -30,
        bottom: 0,
        left: -10,
        right: -10,
      },
    },
    colors: props.series.map((_, index) => index === highlightedIndex.value
      ? `rgba(${hexToRgb(currentTheme.primary)}, 1)`
      : `rgba(${hexToRgb(currentTheme.primary)},${variableTheme['dragged-opacity']})`),
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: props.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`,
          fontSize: '13px',
          fontFamily: 'Public Sans',
        },
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    tooltip: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 1025,
        options: {
          chart: {
            height: 199,
          },
        },
      },
    ],
  }
})

const chartSeries = computed(() => [
  {
    data: props.series,
  },
])

const moreList = [
  { title: 'Обновить', value: 'refresh' },
  { title: 'Детали', value: 'details' },
]
</script>

<template>
  <VCard>
    <VCardItem class="pb-sm-0">
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardSubtitle>{{ subtitle }}</VCardSubtitle>

      <template #append>
        <div class="mt-n4 me-n2">
          <MoreBtn
            size="small"
            :menu-list="moreList"
          />
        </div>
      </template>
    </VCardItem>

    <VCardText>
      <VRow>
        <VCol
          cols="12"
          sm="5"
          lg="6"
          class="d-flex flex-column align-self-center"
        >
          <div class="d-flex align-center gap-2 mb-3 flex-wrap">
            <h2 class="text-h2">
              {{ total }}
            </h2>
            <VChip
              label
              size="small"
              color="success"
            >
              {{ delta }}
            </VChip>
          </div>

          <span class="text-sm text-medium-emphasis">
            {{ summary }}
          </span>
        </VCol>

        <VCol
          cols="12"
          sm="7"
          lg="6"
        >
          <VueApexCharts
            :options="chartOptions"
            :series="chartSeries"
            height="161"
          />
        </VCol>
      </VRow>

      <div class="border rounded mt-5 pa-5">
        <VRow>
          <VCol
            v-for="item in items"
            :key="item.title"
            cols="12"
            sm="4"
          >
            <div class="d-flex align-center">
              <VAvatar
                rounded
                size="26"
                :color="item.color"
                variant="tonal"
                class="me-2"
              >
                <VIcon
                  size="18"
                  :icon="item.icon"
                />
              </VAvatar>

              <div>
                <h6 class="text-base font-weight-regular mb-0">
                  {{ item.title }}
                </h6>
                <p class="text-xs text-disabled mb-0">
                  {{ item.caption }}
                </p>
              </div>
            </div>
            <h6 class="text-h4 my-2">
              {{ item.amount }}
            </h6>
            <VProgressLinear
              :model-value="item.progress"
              :color="item.color"
              height="4"
              rounded
              rounded-bar
            />
          </VCol>
        </VRow>
      </div>
    </VCardText>
  </VCard>
</template>
