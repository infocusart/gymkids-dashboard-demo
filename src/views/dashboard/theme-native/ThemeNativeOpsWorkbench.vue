<script setup lang="ts">
import type { OpsPanel } from '@/data/dashboard'

interface ThemeNativeOpsPanel extends OpsPanel {
  truthLabel: string
}

const props = defineProps<{
  panels: readonly ThemeNativeOpsPanel[]
}>()

const activeTab = ref(0)

const tone = {
  fact: 'success',
  manual_fact: 'primary',
  proxy: 'warning',
  partial: 'info',
  missing: 'error',
  stale: 'secondary',
  demo: 'info',
} as const

const moreList = [
  { title: 'Обновить', value: 'refresh' },
  { title: 'Развернуть', value: 'expand' },
]
</script>

<template>
  <VCard class="h-100">
    <VCardItem title="Операционный контур">
      <VCardSubtitle>
        Один рабочий блок для сайта, промо, контакт-центра, capacity и слоя зависших лидов без разлета по разным экранам.
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
      class="px-4"
    >
      <VTab
        v-for="(panel, index) in props.panels"
        :key="panel.title"
        :value="index"
        class="text-none"
      >
        {{ panel.title }}
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="activeTab">
        <VWindowItem
          v-for="(panel, index) in props.panels"
          :key="panel.title"
          :value="index"
        >
          <div class="d-flex align-start justify-space-between gap-4 flex-wrap mb-4">
            <div class="theme-ops-copy">
              <div class="text-h5 mb-2">
                {{ panel.title }}
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0 theme-ops-subtitle">
                {{ panel.subtitle }}
              </p>
            </div>

            <VChip
              label
              size="small"
              :color="tone[panel.truthGrade]"
            >
              {{ panel.truthLabel }}
            </VChip>
          </div>

          <VTable class="text-wrap">
            <thead>
              <tr>
                <th>Метрика</th>
                <th>Значение</th>
                <th>Комментарий</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="metric in panel.metrics"
                :key="metric.label"
              >
                <td class="py-4">
                  <div class="font-weight-medium">
                    {{ metric.label }}
                  </div>
                </td>
                <td class="py-4">
                  <VChip
                    :color="metric.color"
                    label
                    size="small"
                  >
                    {{ metric.value }}
                  </VChip>
                </td>
                <td class="py-4">
                  {{ metric.helper }}
                </td>
              </tr>
            </tbody>
          </VTable>

          <VList class="card-list mt-4">
            <VListItem
              v-for="note in panel.notes"
              :key="note"
            >
              <template #prepend>
                <VAvatar
                  size="30"
                  rounded
                  variant="tonal"
                  color="primary"
                  class="me-3"
                >
                  <VIcon
                    icon="tabler-bolt"
                    size="18"
                  />
                </VAvatar>
              </template>

              <VListItemTitle class="text-body-2 text-wrap theme-ops-note">
                {{ note }}
              </VListItemTitle>
            </VListItem>
          </VList>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.75rem;
}

.theme-ops-copy {
  max-inline-size: 38rem;
}

.theme-ops-subtitle,
.theme-ops-note {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
