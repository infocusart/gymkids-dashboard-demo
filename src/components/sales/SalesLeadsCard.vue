<script setup lang="ts">
import { computed } from 'vue'
import type { SalesRecord } from '@/lib/planerkiSales'
import { salesRevenueTone } from '@/lib/salesDesktop'
import { salesLeads } from '@/lib/salesLeads'

const props = defineProps<{ record: SalesRecord }>()
const leads = computed(() => salesLeads(props.record))
const number = (value: number | null, digits = 0) => value === null ? '—' : new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits }).format(value)
const rate = computed(() => leads.value.rate === null ? '—' : `${number(leads.value.rate * 100, 1)}%`)
</script>

<template>
  <section
    class="sales-card monthly-leads-card"
    data-sales-card="leads"
    :data-tone="salesRevenueTone(leads.rate)"
    aria-labelledby="monthly-leads-heading"
  >
    <header class="monthly-leads-heading">
      <h2 id="monthly-leads-heading">
        Лиды на сегодня
      </h2><span>{{ rate }} к плану</span>
    </header>
    <div class="monthly-leads-number">
      <strong>{{ number(leads.fact) }}</strong><span>из {{ number(leads.plan) }}<small>план месяца</small></span>
    </div>
    <p class="monthly-leads-daily">
      <span>План: <b>{{ number(leads.dailyPlan, 1) }}</b></span><span>Факт: <b>{{ number(leads.dailyFact, 1) }}</b></span><small>лида в день</small>
    </p>
    <div
      class="monthly-leads-chart"
      role="img"
      :style="{ '--plan-line': `${leads.planHeight}%` }"
      :aria-label="`Лиды по дням ${record.period}. Итог ${number(leads.fact)}. План ${number(leads.dailyPlan, 1)} лида в день, пунктирная линия. Шкала от нуля.`"
    >
      <div class="monthly-leads-plot">
        <div
          v-for="bar in leads.chart"
          :key="bar.day"
          class="monthly-leads-day"
          :class="{ 'future-day': bar.future, 'missing-day': bar.value === null && !bar.future }"
          :title="`${bar.day} число: ${bar.future ? 'план' : number(bar.value)}${bar.future ? '' : ' лидов'}`"
        >
          <i :style="{ height: `${bar.height}%` }" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.monthly-leads-card { --lead-tone: #3f9474; --lead-rgb: 63 148 116; --lead-background: radial-gradient(circle at 86% 10%, rgb(var(--lead-rgb) / 30%), transparent 44%), linear-gradient(145deg, rgb(var(--lead-rgb) / 16%), #110f0e75 62%); grid-area: leads; display: flex; flex-direction: column; min-height: 490px; overflow: hidden; color: #fbf7f1; border: 1px solid #ffffff1a; background: var(--lead-background); }
.sales-card.monthly-leads-card:not(.is-neighbor):hover { background: var(--lead-background); }
.monthly-leads-card[data-tone="warning"] { --lead-tone: #c79f52; --lead-rgb: 199 159 82; }
.monthly-leads-card[data-tone="negative"] { --lead-tone: #cf806b; --lead-rgb: 207 128 107; }
.monthly-leads-card[data-tone="neutral"] { --lead-tone: #82988e; --lead-rgb: 130 152 142; }
.monthly-leads-heading { display: flex; align-items: flex-start; gap: 12px; justify-content: space-between; }
.monthly-leads-heading h2 { margin: 0; color: #fbf7f1; font-size: 23px; font-weight: 650; letter-spacing: -.04em; line-height: 1.12; }
.monthly-leads-heading > span { flex-shrink: 0; padding: 7px 10px; border: 1px solid #3f94746b; border-radius: 999px; background: #3f94742e; font-size: 12px; font-weight: 600; white-space: nowrap; }
.monthly-leads-number { display: flex; align-items: flex-end; gap: 12px; margin-top: 32px; }
.monthly-leads-number > strong { color: #fbf7f1; font-size: clamp(76px, 6.2vw, 100px); font-weight: 600; letter-spacing: -.08em; line-height: .9; }
.monthly-leads-number > span { display: grid; padding-bottom: 3px; color: #d2ddd6; font-size: 20px; font-weight: 600; line-height: 1.15; }
.monthly-leads-number small { margin-top: 3px; font-size: 12px; font-weight: 450; }
.monthly-leads-daily { display: flex; align-items: baseline; gap: 7px 9px; flex-wrap: wrap; margin: 20px 0 24px; font-size: 13px; color: #d2ddd6; }
.monthly-leads-daily span { display: inline-flex; gap: 4px; align-items: baseline; }
.monthly-leads-daily span + span { padding-left: 9px; border-left: 1px solid #ffffff2e; }
.monthly-leads-daily b { color: #fbf7f1; font-size: 17px; font-weight: 600; }
.monthly-leads-daily small { font-size: 12px; }
.monthly-leads-chart { position: relative; flex: 1 0 210px; min-height: 210px; margin: auto -22px -22px; }
.monthly-leads-plot { position: absolute; inset: 16px 0 0; display: flex; align-items: stretch; gap: 2px; }
.monthly-leads-plot::before { content: ''; position: absolute; inset-inline: 0; bottom: var(--plan-line); height: 1px; background: repeating-linear-gradient(90deg, #fbf7f16b 0 8px, transparent 8px 14px); }
.monthly-leads-day { position: relative; flex: 1; min-width: 0; }
.monthly-leads-day i { position: absolute; bottom: 0; inset-inline: 0; border-radius: 5px 5px 0 0; background: var(--lead-tone); }
.monthly-leads-day.future-day i { border: 1px solid #3f94748a; background: #3f94740d; }
.monthly-leads-day.missing-day i { display: none; }
.monthly-leads-card.is-neighbor { min-height: 175px; }
.is-neighbor .monthly-leads-heading { flex-wrap: wrap; gap: 6px; }
.is-neighbor .monthly-leads-heading h2 { font-size: 18px; }
.is-neighbor .monthly-leads-heading > span { padding: 4px 6px; font-size: 11px; }
.is-neighbor .monthly-leads-number { margin-top: 16px; gap: 9px; }
.is-neighbor .monthly-leads-number > strong { font-size: 50px; }
.is-neighbor .monthly-leads-number > span { font-size: 15px; }
.is-neighbor .monthly-leads-daily, .is-neighbor .monthly-leads-chart { display: none; }
@media (min-width: 1024px) and (max-width: 1279px) { .monthly-leads-heading h2 { font-size: 21px; } .monthly-leads-heading > span { padding: 6px 8px; font-size: 11px; } .monthly-leads-chart { margin-inline: -18px; margin-bottom: -18px; } .monthly-leads-number > strong { font-size: 82px; } }
</style>
