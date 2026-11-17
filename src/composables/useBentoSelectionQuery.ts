import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { Ref } from 'vue'
import type { useGymkidsDashboard } from './useGymkidsDashboard'

export const queryValue = (value: unknown) => Array.isArray(value) ? value[0] : typeof value === 'string' ? value : null

interface SelectionQueryOptions {
  route: RouteLocationNormalizedLoaded
  router: Router
  dashboard: ReturnType<typeof useGymkidsDashboard>['dashboard']
  selectedCenterId: Ref<string>
  selectedPeriod: Ref<string>
}

export const useBentoSelectionQuery = ({ route, router, dashboard, selectedCenterId, selectedPeriod }: SelectionQueryOptions) => {
  const replaceSelectionDate = (date: string) => {
    router.replace({
      query: {
        ...route.query,
        center: selectedCenterId.value,
        period: selectedPeriod.value,
        date,
      },
    })
  }

  const syncSelectionQuery = () => {
    if (!dashboard.value)
      return

    router.replace({
      query: {
        ...route.query,
        center: selectedCenterId.value,
        period: selectedPeriod.value,
        date: dashboard.value.meta.selectedDate,
      },
    })
  }

  return { syncSelectionQuery, replaceSelectionDate }
}
