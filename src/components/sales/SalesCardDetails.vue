<script setup lang="ts">
import { computed } from 'vue'
import { type SalesRecord, displayMetric, metric } from '@/lib/planerkiSales'
import { type SalesCardKey, salesCardDetails } from '@/lib/salesDesktop'

const props = defineProps<{ card: SalesCardKey; record: SalesRecord; expanded: boolean; busy: boolean; format: (row: number, value: number | null) => string }>()

defineEmits<{ toggle: [card: SalesCardKey] }>()

const details = computed(() => salesCardDetails[props.card])
const label = (row: number) => ({ 31: 'Средний чек групп в книге', 32: 'Итог покупок в книге (состав зависит от формулы)', 42: 'Новые ИНДИ / сплит / мини-группы', 43: 'Средний чек других форматов в книге' }[row] ?? props.record.metrics[String(row)]?.label ?? '')
</script>

<template>
  <button
    class="sales-focus-button"
    :disabled="busy"
    :aria-expanded="expanded"
    :aria-controls="`sales-detail-${card}`"
    :aria-label="`${expanded ? 'Свернуть' : 'Раскрыть'}: ${details.title}`"
    @click="$emit('toggle', card)"
  >
    {{ expanded ? '×' : '↗' }}
  </button>
  <div
    v-if="expanded"
    :id="`sales-detail-${card}`"
    class="sales-card-detail"
  >
    <span class="detail-eyebrow">Расчёт и исходные значения книги</span>
    <h3>{{ details.title }}</h3>
    <p>{{ details.explanation }}</p>
    <table>
      <caption class="sales-sr-only">
        {{ details.title }} — план и факт
      </caption>
      <thead>
        <tr>
          <th scope="col">
            Показатель
          </th><th scope="col">
            План
          </th><th scope="col">
            Факт
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in details.rows"
          :key="row"
        >
          <th scope="row">
            {{ label(row) }}
          </th><td>{{ format(row, metric(record, row, 'plan')) }}</td><td>{{ format(row, displayMetric(record, row)) }}</td>
        </tr>
      </tbody>
    </table>
    <p class="detail-source">
      {{ record.sheet }} · {{ record.sourceCenter }} · итог {{ record.endDate.split('-').reverse().join('.') }}<br>План: {{ record.planColumn }} · факт: {{ record.factColumn }} · строки {{ details.rows.join(', ') }}
    </p>
  </div>
</template>
