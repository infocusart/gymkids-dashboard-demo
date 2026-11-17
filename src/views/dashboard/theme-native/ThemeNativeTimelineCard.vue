<script setup lang="ts">
import { useRouter } from 'vue-router'

interface ThemeNativeTimelineItem {
  color: string
  title: string
  meta: string
  description: string
  footer: string
}

const props = defineProps<{
  title: string
  subtitle: string
  items: ThemeNativeTimelineItem[]
  detailsRoute?: string
  detailsLabel?: string
}>()

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

const moreList = [
  { title: 'Обновить', value: 'refresh' },
  { title: 'Детали', value: 'details' },
]
</script>

<template>
  <VCard
    class="theme-native-timeline-card"
    :class="{ 'theme-native-timeline-card--interactive': isInteractive }"
    :role="isInteractive ? 'button' : undefined"
    :tabindex="isInteractive ? 0 : undefined"
    @click="openDetailReport"
    @keydown="handleCardKeydown"
  >
    <VCardItem>
      <template #prepend>
        <VIcon
          icon="tabler-list-details"
          size="20"
          color="high-emphasis"
          class="me-1"
        />
      </template>
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

      <VCardTitle>{{ title }}</VCardTitle>
      <VCardSubtitle>{{ subtitle }}</VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VTimeline
        side="end"
        align="start"
        line-inset="8"
        truncate-line="start"
        density="compact"
      >
        <VTimelineItem
          v-for="item in items"
          :key="`${item.title}-${item.meta}`"
          :dot-color="item.color"
          size="x-small"
        >
          <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-2">
            <span class="app-timeline-title">
              {{ item.title }}
            </span>
            <span class="app-timeline-meta">{{ item.meta }}</span>
          </div>

          <div class="app-timeline-text mt-1">
            {{ item.description }}
          </div>

          <div class="app-timeline-footer text-medium-emphasis mt-2">
            {{ item.footer }}
          </div>
        </VTimelineItem>
      </VTimeline>

      <div
        v-if="isInteractive"
        class="theme-native-timeline-card__footer d-flex align-center justify-space-between gap-3 pt-3"
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
.theme-native-timeline-card--interactive {
  cursor: pointer;
}

.theme-native-timeline-card--interactive:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.88);
  outline-offset: 3px;
}

.app-timeline-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.app-timeline-meta {
  color: rgba(var(--v-theme-on-surface), 0.64);
  font-size: 0.8rem;
  text-transform: uppercase;
}

.app-timeline-text {
  font-size: 0.9rem;
  line-height: 1.45;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.app-timeline-footer {
  font-size: 0.84rem;
  line-height: 1.4;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.theme-native-timeline-card__footer {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
