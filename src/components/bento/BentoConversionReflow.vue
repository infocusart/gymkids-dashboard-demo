<script setup lang="ts">
import { computed } from 'vue'
import type { DeepReadonly } from 'vue'
import type { GymkidsDashboardView } from '@/data/gymkidsSnapshot'

const props = defineProps<{
  dashboard: DeepReadonly<GymkidsDashboardView>
}>()

const emit = defineEmits<{
  close: []
  openPath: []
}>()

const rate = (value: number, total: number) => {
  if (!total)
    return 0

  return Math.round((value / total) * 1000) / 10
}

const formatRate = (value: number) => `${String(value).replace('.', ',')}%`

const nestedAvailable = computed(() => props.dashboard.cohort.available && props.dashboard.cohort.validScheduled !== null && props.dashboard.cohort.validReached !== null)

const journey = computed(() => {
  const leads = props.dashboard.leads.fact
  const valid = props.dashboard.quality.valid
  const scheduled = props.dashboard.cohort.validScheduled ?? 0
  const reached = props.dashboard.cohort.validReached ?? 0

  return [
    { key: 'leads', label: 'Лиды', value: leads, rate: 100 },
    { key: 'valid', label: 'Валидные', value: valid, rate: rate(valid, leads) },
    { key: 'scheduled', label: 'Записаны из валидных', value: scheduled, rate: rate(scheduled, leads) },
    { key: 'reached', label: 'Дошли', value: reached, rate: rate(reached, leads) },
  ].map((item, index, items) => ({
    ...item,
    rateLabel: index === 0
      ? 'старт'
      : index >= 2 && !nestedAvailable.value
        ? '—'
        : formatRate(rate(item.value, items[index - 1].value)),
    valueLabel: index >= 2 && !nestedAvailable.value ? '—' : item.value.toLocaleString('ru-RU'),
  }))
})

const largestDrop = computed(() => {
  const transitions = journey.value.slice(1).map((step, index) => ({
    from: journey.value[index],
    to: step,
    value: journey.value[index].value - step.value,
  })).filter((_, index) => index === 0 || nestedAvailable.value)

  return transitions.reduce((largest, item) => item.value > largest.value ? item : largest)
})
</script>

<template>
  <section
    class="conversion-reflow-detail"
    aria-labelledby="conversion-journey-title"
  >
    <div class="conversion-reflow-detail__content">
      <header class="conversion-reflow-detail__header">
        <div>
          <span>Когорта лидов месяца</span>
          <h3 id="conversion-journey-title">
            Путь к пробному
          </h3>
        </div>

        <button
          class="conversion-reflow-back"
          type="button"
          data-bento-detail-focus
          aria-label="Свернуть метрику «Конверсия»"
          @click="emit('close')"
        >
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="m12.5 4.5-5.5 5.5 5.5 5.5M7.5 10H17" />
          </svg>
          <span>Свернуть</span>
        </button>
      </header>

      <div
        class="conversion-journey"
        :aria-label="`Когорта лидов месяца: ${journey.map(item => `${item.label} — ${item.valueLabel}`).join(', ')}`"
      >
        <div
          v-for="(item, index) in journey"
          :key="item.key"
          class="conversion-journey__step"
        >
          <span class="conversion-journey__index">0{{ index + 1 }}</span>
          <strong>{{ item.label }}</strong>
          <b>{{ item.valueLabel }}</b>
          <small>{{ item.rateLabel }}</small>
          <i aria-hidden="true"><span :style="{ inlineSize: `${item.rate}%` }" /></i>
        </div>
      </div>
      <p>Лиды выбранного месяца. Записи и подтверждения в этом пути — среди валидных лидов, все даты пробного до среза CRM.</p>

      <aside class="conversion-reflow-insight">
        <div>
          <span>Наибольшая разница между этапами</span>
          <p>
            «{{ largestDrop.from.label }}» → «{{ largestDrop.to.label }}»:
            <strong>−{{ largestDrop.value.toLocaleString('ru-RU') }}</strong>
          </p>
        </div>

        <button
          type="button"
          @click="emit('openPath')"
        >
          По каналам
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
          ><path d="M6 14 14 6M8 6h6v6" /></svg>
        </button>
      </aside>
    </div>
  </section>
</template>
