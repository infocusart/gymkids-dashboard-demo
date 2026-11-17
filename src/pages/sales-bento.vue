<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { stripParenthesizedNotes } from '@/lib/reportText'
import SalesDesktopHeader from '@/components/sales/SalesDesktopHeader.vue'
import SalesCardDetails from '@/components/sales/SalesCardDetails.vue'
import SalesMonthlyDesktop from '@/components/sales/SalesMonthlyDesktop.vue'
import { useSalesDesktopFocus } from '@/composables/useSalesDesktopFocus'
import { type SalesCardKey, salesFocusPlacement, salesRevenueTone } from '@/lib/salesDesktop'
import GymkidsSoftAurora from '@/components/GymkidsSoftAurora.vue'
import logo from '@images/gymkids/white-logo.png'
import { baseBalance, completeSum, displayMetric, metric, moneyRows, rateRows, ratio, salesRecords, salesSource, termDifference } from '@/lib/planerkiSales'

definePage({ meta: { layout: 'blank', public: true } })

const route = useRoute()
const router = useRouter()
const originalTitle = document.title

onMounted(() => {
  document.title = 'GYMKiDs — Продажи и клиентская база'
})
onBeforeUnmount(() => {
  document.title = originalTitle
})

const centers = [...new Map(salesRecords.map(record => [record.centerId, { id: record.centerId, name: record.centerName }])).values()]
const periods = [...new Set(salesRecords.map(record => record.period))].sort().reverse()
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
const f = (row: number) => displayMetric(record.value, row)
const p = (row: number) => metric(record.value, row, 'plan')
const number = (value: number | null, digits = 0) => value === null ? '—' : new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits }).format(value)
const currency = computed(() => ({ RUB: '₽', AZN: '₼', UZS: 'сум', AMD: '֏' }[record.value?.currency ?? 'RUB'] ?? record.value?.currency ?? ''))
const money = (value: number | null) => value === null ? '—' : `${number(value)} ${currency.value}`
const shortMoney = (value: number | null) => value === null ? '—' : Math.abs(value) >= 1e6 ? `${number(value / 1e6, 2)} млн ${currency.value}` : money(value)
const percentage = (value: number | null) => value === null ? '—' : `${number(value * 100, 1)}%`
const signed = (value: number | null) => value === null ? '—' : `${value > 0 ? '+' : ''}${number(value)}`
const periodLabel = (value: string, short = false) => new Intl.DateTimeFormat('ru-RU', { month: short ? 'short' : 'long', ...(short ? {} : { year: 'numeric' }), timeZone: 'UTC' }).format(new Date(`${value}-01T12:00:00Z`))
const fill = (value: number | null, base: number | null) => `${Math.min(100, Math.max(0, (ratio(value, base) ?? 0) * 100))}%`
const cleanLabel = stripParenthesizedNotes
const revenue = computed(() => f(3) === null ? null : f(5))
const revenueRate = computed(() => ratio(revenue.value, p(5)))
const revenueDelta = computed(() => revenue.value === null || p(5) === null ? null : revenue.value - p(5)!)
const balance = computed(() => baseBalance(record.value))

const balanceRows = computed(() => [
  { label: 'Новые', value: f(32), negative: false },
  { label: 'Вернулись БЧК', value: f(25), negative: false },
  { label: 'Не продлились', value: f(68), negative: true },
])

const balanceScale = computed(() => Math.max(1, ...balanceRows.value.map(row => Math.abs(row.value ?? 0))))
const termRows = computed(() => [33, 34, 35, 36].map((row, index) => ({ row, label: ['1 месяц', '3 месяца', '6 месяцев', '12 месяцев'][index], value: f(row) })))
const termScale = computed(() => Math.max(1, ...termRows.value.map(row => row.value ?? 0)))
const termGap = computed(() => termDifference(record.value))

const renewals = computed(() => [
  { label: 'Группы', eligible: f(8), renewed: f(10), plan: p(10), amount: f(12), rate: ratio(f(10), f(8)), average: f(11) },
  { label: 'Индивидуальные', eligible: f(15), renewed: f(17), plan: p(17), amount: f(19), rate: ratio(f(17), f(15)), average: f(18) },
])

const trend = computed(() => salesRecords.filter(item => item.centerId === center.value && item.period <= period.value).sort((a, b) => a.period.localeCompare(b.period)).map(item => ({ period: item.period, value: metric(item, 3) === null ? null : metric(item, 5) })))
const trendScale = computed(() => Math.max(1, ...trend.value.map(item => item.value ?? 0)))
const services = computed(() => [62, 63, 64, 65].map(row => ({ row, label: cleanLabel(record.value?.metrics[String(row)]?.label ?? ''), value: f(row) })))
const serviceScale = computed(() => Math.max(1, ...services.value.map(item => item.value ?? 0)))
const detailRows = computed(() => Object.entries(record.value?.metrics ?? {}).map(([row, item]) => ({ row: Number(row), ...item })))
const formatMetric = (row: number, value: number | null) => moneyRows.has(row) ? money(value) : rateRows.has(row) ? percentage(value) : row === 73 ? (value === null ? '—' : `${number(value, 1)}%`) : number(value, 1)
const incomplete = computed(() => [3, 5, 8, 10, 25, 30, 32, 68].some(row => f(row) === null))
const refundRate = computed(() => ratio(f(4), revenue.value))
const sourceDays = computed(() => f(72))
const daysInMonth = computed(() => new Date(Number(period.value.slice(0, 4)), Number(period.value.slice(5, 7)), 0).getDate())
const negativeTrend = computed(() => trend.value.some(item => item.value !== null && item.value < 0))
const isDesktop = useMediaQuery('(min-width: 1024px)')
const { grid, focusedCard, busy, toggleCard, resetFocus } = useSalesDesktopFocus(isDesktop)
const revenueTone = computed(() => salesRevenueTone(revenueRate.value))
const balanceTone = computed(() => balance.value === null || balance.value === 0 ? 'neutral' : balance.value > 0 ? 'positive' : 'negative')
const cardClass = (key: SalesCardKey) => ({ 'is-focused': isDesktop.value && focusedCard.value === key, 'is-neighbor': isDesktop.value && focusedCard.value !== null && focusedCard.value !== key })
const serviceLabel = (row: number) => ({ 62: 'Бар, кафе и свободное посещение', 63: 'Мастер-классы и лагерь', 64: 'Дни рождения', 65: 'Джимтест, Флайфест и соревнования' }[row] ?? '')
const cardStyle = (key: SalesCardKey) => isDesktop.value ? salesFocusPlacement(key, focusedCard.value) : undefined

watch([center, period], resetFocus)
</script>

<template>
  <main
    class="sales-canvas"
    aria-label="Продажи и клиентская база GYMKiDs"
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
        <nav
          aria-label="Дашборды"
          class="sales-nav"
        >
          <RouterLink :to="{ path: '/bento-preview-focus', query: { center, period } }">
            Привлечение
          </RouterLink>
          <span aria-current="page">Продажи и база</span>
        </nav>
        <span class="source-tag">Планёрки · итоги месяца</span>
      </header>

      <section
        v-if="!isDesktop"
        class="sales-heading"
        aria-label="Параметры отчёта"
      >
        <div><span class="eyebrow">Результаты клуба</span><h1>Продажи и клиентская база</h1></div>
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
        v-if="!record"
        class="sales-empty"
        role="status"
      >
        <h2>Итог этого месяца недоступен</h2><p>В книге нет однозначной колонки месячных итогов для выбранного центра. Выберите другой месяц.</p>
      </div>
      <template v-else>
        <p
          v-if="incomplete || (sourceDays !== null && sourceDays !== daysInMonth)"
          class="data-note"
          role="status"
        >
          В месячном итоге есть пропуски{{ sourceDays !== null && sourceDays !== daysInMonth ? ` или указано ${number(sourceDays)} из ${daysInMonth} дней` : '' }}. Пустые значения обозначены «—».
        </p>

        <SalesMonthlyDesktop
          v-if="isDesktop"
          :record="record"
        />
        <div
          v-else
          ref="grid"
          class="sales-grid"
          :class="{ 'has-focus': isDesktop && focusedCard, 'is-reflowing': busy }"
          :aria-busy="busy"
        >
          <section
            class="sales-card revenue-card"
            data-sales-card="revenue"
            :class="cardClass('revenue')"
            :style="cardStyle('revenue')"
            aria-labelledby="revenue-title"
          >
            <div class="card-top">
              <h2 id="revenue-title">
                Выручка после возвратов
              </h2><span
                class="pill"
                :class="{ caution: revenueRate !== null && revenueRate < 1 }"
              >{{ percentage(revenueRate) }} к плану</span>
            </div>
            <div class="hero-value">
              {{ revenue !== null && Math.abs(revenue) >= 1e8 ? shortMoney(revenue) : money(revenue) }}
            </div>
            <div class="revenue-caption">
              <span>План <strong>{{ money(p(5)) }}</strong></span><span :class="revenueDelta !== null && revenueDelta < 0 ? 'coral-text' : 'mint-text'">{{ revenueDelta === null ? '—' : `${revenueDelta >= 0 ? '+' : '−'}${shortMoney(Math.abs(revenueDelta))}` }} к плану</span>
            </div>
            <div
              class="revenue-track"
              role="img"
              :aria-label="`Выполнение плана выручки: ${percentage(revenueRate)}`"
            >
              <i :style="{ width: fill(revenue, p(5)) }" />
            </div>
            <div class="revenue-bottom">
              <div class="revenue-totals">
                <div><span>До возвратов</span><strong>{{ shortMoney(f(3)) }}</strong></div><div><span>Возвраты</span><strong>{{ shortMoney(f(4)) }}</strong></div>
              </div>
              <div class="trend-wrap">
                <div class="trend-caption">
                  <span>По месяцам · после возвратов</span><span>{{ isDesktop ? 'Макс. ' : '' }}{{ shortMoney(trendScale) }}</span>
                </div>
                <div
                  v-if="!negativeTrend"
                  class="revenue-trend"
                  role="img"
                  aria-label="Выручка по месяцам, шкала от нуля. Точные суммы доступны в раскрываемом списке под графиком."
                >
                  <div
                    v-for="item in trend"
                    :key="item.period"
                    class="trend-column"
                    :class="{ selected: item.period === period }"
                    :title="`${periodLabel(item.period)}: ${money(item.value)}`"
                  >
                    <span class="trend-bar-space"><i
                      v-if="item.value !== null"
                      :style="{ height: fill(item.value, trendScale) }"
                    /><span v-else>—</span></span><span>{{ periodLabel(item.period, true) }}</span>
                  </div>
                </div>
                <div
                  v-else
                  class="negative-trend"
                >
                  <span
                    v-for="item in trend"
                    :key="item.period"
                  >{{ periodLabel(item.period, true) }} · {{ shortMoney(item.value) }}</span>
                </div>
                <details class="trend-history">
                  <summary>Суммы по месяцам</summary><dl>
                    <div
                      v-for="item in trend"
                      :key="item.period"
                    >
                      <dt>{{ periodLabel(item.period) }}</dt><dd>{{ money(item.value) }}</dd>
                    </div>
                  </dl>
                </details>
              </div>
            </div>
            <SalesCardDetails
              v-if="isDesktop"
              card="revenue"
              :record="record"
              :expanded="focusedCard === 'revenue'"
              :busy="busy"
              :format="formatMetric"
              @toggle="toggleCard"
            />
          </section>

          <section
            class="sales-card balance-card"
            data-sales-card="balance"
            :class="cardClass('balance')"
            :style="cardStyle('balance')"
            aria-labelledby="balance-title"
            :data-balance-tone="isDesktop ? balanceTone : undefined"
          >
            <div class="card-top">
              <h2 id="balance-title">
                Баланс базы
              </h2><span class="card-kicker">Групповые абонементы</span>
            </div>
            <div class="balance-head">
              <strong :class="balance !== null && balance < 0 ? 'loss' : 'gain'">{{ signed(balance) }}</strong><span>{{ balance === null ? 'Недостаточно данных' : balance > 0 ? 'Приток превышает потери' : balance < 0 ? 'Потери превышают приток' : 'Приток равен потерям' }}</span>
            </div>
            <div class="balance-chart">
              <div
                v-for="item in balanceRows"
                :key="item.label"
                class="balance-row"
              >
                <span>{{ item.label }}</span><div
                  class="balance-rail"
                  aria-hidden="true"
                >
                  <i
                    :class="item.negative ? 'outflow' : 'inflow'"
                    :style="{ width: `${Math.min(50, Math.abs(item.value ?? 0) / balanceScale * 50)}%` }"
                  />
                </div><strong>{{ item.value === null ? '—' : `${item.negative ? '−' : '+'}${number(item.value)}` }}</strong>
              </div>
              <div class="balance-axis">
                <span>Потери</span><span>0</span><span>Приток</span>
              </div>
            </div>
            <p class="card-footnote">
              Новые + вернувшиеся БЧК − непродлившие.<br>Баланс абонементов, не уникальных клиентов.
            </p>
            <SalesCardDetails
              v-if="isDesktop"
              card="balance"
              :record="record"
              :expanded="focusedCard === 'balance'"
              :busy="busy"
              :format="formatMetric"
              @toggle="toggleCard"
            />
          </section>

          <section
            class="sales-card new-card"
            data-sales-card="new"
            :class="cardClass('new')"
            :style="cardStyle('new')"
            aria-labelledby="new-title"
          >
            <div class="card-top">
              <h2 id="new-title">
                Новые продажи
              </h2><span class="card-kicker">Группы</span>
            </div>
            <div class="metric-pair">
              <strong>{{ number(f(32)) }}</strong><span>абонементов<br>план {{ number(p(32), 1) }}</span>
            </div>
            <div class="money-line">
              <strong>{{ shortMoney(f(30)) }}</strong><span>средний чек {{ money(f(31)) }}</span>
            </div>
            <div class="term-chart">
              <div
                v-for="item in termRows"
                :key="item.row"
                class="bar-row"
              >
                <span>{{ item.label }}</span><div class="bar-track">
                  <i :style="{ width: fill(item.value, termScale) }" />
                </div><strong>{{ number(item.value) }}</strong>
              </div>
            </div>
            <p
              v-if="termGap !== null && Math.abs(termGap) > 0.01"
              class="inline-note"
            >
              Разбивка по срокам: {{ number(completeSum(termRows.map(item => item.value))) }} из {{ number(f(32)) }}. Расхождение в таблице: {{ signed(termGap) }}.
            </p>
            <p
              v-else
              class="card-footnote"
            >
              Выручка только от новых групповых клиентов.
            </p>
            <SalesCardDetails
              v-if="isDesktop"
              card="new"
              :record="record"
              :expanded="focusedCard === 'new'"
              :busy="busy"
              :format="formatMetric"
              @toggle="toggleCard"
            />
          </section>

          <section
            class="sales-card renewals-card"
            data-sales-card="renewals"
            :class="cardClass('renewals')"
            :style="cardStyle('renewals')"
            aria-labelledby="renewals-title"
          >
            <div class="card-top">
              <h2 id="renewals-title">
                Продления
              </h2><span class="card-kicker">Удержание</span>
            </div>
            <div
              v-for="item in renewals"
              :key="item.label"
              class="renewal-group"
            >
              <div class="renewal-heading">
                <h3>{{ item.label }}</h3><strong>{{ percentage(item.rate) }}</strong>
              </div>
              <div class="renewal-count">
                <strong>{{ number(item.renewed) }}</strong><span>из {{ number(item.eligible) }} к продлению</span>
              </div>
              <div class="bar-track">
                <i :style="{ width: fill(item.renewed, item.eligible) }" />
              </div>
              <div class="renewal-meta">
                <strong>{{ shortMoney(item.amount) }}</strong><span>план {{ number(item.plan, 1) }} аб.</span>
              </div>
            </div>
            <SalesCardDetails
              v-if="isDesktop"
              card="renewals"
              :record="record"
              :expanded="focusedCard === 'renewals'"
              :busy="busy"
              :format="formatMetric"
              @toggle="toggleCard"
            />
          </section>

          <section
            class="sales-card bchk-card"
            data-sales-card="bchk"
            :class="cardClass('bchk')"
            :style="cardStyle('bchk')"
            aria-labelledby="bchk-title"
          >
            <div class="card-top">
              <h2 id="bchk-title">
                Возвращение БЧК
              </h2>
            </div>
            <div class="metric-pair">
              <strong>{{ number(f(25)) }}</strong><span>абонементов<br>план {{ number(p(25), 1) }}</span>
            </div>
            <div class="bchk-revenue">
              {{ shortMoney(f(27)) }}
            </div>
            <div class="bar-track">
              <i :style="{ width: fill(f(27), p(27)) }" />
            </div>
            <div class="renewal-meta">
              <span>План {{ shortMoney(p(27)) }}</span><strong>{{ percentage(ratio(f(27), p(27))) }}</strong>
            </div>
            <div class="bchk-average">
              <span>Средний чек</span><strong>{{ money(f(26)) }}</strong>
            </div>
            <p class="card-footnote">
              Бывшие члены клуба, вернувшиеся после окончания абонемента без своевременного продления.
            </p>
            <SalesCardDetails
              v-if="isDesktop"
              card="bchk"
              :record="record"
              :expanded="focusedCard === 'bchk'"
              :busy="busy"
              :format="formatMetric"
              @toggle="toggleCard"
            />
          </section>

          <section
            class="sales-card extra-card"
            data-sales-card="extra"
            :class="cardClass('extra')"
            :style="cardStyle('extra')"
            aria-labelledby="extra-title"
          >
            <div class="card-top">
              <h2 id="extra-title">
                Дополнительные продажи
              </h2><span class="card-kicker">Другие форматы</span>
            </div>
            <div class="extra-formats">
              <div
                v-for="(name, index) in ['Индивидуальные', 'Сплит', 'Мини-группы']"
                :key="name"
                role="group"
                :aria-label="`${name}: ${number(f(39 + index))} абонементов`"
              >
                <strong>{{ number(f(39 + index)) }}</strong><span>{{ index === 0 && !isDesktop ? 'Индив.' : name }}</span>
              </div>
            </div>
            <div class="extra-bottom">
              <span>Выручка новых ИНДИ / сплит / мини-групп</span><strong>{{ shortMoney(f(44)) }}</strong>
            </div>
            <div class="extra-bottom">
              <span>Доплаты</span><strong>{{ shortMoney(f(22)) }}</strong>
            </div>
            <SalesCardDetails
              v-if="isDesktop"
              card="extra"
              :record="record"
              :expanded="focusedCard === 'extra'"
              :busy="busy"
              :format="formatMetric"
              @toggle="toggleCard"
            />
          </section>

          <section
            class="sales-card services-card"
            data-sales-card="services"
            :class="cardClass('services')"
            :style="cardStyle('services')"
            aria-labelledby="services-title"
          >
            <div class="card-top">
              <h2 id="services-title">
                Услуги и события
              </h2><strong>{{ shortMoney(f(66)) }}</strong>
            </div>
            <div class="services-list">
              <div
                v-for="item in services"
                :key="item.row"
              >
                <div><span>{{ isDesktop ? serviceLabel(item.row) : item.label }}</span><strong>{{ shortMoney(item.value) }}</strong></div><div class="bar-track">
                  <i :style="{ width: fill(item.value, serviceScale) }" />
                </div>
              </div>
            </div>
            <p
              v-if="f(66) === null"
              class="card-footnote"
            >
              Выручка по услугам не заполнена.
            </p>
            <SalesCardDetails
              v-if="isDesktop"
              card="services"
              :record="record"
              :expanded="focusedCard === 'services'"
              :busy="busy"
              :format="formatMetric"
              @toggle="toggleCard"
            />
          </section>

          <section
            class="sales-card refunds-card"
            data-sales-card="refunds"
            :class="cardClass('refunds')"
            :style="cardStyle('refunds')"
            aria-labelledby="refunds-title"
          >
            <h2 id="refunds-title">
              Возвраты и рассрочки
            </h2>
            <div class="refund-metric">
              <strong>{{ percentage(refundRate) }}</strong><span>возвратов к выручке<br>после возвратов</span>
            </div>
            <div class="extra-bottom">
              <span>Сумма возвратов</span><strong>{{ shortMoney(f(4)) }}</strong>
            </div>
            <div class="extra-bottom">
              <span>Рассрочки Т-Банк</span><strong>{{ number(f(70)) }}</strong>
            </div>
            <div class="extra-bottom">
              <span>Средний чек рассрочки</span><strong>{{ money(f(71)) }}</strong>
            </div>
            <SalesCardDetails
              v-if="isDesktop"
              card="refunds"
              :record="record"
              :expanded="focusedCard === 'refunds'"
              :busy="busy"
              :format="formatMetric"
              @toggle="toggleCard"
            />
          </section>
        </div>

        <footer class="sales-footer">
          <span>{{ salesSource.workbook }} · {{ record.sheet }} · итог {{ record.endDate.split('-').reverse().join('.') }}</span><span>Валюта: {{ record.currency }} · «—» = нет данных</span>
        </footer>
        <details class="source-details">
          <summary>Показатели и источник данных <span>План / факт · {{ detailRows.length }} строк</span></summary>
          <p>Сохранённые значения книги. План: колонка {{ record.planColumn }}, итог: {{ record.factColumn }}. Недельные накопительные значения не складываются. «Новая Рига» соответствует центру «Лобаново»; Профсоюз 2 и Фестик паркур не объединены с другими центрами. Это месячный отчёт, конверсии здесь не являются когортными.</p>
          <p
            v-if="record.errors.length"
            class="inline-note"
          >
            Ошибки формул в источнике: {{ record.errors.map(item => `${item.cell} ${item.error}`).join(', ') }}. Их значения показаны как «—».
          </p>
          <div class="source-table-wrap">
            <table>
              <caption>{{ record.sourceCenter }} · {{ record.sheet }}</caption><thead>
                <tr>
                  <th scope="col">
                    Показатель
                  </th><th scope="col">
                    План
                  </th><th scope="col">
                    Итог
                  </th><th scope="col">
                    Ячейка итога
                  </th>
                </tr>
              </thead><tbody>
                <tr
                  v-for="item in detailRows"
                  :key="item.row"
                >
                  <th scope="row">
                    {{ item.row === 31 ? 'Средний чек НОВЫЕ группы' : cleanLabel(item.label) }}
                  </th><td>{{ formatMetric(item.row, item.plan) }}</td><td>{{ formatMetric(item.row, item.fact) }}</td><td>{{ record.factColumn }}{{ item.row }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </template>
    </div>
  </main>
</template>

<style src="../styles/sales-bento.css"></style>

<style src="../styles/sales-bento-desktop.css"></style>
