<script setup lang="ts">
import { useRouter } from 'vue-router'
import type {
  DataTruthGrade,
  OwnerActionStatus,
  OwnerDrilldownStatus,
} from '@/data/dashboard'

interface ThemeNativeOwnerAction {
  title: string
  owner: string
  priority: string
  status: OwnerActionStatus
  statusLabel: string
  statusColor: string
  statusIcon: string
  due: string
  detail: string
  truthGrade: DataTruthGrade
  truthGradeLabel: string
  truthGradeColor: string
}

interface ThemeNativeDrilldownHook {
  title: string
  route: string
  status: OwnerDrilldownStatus
  statusLabel: string
  statusColor: string
  statusIcon: string
  helper: string
  disabled: boolean
  truthGrade: DataTruthGrade
  truthGradeLabel: string
  truthGradeColor: string
}

const props = defineProps<{
  items: readonly ThemeNativeOwnerAction[]
  hooks: readonly ThemeNativeDrilldownHook[]
}>()

const router = useRouter()

function openHook(hook: ThemeNativeDrilldownHook) {
  if (hook.disabled || !hook.route)
    return

  router.push(hook.route)
}
</script>

<template>
  <VCard class="theme-owner-actions h-100">
    <VCardItem>
      <VCardTitle>Owner action queue</VCardTitle>
      <VCardSubtitle>
        3 коротких действия, которые можно планировать до подключения платежей и capacity.
      </VCardSubtitle>
    </VCardItem>

    <VCardText class="theme-owner-actions__body">
      <div class="theme-owner-actions__items">
        <article
          v-for="item in props.items"
          :key="item.title"
          class="theme-owner-actions__item"
        >
          <div class="theme-owner-actions__line">
            <VAvatar
              rounded
              variant="tonal"
              :color="item.statusColor"
              size="32"
            >
              <VIcon
                :icon="item.statusIcon"
                size="18"
              />
            </VAvatar>

            <div class="theme-owner-actions__copy">
              <div class="theme-owner-actions__title">
                {{ item.title }}
              </div>
              <div class="theme-owner-actions__meta">
                {{ item.owner }} · {{ item.priority }} · {{ item.due }}
              </div>
            </div>

            <VChip
              label
              size="x-small"
              :color="item.statusColor"
            >
              {{ item.statusLabel }}
            </VChip>
          </div>

          <div class="theme-owner-actions__detail">
            {{ item.detail }}
          </div>

          <VChip
            label
            size="x-small"
            :color="item.truthGradeColor"
            class="theme-owner-actions__truth"
          >
            {{ item.truthGradeLabel }}
          </VChip>
        </article>
      </div>

      <div class="theme-owner-actions__hooks">
        <div class="theme-owner-actions__hooks-title">
          Drill-down
        </div>
        <div class="theme-owner-actions__hook-list">
          <VBtn
            v-for="hook in props.hooks"
            :key="hook.title"
            :disabled="hook.disabled"
            :color="hook.statusColor"
            :prepend-icon="hook.statusIcon"
            variant="tonal"
            size="small"
            class="theme-owner-actions__hook"
            @click="openHook(hook)"
          >
            {{ hook.title }}
            <VTooltip
              activator="parent"
              location="top"
            >
              {{ hook.helper }}
            </VTooltip>
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.theme-owner-actions__body {
  display: flex;
  block-size: 100%;
  flex-direction: column;
  gap: 0.9rem;
}

.theme-owner-actions__items {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.theme-owner-actions__item {
  position: relative;
  border: 1px solid rgba(201, 214, 255, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.032);
  padding: 0.75rem;
}

.theme-owner-actions__line {
  display: grid;
  align-items: start;
  gap: 0.65rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.theme-owner-actions__copy {
  min-inline-size: 0;
}

.theme-owner-actions__title {
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.theme-owner-actions__meta,
.theme-owner-actions__detail {
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 0.74rem;
  line-height: 1.32;
  overflow-wrap: anywhere;
}

.theme-owner-actions__meta {
  margin-block-start: 0.22rem;
}

.theme-owner-actions__detail {
  display: -webkit-box;
  overflow: hidden;
  margin-block-start: 0.55rem;
  padding-inline-end: 4.75rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.theme-owner-actions__truth {
  position: absolute;
  inset-block-end: 0.7rem;
  inset-inline-end: 0.75rem;
}

.theme-owner-actions__hooks {
  margin-block-start: auto;
  border-block-start: 1px solid rgba(201, 214, 255, 0.08);
  padding-block-start: 0.85rem;
}

.theme-owner-actions__hooks-title {
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.theme-owner-actions__hook-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-block-start: 0.55rem;
}

.theme-owner-actions__hook {
  min-inline-size: 0;
  text-transform: none;
}

@media (width <= 480px) {
  .theme-owner-actions__line {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .theme-owner-actions__line > .v-chip {
    grid-column: 1 / -1;
    justify-self: flex-start;
  }

  .theme-owner-actions__detail {
    padding-inline-end: 0;
  }

  .theme-owner-actions__truth {
    position: static;
    margin-block-start: 0.55rem;
  }
}
</style>
