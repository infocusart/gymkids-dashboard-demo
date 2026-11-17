<script setup lang="ts">
interface ThemeNativeSignalCard {
  icon: string
  color: string
  title: string
  value: string
  helper: string
  badge: string
}

const props = defineProps<{
  title: string
  subtitle: string
  cards: ThemeNativeSignalCard[]
  compact?: boolean
}>()

const hoverState = ref<Record<string, boolean>>({})

const moreList = [
  { title: 'Обновить', value: 'refresh' },
  { title: 'Срез', value: 'snapshot' },
  { title: 'Все сигналы', value: 'expand' },
]

function setHover(title: string, value: boolean) {
  hoverState.value = {
    ...hoverState.value,
    [title]: value,
  }
}
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardSubtitle>{{ subtitle }}</VCardSubtitle>

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
      <VRow>
        <VCol
          v-for="card in props.cards"
          :key="card.title"
          cols="12"
          sm="6"
          md="6"
          lg="4"
        >
          <VCard
            class="theme-signal-card cursor-pointer"
            :class="{ 'theme-signal-card--compact': props.compact }"
            :style="hoverState[card.title] ? `border-block-end-color: rgb(var(--v-theme-${card.color}))` : `border-block-end-color: rgba(var(--v-theme-${card.color}), 0.38)`"
            @mouseenter="setHover(card.title, true)"
            @mouseleave="setHover(card.title, false)"
          >
            <VCardText>
              <div class="d-flex align-center justify-space-between gap-4 mb-3">
                <VAvatar
                  rounded
                  variant="tonal"
                  :color="card.color"
                >
                  <VIcon
                    :icon="card.icon"
                    size="24"
                  />
                </VAvatar>

                <VChip
                  size="x-small"
                  label
                  :color="card.color"
                >
                  {{ card.badge }}
                </VChip>
              </div>

              <div
                class="mb-1"
                :class="props.compact ? 'text-h5' : 'text-h4'"
              >
                {{ card.value }}
              </div>

              <div class="text-body-1 mb-1 font-weight-medium">
                {{ card.title }}
              </div>

              <div class="theme-signal-helper text-sm text-medium-emphasis">
                {{ card.helper }}
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
@use "@core/scss/base/mixins" as mixins;

.theme-signal-card {
  position: relative;
  border-block-end-style: solid;
  border-block-end-width: 2px;
  border-radius: 1.5rem;
  background:
    linear-gradient(180deg, rgba(57, 64, 98, 0.94), rgba(45, 51, 78, 0.98)),
    linear-gradient(140deg, rgba(255, 255, 255, 0.05), transparent 46%);
  box-shadow:
    0 18px 32px rgba(10, 16, 27, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition:
    transform 320ms cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 320ms cubic-bezier(0.32, 0.72, 0, 1),
    border-color 320ms cubic-bezier(0.32, 0.72, 0, 1);

  &::before {
    position: absolute;
    border: 1px solid rgba(255, 255, 255, 0.045);
    border-radius: calc(1.5rem - 1px);
    content: "";
    inset: 1px;
    pointer-events: none;
  }

  &:hover {
    border-block-end-width: 3px;
    margin-block-end: -1px;
    transform: translateY(-2px);

    @include mixins.elevation(8);

    transition: all 0.1s ease-out;
  }
}

.theme-signal-card--compact {
  .v-card-text {
    padding: 1rem;
  }
}

.theme-signal-helper {
  display: -webkit-box;
  overflow: hidden;
  min-block-size: 2.8rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.skin--bordered {
  .theme-signal-card {
    border-block-end-width: 2px;

    &:hover {
      border-block-end-width: 3px;
      margin-block-end: -2px;
      transition: all 0.1s ease-out;
    }
  }
}
</style>
