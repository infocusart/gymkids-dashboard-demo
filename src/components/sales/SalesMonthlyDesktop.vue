<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SalesCardDetails from './SalesCardDetails.vue'
import SalesPlanFact from './SalesPlanFact.vue'
import SalesSourceDetails from './SalesSourceDetails.vue'
import SalesLeadsCard from './SalesLeadsCard.vue'
import { type SalesRecord, displayMetric, metric, moneyRows, rateRows, ratio } from '@/lib/planerkiSales'
import { monthlySales } from '@/lib/salesMonthly'
import { type SalesCardKey, salesFocusPlacement } from '@/lib/salesDesktop'
import { useSalesDesktopFocus } from '@/composables/useSalesDesktopFocus'
import type { SalesSourceRow } from '@/lib/salesSourceDetails'

const props = defineProps<{ record: SalesRecord }>()
const model = computed(() => monthlySales(props.record))
const desktop = ref(true)
const { grid, focusedCard, busy, toggleCard, resetFocus } = useSalesDesktopFocus(desktop)
const selectedSource = ref<SalesSourceRow | null>(null)

watch(() => props.record, () => {
  selectedSource.value = null
  resetFocus()
})
function closeSource() {
  const row = selectedSource.value

  selectedSource.value = null
  nextTick(() => grid.value?.querySelector<HTMLButtonElement>(`[data-source-row="${row}"]`)?.focus({ preventScroll: true }))
}
async function openSource(row: number) {
  if (selectedSource.value === row) {
    closeSource()

    return
  }
  resetFocus()
  selectedSource.value = row as SalesSourceRow
  await nextTick()

  const panel = grid.value?.querySelector<HTMLElement>('#sales-source-details')

  panel?.focus({ preventScroll: true })
  panel?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
function openCard(key: SalesCardKey) {
  selectedSource.value = null
  toggleCard(key)
}
function escapeSource(event: KeyboardEvent) {
  if (event.key === 'Escape' && !event.defaultPrevented && selectedSource.value !== null) {
    event.preventDefault()
    closeSource()
  }
}
onMounted(() => window.addEventListener('keydown', escapeSource))
onBeforeUnmount(() => window.removeEventListener('keydown', escapeSource))

const f = (row: number) => displayMetric(props.record, row)
const p = (row: number) => metric(props.record, row, 'plan')
const number = (value: number | null, digits = 0) => value === null ? '—' : new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits }).format(value)
const currency = computed(() => ({ RUB: '₽', AZN: '₼', UZS: 'сум', AMD: '֏' }[props.record.currency] ?? props.record.currency))
const money = (value: number | null) => value === null ? '—' : `${number(value)} ${currency.value}`
const shortMoney = (value: number | null) => value === null ? '—' : Math.abs(value) >= 1e6 ? `${number(value / 1e6, 2)} млн ${currency.value}` : money(value)
const percent = (value: number | null) => value === null ? '—' : `${number(value * 100, 1)}%`
const signedMoney = (value: number | null) => value === null ? '—' : `${value >= 0 ? '+' : '−'}${shortMoney(Math.abs(value))}`
const signed = (value: number | null) => value === null ? '—' : `${value > 0 ? '+' : ''}${number(value, 1)}`
const fill = (value: number | null, base: number | null) => `${Math.min(100, Math.max(0, (ratio(value, base) ?? 0) * 100))}%`
const format = (row: number, value: number | null) => moneyRows.has(row) ? money(value) : rateRows.has(row) ? percent(value) : row === 73 ? `${number(value, 1)}${value === null ? '' : '%'}` : number(value, 1)
const placement = (key: SalesCardKey) => salesFocusPlacement(key, focusedCard.value)
const classes = (key: SalesCardKey) => ({ 'is-focused': focusedCard.value === key, 'is-neighbor': focusedCard.value !== null && focusedCard.value !== key })
const pp = (fact: number | null, plan: number | null) => fact === null || plan === null ? '—' : `${signed((fact - plan) * 100)} п. п.`
const parameter = (label: string, row: number, formatter = number, fact = f(row)) => ({ label, plan: formatter(p(row)), fact: formatter(fact) })
const terms = ['1 месяц', '3 месяца', '6 месяцев', '12 месяцев']
const serviceLabels = ['Бар, кафе и свободное посещение', 'Мастер-классы и лагерь', 'Дни рождения', 'Джимтест, Флайфест и соревнования']

const stages = computed(() => [
  { label: 'Лиды', plan: p(53), fact: f(58) },
  { label: 'Записались', plan: p(48), fact: f(48) },
  { label: 'Пришли', plan: p(46), fact: f(46) },
  { label: 'Купили · все форматы', plan: null, fact: model.value.allNew },
])
</script>

<template>
  <div class="monthly-dashboard">
    <div
      ref="grid"
      class="sales-grid monthly-grid"
      :class="{ 'has-focus': focusedCard, 'is-reflowing': busy, 'has-source-detail': selectedSource !== null }"
      :aria-busy="busy"
    >
      <section
        class="sales-card revenue-card"
        data-sales-card="revenue"
        :class="classes('revenue')"
        :style="placement('revenue')"
        aria-labelledby="monthly-revenue"
      >
        <div class="card-top">
          <h2 id="monthly-revenue">
            План месяца
          </h2><span
            class="pill"
            :class="{ caution: (ratio(model.net, p(5)) ?? 0) < 1 }"
          >{{ percent(ratio(model.net, p(5))) }}</span>
        </div>
        <span class="monthly-eyebrow">Выручка после возвратов · факт</span>
        <div class="hero-value">
          {{ shortMoney(model.net) }}
        </div>
        <div class="revenue-caption">
          <span>План <strong>{{ money(p(5)) }}</strong></span><span :class="model.net !== null && p(5) !== null && model.net < p(5)! ? 'coral-text' : 'mint-text'">{{ signedMoney(model.net === null || p(5) === null ? null : model.net - p(5)!) }} к плану</span>
        </div>
        <div
          class="revenue-track"
          role="img"
          :aria-label="`Выполнение плана: ${percent(ratio(model.net, p(5)))}, шкала от 0 до 100%`"
        >
          <i :style="{ width: fill(model.net, p(5)) }" />
        </div>
        <div class="monthly-revenue-summary">
          <div><span>Осталось до плана</span><strong>{{ shortMoney(model.remaining) }}</strong></div><div><span>{{ model.days === model.monthDays ? 'Итог месяца' : 'Прогноз при текущем темпе' }}</span><strong>{{ shortMoney(model.forecast) }}</strong></div>
        </div>
        <SalesCardDetails
          card="revenue"
          :record="record"
          :expanded="focusedCard === 'revenue'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>

      <section
        class="sales-card decomposition-card"
        data-sales-card="decomposition"
        :class="classes('decomposition')"
        :style="placement('decomposition')"
        aria-labelledby="monthly-decomposition"
      >
        <div class="card-top">
          <h2 id="monthly-decomposition">
            Из чего собираем план
          </h2>
        </div>
        <table class="monthly-decomposition">
          <caption class="sales-sr-only">
            Декомпозиция выручки месяца по источникам
          </caption><thead>
            <tr>
              <th scope="col">
                Источник
              </th><th scope="col">
                План
              </th><th scope="col">
                Факт
              </th><th scope="col">
                Выполнение
              </th>
            </tr>
          </thead><tbody>
            <tr
              v-for="source in model.sources"
              :key="source.row"
            >
              <th scope="row">
                <button
                  :data-source-row="source.row"
                  :disabled="busy"
                  :aria-expanded="selectedSource === source.row"
                  aria-controls="sales-source-details"
                  @click="openSource(source.row)"
                >
                  {{ source.label }} <span aria-hidden="true">{{ selectedSource === source.row ? '−' : '+' }}</span>
                </button>
              </th><td>{{ shortMoney(source.plan) }}</td><td>{{ shortMoney(source.fact) }}</td><td>{{ percent(ratio(source.fact, source.plan)) }}</td>
            </tr>
          </tbody>
        </table>
        <SalesCardDetails
          card="decomposition"
          :record="record"
          :expanded="focusedCard === 'decomposition'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>

      <SalesSourceDetails
        v-if="selectedSource !== null"
        :record="record"
        :row="selectedSource"
        @close="closeSource"
      />

      <SalesLeadsCard
        :record="record"
        :class="classes('leads')"
        :style="placement('leads')"
      />

      <section
        class="sales-card refunds-card"
        data-sales-card="refunds"
        :class="classes('refunds')"
        :style="placement('refunds')"
        aria-labelledby="monthly-refunds"
      >
        <div class="card-top">
          <h2 id="monthly-refunds">
            Возвраты и рассрочки
          </h2>
        </div>
        <SalesPlanFact
          caption="Возвраты и способ оплаты"
          :rows="[parameter('Возвраты', 4, shortMoney), { label: 'Доля к выручке после возвратов', plan: percent(ratio(p(4), p(5))), fact: percent(ratio(f(4), model.net)) }, parameter('Рассрочки Т-Банк', 70), parameter('Средний чек рассрочки', 71, shortMoney)]"
        />
        <p class="card-footnote">
          Рассрочки — способ оплаты; не добавляются к выручке.
        </p>
        <SalesCardDetails
          card="refunds"
          :record="record"
          :expanded="focusedCard === 'refunds'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>

      <section
        class="sales-card balance-card"
        data-sales-card="balance"
        :class="classes('balance')"
        :style="placement('balance')"
        aria-labelledby="monthly-balance"
        :data-balance-tone="model.replacement === null ? 'neutral' : model.replacement < 0 ? 'negative' : 'positive'"
      >
        <div class="card-top">
          <h2 id="monthly-balance">
            Замещение потерь
          </h2><span class="card-kicker">Группы</span>
        </div>
        <div class="balance-head">
          <strong>{{ signed(model.replacement) }}</strong><span>новые группы минус непродления групп</span>
        </div>
        <div class="monthly-balance-row">
          <span>Новые группы</span><strong>{{ number(model.groups) }}</strong>
        </div><div class="monthly-balance-row">
          <span>Не продлились · группы</span><strong>{{ number(model.lostGroups) }}</strong>
        </div>
        <p class="card-footnote">
          БЧК: {{ number(f(25)) }} абонементов по всем форматам, показаны отдельно. Это замещение абонементов; общий прирост клиентов по этим данным не определяется.
        </p>
        <SalesCardDetails
          card="balance"
          :record="record"
          :expanded="focusedCard === 'balance'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>

      <section
        class="sales-card new-card"
        data-sales-card="new"
        :class="classes('new')"
        :style="placement('new')"
        aria-labelledby="monthly-new"
      >
        <div class="card-top">
          <h2 id="monthly-new">
            Новые продажи
          </h2><span class="card-kicker">Группы</span>
        </div>
        <div class="monthly-source-value">
          <strong>{{ shortMoney(f(30)) }}</strong><span>{{ percent(ratio(f(30), p(30))) }} к плану</span>
        </div>
        <div class="monthly-money-plan">
          План {{ shortMoney(p(30)) }} · осталось {{ shortMoney(f(30) === null || p(30) === null ? null : Math.max(0, p(30)! - f(30)!)) }}
        </div>
        <div
          class="bar-track"
          role="img"
          :aria-label="`Выполнение плана новых групп: ${percent(ratio(f(30), p(30)))}, шкала 0–100%`"
        >
          <i :style="{ width: fill(f(30), p(30)) }" />
        </div>
        <SalesPlanFact
          caption="Параметры новых групповых продаж"
          :rows="[parameter('Новые группы · абонементы', 32, number, model.groups), parameter('Средний чек групп', 31, shortMoney, model.groupAverage)]"
        />
        <div class="monthly-conversion">
          <div><span>Конверсия в покупку · все форматы</span><strong>{{ percent(model.purchaseRate) }}</strong></div><p>{{ number(f(46)) }} посещённых пробных → {{ number(model.allNew) }} новых абонементов · все форматы</p><span class="monthly-conversion-note">Соотношение за месяц. Общая цель по всем форматам в книге не задана.</span>
        </div>
        <div class="monthly-terms">
          <div
            v-for="(label, index) in terms"
            :key="label"
          >
            <strong>{{ number(f(33 + index)) }}</strong><span>{{ label }}</span>
          </div>
        </div>
        <SalesCardDetails
          card="new"
          :record="record"
          :expanded="focusedCard === 'new'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>

      <section
        class="sales-card renewals-card"
        data-sales-card="renewals"
        :class="classes('renewals')"
        :style="placement('renewals')"
        aria-labelledby="monthly-renewals"
      >
        <div class="card-top">
          <h2 id="monthly-renewals">
            Продления
          </h2><span class="card-kicker">Удержание</span>
        </div>
        <div
          v-for="item in model.renewals"
          :key="item.label"
          class="monthly-renewal"
        >
          <h3>{{ item.label }}</h3>
          <div class="monthly-source-value">
            <strong>{{ shortMoney(f(item.amountRow)) }}</strong><span>{{ percent(ratio(f(item.amountRow), p(item.amountRow))) }} к плану</span>
          </div>
          <div class="monthly-money-plan">
            План {{ shortMoney(p(item.amountRow)) }}
          </div>
          <div class="monthly-renewal-rate">
            <span>Конверсия в продление</span><strong>{{ percent(item.rate) }}</strong>
          </div>
          <div class="monthly-rate-target">
            План {{ percent(item.planRate) }} · {{ pp(item.rate, item.planRate) }}
          </div>
          <SalesPlanFact
            :caption="`Параметры продлений: ${item.label}`"
            :rows="[parameter('К продлению', item.eligibleRow), parameter('Продлились', item.countRow), parameter('Средний чек', item.averageRow, shortMoney, item.average)]"
          />
        </div>
        <SalesCardDetails
          card="renewals"
          :record="record"
          :expanded="focusedCard === 'renewals'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>

      <section
        class="sales-card bchk-card"
        data-sales-card="bchk"
        :class="classes('bchk')"
        :style="placement('bchk')"
        aria-labelledby="monthly-bchk"
      >
        <div class="card-top">
          <h2 id="monthly-bchk">
            Возвращение БЧК
          </h2>
        </div>
        <span class="monthly-eyebrow">Все форматы</span>
        <div class="monthly-source-value">
          <strong>{{ shortMoney(f(27)) }}</strong><span>{{ percent(ratio(f(27), p(27))) }} к плану</span>
        </div>
        <div class="monthly-money-plan">
          План {{ shortMoney(p(27)) }}
        </div>
        <SalesPlanFact
          caption="Параметры возвращения БЧК"
          :rows="[parameter('Абонементы', 25), parameter('Средний чек', 26, shortMoney, ratio(f(27), f(25)))]"
        />
        <SalesCardDetails
          card="bchk"
          :record="record"
          :expanded="focusedCard === 'bchk'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>

      <section
        class="sales-card extra-card"
        data-sales-card="extra"
        :class="classes('extra')"
        :style="placement('extra')"
        aria-labelledby="monthly-extra"
      >
        <div class="card-top">
          <h2 id="monthly-extra">
            Новые · другие форматы
          </h2>
        </div>
        <div class="monthly-source-value">
          <strong>{{ shortMoney(f(44)) }}</strong><span>План {{ shortMoney(p(44)) }}</span>
        </div>
        <SalesPlanFact
          caption="Новые индивидуальные, сплит и мини-группы"
          :rows="[...['Индивидуальные', 'Сплит', 'Мини-группы'].map((label, index) => parameter(label, 39 + index)), { label: 'Средний чек · вместе', plan: shortMoney(ratio(p(44), p(42))), fact: shortMoney(model.otherAverage) }]"
        />
        <SalesCardDetails
          card="extra"
          :record="record"
          :expanded="focusedCard === 'extra'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>

      <section
        class="sales-card funnel-card"
        data-sales-card="funnel"
        :class="classes('funnel')"
        :style="placement('funnel')"
        aria-labelledby="monthly-funnel"
      >
        <div class="card-top">
          <h2 id="monthly-funnel">
            Объём для новых продаж
          </h2><span class="card-kicker">Все форматы</span>
        </div>
        <div class="monthly-funnel">
          <div
            v-for="stage in stages"
            :key="stage.label"
          >
            <span>{{ stage.label }}</span><strong>{{ number(stage.fact) }}</strong><span>{{ stage.plan === null ? 'Общий план —' : `План ${number(stage.plan, 1)}` }}</span>
          </div>
        </div>
        <div class="monthly-funnel-rates">
          <div><span>Лид → пришёл на пробное</span><strong>{{ percent(model.leadTrialRate) }}</strong><span>Цель книги {{ percent(p(50)) }}</span></div><div><span>Доходимость до пробного</span><strong>{{ percent(model.attendanceRate) }}</strong><span>План {{ percent(p(47)) }}</span></div>
        </div>
        <div class="monthly-funnel-plans">
          <span>Необходимо лидов по расчёту <strong>{{ number(p(53), 1) }}</strong></span><span>План по каналам <strong>{{ number(p(58)) }}</strong></span>
        </div>
        <p class="card-footnote">
          Месячные объёмы и коэффициенты. План покупки в книге рассчитан для групп: {{ number(p(32), 1) }} абонементов. Детали каналов — в дашборде привлечения.
        </p>
        <SalesCardDetails
          card="funnel"
          :record="record"
          :expanded="focusedCard === 'funnel'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>

      <section
        class="sales-card topups-card"
        data-sales-card="topups"
        :class="classes('topups')"
        :style="placement('topups')"
        aria-labelledby="monthly-topups"
      >
        <div class="card-top">
          <h2 id="monthly-topups">
            Доплаты
          </h2>
        </div>
        <div class="monthly-source-value">
          <strong>{{ shortMoney(f(22)) }}</strong><span>{{ percent(ratio(f(22), p(22))) }} к плану</span>
        </div>
        <div class="monthly-money-plan">
          План {{ shortMoney(p(22)) }}
        </div>
        <div
          class="bar-track"
          role="img"
          :aria-label="`Выполнение плана доплат: ${percent(ratio(f(22), p(22)))}, шкала 0–100%`"
        >
          <i :style="{ width: fill(f(22), p(22)) }" />
        </div>
        <p class="card-footnote">
          Отдельный источник выручки. Количество новых абонементов не увеличивает.
        </p>
        <SalesCardDetails
          card="topups"
          :record="record"
          :expanded="focusedCard === 'topups'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>

      <section
        class="sales-card services-card"
        data-sales-card="services"
        :class="classes('services')"
        :style="placement('services')"
        aria-labelledby="monthly-services"
      >
        <div class="card-top">
          <h2 id="monthly-services">
            Услуги и события
          </h2>
        </div>
        <div class="monthly-source-value">
          <strong>{{ shortMoney(f(66)) }}</strong><span>План {{ shortMoney(model.sources.find(item => item.row === 66)!.plan) }}</span>
        </div>
        <SalesPlanFact
          caption="План и факт дополнительных услуг"
          :rows="serviceLabels.map((label, index) => parameter(label, 62 + index, shortMoney))"
        />
        <p
          v-if="f(66) === null"
          class="card-footnote"
        >
          Данные по услугам не заполнены.
        </p>
        <SalesCardDetails
          card="services"
          :record="record"
          :expanded="focusedCard === 'services'"
          :busy="busy"
          :format="format"
          @toggle="openCard"
        />
      </section>
    </div>
  </div>
</template>

<style src="../../styles/sales-monthly-desktop.css"></style>
