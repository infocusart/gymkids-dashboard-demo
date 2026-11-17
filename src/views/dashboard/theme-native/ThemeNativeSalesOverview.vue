<script setup lang="ts">
import { useRouter } from 'vue-router'

interface ThemeNativeCompareSide {
  label: string
  value: string
  subtitle: string
  icon: string
  color: string
}

const props = defineProps<{
  title: string
  delta: string
  total: string
  left: ThemeNativeCompareSide
  right: ThemeNativeCompareSide
  progress: number
  progressColor: string
  progressBgColor: string
  detailsRoute?: string
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
</script>

<template>
  <VCard
    class="theme-native-sales-overview"
    :class="{ 'theme-native-sales-overview--interactive': isInteractive }"
    :role="isInteractive ? 'button' : undefined"
    :tabindex="isInteractive ? 0 : undefined"
    @click="openDetailReport"
    @keydown="handleCardKeydown"
  >
    <VCardText>
      <div class="d-flex align-center justify-space-between">
        <div class="text-body-1">
          {{ title }}
        </div>
        <div class="text-success font-weight-medium">
          {{ delta }}
        </div>
      </div>
      <h4 class="text-h4">
        {{ total }}
      </h4>
    </VCardText>

    <VCardText>
      <VRow no-gutters>
        <VCol cols="5">
          <div class="py-2">
            <div class="d-flex align-center mb-3">
              <VAvatar
                :color="left.color"
                variant="tonal"
                :size="24"
                rounded
                class="me-2"
              >
                <VIcon
                  size="18"
                  :icon="left.icon"
                />
              </VAvatar>
              <span>{{ left.label }}</span>
            </div>
            <h5 class="text-h5">
              {{ left.value }}
            </h5>
            <div class="text-body-2 text-disabled">
              {{ left.subtitle }}
            </div>
          </div>
        </VCol>

        <VCol cols="2">
          <div class="d-flex flex-column align-center justify-center h-100">
            <VDivider
              vertical
              class="mx-auto"
            />

            <VAvatar
              size="24"
              color="rgba(var(--v-theme-on-surface), var(--v-hover-opacity))"
              class="my-2"
            >
              <div class="text-overline text-disabled">
                VS
              </div>
            </VAvatar>

            <VDivider
              vertical
              class="mx-auto"
            />
          </div>
        </VCol>

        <VCol
          cols="5"
          class="text-end"
        >
          <div class="py-2">
            <div class="d-flex align-center justify-end mb-3">
              <span class="me-2">{{ right.label }}</span>
              <VAvatar
                :color="right.color"
                variant="tonal"
                :size="24"
                rounded
              >
                <VIcon
                  size="18"
                  :icon="right.icon"
                />
              </VAvatar>
            </div>
            <h5 class="text-h5">
              {{ right.value }}
            </h5>
            <div class="text-body-2 text-disabled">
              {{ right.subtitle }}
            </div>
          </div>
        </VCol>
      </VRow>

      <div class="mt-6">
        <VProgressLinear
          :model-value="progress"
          :color="progressColor"
          height="10"
          :bg-color="progressBgColor"
          :rounded-bar="false"
          rounded
        />
      </div>

      <div
        v-if="isInteractive"
        class="theme-native-sales-overview__footer d-flex align-center justify-space-between gap-3 pt-4"
      >
        <span class="text-sm text-medium-emphasis">
          Клик — открыть отчет по пробному пути
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

<style scoped lang="scss">
.theme-native-sales-overview--interactive {
  cursor: pointer;
}

.theme-native-sales-overview--interactive:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.88);
  outline-offset: 3px;
}

.theme-native-sales-overview__footer {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
