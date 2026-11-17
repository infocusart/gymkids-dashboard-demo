<script setup lang="ts">
interface ThemeNativeChannelRow {
  avatarIcon: string
  avatarColor: string
  title: string
  subtitle: string
  metric: string
  progress: number
  progressColor: string
}

defineProps<{
  title: string
  subtitle: string
  rows: ThemeNativeChannelRow[]
}>()

const moreList = [
  { title: 'Обновить', value: 'refresh' },
  { title: 'Снимок', value: 'snapshot' },
  { title: 'Все каналы', value: 'expand' },
]
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardSubtitle>
        {{ subtitle }}
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

    <VCardText>
      <VList class="card-list bg-transparent px-0">
        <VListItem
          v-for="row in rows"
          :key="row.title"
        >
          <template #prepend>
            <VAvatar
              size="34"
              rounded
              :color="row.avatarColor"
              variant="tonal"
              class="me-1"
            >
              <VIcon
                :icon="row.avatarIcon"
                size="20"
              />
            </VAvatar>
          </template>

          <VListItemTitle class="font-weight-medium">
            {{ row.title }}
          </VListItemTitle>
          <VListItemSubtitle class="me-4">
            {{ row.subtitle }}
          </VListItemSubtitle>

          <div class="text-caption text-medium-emphasis mt-1">
            {{ row.metric }}
          </div>

          <template #append>
            <div class="d-flex align-center gap-x-4">
              <div style="inline-size: 4.875rem;">
                <VProgressLinear
                  :model-value="row.progress"
                  :color="row.progressColor"
                  height="8"
                  rounded-bar
                  rounded
                />
              </div>
              <span class="text-disabled">{{ row.progress }}%</span>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 16px;
  background: transparent !important;
}
</style>
