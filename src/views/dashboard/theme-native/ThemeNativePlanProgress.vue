<script setup lang="ts">
import { useTheme } from 'vuetify'

interface ThemeNativePlanItem {
  avatar: string
  avatarColor: string
  title: string
  subtitle: string
  value: string
}

const props = defineProps<{
  title: string
  subtitle: string
  total: string
  delta: string
  categories: string[]
  progressSeries: number[]
  remainderSeries: number[]
  items: ThemeNativePlanItem[]
}>()

const decimalFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const vuetifyTheme = useTheme()
const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'

const chartSeries = computed(() => [
  {
    name: 'Прогресс',
    data: props.progressSeries,
  },
  {
    name: 'Остаток',
    data: props.remainderSeries,
  },
])

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors

  return {
    chart: {
      parentHeightOffset: 0,
      stacked: true,
      type: 'bar',
      toolbar: { show: false },
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      y: {
        formatter(value: number) {
          return `${decimalFormatter.format(value)}%`
        },
      },
    },
    legend: {
      show: false,
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '42%',
        borderRadius: 10,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
      },
    },
    colors: ['rgba(var(--v-theme-primary),1)', 'rgba(var(--v-theme-on-surface),0.14)'],
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0],
      formatter(value: number) {
        return `${decimalFormatter.format(value)}%`
      },
      offsetY: -22,
      style: {
        colors: [currentTheme['on-surface']],
        fontSize: '12px',
        fontWeight: 600,
      },
    },
    grid: {
      show: false,
      padding: {
        top: 12,
        bottom: -8,
        left: -12,
        right: -12,
      },
    },
    xaxis: {
      categories: props.categories,
      labels: {
        show: true,
        trim: false,
        style: {
          colors: Array.from({ length: props.categories.length }, () => labelColor),
          fontSize: '11px',
          fontWeight: 500,
        },
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      max: 100,
      min: 0,
      show: false,
    },
    responsive: [
      {
        breakpoint: 1600,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '50%',
              borderRadius: 8,
            },
          },
        },
      },
      {
        breakpoint: 1468,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '60%',
              borderRadius: 8,
            },
          },
        },
      },
      {
        breakpoint: 1279,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '42%',
              borderRadius: 8,
            },
          },
        },
      },
      {
        breakpoint: 1197,
        options: {
          chart: {
            height: 228,
          },
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: '40%',
            },
          },
        },
      },
      {
        breakpoint: 912,
        options: {
          chart: {
            height: 232,
          },
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: '55%',
            },
          },
        },
      },
      {
        breakpoint: 725,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '58%',
              borderRadius: 8,
            },
          },
        },
      },
      {
        breakpoint: 600,
        options: {
          chart: {
            height: 250,
          },
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: '52%',
            },
          },
          dataLabels: {
            offsetY: -18,
            style: {
              fontSize: '11px',
            },
          },
        },
      },
      {
        breakpoint: 475,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: '50%',
            },
          },
        },
      },
      {
        breakpoint: 381,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '60%',
              borderRadius: 8,
            },
          },
        },
      },
    ],
    states: {
      hover: {
        filter: {
          type: 'none',
        },
      },
      active: {
        filter: {
          type: 'none',
        },
      },
    },
  }
})

const moreList = [
  { title: 'Обновить', value: 'refresh' },
  { title: 'Детали', value: 'details' },
]
</script>

<template>
  <VCard>
    <VCardItem class="pb-0">
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardSubtitle>{{ subtitle }}</VCardSubtitle>

      <div class="d-flex align-center mt-2">
        <h2 class="text-h2 me-2">
          {{ total }}
        </h2>
        <div class="text-success">
          <span class="text-base">{{ delta }}</span>
        </div>
      </div>

      <template #append>
        <div class="mt-n10 me-n2">
          <MoreBtn
            size="small"
            :menu-list="moreList"
          />
        </div>
      </template>
    </VCardItem>

    <VCardText>
      <VueApexCharts
        :options="chartOptions"
        :series="chartSeries"
        height="220"
        class="my-2"
      />

      <VList class="card-list bg-transparent px-0">
        <VListItem
          v-for="item in items"
          :key="item.title"
        >
          <VListItemTitle class="font-weight-medium">
            {{ item.title }}
          </VListItemTitle>
          <VListItemSubtitle>
            {{ item.subtitle }}
          </VListItemSubtitle>
          <template #prepend>
            <VAvatar
              size="38"
              :color="item.avatarColor"
              variant="tonal"
              rounded
              class="me-1"
            >
              <VIcon
                :icon="item.avatar"
                size="22"
              />
            </VAvatar>
          </template>

          <template #append>
            <span
              class="font-weight-medium"
              :class="`text-${item.avatarColor}`"
            >{{ item.value }}</span>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 16px;
  background: transparent !important;
}
</style>
