<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import logo from '@images/gymkids/white-logo.png'

const props = defineProps<{
  center: string
  period: string
  centers: { id: string; name: string }[]
  periods: { id: string; name: string }[]
  endDate?: string
  sourceDays: number | null
  tone: 'positive' | 'warning' | 'negative' | 'neutral'
}>()

const emit = defineEmits<{ 'update:center': [value: string]; 'update:period': [value: string] }>()
const root = ref<HTMLElement>()
const centerTrigger = ref<HTMLButtonElement>()
const periodTrigger = ref<HTMLButtonElement>()
const monthSelect = ref<HTMLSelectElement>()
const open = ref<'center' | 'period' | null>(null)
const centerName = computed(() => props.centers.find(item => item.id === props.center)?.name)
const periodName = computed(() => props.periods.find(item => item.id === props.period)?.name)
const monthDays = computed(() => new Date(Number(props.period.slice(0, 4)), Number(props.period.slice(5, 7)), 0).getDate())
const endDay = computed(() => props.endDate ? Number(props.endDate.slice(8, 10)) : null)
const dateLabel = computed(() => props.endDate ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${props.endDate}T12:00:00Z`)) : 'нет итога месяца')
const coverage = computed(() => !props.endDate ? 'Нет итога месяца' : props.sourceDays === null ? 'Число дней не указано' : `${props.sourceDays} из ${monthDays.value} дней`)

const calendar = computed(() => {
  const first = new Date(`${props.period}-01T12:00:00Z`)
  const offset = (first.getUTCDay() + 6) % 7

  return Array.from({ length: Math.ceil((offset + monthDays.value) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1

    return day > 0 && day <= monthDays.value ? day : null
  })
})

onClickOutside(root, () => {
  open.value = null
})
watch(() => [props.center, props.period], () => {
  open.value = null
})
async function toggle(kind: 'center' | 'period') {
  open.value = open.value === kind ? null : kind
  if (!open.value)
    return
  await nextTick()
  if (kind === 'center')
    root.value?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]')?.focus()
  else monthSelect.value?.focus()
}
function close(kind: 'center' | 'period') {
  open.value = null
  ;(kind === 'center' ? centerTrigger : periodTrigger).value?.focus()
}
function chooseCenter(id: string) {
  emit('update:center', id)
  close('center')
}
function choosePeriod(id: string) {
  emit('update:period', id)
  close('period')
}
function escape(event: KeyboardEvent, kind: 'center' | 'period') {
  if (event.key !== 'Escape')
    return
  event.preventDefault()
  event.stopPropagation()
  close(kind)
}
function navigateCenter(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    escape(event, 'center')

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
  <header
    ref="root"
    class="dashboard-header"
    :data-tone="tone"
  >
    <h1 class="visually-hidden">
      План месяца GYMKiDs
    </h1>
    <div class="brand-context">
      <img
        :src="logo"
        class="brand-logo"
        alt="GYMKiDs"
      >
    </div>
    <div class="screen-context">
      <div class="center-picker">
        <span
          id="sales-center-label"
          class="visually-hidden"
        >Центр</span>
        <button
          ref="centerTrigger"
          class="center-picker-trigger"
          :class="{ 'is-open': open === 'center' }"
          :title="centerName"
          aria-haspopup="listbox"
          :aria-expanded="open === 'center'"
          aria-controls="sales-center-options"
          aria-labelledby="sales-center-label sales-center-value"
          @click="toggle('center')"
          @keydown.down.prevent="toggle('center')"
          @keydown="escape($event, 'center')"
        >
          <span id="sales-center-value">{{ centerName }}</span><svg
            aria-hidden="true"
            viewBox="0 0 16 16"
          ><path d="m4 6 4 4 4-4" /></svg>
        </button>
        <Transition name="center-menu-popover">
          <div
            v-if="open === 'center'"
            id="sales-center-options"
            class="center-picker-listbox"
            role="listbox"
            aria-labelledby="sales-center-label"
            @keydown="navigateCenter"
          >
            <button
              v-for="item in centers"
              :key="item.id"
              class="center-picker-option"
              :class="{ 'is-selected': item.id === center }"
              role="option"
              :aria-selected="item.id === center"
              :tabindex="item.id === center ? 0 : -1"
              @click="chooseCenter(item.id)"
            >
              <span>{{ item.name }}</span><svg
                v-if="item.id === center"
                aria-hidden="true"
                viewBox="0 0 16 16"
              ><path d="m3 8 3 3 7-7" /></svg>
            </button>
          </div>
        </Transition>
      </div>
    </div>
    <div class="period-context">
      <div
        class="period-picker"
        @keydown="escape($event, 'period')"
      >
        <button
          ref="periodTrigger"
          class="period-trigger"
          :class="{ 'is-open': open === 'period' }"
          :aria-label="`Выбрать месяц отчёта. Сейчас ${periodName}`"
          aria-haspopup="dialog"
          :aria-expanded="open === 'period'"
          aria-controls="sales-calendar"
          @click="toggle('period')"
        >
          <svg
            class="period-trigger-calendar"
            aria-hidden="true"
            viewBox="0 0 24 24"
          ><path d="M7 3v3M17 3v3M4.5 9h15M6.5 5h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /></svg>
          <span class="period-trigger-copy"><span>{{ periodName }}</span><strong>{{ coverage }}</strong></span>
          <svg
            class="period-trigger-chevron"
            aria-hidden="true"
            viewBox="0 0 16 16"
          ><path d="m4 6 4 4 4-4" /></svg>
        </button>
        <Transition name="calendar-popover">
          <section
            v-if="open === 'period'"
            id="sales-calendar"
            class="calendar-popover"
            role="dialog"
            aria-label="Выбор месяца отчёта"
            aria-describedby="sales-calendar-note"
          >
            <div class="calendar-heading">
              <div>
                <span>Дата отчёта</span><label class="period-select-label"><span class="visually-hidden">Месяц отчёта</span><select
                  ref="monthSelect"
                  :value="period"
                  aria-label="Выбрать месяц"
                  @change="choosePeriod(($event.target as HTMLSelectElement).value)"
                ><option
                  v-for="item in periods"
                  :key="item.id"
                  :value="item.id"
                >{{ item.name }}</option></select></label>
              </div><span>{{ endDate ? `Срез ${dateLabel}` : 'Нет итога' }}</span>
            </div>
            <div
              class="calendar-weekdays"
              aria-hidden="true"
            >
              <span
                v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']"
                :key="day"
              >{{ day }}</span>
            </div>
            <div
              class="calendar-days"
              role="group"
              :aria-label="periodName"
            >
              <template
                v-for="(day, index) in calendar"
                :key="index"
              >
                <span
                  v-if="day === null"
                  class="calendar-day-spacer"
                  aria-hidden="true"
                /><button
                  v-else
                  class="calendar-day"
                  :class="{ 'is-selected': day === endDay, 'is-latest': day === endDay }"
                  :disabled="day !== endDay"
                  :aria-pressed="day === endDay"
                  :aria-label="`${day}. ${day === endDay ? 'Итог месяца' : 'Дневной срез недоступен'}`"
                  @click="close('period')"
                >
                  {{ day }}
                </button>
              </template>
            </div>
            <p
              id="sales-calendar-note"
              class="calendar-note"
            >
              В таблице доступны только итоги месяца.
            </p>
            <footer class="calendar-footer">
              <span>Выбрано: <b>{{ dateLabel }}</b></span><button @click="choosePeriod(periods[0].id)">
                Последние данные
              </button>
            </footer>
          </section>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  --picker-tone-rgb: 238 119 107;
  --picker-tone-secondary-rgb: 220 92 117;
  position: relative;
  z-index: 40;
  display: grid;
  min-block-size: 100px;
  padding: 8px;
  align-items: center;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 24px;
}
.dashboard-header[data-tone="positive"] { --picker-tone-rgb: 63 148 116; --picker-tone-secondary-rgb: 111 159 135; }
.dashboard-header[data-tone="warning"] { --picker-tone-rgb: 222 174 82; --picker-tone-secondary-rgb: 234 137 82; }
.dashboard-header[data-tone="neutral"] { --picker-tone-rgb: 126 137 148; --picker-tone-secondary-rgb: 96 121 140; }
.brand-context,
.screen-context,
.period-context > div { display: grid; }

.brand-logo {
  display: block;
  inline-size: 90px;
  block-size: auto;
  margin: 0;
}

.screen-context {
  justify-items: center;
  text-align: center;
}

.center-picker {
  position: relative;
  z-index: 40;
  display: grid;
  justify-items: center;
}

.center-picker-trigger {
  position: relative;
  display: inline-grid;
  inline-size: 300px;
  max-inline-size: min(42vw, 360px);
  min-block-size: 38px;
  padding: 6px 34px;
  border: 1px solid transparent;
  border-radius: 12px;
  place-items: center;
  appearance: none;
  box-sizing: border-box;
  color: #fffaf4;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -.045em;
  line-height: 1;
  text-align: center;
  transition: border-color 180ms ease, background-color 180ms ease, transform 180ms ease;
}

.center-picker-trigger > span {
  overflow: hidden;
  inline-size: 100%;
  min-inline-size: 0;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.center-picker-trigger svg {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-end: 12px;
  inline-size: 14px;
  fill: none;
  stroke: rgb(255 250 244 / 62%);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
  transform: translateY(-50%);
  transition: transform 180ms ease;
}

.center-picker-trigger:not(.is-open):hover {
  border-color: rgb(var(--picker-tone-rgb) / 34%);
  background:
    linear-gradient(120deg, rgb(255 255 255 / 10%), rgb(var(--picker-tone-rgb) / 12%));
  box-shadow: inset 0 1px rgb(255 255 255 / 10%);
}

.center-picker-trigger.is-open {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.center-picker-trigger:active { transform: translateY(1px); }
.center-picker-trigger.is-open svg { transform: translateY(-50%) rotate(180deg); }

.center-picker-trigger:focus-visible {
  border-color: rgb(var(--picker-tone-rgb) / 64%);
  outline: none;
  background:
    linear-gradient(120deg, rgb(255 255 255 / 12%), rgb(var(--picker-tone-rgb) / 16%));
  box-shadow: inset 0 1px rgb(255 255 255 / 12%);
}

.center-picker-trigger.is-open:focus-visible {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.center-picker-listbox {
  position: absolute;
  z-index: 60;
  inset-block-start: calc(100% + 10px);
  inset-inline-start: 50%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  inline-size: min(320px, calc(100vw - 24px));
  max-block-size: min(50vh, 324px);
  padding: 6px;
  border: 1px solid rgb(var(--picker-tone-rgb) / 31%);
  border-radius: 22px;
  color: #fffaf4;
  background:
    linear-gradient(145deg, rgb(255 255 255 / 15%), transparent 36%),
    radial-gradient(circle at 88% 8%, rgb(var(--picker-tone-rgb) / 24%), transparent 48%),
    linear-gradient(160deg, rgb(30 35 40 / 68%), rgb(var(--picker-tone-secondary-rgb) / 16%)),
    rgb(20 23 26 / 64%);
  box-shadow:
    0 16px 42px rgb(4 7 10 / 30%),
    inset 0 1px rgb(255 255 255 / 18%),
    inset 0 -1px rgb(var(--picker-tone-rgb) / 10%);
  -webkit-backdrop-filter: blur(26px) saturate(135%);
  backdrop-filter: blur(26px) saturate(135%);
  scrollbar-color: rgb(var(--picker-tone-rgb) / 64%) rgb(255 250 244 / 6%);
  scrollbar-width: thin;
  text-align: start;
  translate: -50% 0;
}

.center-picker-listbox:focus-visible {
  outline: 2px solid rgb(var(--picker-tone-rgb) / 92%);
  outline-offset: 3px;
}

.center-picker-option {
  display: grid;
  min-block-size: 38px;
  padding: 8px 10px 8px 12px;
  border: 1px solid transparent;
  border-radius: 11px;
  align-items: center;
  color: rgb(255 250 244 / 78%);
  cursor: pointer;
  font-size: 14px;
  font-weight: 650;
  grid-template-columns: minmax(0, 1fr) 16px;
  gap: 10px;
  letter-spacing: -.01em;
  line-height: 1.15;
}

.center-picker-option + .center-picker-option { margin-block-start: 2px; }

.center-picker-option > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.center-picker-option svg {
  inline-size: 16px;
  fill: none;
  stroke: #fffaf4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.center-picker-option.is-active {
  border-color: transparent;
  color: #fffaf4;
  background: rgb(255 255 255 / 9%);
  box-shadow: inset 0 0 0 1px rgb(var(--picker-tone-rgb) / 38%);
}

.center-picker-option.is-selected {
  color: #fffaf4;
  background:
    linear-gradient(110deg, rgb(var(--picker-tone-rgb) / 34%), rgb(255 255 255 / 8%));
  box-shadow:
    inset 3px 0 rgb(var(--picker-tone-rgb) / 76%),
    inset 0 1px rgb(255 255 255 / 9%);
}

.center-picker-option.is-active.is-selected {
  border-color: transparent;
  background:
    linear-gradient(110deg, rgb(var(--picker-tone-rgb) / 42%), rgb(255 255 255 / 12%));
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 19%),
    inset 3px 0 rgb(var(--picker-tone-rgb) / 82%),
    inset 0 1px rgb(255 255 255 / 9%);
}

.center-menu-popover-enter-active,
.center-menu-popover-leave-active { transition: opacity 150ms ease, transform 150ms ease; }
.center-menu-popover-enter-from,
.center-menu-popover-leave-to { opacity: 0; transform: translateY(-6px) scale(.98); }

.period-context {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  text-align: end;
}

.period-picker { position: relative; }

.data-freshness {
  margin-block-start: 4px;
  color: rgb(255 250 244 / 56%);
  font-size: 11px;
  line-height: 1.2;
  text-align: end;
  white-space: nowrap;
}

.period-trigger {
  display: grid;
  min-block-size: 54px;
  padding: 7px 10px 7px 12px;
  border: 1px solid transparent;
  border-radius: 15px;
  align-items: center;
  appearance: none;
  color: #fffaf4;
  background: transparent;
  cursor: pointer;
  font: inherit;
  grid-template-columns: 18px auto 14px;
  gap: 9px;
  text-align: end;
  transition: border-color 180ms ease, background-color 180ms ease, transform 180ms ease;
}

.period-trigger:not(.is-open):hover {
  border-color: rgb(var(--picker-tone-rgb) / 34%);
  background:
    linear-gradient(120deg, rgb(255 255 255 / 10%), rgb(var(--picker-tone-rgb) / 12%));
  box-shadow: inset 0 1px rgb(255 255 255 / 10%);
}

.period-trigger.is-open {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.period-trigger:active { transform: translateY(1px); }

.period-trigger:focus-visible {
  border-color: rgb(var(--picker-tone-rgb) / 64%);
  outline: none;
  background:
    linear-gradient(120deg, rgb(255 255 255 / 12%), rgb(var(--picker-tone-rgb) / 16%));
  box-shadow: inset 0 1px rgb(255 255 255 / 12%);
}

.period-trigger.is-open:focus-visible {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.period-trigger-calendar,
.period-trigger-chevron {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.period-trigger-calendar {
  inline-size: 18px;
  color: rgb(255 250 244 / 68%);
}

.period-trigger-chevron {
  inline-size: 14px;
  color: rgb(255 250 244 / 50%);
  transition: transform 180ms ease;
}

.period-trigger.is-open .period-trigger-chevron { transform: rotate(180deg); }

.period-trigger-copy {
  display: grid;
  gap: 2px;
}

.period-trigger-copy > span {
  color: rgb(255 250 244 / 60%);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.period-trigger-copy strong {
  color: #fffaf4;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.calendar-popover {
  position: absolute;
  z-index: 20;
  inset-block-start: calc(100% + 10px);
  inset-inline-end: 0;
  inline-size: min(326px, calc(100vw - 20px));
  padding: 16px;
  border: 1px solid rgb(var(--picker-tone-rgb) / 31%);
  border-radius: 22px;
  color: #fffaf4;
  background:
    linear-gradient(145deg, rgb(255 255 255 / 15%), transparent 36%),
    radial-gradient(circle at 88% 8%, rgb(var(--picker-tone-rgb) / 24%), transparent 48%),
    linear-gradient(160deg, rgb(30 35 40 / 68%), rgb(var(--picker-tone-secondary-rgb) / 16%)),
    rgb(20 23 26 / 64%);
  box-shadow:
    0 16px 42px rgb(4 7 10 / 30%),
    inset 0 1px rgb(255 255 255 / 18%),
    inset 0 -1px rgb(var(--picker-tone-rgb) / 10%);
  -webkit-backdrop-filter: blur(26px) saturate(135%);
  backdrop-filter: blur(26px) saturate(135%);
  text-align: start;
  transform-origin: top right;
}

.calendar-heading {
  display: flex;
  margin-block-end: 14px;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.calendar-heading > div { display: grid; gap: 2px; }

.calendar-heading > div > span {
  color: rgb(255 250 244 / 58%);
  font-size: 12px;
  font-weight: 550;
}

.calendar-heading strong {
  color: #fffaf4;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -.025em;
}

.calendar-heading > span {
  padding-block-end: 2px;
  color: rgb(255 250 244 / 58%);
  font-size: 12px;
  font-weight: 550;
  white-space: nowrap;
}

.calendar-weekdays,
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 5px;
}

.calendar-weekdays {
  margin-block-end: 5px;
  color: rgb(255 250 244 / 48%);
  font-size: 12px;
  font-weight: 650;
  text-align: center;
}

.calendar-weekdays span { padding-block: 3px; }

.calendar-day,
.calendar-day-spacer {
  inline-size: 100%;
  aspect-ratio: 1;
}

.calendar-day {
  position: relative;
  display: grid;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 11px;
  place-items: center;
  appearance: none;
  color: rgb(255 250 244 / 88%);
  background: transparent;
  cursor: pointer;
  font: 650 13px/1 "Inter Tight", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.calendar-day:hover:not(:disabled) {
  border-color: rgb(var(--picker-tone-rgb) / 48%);
  background: rgb(var(--picker-tone-rgb) / 17%);
  transform: translateY(-1px);
}

.calendar-day:focus-visible {
  z-index: 1;
  outline: 2px solid rgb(var(--picker-tone-rgb) / 92%);
  outline-offset: 2px;
}

.calendar-day.is-selected {
  border-color: rgb(var(--picker-tone-rgb) / 68%);
  color: #fffaf4;
  background:
    linear-gradient(135deg, rgb(var(--picker-tone-rgb) / 54%), rgb(255 255 255 / 17%));
  box-shadow: inset 0 1px rgb(255 255 255 / 14%);
}

.calendar-day.is-latest::after {
  position: absolute;
  inset-block-end: 4px;
  inline-size: 3px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgb(var(--picker-tone-rgb));
  content: "";
}

.calendar-day.is-selected.is-latest::after { background: #fffaf4; }

.calendar-day:disabled {
  border-color: rgb(255 250 244 / 9%);
  color: rgb(255 250 244 / 27%);
  cursor: not-allowed;
}

.calendar-footer {
  display: flex;
  margin-block-start: 13px;
  padding-block-start: 12px;
  border-block-start: 1px solid rgb(255 250 244 / 10%);
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.calendar-footer > span {
  color: rgb(255 250 244 / 60%);
  font-size: 12px;
}

.calendar-footer b { color: #fffaf4; font-weight: 650; }

.calendar-footer button {
  min-block-size: 34px;
  padding: 7px 9px;
  border: 1px solid rgb(var(--picker-tone-rgb) / 40%);
  border-radius: 10px;
  appearance: none;
  color: #fffaf4;
  background: rgb(var(--picker-tone-rgb) / 13%);
  cursor: pointer;
  font: 650 12px/1 "Inter Tight", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.calendar-footer button:hover {
  border-color: rgb(var(--picker-tone-rgb) / 62%);
  background: rgb(var(--picker-tone-rgb) / 22%);
}

.calendar-footer button:focus-visible {
  outline: 2px solid rgb(var(--picker-tone-rgb) / 92%);
  outline-offset: 2px;
}

.calendar-popover-enter-active,
.calendar-popover-leave-active { transition: opacity 180ms ease, transform 180ms cubic-bezier(.2, .75, .2, 1); }
.calendar-popover-enter-from,
.calendar-popover-leave-to { opacity: 0; transform: translateY(-5px) scale(.98); }

.period-select-label select {
  max-inline-size: 190px;
  padding: 2px 22px 2px 0;
  border: 0;
  appearance: none;
  color: #fffaf4;
  background:
    linear-gradient(45deg, transparent 50%, rgb(255 250 244 / 62%) 50%) calc(100% - 9px) 54% / 5px 5px no-repeat,
    linear-gradient(135deg, rgb(255 250 244 / 62%) 50%, transparent 50%) calc(100% - 5px) 54% / 5px 5px no-repeat;
  cursor: pointer;
  font: 700 18px/1.2 "Inter Tight", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
}

.period-select-label select:focus-visible {
  outline: 2px solid rgb(var(--picker-tone-rgb) / 92%);
  outline-offset: 3px;
}

.period-select-label option {
  color: #1d1b19;
  background: #fffaf4;
}

.visually-hidden {
  position: absolute;
  overflow: hidden;
  inline-size: 1px;
  block-size: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.center-picker-option { inline-size: 100%; appearance: none; background: transparent; font-family: inherit; text-align: start; }
.center-picker-option:hover, .center-picker-option:focus-visible { outline: none; box-shadow: inset 0 0 0 1px rgb(var(--picker-tone-rgb) / 65%); background-color: rgb(255 255 255 / 9%); }
.calendar-note { margin: 10px 0 0; color: rgb(255 250 244 / 60%); font-size: 11px; line-height: 1.35; }
@media (prefers-reduced-motion: reduce) {
  .center-picker-trigger, .center-picker-trigger svg, .center-picker-option, .period-trigger, .period-trigger-chevron, .calendar-day, .calendar-footer button,
  .center-menu-popover-enter-active, .center-menu-popover-leave-active, .calendar-popover-enter-active, .calendar-popover-leave-active { transition: none; }
}
</style>
