<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import GymkidsSoftAurora from '@/components/GymkidsSoftAurora.vue'
import SalesDesktopHeader from '@/components/sales/SalesDesktopHeader.vue'
import logo from '@images/gymkids/white-logo.png'
import { displayMetric, metric, ratio, salesRecords, salesSource } from '@/lib/planerkiSales'
import { monthlySales } from '@/lib/salesMonthly'
import { salesRevenueTone } from '@/lib/salesDesktop'

const route = useRoute()
const router = useRouter()
const originalTitle = document.title

onMounted(() => {
  document.title = 'GYMKiDs — План месяца v3'
})
onBeforeUnmount(() => {
  document.title = originalTitle
})

const centers = [...new Map(salesRecords.map(item => [item.centerId, { id: item.centerId, name: item.centerName }])).values()]
const periods = [...new Set(salesRecords.map(item => item.period))].sort().reverse()
const query = (value: unknown) => typeof value === 'string' ? value : ''

const selectedCenter = () => centers.some(item => item.id === query(route.query.center)) ? query(route.query.center) : 'novo-peredelkino'
const selectedPeriod = () => periods.includes(query(route.query.period)) ? query(route.query.period) : periods[0]

const center = computed({
  get: selectedCenter,
  set: value => {
    router.replace({ query: { ...route.query, center: value, period: selectedPeriod() } })
  },
})

const period = computed({
  get: selectedPeriod,
  set: value => {
    router.replace({ query: { ...route.query, center: selectedCenter(), period: value } })
  },
})

const record = computed(() => salesRecords.find(item => item.centerId === center.value && item.period === period.value))
const model = computed(() => record.value ? monthlySales(record.value) : null)
const f = (row: number) => displayMetric(record.value, row)
const p = (row: number) => metric(record.value, row, 'plan')
const number = (value: number | null, digits = 0) => value === null ? '—' : new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits }).format(value)
const currency = computed(() => ({ RUB: '₽', AZN: '₼', UZS: 'сум', AMD: '֏' }[record.value?.currency ?? 'RUB'] ?? record.value?.currency ?? ''))
const money = (value: number | null) => value === null ? '—' : `${number(value)} ${currency.value}`
const shortMoney = (value: number | null) => value === null ? '—' : Math.abs(value) >= 1e6 ? `${number(value / 1e6, 2)} млн ${currency.value}` : money(value)
const percent = (value: number | null) => value === null ? '—' : `${number(value * 100, 1)}%`
const signed = (value: number | null, digits = 0) => value === null ? '—' : `${value > 0 ? '+' : ''}${number(value, digits)}`
const signedMoney = (value: number | null) => value === null ? '—' : `${value >= 0 ? '+' : '−'}${shortMoney(Math.abs(value))}`
const percentagePoints = (fact: number | null, plan: number | null) => fact === null || plan === null ? '—' : `${signed((fact - plan) * 100, 1)} п.п.`
const difference = (fact: number | null, plan: number | null) => fact === null || plan === null ? null : fact - plan
const completeSum = (values: (number | null)[]) => values.includes(null) ? null : values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
const fill = (value: number | null, base: number | null) => `${Math.min(100, Math.max(0, (ratio(value, base) ?? 0) * 100))}%`
const periodLabel = (value: string) => new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}-01T12:00:00Z`))
const revenueRate = computed(() => ratio(model.value?.net ?? null, p(5)))
const revenueDelta = computed(() => model.value?.net === null || model.value?.net === undefined || p(5) === null ? null : model.value.net - p(5)!)
const revenueTone = computed(() => salesRevenueTone(revenueRate.value))
const sourceDays = computed(() => f(72))
const isDesktop = useMediaQuery('(min-width: 1024px)')

const stages = computed(() => [
  { label: 'Лиды', fact: f(58), plan: p(53) },
  { label: 'Записались', fact: f(48), plan: p(48) },
  { label: 'Пришли', fact: f(46), plan: p(46) },
  { label: 'Купили', fact: model.value?.allNew ?? null, plan: null },
])

const monthDays = computed(() => new Date(Number(period.value.slice(0, 4)), Number(period.value.slice(5, 7)), 0).getDate())
const elapsedDays = computed(() => sourceDays.value === null ? null : Math.min(sourceDays.value, monthDays.value))
const paceTarget = (plan: number | null) => plan === null || elapsedDays.value === null ? null : plan * elapsedDays.value / monthDays.value
const paceRate = (fact: number | null, plan: number | null) => ratio(fact, paceTarget(plan))

const outcomeLabel = (rate: number | null) => {
  if (rate === null)
    return 'Темп недоступен'
  if (elapsedDays.value === monthDays.value)
    return rate >= 1 ? 'План выполнен' : 'План не выполнен'
  if (rate >= 1.05)
    return 'Выше темпа'
  if (rate >= 0.95)
    return 'В темпе'

  return 'Ниже темпа'
}

const outcomeClass = (rate: number | null) => rate === null ? 'neutral' : rate >= 1 ? 'positive' : rate >= 0.95 ? 'steady' : 'negative'
const newRevenue = computed(() => completeSum([f(30), f(44)]))
const newRevenuePlan = computed(() => completeSum([p(30), p(44)]))
const newCount = computed(() => model.value?.allNew ?? null)
const newCountPlan = computed(() => completeSum([p(32), p(42)]))
const newAverage = computed(() => ratio(newRevenue.value, newCount.value))
const newAveragePlan = computed(() => ratio(newRevenuePlan.value, newCountPlan.value))
const newSalesRate = computed(() => paceRate(newRevenue.value, newRevenuePlan.value))
const newSalesConversion = computed(() => ratio(newCount.value, f(46)))
const newSalesConversionPlan = computed(() => ratio(newCountPlan.value, p(46)))
const renewalRevenue = computed(() => completeSum([f(12), f(19)]))
const renewalPlan = computed(() => completeSum([p(12), p(19)]))
const renewalRate = computed(() => paceRate(renewalRevenue.value, renewalPlan.value))

const renewalRows = (item: NonNullable<typeof model.value>['renewals'][number]) => [
  { label: 'Выручка', plan: p(item.amountRow), fact: f(item.amountRow), format: shortMoney },
  { label: 'Продлено', plan: p(item.countRow), fact: f(item.countRow), format: (value: number | null) => number(value, 1) },
  { label: 'Средний чек', plan: p(item.averageRow), fact: item.average, format: shortMoney },
  { label: 'Доля месячной базы', plan: item.planRate, fact: item.rate, format: percent },
]

const incomplete = computed(() => [5, 8, 10, 25, 30, 33, 34, 35, 36, 46, 48, 58, 68].some(row => f(row) === null))
</script>

<template>
  <main
    class="sales-canvas v3-canvas"
    aria-label="План месяца и клиентская база GYMKiDs, версия 3"
  >
    <GymkidsSoftAurora
      :tone="isDesktop ? revenueTone : 'neutral'"
      motion="interactive"
    />
    <div class="sales-shell">
      <SalesDesktopHeader
        v-if="isDesktop"
        v-model:center="center"
        v-model:period="period"
        :centers="centers"
        :periods="periods.map(id => ({ id, name: periodLabel(id) }))"
        :end-date="record?.endDate"
        :source-days="sourceDays"
        :tone="revenueTone"
      />
      <header
        v-else
        class="sales-header"
      >
        <img
          :src="logo"
          class="sales-logo"
          alt="GYMKiDs"
        >
        <span class="source-tag">План месяца · v3</span>
      </header>

      <section
        v-if="!isDesktop"
        class="sales-heading"
        aria-label="Параметры отчёта"
      >
        <div><span class="eyebrow">Результаты клуба</span><h1>План месяца</h1></div>
        <div class="sales-filters">
          <label>Центр<select
            v-model="center"
            aria-label="Центр"
          ><option
            v-for="item in centers"
            :key="item.id"
            :value="item.id"
          >{{ item.name }}</option></select></label>
          <label>Месяц<select
            v-model="period"
            aria-label="Месяц"
          ><option
            v-for="item in periods"
            :key="item"
            :value="item"
          >{{ periodLabel(item) }}</option></select></label>
        </div>
      </section>

      <div
        v-if="!record || !model"
        class="sales-empty"
        role="status"
      >
        <h2>Итог этого месяца недоступен</h2><p>В книге нет однозначной колонки месячных итогов для выбранного центра.</p>
      </div>
      <template v-else>
        <p
          v-if="incomplete || (sourceDays !== null && sourceDays !== monthDays)"
          class="data-note"
          role="status"
        >
          В месячном итоге есть пропуски{{ sourceDays !== null && sourceDays !== monthDays ? ` или указано ${number(sourceDays)} из ${monthDays} дней` : '' }}. Пустые значения обозначены «—».
        </p>

        <div class="v3-grid">
          <section
            class="sales-card v3-card plan-card"
            aria-labelledby="v3-plan"
          >
            <div class="card-top">
              <h2 id="v3-plan">
                План месяца
              </h2><span
                class="pill"
                :class="{ caution: (revenueRate ?? 0) < 1 }"
              >{{ percent(revenueRate) }}</span>
            </div>
            <span class="v3-eyebrow">Выручка после возвратов · факт</span>
            <div class="hero-value">
              {{ shortMoney(model.net) }}
            </div>
            <div class="revenue-caption">
              <span>План <strong>{{ shortMoney(p(5)) }}</strong></span><span :class="revenueDelta !== null && revenueDelta < 0 ? 'coral-text' : 'mint-text'">{{ signedMoney(revenueDelta) }} к плану</span>
            </div>
            <div
              class="revenue-track"
              role="img"
              :aria-label="`Выполнение плана: ${percent(revenueRate)}`"
            >
              <i :style="{ width: fill(model.net, p(5)) }" />
            </div>
          </section>

          <section
            class="sales-card v3-card refunds-card"
            aria-labelledby="v3-refunds"
          >
            <div class="card-top">
              <h2 id="v3-refunds">
                Возвраты
              </h2><span class="card-kicker">{{ percent(ratio(f(4), model.net)) }} выручки</span>
            </div>
            <div class="refund-compact">
              {{ shortMoney(f(4)) }}
            </div>
          </section>

          <section
            class="sales-card v3-card new-card"
            aria-labelledby="v3-new"
          >
            <div class="card-top">
              <h2 id="v3-new">
                Новые продажи
              </h2><span
                class="status-chip"
                :class="outcomeClass(newSalesRate)"
              >{{ outcomeLabel(newSalesRate) }}</span>
            </div>
            <div class="outcome-line">
              <div><strong>{{ shortMoney(newRevenue) }}</strong><span>План {{ shortMoney(newRevenuePlan) }}</span></div>
              <span
                class="outcome-delta"
                :class="outcomeClass(newSalesRate)"
              >{{ signedMoney(difference(newRevenue, newRevenuePlan)) }}</span>
            </div>
            <div class="new-mix">
              <span>Группы <strong>{{ shortMoney(f(30)) }}</strong> · {{ number(model.groups) }}</span><span>Индивидуальные <strong>{{ shortMoney(f(44)) }}</strong> · {{ number(model.other) }}</span>
            </div>
            <div
              class="driver-grid"
              aria-label="Факторы новых продаж"
            >
              <div><span>Продано</span><strong>{{ number(newCount) }}</strong><small>План {{ number(newCountPlan, 1) }} · {{ signed(difference(newCount, newCountPlan), 1) }}</small></div>
              <div><span>Средний чек</span><strong>{{ shortMoney(newAverage) }}</strong><small>План {{ shortMoney(newAveragePlan) }} · {{ signedMoney(difference(newAverage, newAveragePlan)) }}</small></div>
              <div><span>Конверсия</span><strong>{{ percent(newSalesConversion) }}</strong><small>План {{ percent(newSalesConversionPlan) }} · {{ percentagePoints(newSalesConversion, newSalesConversionPlan) }}</small></div>
            </div>
          </section>

          <section
            class="sales-card v3-card renewals-card"
            aria-labelledby="v3-renewals"
          >
            <div class="card-top">
              <h2 id="v3-renewals">
                Продления
              </h2><span
                class="status-chip"
                :class="outcomeClass(renewalRate)"
              >{{ outcomeLabel(renewalRate) }}</span>
            </div>
            <div class="renewals-outcome">
              <strong>{{ shortMoney(renewalRevenue) }}</strong><span>План {{ shortMoney(renewalPlan) }}</span><small :class="outcomeClass(renewalRate)">{{ signedMoney(difference(renewalRevenue, renewalPlan)) }}</small>
            </div>
            <div
              v-for="item in model.renewals"
              :key="item.label"
              class="renewal-section"
            >
              <h3>{{ item.label }}</h3>
              <div
                class="renewal-table renewal-head"
                aria-hidden="true"
              >
                <span>Показатель</span><span>План</span><span>Факт</span>
              </div>
              <div
                v-for="row in renewalRows(item)"
                :key="row.label"
                class="renewal-table"
              >
                <span>{{ row.label }}</span><span>{{ row.format(row.plan) }}</span><strong>{{ row.format(row.fact) }}</strong>
              </div>
            </div>
          </section>

          <section
            class="sales-card v3-card path-card"
            aria-labelledby="v3-path"
          >
            <div class="card-top">
              <h2 id="v3-path">
                Путь до покупки
              </h2><span class="card-kicker">Все форматы</span>
            </div>
            <div class="v3-path">
              <div
                v-for="stage in stages"
                :key="stage.label"
              >
                <span>{{ stage.label }}</span><strong>{{ number(stage.fact) }}</strong><small>{{ stage.plan === null ? 'Общий план —' : `План ${number(stage.plan, 1)}` }}</small>
              </div>
            </div>
            <div class="path-rates">
              <div><span>Лид → пришёл</span><strong>{{ percent(model.leadTrialRate) }}</strong><small>Цель {{ percent(p(50)) }}</small></div><div><span>Записался → пришёл</span><strong>{{ percent(model.attendanceRate) }}</strong><small>План {{ percent(p(47)) }}</small></div>
            </div>
          </section>

          <section
            class="sales-card v3-card topups-card"
            aria-labelledby="v3-topups"
          >
            <div class="card-top">
              <h2 id="v3-topups">
                Доплаты
              </h2><span class="pill">{{ percent(ratio(f(22), p(22))) }}</span>
            </div>
            <div class="bottom-kpi">
              {{ shortMoney(f(22)) }}
            </div>
            <div class="bar-track">
              <i :style="{ width: fill(f(22), p(22)) }" />
            </div>
            <p class="card-footnote">
              План {{ shortMoney(p(22)) }}
            </p>
          </section>

          <section
            class="sales-card v3-card movement-card"
            aria-labelledby="v3-movement"
          >
            <div class="card-top">
              <h2 id="v3-movement">
                Движение базы
              </h2><span class="card-kicker">Группы</span>
            </div>
            <div class="movement-equation">
              <span><strong>+{{ number(model.groups) }}</strong> новые</span><i>−</i><span><strong>{{ number(model.lostGroups) }}</strong> не продлились</span><i>=</i><span><strong>{{ signed(model.replacement) }}</strong> баланс</span>
            </div>
          </section>

          <section
            class="sales-card v3-card bchk-card"
            aria-labelledby="v3-bchk"
          >
            <div class="card-top">
              <h2 id="v3-bchk">
                Возвращение БЧК
              </h2><span class="pill">{{ percent(ratio(f(27), p(27))) }}</span>
            </div>
            <div class="bottom-kpi">
              {{ shortMoney(f(27)) }}
            </div>
            <div class="bchk-facts">
              <span><strong>{{ number(f(25)) }}</strong> абонемент · план {{ number(p(25), 1) }}</span><span>Чек <strong>{{ shortMoney(ratio(f(27), f(25))) }}</strong> · план {{ shortMoney(p(26)) }}</span>
            </div>
          </section>
        </div>

        <footer class="sales-footer">
          <span>{{ salesSource.workbook }} · {{ record.sheet }} · итог {{ record.endDate.split('-').reverse().join('.') }}</span><span>v3 preview · валюта {{ record.currency }} · «—» = нет данных</span>
        </footer>
      </template>
    </div>
  </main>
</template>

<style src="../styles/sales-bento.css"></style>

<style src="../styles/sales-v3.css"></style>
