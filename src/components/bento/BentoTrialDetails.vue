<script setup lang="ts">
import { computed } from 'vue'
import type { DeepReadonly } from 'vue'
import type { GymkidsDashboardView } from '@/data/gymkidsSnapshot'

const props = defineProps<{
  trial: DeepReadonly<GymkidsDashboardView['trial']>
}>()

const emit = defineEmits<{ close: [] }>()
const maxDaily = computed(() => Math.max(1, ...props.trial.byDate.map(day => day.scheduled)))
const previousMonths = computed(() => props.trial.byLeadMonth.filter(month => month.period < props.trial.period))

const selectedMonthGenitive = computed(() => new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric', month: 'long', timeZone: 'UTC',
}).formatToParts(new Date(`${props.trial.period}-01T00:00:00Z`)).find(part => part.type === 'month')!.value)

const monthLabel = (period: string) => new Intl.DateTimeFormat('ru-RU', {
  month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${period}-01T00:00:00Z`)).replace(' г.', '')

const rateLabel = (reached: number, scheduled: number) => scheduled
  ? `${String(Math.round(reached / scheduled * 1000) / 10).replace('.', ',')}%`
  : '—'

const dayLabel = (date: string) => new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric', month: 'long', timeZone: 'UTC',
}).format(new Date(`${date}T00:00:00Z`))

const dailyLabel = (day: DeepReadonly<GymkidsDashboardView['trial']['byDate'][number]>) =>
  `${dayLabel(day.date)}: назначены ${day.scheduled}, дошли ${day.reached}`
</script>

<template>
  <section
    class="trial-details"
    aria-label="Подробности пробных за период"
    @click="emit('close')"
  >
    <template v-if="trial.available">
      <section
        class="trial-details__months"
        aria-labelledby="trial-lead-months-title"
      >
        <h3 id="trial-lead-months-title">
          Пробные из прошлых месяцев
        </h3>
        <div class="trial-details__table-scroll">
          <table v-if="previousMonths.length">
            <thead>
              <tr>
                <th scope="col">
                  Месяц обращения
                </th><th scope="col">
                  Записаны
                </th><th scope="col">
                  Дошли
                </th><th scope="col">
                  Дошли, %
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="month in previousMonths"
                :key="month.period"
              >
                <th scope="row">
                  {{ monthLabel(month.period) }}
                </th>
                <td>{{ month.scheduled }}</td><td>{{ month.reached }}</td><td>{{ rateLabel(month.reached, month.scheduled) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>
            Пробных из прошлых обращений нет.
          </p>
        </div>
      </section>

      <section
        class="trial-details__future"
        aria-labelledby="trial-future-title"
      >
        <h3 id="trial-future-title">
          Записи на будущие месяцы
        </h3>
        <div class="trial-details__table-scroll">
          <table v-if="trial.futureBookings.available && trial.futureBookings.byTrialMonth.length">
            <thead>
              <tr>
                <th scope="col">
                  Обращения {{ selectedMonthGenitive }} → пробное
                </th>
                <th scope="col">
                  Записаны
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="month in trial.futureBookings.byTrialMonth"
                :key="month.period"
              >
                <th scope="row">
                  {{ monthLabel(month.period) }}
                </th>
                <td>{{ month.scheduled }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else-if="trial.futureBookings.available">
            Записей на будущие месяцы нет.
          </p>
          <p v-else>
            Данные о записях на будущие месяцы недоступны.
          </p>
        </div>
      </section>

      <figure
        class="trial-details__daily"
        aria-labelledby="trial-daily-title"
      >
        <figcaption>
          <h3 id="trial-daily-title">
            Пробные по дням
          </h3>
          <span class="trial-details__legend"><i />Записаны <i />Дошли</span>
        </figcaption>
        <div
          class="trial-details__chart"
          :style="{ '--trial-days': trial.byDate.length }"
        >
          <div
            v-for="(day, index) in trial.byDate"
            :key="day.date"
            class="trial-details__day"
            tabindex="0"
            :aria-label="dailyLabel(day)"
            :title="dailyLabel(day)"
          >
            <span
              class="trial-details__bar"
              :style="{ blockSize: `${day.scheduled / maxDaily * 100}%` }"
            >
              <i :style="{ blockSize: `${day.scheduled ? day.reached / day.scheduled * 100 : 0}%` }" />
            </span>
            <small v-if="index === 0 || index === trial.byDate.length - 1 || (index < trial.byDate.length - 2 && Number(day.date.slice(-2)) % 5 === 0)">{{ Number(day.date.slice(-2)) }}</small>
          </div>
        </div>
      </figure>
    </template>
    <p
      v-else
      class="trial-details__note"
    >
      {{ trial.coverageNote }}
    </p>
  </section>
</template>

<style scoped>
.trial-details {
  position: relative;
  z-index: 9;
  min-block-size: 0;
  overflow: auto;
  border-block-start: 1px solid rgb(25 28 25 / 14%);
  color: var(--ink);
  padding-block-start: 14px;
  scrollbar-width: thin;
}
.trial-details h3 { margin: 0; color: var(--ink); font-size: 16px; font-weight: 700; letter-spacing: -.035em; line-height: 1.2; }
.trial-details p { margin: 5px 0 0; color: var(--muted); font-size: 12px; line-height: 1.3; }
.trial-details__table-scroll { max-block-size: 172px; overflow: auto; margin-block-start: 10px; scrollbar-width: thin; }
.trial-details table { inline-size: 100%; border-collapse: collapse; font-size: 12px; font-variant-numeric: tabular-nums; }
.trial-details th, .trial-details td { border-block-end: 1px solid rgb(25 28 25 / 12%); padding-block: 8px; text-align: end; }
.trial-details th:first-child { text-align: start; }
.trial-details thead th { padding-block: 0 7px; color: var(--muted); font-size: 10px; font-weight: 500; }
.trial-details tbody th { font-weight: 600; text-transform: capitalize; }
.trial-details tbody td { font-weight: 650; }
.trial-details__months tbody td:last-child { color: #267856; }
.trial-details tbody tr:last-child > * { border: 0; }
.trial-details__daily { margin: 18px 0 0; }
.trial-details__future { margin-block-start: 18px; }
.trial-details figcaption { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.trial-details__legend { display: flex; align-items: center; gap: 4px; color: var(--muted); font-size: 10px; }
.trial-details__legend i { inline-size: 6px; block-size: 6px; border-radius: 2px; background: rgb(25 28 25 / 22%); }
.trial-details__legend i:last-of-type { margin-inline-start: 5px; background: #349672; }
.trial-details__chart { display: grid; grid-template-columns: repeat(var(--trial-days), minmax(0, 1fr)); block-size: 68px; margin-block: 14px 20px; margin-inline: 2px; align-items: end; gap: 3px; border-block-end: 1px solid rgb(25 28 25 / 16%); }
.trial-details__day { position: relative; display: flex; block-size: 100%; align-items: end; border-radius: 2px; }
.trial-details__day:focus-visible { outline: 2px solid #267856; outline-offset: 2px; }
.trial-details__day:hover { background: rgb(25 28 25 / 7%); }
.trial-details__bar { position: relative; display: block; inline-size: 100%; overflow: hidden; border-radius: 3px 3px 0 0; background: rgb(25 28 25 / 22%); }
.trial-details__bar i { position: absolute; inline-size: 100%; inset-block-end: 0; background: #349672; }
.trial-details__day small { position: absolute; color: var(--muted); font-size: 9px; inset-block-start: calc(100% + 5px); inset-inline-start: 50%; transform: translateX(-50%); }
.trial-details .trial-details__note { margin-block-start: 15px; }
.trial-details-fade-enter-active { transition: opacity 260ms ease 300ms; }
.trial-details-fade-leave-active { position: absolute; transition: opacity 160ms ease; }
.trial-details-fade-enter-from, .trial-details-fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .trial-details-fade-enter-active, .trial-details-fade-leave-active { transition: none; }
}
</style>
