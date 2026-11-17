<script setup lang="ts">
import type { Component } from 'vue'

interface ThemeNativeModuleDeckItem {
  key: string
  label: string
  component: Component
  props?: Record<string, unknown>
}

const props = defineProps<{
  title: string
  subtitle: string
  items: ThemeNativeModuleDeckItem[]
}>()

const activeTab = ref(props.items[0]?.key ?? '')

watch(
  () => props.items,
  items => {
    if (!items.some(item => item.key === activeTab.value))
      activeTab.value = items[0]?.key ?? ''
  },
  { deep: true },
)

const moreList = [
  { title: 'Обновить', value: 'refresh' },
  { title: 'Снимок', value: 'snapshot' },
]
</script>

<template>
  <div class="theme-module-deck">
    <div class="theme-module-deck__head">
      <div>
        <div class="text-h6 mb-1">
          {{ title }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ subtitle }}
        </div>
      </div>

      <div class="mt-n2 me-n2">
        <MoreBtn
          size="small"
          :menu-list="moreList"
        />
      </div>
    </div>

    <VTabs
      v-model="activeTab"
      class="theme-module-deck__tabs"
    >
      <VTab
        v-for="item in items"
        :key="item.key"
        :value="item.key"
        class="text-none"
      >
        {{ item.label }}
      </VTab>
    </VTabs>

    <VWindow
      v-model="activeTab"
      class="mt-4"
    >
      <VWindowItem
        v-for="item in items"
        :key="item.key"
        :value="item.key"
      >
        <component
          :is="item.component"
          v-bind="item.props"
        />
      </VWindowItem>
    </VWindow>
  </div>
</template>

<style lang="scss" scoped>
.theme-module-deck {
  min-block-size: 100%;
}

.theme-module-deck__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.theme-module-deck__tabs {
  margin-block-start: 1rem;
}
</style>
