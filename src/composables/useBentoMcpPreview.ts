import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { queryValue } from './useBentoSelectionQuery'
import { loadGymkidsMcpPreview, loadGymkidsReviewPreview } from '@/lib/gymkidsMcpPreview'
import type { GymkidsPreviewBlock, GymkidsPreviewResult } from '@/lib/gymkidsMcpPreview'

interface McpPreviewOptions {
  route: RouteLocationNormalizedLoaded
  selectedCenterId: Ref<string>
  selectedPeriod: Ref<string>
}

export const useBentoMcpPreview = ({ route, selectedCenterId, selectedPeriod }: McpPreviewOptions) => {
  type McpPreviewState = 'inactive' | 'loading' | 'applied' | 'error'
  const mcpPreviewState = ref<McpPreviewState>('inactive')
  const mcpPreview = ref<GymkidsPreviewResult | null>(null)
  const mcpPreviewError = ref('')
  const ownerReviewRequested = computed(() => Boolean(queryValue(route.query.review_change)))

  const mcpPreviewRequested = computed(() => Boolean(
    ownerReviewRequested.value
    || queryValue(route.query.preview_change)
    || queryValue(route.query.preview_hash),
  ))

  const mcpPreviewMatchesSelection = computed(() => Boolean(
    mcpPreview.value
    && mcpPreview.value.scope.center_id === selectedCenterId.value
    && mcpPreview.value.scope.period === selectedPeriod.value,
  ))

  const mcpPreviewStatusLabel = computed(() => {
    if (mcpPreviewState.value === 'loading')
      return 'Загружаем защищённый preview…'
    if (mcpPreviewState.value === 'error')
      return mcpPreviewError.value
    if (!mcpPreviewMatchesSelection.value)
      return 'Preview приостановлен: выбраны другой центр или месяц.'

    return ownerReviewRequested.value
      ? `Проверочный артефакт ${mcpPreview.value?.changeId.slice(4, 12)} применён. Это ещё не релиз.`
      : `Демо-изменение ${mcpPreview.value?.changeId.slice(4, 12)} применено. Релиз недоступен редактору.`
  })

  const mcpBlock = (blockId: string): GymkidsPreviewBlock | undefined => (
    mcpPreviewMatchesSelection.value ? mcpPreview.value?.blocks[blockId] : undefined
  )

  const mcpTitle = (blockId: string, fallback: string) => mcpBlock(blockId)?.title ?? fallback
  const mcpVisible = (blockId: string) => mcpBlock(blockId)?.visible !== false

  const mcpLayoutClass = (blockId: string) => {
    const layout = mcpBlock(blockId)?.layout

    return layout && layout !== 'default' ? `gk-preview-layout--${layout}` : undefined
  }

  const initializeMcpPreview = async () => {
    if (!mcpPreviewRequested.value)
      return

    const reviewChangeId = queryValue(route.query.review_change)
    const changeId = reviewChangeId ?? queryValue(route.query.preview_change)
    const contentHash = queryValue(route.query.preview_hash)
    const centerId = queryValue(route.query.center) ?? selectedCenterId.value
    const period = queryValue(route.query.period) ?? selectedPeriod.value

    if (!changeId || (!reviewChangeId && !contentHash) || !centerId || !period) {
      mcpPreviewState.value = 'error'
      mcpPreviewError.value = 'В ссылке preview не хватает квитанции, центра или месяца.'

      return
    }

    mcpPreviewState.value = 'loading'
    mcpPreviewError.value = ''

    try {
      mcpPreview.value = reviewChangeId
        ? await loadGymkidsReviewPreview({ changeId, centerId, period })
        : await loadGymkidsMcpPreview({
          changeId,
          contentHash: contentHash!,
          origin: queryValue(route.query.preview_origin) ?? 'https://mcp.gymkids-fr.infocuslab.ru',
          centerId,
          period,
        })
      mcpPreviewState.value = 'applied'
    }
    catch (error) {
      mcpPreviewState.value = 'error'
      mcpPreviewError.value = error instanceof Error ? error.message : 'Не удалось применить MCP preview.'
    }
  }

  return { mcpPreviewMatchesSelection, ownerReviewRequested, mcpPreviewState, mcpPreviewRequested, mcpPreviewStatusLabel, mcpTitle, mcpVisible, mcpLayoutClass, initializeMcpPreview }
}
