<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{ center: string; period: string; centers: { id: string; name: string }[]; periods: { id: string; name: string }[] }>()
const emit = defineEmits<{ 'update:center': [value: string]; 'update:period': [value: string] }>()
const root = ref<HTMLElement>()
const open = ref<'center' | 'period' | null>(null)
const triggers = ref<HTMLButtonElement[]>([])
const options = (kind: 'center' | 'period') => kind === 'center' ? props.centers : props.periods
const selected = (kind: 'center' | 'period') => props[kind]
const title = (kind: 'center' | 'period') => options(kind).find(item => item.id === selected(kind))?.name

onClickOutside(root, () => {
  open.value = null
})
watch(() => [props.center, props.period], () => {
  open.value = null
})

async function toggle(kind: 'center' | 'period') {
  open.value = open.value === kind ? null : kind
  await nextTick()
  root.value?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]')?.focus()
}
function close(kind: 'center' | 'period') {
  open.value = null
  triggers.value[kind === 'center' ? 0 : 1]?.focus()
}
function choose(kind: 'center' | 'period', id: string) {
  if (kind === 'center')
    emit('update:center', id)
  else emit('update:period', id)
  close(kind)
}
function navigate(event: KeyboardEvent, kind: 'center' | 'period') {
  if (event.key === 'Escape') {
    event.stopPropagation()
    close(kind)

    return
  }
  const buttons = Array.from(root.value?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
  let target: number
  if (event.key === 'ArrowDown')
    target = (index + 1) % buttons.length
  else if (event.key === 'ArrowUp')
    target = (index - 1 + buttons.length) % buttons.length
  else if (event.key === 'Home')
    target = 0
  else if (event.key === 'End')
    target = buttons.length - 1
  else return
  event.preventDefault()
  buttons[target]?.focus()
}
</script>

<template>
  <div
    ref="root"
    class="sales-desktop-filters"
  >
    <div
      v-for="(kind, index) in (['center', 'period'] as const)"
      :key="kind"
      class="sales-filter"
    >
      <span :id="`filter-label-${kind}`">{{ kind === 'center' ? 'Центр' : 'Месяц' }}</span>
      <button
        :ref="el => { if (el) triggers[index] = el as HTMLButtonElement }"
        class="sales-filter-trigger"
        :aria-labelledby="`filter-label-${kind} filter-value-${kind}`"
        aria-haspopup="listbox"
        :aria-expanded="open === kind"
        :aria-controls="`filter-options-${kind}`"
        @click="toggle(kind)"
        @keydown.down.prevent="toggle(kind)"
      >
        <strong :id="`filter-value-${kind}`">{{ title(kind) }}</strong><span aria-hidden="true">⌄</span>
      </button>
      <div
        v-if="open === kind"
        :id="`filter-options-${kind}`"
        class="sales-filter-menu"
        role="listbox"
        :aria-labelledby="`filter-label-${kind}`"
        @keydown="navigate($event, kind)"
      >
        <button
          v-for="item in options(kind)"
          :key="item.id"
          role="option"
          :aria-selected="item.id === selected(kind)"
          :tabindex="item.id === selected(kind) ? 0 : -1"
          @click="choose(kind, item.id)"
        >
          <span>{{ item.name }}</span><span
            v-if="item.id === selected(kind)"
            aria-hidden="true"
          >✓</span>
        </button>
      </div>
    </div>
  </div>
</template>
