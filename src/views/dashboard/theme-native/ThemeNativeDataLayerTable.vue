<script setup lang="ts">
import type { FreshnessItem, PendingLayer, TruthLayer } from '@/data/dashboard'

interface ThemeNativeTruthLayer extends TruthLayer {
  gradeLabel: string
}

interface ThemeNativeFreshnessItem extends FreshnessItem {
  statusLabel: string
}

const props = defineProps<{
  truthLayers: readonly ThemeNativeTruthLayer[]
  pendingLayers: readonly PendingLayer[]
  freshness: readonly ThemeNativeFreshnessItem[]
}>()

const activeTab = ref('truth')

const tone = {
  fact: 'success',
  manual_fact: 'primary',
  proxy: 'warning',
  partial: 'info',
  demo: 'info',
  missing: 'error',
  stale: 'secondary',
} as const

const freshnessTone = {
  fresh: 'success',
  partial: 'warning',
  manual: 'info',
  stale: 'secondary',
  missing: 'error',
} as const

const moreList = [
  { title: 'Обновить', value: 'refresh' },
  { title: 'Развернуть', value: 'expand' },
]
</script>

<template>
  <VCard class="h-100">
    <VCardItem title="Контроль слоев данных">
      <VCardSubtitle>
        Где у нас уже есть опора, где только ручной ориентир, а где экран пока живет на backlog и приближениях.
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
      grow
      class="disable-tab-transition"
    >
      <VTab
        value="truth"
        class="text-none"
      >
        Опора
      </VTab>
      <VTab
        value="pending"
        class="text-none"
      >
        Бэклог
      </VTab>
      <VTab
        value="freshness"
        class="text-none"
      >
        Свежесть
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="activeTab">
        <VWindowItem value="truth">
          <VList class="card-list bg-transparent px-0">
            <VListItem
              v-for="layer in props.truthLayers"
              :key="layer.title"
              class="px-0"
            >
              <template #prepend>
                <VAvatar
                  size="34"
                  rounded
                  variant="tonal"
                  :color="tone[layer.grade]"
                  class="me-3"
                >
                  <VIcon
                    icon="tabler-database"
                    size="20"
                  />
                </VAvatar>
              </template>

              <VListItemTitle class="d-flex align-center justify-space-between gap-3 flex-wrap">
                <span class="font-weight-medium text-wrap">{{ layer.title }}</span>
                <VChip
                  :color="tone[layer.grade]"
                  label
                  size="small"
                >
                  {{ layer.gradeLabel }}
                </VChip>
              </VListItemTitle>

              <VListItemSubtitle class="text-wrap">
                <div class="theme-data-owner mt-1">
                  {{ layer.owner }}
                </div>
                <div class="theme-data-copy mt-1">
                  {{ layer.summary }}
                </div>
                <div class="theme-data-note mt-1">
                  {{ layer.note }}
                </div>
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </VWindowItem>

        <VWindowItem value="pending">
          <VList class="card-list bg-transparent px-0">
            <VListItem
              v-for="layer in props.pendingLayers"
              :key="layer.title"
              class="px-0"
            >
              <template #prepend>
                <VAvatar
                  size="34"
                  rounded
                  variant="tonal"
                  color="warning"
                  class="me-3"
                >
                  <VIcon
                    icon="tabler-lock-exclamation"
                    size="20"
                  />
                </VAvatar>
              </template>

              <VListItemTitle class="d-flex align-center justify-space-between gap-3 flex-wrap">
                <span class="font-weight-medium text-wrap">{{ layer.title }}</span>
                <VChip
                  color="warning"
                  label
                  size="small"
                >
                  {{ layer.metrics.length }} метрики
                </VChip>
              </VListItemTitle>

              <VListItemSubtitle class="text-wrap">
                <div class="theme-data-copy mt-1">
                  {{ layer.blocker }}
                </div>
                <div class="theme-data-note mt-1">
                  {{ layer.nextStep }}
                </div>
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </VWindowItem>

        <VWindowItem value="freshness">
          <VList class="card-list bg-transparent px-0">
            <VListItem
              v-for="item in props.freshness"
              :key="item.source"
              class="px-0"
            >
              <template #prepend>
                <VAvatar
                  size="34"
                  rounded
                  variant="tonal"
                  :color="freshnessTone[item.status]"
                  class="me-3"
                >
                  <VIcon
                    icon="tabler-clock-hour-4"
                    size="20"
                  />
                </VAvatar>
              </template>

              <VListItemTitle class="d-flex align-center justify-space-between gap-3 flex-wrap">
                <span class="font-weight-medium text-wrap">{{ item.source }}</span>
                <VChip
                  :color="freshnessTone[item.status]"
                  label
                  size="small"
                >
                  {{ item.statusLabel }}
                </VChip>
              </VListItemTitle>

              <VListItemSubtitle class="text-wrap">
                <div class="theme-data-owner mt-1">
                  {{ item.updatedAt }}
                </div>
                <div class="theme-data-note mt-1">
                  {{ item.note }}
                </div>
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.875rem;
}

.theme-data-owner {
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 0.79rem;
  text-transform: uppercase;
}

.theme-data-copy,
.theme-data-note {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.theme-data-note {
  color: rgba(var(--v-theme-on-surface), 0.72);
}
</style>
