<script setup lang="ts">
import { computed } from 'vue'
import { type SalesRecord } from '@/lib/planerkiSales'
import { type SalesSourceRow, type SourceParameter, sourceDetails } from '@/lib/salesSourceDetails'

const props = defineProps<{ record: SalesRecord; row: SalesSourceRow }>()

defineEmits<{ close: [] }>()

const details = computed(() => sourceDetails(props.record, props.row))
const number = (value: number, digits = 1) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits }).format(value)

const money = (value: number, currency = props.record.currency) => {
  const symbol = { RUB: '₽', AZN: '₼', AMD: '֏', UZS: 'сум' }[currency] ?? currency

  return `${Math.abs(value) >= 1e6 ? `${number(value / 1e6, 2)} млн` : number(value, 0)} ${symbol}`
}

const percent = (value: number | null) => value === null ? '—' : `${number(value * 100)}%`

const parameterValue = (item: SourceParameter, value: number) => {
  const formatted = item.unit === 'money' ? money(value) : item.unit === 'rate' ? percent(value) : number(value, item.signed ? 2 : 1)

  return item.signed && value > 0 ? `+${formatted}` : formatted
}

const month = computed(() => new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(`${props.record.period}-15T12:00:00`)))
const yearScale = computed(() => Math.max(1, ...details.value.years.flatMap(item => [item.plan, item.fact])))
const bar = (value: number) => `${Math.max(0, value) / yearScale.value * 100}%`
</script>

<template>
  <section
    id="sales-source-details"
    class="sales-source-panel"
    tabindex="-1"
    aria-labelledby="source-detail-heading"
  >
    <header class="source-header">
      <div>
        <span class="source-context">{{ record.centerName }} · {{ month }} {{ record.period.slice(0, 4) }}</span><h2 id="source-detail-heading">
          {{ details.label }}
        </h2>
      </div>
      <div class="source-budget">
        <span>План {{ money(details.totals.plan) }}</span><strong>Факт {{ money(details.totals.fact) }}</strong>
      </div>
      <button
        class="source-close"
        aria-label="Закрыть подробности источника"
        @click="$emit('close')"
      >
        ×
      </button>
    </header>
    <div class="source-sections">
      <section
        class="source-quarter"
        aria-labelledby="source-counts-heading"
      >
        <h3 id="source-counts-heading">
          <span class="section-number">01</span> Детальный план
        </h3>
        <div class="quantity-pair">
          <div><span>План · шт.</span><strong>{{ number(details.totals.countPlan) }}</strong></div><div><span>Факт · шт.</span><strong>{{ number(details.totals.countFact) }}</strong></div>
        </div>
        <table class="source-table">
          <caption class="sales-sr-only">
            Параметры выбранного источника
          </caption><thead>
            <tr>
              <th scope="col">
                Параметр
              </th><th scope="col">
                План
              </th><th scope="col">
                Факт
              </th>
            </tr>
          </thead><tbody>
            <tr
              v-for="item in details.parameters.slice(1)"
              :key="item.label"
              :class="{ 'source-difference': item.signed }"
            >
              <th scope="row">
                {{ item.label }}
              </th><td>{{ parameterValue(item, item.plan) }}</td><td>{{ parameterValue(item, item.fact) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section
        class="source-quarter"
        aria-labelledby="source-managers-heading"
      >
        <h3 id="source-managers-heading">
          <span class="section-number">02</span> Планы менеджеров
        </h3>
        <table class="source-table manager-table">
          <caption class="sales-sr-only">
            Распределение плана и факта по менеджерам
          </caption><thead>
            <tr>
              <th scope="col">
                Менеджер
              </th><th scope="col">
                План
              </th><th scope="col">
                Факт
              </th>
            </tr>
          </thead><tbody>
            <tr
              v-for="item in details.managers"
              :key="item.name"
            >
              <th scope="row">
                {{ item.name }}
              </th><td>{{ money(item.plan) }}</td><td>{{ money(item.fact) }}</td>
            </tr>
          </tbody><tfoot>
            <tr>
              <th scope="row">
                Итого
              </th><td>{{ money(details.totals.plan) }}</td><td>{{ money(details.totals.fact) }}</td>
            </tr>
          </tfoot>
        </table>
      </section>
      <section
        class="source-quarter"
        aria-labelledby="source-centers-heading"
      >
        <h3 id="source-centers-heading">
          <span class="section-number">03</span> Другие центры
        </h3>
        <div class="comparison-caption">
          <span>Выручка · факт</span><span>К плану</span>
        </div>
        <ul class="center-list">
          <li
            v-for="item in details.centers"
            :key="item.id"
          >
            <span>{{ item.name }}<small>{{ money(item.fact, item.currency) }}</small></span><strong>{{ percent(item.completion) }}</strong>
          </li>
        </ul>
      </section>
      <section
        class="source-quarter"
        aria-labelledby="source-years-heading"
      >
        <h3 id="source-years-heading">
          <span class="section-number">04</span> Сравнение годов
        </h3>
        <div class="year-legend">
          <span><i class="plan-dot" />План</span><span><i class="fact-dot" />Факт</span><span>{{ month }}</span>
        </div>
        <div
          class="year-list"
          role="img"
          :aria-label="`План и факт за ${month} 2024, 2025 и 2026 годов; общая шкала от 0 до ${money(yearScale)}`"
        >
          <div
            v-for="item in details.years"
            :key="item.year"
            class="year-row"
          >
            <div><strong>{{ item.year }}</strong><strong>{{ money(item.fact) }}</strong></div><div class="year-bars">
              <i
                class="plan-bar"
                :style="{ width: bar(item.plan) }"
              /><i
                class="fact-bar"
                :style="{ width: bar(item.fact) }"
              />
            </div><small>План {{ money(item.plan) }} · {{ percent(item.completion) }}</small>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.sales-source-panel { grid-area: source-detail; min-width: 0; padding: 22px; border: 1px solid #ffffff40; border-radius: 26px; background: linear-gradient(115deg, #e0e3d9e8, #cbd8ccd9); color: #232522; scroll-margin-top: 24px; }
.sales-source-panel:focus { outline: none; }
.sales-source-panel:focus-visible { outline: 2px solid #f1d9a5; outline-offset: 3px; }
.source-header { display: flex; align-items: center; gap: 18px; padding-bottom: 22px; border-bottom: 1px solid #263d2e26; }
.source-header h2 { color: #232522; margin: 4px 0 0; font-size: 28px; font-weight: 650; letter-spacing: -.04em; }
.source-context { font-size: 15px; color: #414a43; }
.source-budget { display: grid; gap: 4px; margin-left: auto; text-align: right; font-size: 15px; }
.source-budget strong { font-size: 18px; }
.source-close { flex: 0 0 44px; height: 44px; border: 1px solid #243e3026; border-radius: 50%; background: #ffffff26; color: inherit; font-size: 29px; cursor: pointer; }
.source-close:hover { background: #ffffff60; }
.source-sections { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 22px; gap: 0; }
.source-quarter { min-width: 0; padding: 0 18px; border-left: 1px solid #263d2e26; }
.source-quarter:first-child { padding-left: 0; border-left: 0; }
.source-quarter:last-child { padding-right: 0; }
.source-quarter h3 { color: #232522; display: flex; align-items: center; gap: 9px; margin: 0 0 20px; font-size: 18px; line-height: 1.3; font-weight: 600; letter-spacing: -.02em; }
.section-number { color: #414a43; font-size: 14px; font-weight: 500; }
.quantity-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 15px; }
.quantity-pair > div { display: grid; gap: 4px; }
.quantity-pair span { color: #414a43; font-size: 15px; }
.quantity-pair strong { font-size: 44px; font-weight: 600; letter-spacing: -.05em; line-height: 1.15; }
.source-table { width: 100%; border-collapse: collapse; font-size: 15px; line-height: 1.4; }
.source-table th, .source-table td { padding: 10px 0 10px 8px; border-bottom: 1px solid #263d2e20; text-align: right; overflow-wrap: normal; }
.source-table th:first-child { padding-left: 0; text-align: left; }
.source-table thead th { color: #414a43; font-size: 14px; font-weight: 450; }
.source-table tbody th { font-weight: 450; }
.source-table td { white-space: nowrap; font-weight: 600; font-variant-numeric: tabular-nums; }
.source-table tfoot th, .source-table tfoot td { border-bottom: 0; padding-top: 15px; }
.source-difference th, .source-difference td { color: #5d382b; font-weight: 600; }
.manager-table tbody th { width: 30%; }
.comparison-caption { display: flex; justify-content: space-between; color: #414a43; font-size: 14px; margin-bottom: 4px; }
.center-list { margin: 0; padding: 0; list-style: none; }
.center-list li { display: flex; justify-content: space-between; gap: 10px; padding: 11px 0; border-bottom: 1px solid #263d2e20; font-size: 15px; line-height: 1.35; }
.center-list small { display: block; color: #414a43; margin-top: 2px; font-size: 14px; }
.center-list strong { flex-shrink: 0; align-self: center; font-size: 17px; }
.year-legend { display: flex; align-items: center; gap: 13px; color: #414a43; font-size: 14px; margin-bottom: 17px; }
.year-legend span { display: flex; align-items: center; gap: 5px; }
.year-legend span:last-child { margin-left: auto; }
.year-legend i { width: 7px; height: 7px; border-radius: 2px; }
.plan-dot, .plan-bar { background: #74857b; }
.fact-dot, .fact-bar { background: #285743; }
.year-row { margin-bottom: 17px; }
.year-row > div:first-child { display: flex; justify-content: space-between; gap: 10px; font-size: 17px; margin-bottom: 9px; }
.year-bars { display: grid; gap: 3px; }
.year-bars i { display: block; min-height: 5px; border-radius: 3px; }
.year-row small { display: block; margin-top: 5px; font-size: 14px; line-height: 1.45; color: #414a43; }
@media (max-width: 1439px) { .source-sections { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 28px; } .source-quarter:nth-child(3) { border-left: 0; padding-left: 0; } .source-quarter:nth-child(2) { padding-right: 0; } }
</style>
