<script setup lang="ts">
import { useRouter } from 'vue-router'

interface ThemeNativeCampaignStateRow {
  avatarColor: string
  avatarIcon: string
  title: string
  count: string
  stats: string
  statsColor: string
}

const props = defineProps<{
  title: string
  subtitle: string
  rows: ThemeNativeCampaignStateRow[]
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
  { title: 'Все значения', value: 'expand' },
]
</script>

<template>
  <VCard
    class="theme-native-campaign-state"
    :class="{ 'theme-native-campaign-state--interactive': isInteractive }"
    :role="isInteractive ? 'button' : undefined"
    :tabindex="isInteractive ? 0 : undefined"
    @click="openDetailReport"
    @keydown="handleCardKeydown"
  >
    <VCardItem>
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardSubtitle>
        {{ subtitle }}
      </VCardSubtitle>
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
              :color="row.avatarColor"
              variant="tonal"
              size="34"
              rounded
              class="me-1"
            >
              <VIcon
                :icon="row.avatarIcon"
                size="22"
              />
            </VAvatar>
          </template>

          <VListItemTitle class="font-weight-medium me-4">
            {{ row.title }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ row.count }}
              </div>
              <div :class="`text-${row.statsColor}`">
                {{ row.stats }}
              </div>
            </div>
          </template>
        </VListItem>
      </VList>

      <div
        v-if="isInteractive"
        class="theme-native-campaign-state__footer d-flex align-center justify-space-between gap-3 pt-3"
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
.theme-native-campaign-state--interactive {
  cursor: pointer;
}

.theme-native-campaign-state--interactive:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.88);
  outline-offset: 3px;
}

.card-list {
  --v-card-list-gap: 1.5rem;
  background: transparent !important;
}

.theme-native-campaign-state__footer {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
