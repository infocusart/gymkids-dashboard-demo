<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'

interface ThemeNativeTrackerItem {
  avatarColor: string
  avatarIcon: string
  title: string
  subtitle: string
}

const props = defineProps<{
  title: string
  subtitle: string
  total: string
  totalLabel: string
  radialValue: number
  radialLabel: string
  items: ThemeNativeTrackerItem[]
  detailsRoute?: string
  detailsLabel?: string
}>()

const vuetifyTheme = useTheme()
const router = useRouter()
const isInteractive = computed(() => Boolean(props.detailsRoute))

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

const chartSeries = computed(() => [props.radialValue])

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  return {
    labels: [props.radialLabel],
    chart: {
      type: 'radialBar',
    },
    tooltip: {
      theme: 'dark',
    },
    plotOptions: {
      radialBar: {
        offsetY: 10,
        startAngle: -140,
        endAngle: 130,
        hollow: {
          size: '65%',
        },
        track: {
          background: currentTheme.surface,
          strokeWidth: '100%',
        },
        dataLabels: {
          name: {
            offsetY: -20,
            color: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`,
            fontSize: '13px',
            fontWeight: '400',
            fontFamily: 'Public Sans',
          },
          value: {
            offsetY: 10,
            color: `rgba(${hexToRgb(currentTheme['on-background'])},${variableTheme['high-emphasis-opacity']})`,
            fontSize: '38px',
            fontWeight: '500',
            fontFamily: 'Public Sans',
          },
          formatter: (value: number) => `${value.toFixed(1)}%`,
        },
      },
    },
    colors: [currentTheme.primary],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.5,
        gradientToColors: [currentTheme.primary],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.6,
        stops: [30, 70, 100],
      },
    },
    stroke: {
      dashArray: 10,
    },
    grid: {
      padding: {
        top: -20,
        bottom: 5,
      },
    },
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
    responsive: [
      {
        breakpoint: 960,
        options: {
          chart: {
            height: 280,
          },
        },
      },
    ],
  }
})

const moreList = [
  { title: 'Обновить', value: 'refresh' },
  { title: 'Детали', value: 'details' },
]
</script>

<template>
  <VCard
    class="theme-native-support-tracker"
    :class="{ 'theme-native-support-tracker--interactive': isInteractive }"
    :role="isInteractive ? 'button' : undefined"
    :tabindex="isInteractive ? 0 : undefined"
    @click="openDetailReport"
    @keydown="handleCardKeydown"
  >
    <VCardItem>
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardSubtitle>{{ subtitle }}</VCardSubtitle>

      <template #append>
        <div
          class="mt-n4 me-n2"
          @click.stop
          @keydown.stop
        >
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
          lg="4"
          md="4"
        >
          <div class="mb-lg-6 mb-4 mt-2">
            <h2 class="text-h2">
              {{ total }}
            </h2>
            <p class="text-base mb-0">
              {{ totalLabel }}
            </p>
          </div>

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
                  rounded
                  size="34"
                  :color="item.avatarColor"
                  variant="tonal"
                  class="me-1"
                >
                  <VIcon
                    size="22"
                    :icon="item.avatarIcon"
                  />
                </VAvatar>
              </template>
            </VListItem>
          </VList>
        </VCol>
        <VCol
          cols="12"
          lg="8"
          md="8"
        >
          <VueApexCharts
            :options="chartOptions"
            :series="chartSeries"
            height="360"
          />
        </VCol>
      </VRow>

      <div
        v-if="isInteractive"
        class="theme-native-support-tracker__footer d-flex align-center justify-space-between gap-3 pt-4"
      >
        <span class="text-sm text-medium-emphasis">
          {{ detailsLabel ?? 'Клик — открыть полный отчет' }}
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

<style lang="scss" scoped>
.theme-native-support-tracker--interactive {
  cursor: pointer;
}

.theme-native-support-tracker--interactive:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.88);
  outline-offset: 3px;
}

.card-list {
  --v-card-list-gap: 16px;
  background: transparent !important;
}

.theme-native-support-tracker__footer {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
