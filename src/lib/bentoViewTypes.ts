import type { Ref } from 'vue'
import type { GymkidsMetricDetailKey } from '@/data/gymkidsDetailViews'

export type BentoDetailView = 'sources' | GymkidsMetricDetailKey
export type BentoView = 'overview' | BentoDetailView
export type BentoTransitionPhase = 'idle' | 'to-detail' | 'to-overview'
export type SpatialMotionPhase = 'idle' | 'move'
export type SpatialMotionDirection = 'idle' | 'opening' | 'closing'

export interface BentoSpatialMotionContext {
  bentoStageRef: Ref<HTMLElement | null>
  spatialReflowIsBusy: Ref<boolean>
  spatialMotionPhase: Ref<SpatialMotionPhase>
  spatialMotionDirection: Ref<SpatialMotionDirection>
  resetCardNumberAnimations: () => void
  suppressHoverEffectsUntil: (timestamp: number) => void
}
