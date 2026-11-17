<script setup lang="ts">
import { trialOutcomesReport as report } from '@/data/trialOutcomes'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const router = useRouter()

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()

    return
  }

  router.push('/')
}
</script>

<template>
  <main class="trials-page">
    <div class="trials-shell">
      <header class="trials-header">
        <VBtn
          variant="text"
          color="secondary"
          prepend-icon="tabler-arrow-left"
          class="trials-back"
          @click="goBack"
        >
          Назад к дашборду
        </VBtn>

        <div class="trials-heading-grid">
          <div>
            <div class="trials-eyebrow">
              {{ report.meta.eyebrow }}
            </div>
            <h1>{{ report.meta.title }}</h1>
            <p class="trials-subtitle">
              {{ report.meta.subtitle }}
            </p>
          </div>

          <div class="trials-context">
            <div>
              <span>Период</span>
              <strong>{{ report.meta.period }}</strong>
            </div>
            <div>
              <span>Тип времени</span>
              <strong>{{ report.meta.timeBasis }}</strong>
            </div>
          </div>
        </div>
      </header>

      <section class="trials-kpi-grid">
        <VCard
          v-for="card in report.cards"
          :key="card.key"
          class="trials-kpi-card"
        >
          <VCardText>
            <div class="trials-kpi-topline">
              <span>{{ card.label }}</span>
              <VAvatar
                :color="card.tone"
                variant="tonal"
                size="42"
              >
                <VIcon :icon="card.icon" />
              </VAvatar>
            </div>
            <div class="trials-kpi-value">
              {{ card.value }}
            </div>
            <p>{{ card.helper }}</p>
          </VCardText>
        </VCard>
      </section>

      <section class="trials-main-grid">
        <VCard class="trials-rate-card">
          <VCardText>
            <div class="trials-section-heading">
              <div>
                <div class="trials-section-overline">
                  Итог записи
                </div>
                <h2>Что подтверждено после назначения</h2>
              </div>
              <VChip
                color="success"
                variant="tonal"
                label
              >
                Расчёт из фактов
              </VChip>
            </div>

            <div class="trials-rate-layout">
              <div class="trials-rate-ring">
                <div class="trials-rate-ring-inner">
                  <strong>78,4%</strong>
                  <span>185 из 236</span>
                </div>
              </div>

              <div class="trials-outcomes">
                <div
                  v-for="row in report.outcomeRows"
                  :key="row.label"
                  class="trials-outcome-row"
                >
                  <div class="trials-outcome-title">
                    <span
                      class="trials-outcome-dot"
                      :class="`is-${row.color}`"
                    />
                    <div>
                      <strong>{{ row.label }}</strong>
                      <p>{{ row.note }}</p>
                    </div>
                  </div>
                  <div class="trials-outcome-value">
                    <strong>{{ row.value }}</strong>
                    <span>{{ row.share }}</span>
                  </div>
                </div>

                <div
                  class="trials-progress"
                  aria-label="Распределение результата записи"
                >
                  <span class="trials-progress-confirmed" />
                  <span class="trials-progress-unconfirmed" />
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>

        <VCard class="trials-passport-card">
          <VCardText>
            <div class="trials-section-overline">
              Паспорт данных
            </div>
            <h2>Откуда взяты числа</h2>

            <dl class="trials-passport-list">
              <div>
                <dt>Источник</dt>
                <dd>{{ report.meta.source }}</dd>
              </div>
              <div>
                <dt>Пакет</dt>
                <dd>{{ report.meta.sourceRun }}</dd>
              </div>
              <div>
                <dt>Статус</dt>
                <dd>{{ report.meta.snapshotLabel }}</dd>
              </div>
              <div>
                <dt>Покрытие</dt>
                <dd>236 назначений одной февральской когорты</dd>
              </div>
            </dl>

            <VAlert
              color="info"
              variant="tonal"
              icon="tabler-database-check"
              border="start"
              rounded="lg"
            >
              Исторический пакет зафиксирован. Текущая свежесть CRM не меняет цифры выбранной февральской когорты.
            </VAlert>
          </VCardText>
        </VCard>
      </section>

      <section class="trials-detail-grid">
        <VCard>
          <VCardText>
            <div class="trials-section-overline">
              Определения
            </div>
            <h2>Как читать показатели</h2>

            <div class="trials-definition-list">
              <div
                v-for="(item, index) in report.definitions"
                :key="item.term"
                class="trials-definition-row"
              >
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <div>
                  <strong>{{ item.term }}</strong>
                  <p>{{ item.meaning }}</p>
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>

        <VCard>
          <VCardText>
            <div class="trials-section-overline">
              Граница отчёта
            </div>
            <h2>Чего эта страница не доказывает</h2>

            <div class="trials-boundary-list">
              <div
                v-for="boundary in report.boundaries"
                :key="boundary"
                class="trials-boundary-row"
              >
                <VIcon
                  icon="tabler-shield-check"
                  color="warning"
                  size="20"
                />
                <span>{{ boundary }}</span>
              </div>
            </div>
          </VCardText>
        </VCard>
      </section>

      <VAlert
        class="trials-empty-state"
        color="secondary"
        variant="tonal"
        icon="tabler-chart-bar-off"
        rounded="xl"
      >
        <strong>Детализация по датам пока не показана.</strong>
        Для неё нужна отдельная сверенная витрина по дате пробного, а не дневной ряд по дате создания сделки.
      </VAlert>
    </div>
  </main>
</template>

<style scoped lang="scss">
.trials-page {
  min-block-size: 100vh;
  padding: clamp(1rem, 2.4vw, 2.25rem);
  color: rgba(244, 247, 255, 0.96);
  background:
    radial-gradient(circle at 8% 4%, rgba(115, 103, 240, 0.25), transparent 27rem),
    radial-gradient(circle at 92% 12%, rgba(52, 211, 153, 0.12), transparent 24rem),
    linear-gradient(180deg, #263652 0%, #19253b 48%, #121b2d 100%);
}

.trials-shell {
  margin-inline: auto;
  max-inline-size: 94rem;
}

.trials-header {
  margin-block-end: 1.35rem;
}

.trials-back {
  margin-block-end: 1rem;
  margin-inline-start: -0.75rem;
}

.trials-heading-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 1.4fr) minmax(20rem, 0.6fr);
  align-items: end;
}

.trials-eyebrow,
.trials-section-overline {
  margin-block-end: 0.45rem;
  color: rgba(177, 169, 255, 0.92);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2.6rem, 5vw, 5.25rem);
  font-weight: 760;
  letter-spacing: -0.055em;
  line-height: 0.92;
}

h2 {
  margin: 0;
  color: rgba(248, 250, 255, 0.98);
  font-size: clamp(1.25rem, 2vw, 1.7rem);
  font-weight: 700;
  letter-spacing: -0.035em;
}

.trials-subtitle {
  margin: 0.85rem 0 0;
  color: rgba(214, 221, 239, 0.72);
  font-size: clamp(1rem, 1.7vw, 1.3rem);
}

.trials-context {
  display: grid;
  gap: 0.7rem;
  padding: 1rem 1.15rem;
  border: 1px solid rgba(218, 224, 255, 0.1);
  border-radius: 1.2rem;
  background: rgba(37, 48, 75, 0.68);
  backdrop-filter: blur(18px);
}

.trials-context div {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.trials-context span,
.trials-passport-list dt {
  color: rgba(205, 213, 235, 0.58);
  font-size: 0.78rem;
}

.trials-context strong {
  text-align: end;
}

.trials-page :deep(.v-card) {
  overflow: hidden;
  border: 1px solid rgba(218, 224, 255, 0.09);
  border-radius: 1.5rem;
  background:
    linear-gradient(150deg, rgba(62, 70, 104, 0.92), rgba(40, 49, 77, 0.96));
  box-shadow: 0 22px 46px rgba(6, 12, 25, 0.2);
}

.trials-page :deep(.v-card-text) {
  padding: clamp(1.15rem, 2vw, 1.65rem);
}

.trials-kpi-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-block-end: 1rem;
}

.trials-kpi-topline {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  color: rgba(216, 223, 241, 0.72);
  font-weight: 650;
}

.trials-kpi-value {
  margin-block: 1.2rem 0.35rem;
  font-size: clamp(2.8rem, 5vw, 4.8rem);
  font-weight: 750;
  letter-spacing: -0.065em;
  line-height: 0.9;
}

.trials-kpi-card p,
.trials-outcome-row p,
.trials-definition-row p {
  margin: 0;
  color: rgba(205, 213, 235, 0.6);
  font-size: 0.82rem;
  line-height: 1.55;
}

.trials-main-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.65fr) minmax(19rem, 0.75fr);
  margin-block-end: 1rem;
}

.trials-section-heading {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: flex-start;
}

.trials-rate-layout {
  display: grid;
  gap: clamp(1.4rem, 3vw, 2.5rem);
  grid-template-columns: 13rem minmax(0, 1fr);
  align-items: center;
  margin-block-start: 1.7rem;
}

.trials-rate-ring {
  display: grid;
  border-radius: 50%;
  aspect-ratio: 1;
  background: conic-gradient(rgb(var(--v-theme-success)) 0 78.4%, rgba(255, 188, 74, 0.78) 78.4% 100%);
  box-shadow: 0 0 0 0.65rem rgba(255, 255, 255, 0.025);
  place-items: center;
}

.trials-rate-ring-inner {
  display: grid;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  background: #273550;
  inline-size: 76%;
  aspect-ratio: 1;
  place-content: center;
  text-align: center;
}

.trials-rate-ring-inner strong {
  font-size: 2.2rem;
  letter-spacing: -0.06em;
}

.trials-rate-ring-inner span {
  color: rgba(205, 213, 235, 0.58);
  font-size: 0.78rem;
}

.trials-outcomes {
  display: grid;
  gap: 0.85rem;
}

.trials-outcome-row {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding-block-end: 0.85rem;
  border-block-end: 1px solid rgba(218, 224, 255, 0.08);
}

.trials-outcome-title {
  display: flex;
  gap: 0.75rem;
}

.trials-outcome-dot {
  flex: 0 0 auto;
  border-radius: 50%;
  block-size: 0.7rem;
  inline-size: 0.7rem;
  margin-block-start: 0.35rem;
}

.trials-outcome-dot.is-success { background: rgb(var(--v-theme-success)); }
.trials-outcome-dot.is-warning { background: rgb(var(--v-theme-warning)); }

.trials-outcome-value {
  display: grid;
  text-align: end;
}

.trials-outcome-value strong {
  font-size: 1.55rem;
  line-height: 1;
}

.trials-outcome-value span {
  color: rgba(205, 213, 235, 0.58);
  font-size: 0.76rem;
}

.trials-progress {
  display: flex;
  overflow: hidden;
  border-radius: 999px;
  block-size: 0.55rem;
  background: rgba(255, 255, 255, 0.06);
}

.trials-progress-confirmed {
  inline-size: 78.4%;
  background: rgb(var(--v-theme-success));
}

.trials-progress-unconfirmed {
  inline-size: 21.6%;
  background: rgba(255, 188, 74, 0.82);
}

.trials-passport-card h2 {
  margin-block-end: 1.4rem;
}

.trials-passport-list {
  display: grid;
  gap: 0;
  margin: 0 0 1.2rem;
}

.trials-passport-list div {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding-block: 0.7rem;
  border-block-end: 1px solid rgba(218, 224, 255, 0.08);
}

.trials-passport-list dd {
  margin: 0;
  max-inline-size: 62%;
  font-size: 0.82rem;
  font-weight: 650;
  text-align: end;
}

.trials-detail-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-block-end: 1rem;
}

.trials-definition-list,
.trials-boundary-list {
  display: grid;
  gap: 0.9rem;
  margin-block-start: 1.25rem;
}

.trials-definition-row {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: 2rem 1fr;
}

.trials-definition-row > span {
  color: rgba(177, 169, 255, 0.72);
  font-size: 0.72rem;
  font-weight: 750;
}

.trials-boundary-row {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1.25rem 1fr;
  color: rgba(219, 225, 242, 0.75);
  font-size: 0.88rem;
  line-height: 1.5;
}

.trials-empty-state {
  border: 1px solid rgba(218, 224, 255, 0.08);
}

@media (max-width: 960px) {
  .trials-heading-grid,
  .trials-main-grid,
  .trials-detail-grid {
    grid-template-columns: 1fr;
  }

  .trials-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .trials-page {
    padding: 0.85rem;
  }

  .trials-kpi-grid,
  .trials-rate-layout {
    grid-template-columns: 1fr;
  }

  .trials-rate-ring {
    inline-size: min(13rem, 72vw);
    margin-inline: auto;
  }

  .trials-context div,
  .trials-section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .trials-context strong {
    text-align: start;
  }
}
</style>
