<script setup lang="ts">
import { useRouter } from 'vue-router'

interface ThemeNativeSourceVisitRow {
  avatarIcon: string
  avatarColor: string
  title: string
  subtitle: string
  stats: string
  profitLoss: number
}

const props = defineProps<{
  title: string
  subtitle: string
  rows: ThemeNativeSourceVisitRow[]
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
  { title: 'Все каналы', value: 'expand' },
]
</script>

<template>
  <VCard
    class="theme-native-source-visits"
    :class="{ 'theme-native-source-visits--interactive': isInteractive }"
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
              size="38"
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

          <VListItemTitle class="font-weight-medium me-4">
            {{ row.title }}
          </VListItemTitle>
          <VListItemSubtitle class="me-4">
            {{ row.subtitle }}
          </VListItemSubtitle>

          <template #append>
            <div class="d-flex align-center gap-x-4">
              <div class="text-body-1">
                {{ row.stats }}
              </div>
              <VChip
                label
                size="small"
                :color="row.profitLoss > 0 ? 'success' : 'error'"
              >
                {{ row.profitLoss > 0 ? '+' : '' }}
                {{ row.profitLoss }}%
              </VChip>
            </div>
          </template>
        </VListItem>
      </VList>

      <div
        v-if="isInteractive"
        class="theme-native-source-visits__footer d-flex align-center justify-space-between gap-3 pt-3"
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
.theme-native-source-visits--interactive {
  cursor: pointer;
}

.theme-native-source-visits--interactive:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.88);
  outline-offset: 3px;
}

.card-list {
  --v-card-list-gap: 1.5rem;
  background: transparent !important;
}

.theme-native-source-visits__footer {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
