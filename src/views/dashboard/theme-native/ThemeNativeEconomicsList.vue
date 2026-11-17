<script setup lang="ts">
import { useRouter } from 'vue-router'

interface ThemeNativeEconomicsRow {
  avatarIcon: string
  avatarColor: string
  title: string
  subtitle: string
  stats: string
}

const props = defineProps<{
  title: string
  subtitle: string
  warningTitle: string
  warningText: string
  rows: ThemeNativeEconomicsRow[]
  notes: readonly string[]
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
  { title: 'Снимок', value: 'snapshot' },
  { title: 'Все метрики', value: 'expand' },
]
</script>

<template>
  <VCard
    class="theme-native-economics-list"
    :class="{ 'theme-native-economics-list--interactive': isInteractive }"
    :role="isInteractive ? 'button' : undefined"
    :tabindex="isInteractive ? 0 : undefined"
    @click="openDetailReport"
    @keydown="handleCardKeydown"
  >
    <VCardItem
      :title="title"
      :subtitle="subtitle"
    >
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
      <VList class="card-list bg-transparent px-0">
        <VListItem
          v-for="row in rows"
          :key="row.title"
        >
          <template #prepend>
            <VAvatar
              size="34"
              :color="row.avatarColor"
              variant="tonal"
              class="me-1"
              rounded
            >
              <VIcon
                :icon="row.avatarIcon"
                size="22"
              />
            </VAvatar>
          </template>

          <VListItemTitle>
            {{ row.title }}
          </VListItemTitle>
          <VListItemSubtitle>
            {{ row.subtitle }}
          </VListItemSubtitle>

          <template #append>
            <div class="d-flex align-center">
              <span class="font-weight-medium text-high-emphasis">{{ row.stats }}</span>
            </div>
          </template>
        </VListItem>
      </VList>

      <VAlert
        class="mt-4"
        type="warning"
        variant="tonal"
        :title="warningTitle"
      >
        {{ warningText }}
      </VAlert>

      <VList
        density="compact"
        class="bg-transparent px-0 mt-3"
      >
        <VListItem
          v-for="note in notes"
          :key="note"
          class="px-0"
        >
          <template #prepend>
            <VIcon
              icon="tabler-point"
              size="18"
            />
          </template>

          <VListItemTitle class="text-body-2 text-wrap theme-note-clamp">
            {{ note }}
          </VListItemTitle>
        </VListItem>
      </VList>

      <div
        v-if="isInteractive"
        class="theme-native-economics-list__footer d-flex align-center justify-space-between gap-3 pt-3"
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
.theme-native-economics-list--interactive {
  cursor: pointer;
}

.theme-native-economics-list--interactive:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.88);
  outline-offset: 3px;
}

.card-list {
  --v-card-list-gap: 16px;
  background: transparent !important;
}

.theme-note-clamp {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.theme-native-economics-list__footer {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
