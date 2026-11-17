<script setup lang="ts">
import { ref } from 'vue'
import type { DeepReadonly } from 'vue'
import type { GymkidsPromoEconomics, PromoPerson } from '@/data/gymkidsPromoEconomics'

defineProps<{ economics: DeepReadonly<GymkidsPromoEconomics> | null }>()

const selectedPerson = ref<string | null>(null)

const metrics: { key: keyof Omit<PromoPerson, 'key' | 'name'>; label: string }[] = [
  { key: 'leads', label: 'Лиды' },
  { key: 'valid', label: 'Валидные' },
  { key: 'invalid', label: 'Невалидные' },
  { key: 'inWork', label: 'В работе' },
  { key: 'scheduled', label: 'Записаны на пробное' },
  { key: 'reached', label: 'Дошли до пробного' },
]
</script>

<template>
  <section
    class="promo-details"
    aria-label="Экономика промо и промоутеры"
  >
    <template v-if="economics">
      <header class="promo-details__heading">
        <h3>Экономика привлечения</h3>
        <span
          class="promo-details__demo"
          title="Условные имена, расходы и распределение. Не данные amoCRM."
        >Демо</span>
      </header>
      <div class="promo-details__spend">
        <span>Расход на промо</span><strong>{{ economics.spendLabel }}</strong>
      </div>
      <dl class="promo-details__costs">
        <div
          v-for="cost in economics.costs"
          :key="cost.key"
        >
          <dt>{{ cost.label }}<small>{{ cost.countLabel }}</small></dt><dd>{{ cost.valueLabel }}</dd>
        </div>
      </dl>

      <section
        class="promo-details__people"
        aria-labelledby="promo-people-title"
      >
        <header>
          <h3 id="promo-people-title">
            По промоутерам
          </h3><span>Лиды</span>
        </header>
        <div
          v-for="person in economics.people"
          :key="person.key"
          class="promo-person"
        >
          <button
            type="button"
            class="promo-person__toggle"
            :aria-expanded="selectedPerson === person.key"
            :aria-controls="`promo-person-${person.key}`"
            :aria-label="`Воронка промоутера ${person.name}. Лиды: ${person.leads}`"
            @click.stop="selectedPerson = selectedPerson === person.key ? null : person.key"
          >
            <span>{{ person.name }}</span>
            <i aria-hidden="true"><b :style="{ inlineSize: `${person.leads / economics.leads * 100}%` }" /></i>
            <strong>{{ person.leads }}</strong>
            <span
              class="promo-person__chevron"
              aria-hidden="true"
            >{{ selectedPerson === person.key ? '−' : '+' }}</span>
          </button>
          <dl
            v-if="selectedPerson === person.key"
            :id="`promo-person-${person.key}`"
            class="promo-person__metrics"
          >
            <div
              v-for="metric in metrics"
              :key="metric.key"
              :data-metric="metric.key"
            >
              <dt>{{ metric.label }}</dt><dd>{{ person[metric.key] }}</dd>
            </div>
          </dl>
        </div>
      </section>
    </template>
    <template v-else>
      <h3>Экономика привлечения</h3>
      <p class="promo-details__empty">
        Расходы и разбивка по промоутерам ещё не подключены.
      </p>
    </template>
  </section>
</template>

<style scoped>
.promo-details { position: relative; z-index: 9; min-block-size: 0; overflow: auto; margin-block-start: 18px; padding-block-start: 14px; border-block-start: 1px solid var(--line); color: var(--ink); scrollbar-width: thin; font-variant-numeric: tabular-nums; }
.promo-details h3 { margin: 0; color: var(--ink); font-size: 16px; font-weight: 700; letter-spacing: -.035em; line-height: 1.2; }
.promo-details__heading, .promo-details__people > header { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.promo-details__demo { color: var(--muted); font-size: 10px; }
.promo-details__spend { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-block: 12px 6px; }
.promo-details__spend > span { color: var(--muted); font-size: 12px; }
.promo-details__spend strong { font-size: 20px; font-weight: 650; letter-spacing: -.06em; line-height: 1.1; white-space: nowrap; }
.promo-details dl { margin: 0; }
.promo-details dd { margin: 0; font-weight: 650; }
.promo-details__costs > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-block: 5px; border-block-end: 1px solid var(--line); }
.promo-details__costs dt { font-size: 13px; line-height: 1.2; }
.promo-details__costs small { display: block; margin-block-start: 3px; color: var(--muted); font-size: 10px; line-height: 1.2; }
.promo-details__costs dd { font-size: 18px; letter-spacing: -.045em; line-height: 1.1; white-space: nowrap; }
.promo-details__costs > div:last-child { border: 0; }
.promo-details__people { margin-block-start: 12px; }
.promo-details__people > header { margin-block-end: 5px; }
.promo-details__people > header > span { color: var(--muted); font-size: 11px; padding-inline-end: 24px; }
.promo-person { border-block-end: 1px solid var(--line); }
.promo-person:last-child { border: 0; }
.promo-person__toggle { display: grid; grid-template-columns: minmax(72px, 1fr) minmax(40px, 1fr) 32px 16px; align-items: center; gap: 10px; width: 100%; min-block-size: 40px; padding: 6px 0; border: 0; background: transparent; color: var(--ink); text-align: start; font: inherit; font-size: 13px; cursor: pointer; }
.promo-person__toggle > strong { text-align: end; }
.promo-person__toggle i { height: 5px; border-radius: 4px; background: var(--line); overflow: hidden; }
.promo-person__toggle i b { display: block; height: 100%; background: var(--ink); border-radius: inherit; }
.promo-person__toggle:hover > span:first-child { text-decoration: underline; text-underline-offset: 3px; }
.promo-person__toggle:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; border-radius: 4px; }
.promo-person__chevron { color: var(--muted); text-align: end; }
.promo-details .promo-person__metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 12px; padding-block: 4px 10px; }
.promo-person__metrics dt { color: var(--muted); font-size: 10px; line-height: 1.2; min-block-size: 12px; }
.promo-person__metrics dd { font-size: 18px; line-height: 1.1; letter-spacing: -.035em; }
.promo-person__metrics [data-metric="valid"] dd, .promo-person__metrics [data-metric="reached"] dd { color: #24684e; }
.promo-details__empty { color: var(--muted); font-size: 12px; line-height: 1.4; }
.promo-details-fade-enter-active { transition: opacity 280ms ease 380ms; }
.promo-details-fade-leave-active { position: absolute; transition: opacity 160ms ease; }
.promo-details-fade-enter-from, .promo-details-fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .promo-details-fade-enter-active, .promo-details-fade-leave-active { transition: none; } }
</style>
