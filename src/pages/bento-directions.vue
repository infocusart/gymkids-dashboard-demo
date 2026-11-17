<script setup lang="ts">
import { gymkidsDemoView as dashboard } from '@/data/gymkidsDemo'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <main class="direction-lab">
    <header class="lab-header">
      <div>
        <span class="lab-kicker">GYMKiDs · композиционный этап</span>
        <h1>Три направления.<br>Одни и те же данные.</h1>
      </div>
      <nav aria-label="Направления дизайна">
        <a href="#editorial">01 · Editorial</a>
        <a href="#control">02 · Control</a>
        <a href="#character">03 · Character</a>
      </nav>
    </header>

    <section
      id="editorial"
      class="concept-section editorial-concept"
    >
      <div class="concept-intro">
        <div><span>01</span><h2>Editorial flow</h2></div>
        <p>Спокойный операционный лист. Минимум карточек, максимум воздуха и ясная последовательность чтения.</p>
      </div>

      <div class="editorial-shell">
        <header class="shell-header light-header">
          <div><strong>GYMKiDs</strong><span>{{ dashboard.meta.centerName }}</span></div>
          <div class="period-pill">
            <span>{{ dashboard.meta.periodLabel }}</span><strong>{{ dashboard.meta.dayLabel }}</strong>
          </div>
        </header>

        <div class="editorial-grid">
          <article class="editorial-leads">
            <div class="section-label">
              <span>План · факт · динамика</span><b>01</b>
            </div>
            <div class="editorial-leadline">
              <strong>{{ dashboard.leads.factLabel }}</strong>
              <span>из {{ dashboard.leads.planLabel }}</span>
            </div>
            <div class="editorial-status">
              <p>При текущем темпе</p>
              <strong>{{ dashboard.leads.forecastLabel }} <i>· {{ dashboard.leads.forecastRateLabel }}</i></strong>
              <span>прогноз к концу месяца</span>
            </div>
            <div
              class="editorial-chart"
              aria-hidden="true"
            >
              <i
                v-for="bar in dashboard.leads.chart"
                :key="bar.day"
                :style="{ blockSize: `${bar.actualHeight}%` }"
              />
            </div>
            <div class="chart-note">
              <span>{{ dashboard.leads.averageLabel }} лида в день</span><span>дневной факт</span>
            </div>
          </article>

          <article class="editorial-sources">
            <div class="section-label">
              <span>Источники</span><b>{{ dashboard.leads.factLabel }}</b>
            </div>
            <h3>Откуда пришли лиды</h3>
            <div class="editorial-source-list">
              <div
                v-for="source in dashboard.sources"
                :key="source.key"
              >
                <span>{{ source.label }}</span>
                <i><b :style="{ inlineSize: `${source.share}%` }" /></i>
                <strong>{{ source.fact }}</strong>
                <em :class="`is-${source.tone}`">{{ source.deltaLabel }}</em>
              </div>
            </div>
          </article>

          <article class="editorial-quality">
            <div class="section-label">
              <span>Качество потока</span><b>02</b>
            </div>
            <div class="quality-statement">
              <strong>{{ dashboard.quality.validRateLabel }}</strong><span>валидных<br>заявок</span>
            </div>
            <div
              class="editorial-segments"
              aria-hidden="true"
            >
              <i
                class="valid"
                :style="{ inlineSize: `${dashboard.quality.validRate}%` }"
              />
              <i
                class="invalid"
                :style="{ inlineSize: `${dashboard.quality.invalidRate}%` }"
              />
              <i
                class="work"
                :style="{ inlineSize: `${dashboard.quality.inWorkRate}%` }"
              />
            </div>
            <div class="quality-inline">
              <span><b>{{ dashboard.quality.valid }}</b> валидные</span>
              <span><b>{{ dashboard.quality.invalid }}</b> невалидные</span>
              <span><b>{{ dashboard.quality.inWork }}</b> в работе</span>
            </div>
            <div class="reason-compact">
              <span
                v-for="reason in dashboard.quality.reasons.slice(0, 3)"
                :key="reason.key"
              >{{ reason.label }} <b>{{ reason.value }}</b></span>
            </div>
          </article>

          <article class="editorial-trial">
            <div class="section-label">
              <span>Доходимость</span><b>03</b>
            </div>
            <div class="trial-statement">
              <strong>{{ dashboard.trial.attendanceRateLabel }}</strong><span>дошли из<br>записанных</span>
            </div>
            <div class="trial-rule">
              <i :style="{ inlineSize: `${dashboard.trial.attendanceRate}%` }" />
            </div>
            <p>{{ dashboard.trial.reached }} из {{ dashboard.trial.scheduled }} · {{ dashboard.trial.noShow }} не дошли</p>
          </article>

          <article class="editorial-channel-pair">
            <div class="section-label">
              <span>Каналы с планом</span><b>04</b>
            </div>
            <div class="channel-half site-half">
              <span>Сайт</span><strong>{{ dashboard.website.fact }} <small>/ {{ dashboard.website.plan }}</small></strong>
              <p>{{ dashboard.website.forecastRate }}% к плану · CPL {{ dashboard.website.cplLabel }}</p>
            </div>
            <div class="channel-half promo-half">
              <span>Промо</span><strong>{{ dashboard.promo.fact }} <small>/ {{ dashboard.promo.plan }}</small></strong>
              <p>{{ dashboard.promo.forecastRate }}% к плану</p>
            </div>
          </article>

          <article class="editorial-path">
            <div class="section-label">
              <span>Путь до пробного по каналам</span><b>05</b>
            </div>
            <div class="editorial-path-grid">
              <div
                v-for="source in dashboard.sources"
                :key="source.key"
              >
                <span>{{ source.label }}</span>
                <i><b :style="{ inlineSize: `${source.reachedRate}%` }" /></i>
                <strong>{{ source.reached }} <small>из {{ source.fact }}</small></strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section
      id="control"
      class="concept-section control-concept"
    >
      <div class="concept-intro inverse-intro">
        <div><span>02</span><h2>Dark control</h2></div>
        <p>Командная поверхность: один большой data-story, компактные контрольные модули и точечный сигнал цвета.</p>
      </div>

      <div class="control-shell">
        <header class="shell-header dark-header">
          <div><strong>GYMKiDs / Monitor</strong><span>{{ dashboard.meta.centerName }}</span></div>
          <div class="control-period">
            <i />{{ dashboard.meta.periodLabel }} · {{ dashboard.meta.dayLabel }}
          </div>
        </header>

        <div class="control-grid">
          <article class="control-hero dark-panel">
            <div class="control-heading">
              <span>Темп лидов</span><strong class="positive-text">● {{ dashboard.leads.forecastRateLabel }}</strong>
            </div>
            <div class="control-number">
              <strong>{{ dashboard.leads.factLabel }}</strong><span>/ {{ dashboard.leads.planLabel }}</span>
            </div>
            <p>Прогноз <b>{{ dashboard.leads.forecastLabel }}</b> к концу месяца</p>
            <div
              class="control-chart"
              aria-hidden="true"
            >
              <i
                v-for="bar in dashboard.leads.chart"
                :key="bar.day"
                :style="{ blockSize: `${bar.actualHeight}%` }"
              />
            </div>
            <div class="control-axis">
              <span>1 апреля</span><b>{{ dashboard.leads.averageLabel }} / день</b><span>сегодня</span>
            </div>
          </article>

          <article class="control-sources dark-panel">
            <div class="control-heading">
              <span>Источники</span><strong>{{ dashboard.leads.factLabel }}</strong>
            </div>
            <div class="control-source-list">
              <div
                v-for="source in dashboard.sources"
                :key="source.key"
              >
                <span>{{ source.label }} <small>{{ source.shareLabel }}</small></span>
                <i><b :style="{ inlineSize: `${source.share}%` }" /></i>
                <strong>{{ source.fact }}</strong>
                <em :class="`is-${source.tone}`">{{ source.deltaLabel }}</em>
              </div>
            </div>
          </article>

          <article class="control-quality dark-panel">
            <div class="control-heading">
              <span>Качество</span><strong>{{ dashboard.quality.validRateLabel }}</strong>
            </div>
            <div class="control-quality-bar">
              <i :style="{ inlineSize: `${dashboard.quality.validRate}%` }" />
            </div>
            <div class="control-mini-values">
              <span><b>{{ dashboard.quality.valid }}</b> валидные</span>
              <span><b>{{ dashboard.quality.invalid }}</b> невалидные</span>
              <span><b>{{ dashboard.quality.inWork }}</b> в работе</span>
            </div>
          </article>

          <article class="control-trial dark-panel">
            <div class="control-heading">
              <span>Пробное</span><strong>{{ dashboard.trial.attendanceRateLabel }}</strong>
            </div>
            <div
              class="control-ring"
              :style="{ '--ring': `${dashboard.trial.attendanceRate * 3.6}deg` }"
            >
              <span>{{ dashboard.trial.reached }}</span>
            </div>
            <p>из {{ dashboard.trial.scheduled }} записанных</p>
          </article>

          <article class="control-channels dark-panel">
            <div class="control-heading">
              <span>План каналов</span><strong>Сайт / промо</strong>
            </div>
            <div class="control-channel-row positive-line">
              <span>Сайт</span><strong>{{ dashboard.website.fact }} <small>/ {{ dashboard.website.plan }}</small></strong><em>{{ dashboard.website.forecastRate }}%</em>
            </div>
            <div class="control-channel-row negative-line">
              <span>Промо</span><strong>{{ dashboard.promo.fact }} <small>/ {{ dashboard.promo.plan }}</small></strong><em>{{ dashboard.promo.forecastRate }}%</em>
            </div>
          </article>

          <article class="control-path dark-panel">
            <div class="control-heading">
              <span>Путь по каналам</span><strong>лид → валидный → записан → дошёл</strong>
            </div>
            <div class="control-path-list">
              <div
                v-for="source in dashboard.sources"
                :key="source.key"
              >
                <span>{{ source.label }}</span>
                <i class="base"><b
                  class="valid-layer"
                  :style="{ inlineSize: `${source.validRate}%` }"
                /><b
                  class="reached-layer"
                  :style="{ inlineSize: `${source.reachedRate}%` }"
                /></i>
                <strong>{{ source.reached }}</strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section
      id="character"
      class="concept-section character-concept"
    >
      <div class="concept-intro">
        <div><span>03</span><h2>Character bento</h2></div>
        <p>Асимметричная сетка референса №1. Центральная зона заранее работает как место для будущего AI-проводника.</p>
      </div>

      <div class="character-shell">
        <header class="shell-header character-header">
          <div><strong>GYMKiDs</strong><span>{{ dashboard.meta.centerName }}</span></div>
          <div><span>{{ dashboard.meta.periodLabel }}</span><strong>{{ dashboard.meta.dayLabel }}</strong></div>
        </header>

        <div class="character-grid">
          <article class="bento-card bento-leads cream-card">
            <span class="card-index">01</span>
            <p>Лиды на сегодня</p>
            <strong>{{ dashboard.leads.factLabel }}</strong>
            <span class="bento-plan">из {{ dashboard.leads.planLabel }}</span>
            <div
              class="bento-daily"
              aria-hidden="true"
            >
              <i
                v-for="bar in dashboard.leads.chart"
                :key="bar.day"
                :style="{ blockSize: `${bar.actualHeight}%` }"
              />
            </div>
            <b>{{ dashboard.leads.averageLabel }} / день</b>
          </article>

          <article class="bento-card bento-sources blush-card">
            <span class="card-index">02</span>
            <h3>Откуда пришли лиды</h3>
            <div class="bento-source-list">
              <div
                v-for="source in dashboard.sources"
                :key="source.key"
              >
                <span>{{ source.label }}</span><b>{{ source.fact }}</b><em :class="`is-${source.tone}`">{{ source.deltaLabel }}</em>
              </div>
            </div>
          </article>

          <article class="bento-card bento-trial cream-card">
            <span class="card-index">03</span>
            <p>Дошли из записанных</p>
            <strong>{{ dashboard.trial.attendanceRateLabel }}</strong>
            <div class="bento-trial-rule">
              <i :style="{ inlineSize: `${dashboard.trial.attendanceRate}%` }" />
            </div>
            <b>{{ dashboard.trial.reached }} из {{ dashboard.trial.scheduled }}</b>
          </article>

          <article class="bento-card bento-quality cream-card">
            <span class="card-index">04</span>
            <p>Качество потока</p>
            <strong>{{ dashboard.quality.validRateLabel }}</strong>
            <span class="bento-quality-label">валидных заявок</span>
            <div class="bento-quality-states">
              <span><b>{{ dashboard.quality.valid }}</b> валидные</span><span><b>{{ dashboard.quality.invalid }}</b> невалидные</span><span><b>{{ dashboard.quality.inWork }}</b> в работе</span>
            </div>
            <div class="bento-reasons">
              <span
                v-for="reason in dashboard.quality.reasons.slice(0, 3)"
                :key="reason.key"
              >{{ reason.label }} <b>{{ reason.value }}</b></span>
            </div>
          </article>

          <article class="bento-card bento-guide signal-card">
            <div
              class="signal-orbit"
              aria-hidden="true"
            >
              <i /><b />
            </div>
            <div class="signal-copy">
              <span>Текущий темп</span>
              <strong>{{ dashboard.leads.forecastRateLabel }}</strong>
              <h3>План выполняется.<br>Прогноз — {{ dashboard.leads.forecastLabel }} лидов.</h3>
              <p>Эта зона станет местом AI-проводника после утверждения статичной композиции.</p>
            </div>
          </article>

          <article class="bento-card bento-site mint-card">
            <span class="card-index">05</span><p>Сайт</p><strong>{{ dashboard.website.fact }}</strong><span>из {{ dashboard.website.plan }}</span><b>{{ dashboard.website.forecastRate }}% · CPL {{ dashboard.website.cplLabel }}</b>
          </article>

          <article class="bento-card bento-promo coral-card">
            <span class="card-index">06</span><p>Промо</p><strong>{{ dashboard.promo.fact }}</strong><span>из {{ dashboard.promo.plan }}</span><b>{{ dashboard.promo.forecastRate }}% к плану</b>
          </article>

          <article class="bento-card bento-path cream-card">
            <span class="card-index">07</span>
            <h3>Путь до пробного</h3>
            <div class="bento-path-list">
              <div
                v-for="source in dashboard.sources"
                :key="source.key"
              >
                <span>{{ source.label }}</span><i><b :style="{ inlineSize: `${source.reachedRate}%` }" /></i><strong>{{ source.reached }} <small>/ {{ source.fact }}</small></strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.direction-lab {
  --ink: #171716;
  --paper: #f4f0e9;
  --coral: #f16f66;
  --green: #3d9664;
  min-block-size: 100dvh;
  padding: 48px clamp(18px, 4vw, 70px) 100px;
  color: var(--ink);
  background: #d8d5d0;
  font-family: "Inter Tight", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  font-variant-numeric: tabular-nums;
}

.lab-header,
.concept-section { max-inline-size: 1500px; margin-inline: auto; }

.lab-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; margin-block-end: 72px; }
.lab-kicker { color: #66635f; font-size: 13px; font-weight: 760; letter-spacing: .1em; text-transform: uppercase; }
.lab-header h1 { max-inline-size: 720px; margin: 10px 0 0; color: var(--ink); font-size: clamp(48px, 6vw, 92px); font-weight: 620; letter-spacing: -.07em; line-height: .9; }
.lab-header nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.lab-header a { padding: 10px 14px; border: 1px solid rgb(23 23 22 / 18%); border-radius: 999px; color: inherit; font-size: 13px; font-weight: 700; text-decoration: none; transition: color .18s ease, background-color .18s ease; }
.lab-header a:hover { color: var(--paper); background: var(--ink); }
.lab-header a:focus-visible { outline: 3px solid var(--coral); outline-offset: 3px; }

.concept-section { margin-block-end: 110px; scroll-margin-block-start: 20px; }
.concept-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; margin-block-end: 20px; }
.concept-intro > div { display: flex; align-items: baseline; gap: 12px; }
.concept-intro span { color: #6f6b65; font-size: 13px; font-weight: 800; }
.concept-intro h2 { margin: 0; color: var(--ink); font-size: clamp(30px, 3vw, 46px); font-weight: 700; letter-spacing: -.055em; }
.concept-intro p { max-inline-size: 560px; margin: 0; color: #68645f; font-size: 15px; line-height: 1.45; }

.editorial-shell,
.control-shell,
.character-shell { overflow: hidden; min-block-size: 830px; border-radius: 28px; }

.editorial-shell { padding: 24px 34px 34px; background: var(--paper); }
.shell-header { display: flex; min-block-size: 58px; align-items: center; justify-content: space-between; gap: 20px; }
.shell-header > div:first-child { display: grid; }
.shell-header strong { font-size: 16px; }
.shell-header span { font-size: 13px; }
.light-header { border-block-end: 1px solid rgb(23 23 22 / 15%); }
.light-header > div:first-child span { color: #7a756f; }
.period-pill { display: flex; align-items: center; gap: 10px; }
.period-pill strong { padding: 7px 10px; border-radius: 999px; color: white; background: var(--ink); font-size: 12px; }

.editorial-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); }
.editorial-grid article { min-inline-size: 0; padding: 28px; border-inline-end: 1px solid rgb(23 23 22 / 14%); border-block-end: 1px solid rgb(23 23 22 / 14%); }
.section-label { display: flex; align-items: center; justify-content: space-between; margin-block-end: 24px; color: #6c6761; font-size: 12px; font-weight: 780; letter-spacing: .08em; text-transform: uppercase; }
.section-label b { color: var(--ink); }
.editorial-leads { grid-column: span 7; min-block-size: 390px; }
.editorial-sources { grid-column: span 5; border-inline-end: 0 !important; }
.editorial-quality { grid-column: span 5; min-block-size: 275px; }
.editorial-trial { grid-column: span 3; }
.editorial-channel-pair { display: grid; grid-column: span 4; border-inline-end: 0 !important; grid-template-columns: 1fr 1fr; }
.editorial-channel-pair .section-label { grid-column: 1 / -1; }
.editorial-path { grid-column: span 12; border-inline-end: 0 !important; border-block-end: 0 !important; }
.editorial-leadline { display: flex; align-items: baseline; gap: 15px; }
.editorial-leadline strong { font-size: clamp(86px, 9vw, 138px); font-weight: 560; letter-spacing: -.09em; line-height: .72; }
.editorial-leadline span { color: #77716b; font-size: 28px; font-weight: 650; }
.editorial-status { display: grid; margin-block-start: 22px; grid-template-columns: 1fr auto; }
.editorial-status p,
.editorial-status span { margin: 0; color: #77716b; font-size: 13px; }
.editorial-status strong { grid-row: span 2; font-size: 26px; letter-spacing: -.04em; }
.editorial-status i { color: var(--green); font-style: normal; }
.editorial-chart { display: flex; height: 98px; margin-block-start: 20px; align-items: flex-end; gap: 4px; border-block-end: 1px solid rgb(23 23 22 / 25%); }
.editorial-chart i { flex: 1; min-inline-size: 2px; border-radius: 2px 2px 0 0; background: #1d1c1a; opacity: .84; }
.chart-note { display: flex; justify-content: space-between; margin-block-start: 7px; color: #77716b; font-size: 12px; }
.editorial-sources h3 { margin: 0 0 18px; color: var(--ink); font-size: 28px; letter-spacing: -.04em; }
.editorial-source-list { display: grid; }
.editorial-source-list > div { display: grid; align-items: center; gap: 10px; padding-block: 12px; border-block-end: 1px solid rgb(23 23 22 / 12%); grid-template-columns: 86px minmax(70px, 1fr) 38px 55px; }
.editorial-source-list span { font-size: 14px; font-weight: 680; }
.editorial-source-list i { height: 5px; border-radius: 99px; background: rgb(23 23 22 / 10%); }
.editorial-source-list i b { display: block; height: 100%; border-radius: inherit; background: var(--ink); }
.editorial-source-list strong { text-align: end; }
.editorial-source-list em { text-align: end; font-size: 12px; font-style: normal; font-weight: 750; }
.is-positive { color: var(--green) !important; }
.is-warning { color: #c28623 !important; }
.is-negative { color: #d95950 !important; }
.is-neutral { color: #77716b !important; }
.quality-statement,
.trial-statement { display: flex; align-items: flex-end; gap: 12px; }
.quality-statement strong,
.trial-statement strong { font-size: clamp(54px, 5.4vw, 82px); font-weight: 590; letter-spacing: -.08em; line-height: .75; }
.quality-statement span,
.trial-statement span { font-size: 18px; font-weight: 700; line-height: .95; }
.editorial-segments { display: flex; overflow: hidden; height: 10px; margin-block: 24px 13px; border-radius: 99px; background: #d1ccc5; }
.editorial-segments i { display: block; }
.editorial-segments .valid { background: var(--green); }
.editorial-segments .invalid { background: var(--coral); }
.editorial-segments .work { min-inline-size: 6px; background: #8c8984; }
.quality-inline { display: flex; flex-wrap: wrap; gap: 15px; color: #6f6963; font-size: 12px; }
.quality-inline b { margin-inline-end: 3px; color: var(--ink); font-size: 15px; }
.reason-compact { display: grid; margin-block-start: 15px; }
.reason-compact span { display: flex; justify-content: space-between; padding-block: 6px; border-block-end: 1px solid rgb(23 23 22 / 10%); font-size: 12px; }
.trial-rule { overflow: hidden; height: 8px; margin-block: 26px 14px; border-radius: 99px; background: #d9d4cd; }
.trial-rule i { display: block; height: 100%; border-radius: inherit; background: var(--green); }
.editorial-trial p { margin: 0; color: #706a64; font-size: 13px; }
.channel-half { display: flex; min-inline-size: 0; padding: 18px; flex-direction: column; justify-content: center; }
.channel-half + .channel-half { border-inline-start: 1px solid rgb(23 23 22 / 14%); }
.channel-half > span { font-size: 14px; font-weight: 760; }
.channel-half > strong { margin-block: 10px; font-size: 48px; letter-spacing: -.07em; }
.channel-half small { color: #77716b; font-size: 17px; }
.channel-half p { margin: 0; font-size: 12px; }
.site-half { background: #dbe9d8; }
.promo-half { background: #f2d4cf; }
.editorial-path-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 22px; }
.editorial-path-grid > div { display: grid; gap: 7px; }
.editorial-path-grid span { font-size: 14px; font-weight: 720; }
.editorial-path-grid i { overflow: hidden; height: 6px; border-radius: 99px; background: #d6d0c9; }
.editorial-path-grid i b { display: block; height: 100%; border-radius: inherit; background: var(--green); }
.editorial-path-grid strong { font-size: 22px; }
.editorial-path-grid small { color: #78716b; font-size: 12px; }

.control-concept { padding: 60px 0; }
.inverse-intro h2 { color: var(--ink); }
.inverse-intro span,
.inverse-intro p { color: #68645f; }
.control-shell { padding: 22px 28px 30px; color: #eeeee8; background: #0c100e; }
.dark-header { border-block-end: 1px solid rgb(238 238 232 / 11%); }
.dark-header span { color: rgb(238 238 232 / 50%); }
.control-period { display: flex; align-items: center; gap: 8px; color: rgb(238 238 232 / 65%); font-size: 12px; }
.control-period i { inline-size: 7px; aspect-ratio: 1; border-radius: 50%; background: #c8f35b; box-shadow: 0 0 14px rgb(200 243 91 / 55%); }
.control-grid { display: grid; padding-block-start: 18px; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 12px; }
.dark-panel { min-inline-size: 0; border: 1px solid rgb(238 238 232 / 10%); border-radius: 16px; background: #141916; }
.control-hero { padding: 24px; grid-column: span 8; }
.control-sources { padding: 24px; grid-column: span 4; }
.control-quality { padding: 20px; grid-column: span 5; }
.control-trial { padding: 20px; grid-column: span 3; }
.control-channels { padding: 20px; grid-column: span 4; }
.control-path { padding: 22px; grid-column: span 12; }
.control-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; color: rgb(238 238 232 / 55%); font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
.control-heading strong { color: #eeeee8; font-size: 12px; }
.positive-text { color: #c8f35b !important; }
.control-number { display: flex; margin-block-start: 22px; align-items: baseline; gap: 14px; }
.control-number strong { font-size: clamp(84px, 9vw, 132px); font-weight: 520; letter-spacing: -.085em; line-height: .72; }
.control-number span { color: rgb(238 238 232 / 45%); font-size: 28px; }
.control-hero > p { margin: 18px 0 0; color: rgb(238 238 232 / 50%); font-size: 13px; }
.control-hero > p b { color: #eeeee8; }
.control-chart { display: flex; height: 95px; margin-block-start: 18px; align-items: flex-end; gap: 4px; }
.control-chart i { flex: 1; border-radius: 2px 2px 0 0; background: linear-gradient(180deg, #c8f35b, #567026); opacity: .88; }
.control-axis { display: flex; justify-content: space-between; margin-block-start: 6px; color: rgb(238 238 232 / 42%); font-size: 11px; }
.control-axis b { color: #c8f35b; }
.control-source-list { display: grid; margin-block-start: 17px; }
.control-source-list > div { display: grid; align-items: center; gap: 8px; padding-block: 11px; border-block-end: 1px solid rgb(238 238 232 / 8%); grid-template-columns: 92px minmax(60px, 1fr) 34px 52px; }
.control-source-list span { font-size: 13px; font-weight: 700; }
.control-source-list small { display: block; color: rgb(238 238 232 / 38%); font-size: 10px; }
.control-source-list i { height: 4px; border-radius: 99px; background: rgb(238 238 232 / 8%); }
.control-source-list i b { display: block; height: 100%; border-radius: inherit; background: #c8f35b; }
.control-source-list > div > strong { text-align: end; }
.control-source-list em { text-align: end; font-size: 11px; font-style: normal; font-weight: 760; }
.control-quality-bar { overflow: hidden; height: 8px; margin-block: 28px 16px; border-radius: 99px; background: rgb(238 238 232 / 9%); }
.control-quality-bar i { display: block; height: 100%; border-radius: inherit; background: #c8f35b; }
.control-mini-values { display: flex; justify-content: space-between; gap: 12px; color: rgb(238 238 232 / 45%); font-size: 11px; }
.control-mini-values span { display: grid; }
.control-mini-values b { color: #eeeee8; font-size: 19px; }
.control-ring { position: relative; display: grid; inline-size: 106px; aspect-ratio: 1; margin: 18px auto 7px; place-items: center; border-radius: 50%; background: conic-gradient(#c8f35b var(--ring), rgb(238 238 232 / 8%) 0); }
.control-ring::before { inline-size: 78%; aspect-ratio: 1; border-radius: 50%; background: #141916; content: ""; }
.control-ring span { position: absolute; font-size: 27px; font-weight: 720; }
.control-trial p { margin: 0; color: rgb(238 238 232 / 45%); font-size: 12px; text-align: center; }
.control-channel-row { display: grid; align-items: end; gap: 6px; margin-block-start: 18px; padding: 13px 0 10px 13px; border-inline-start: 2px solid; border-block-end: 1px solid rgb(238 238 232 / 8%); grid-template-columns: 1fr auto; }
.control-channel-row span { color: rgb(238 238 232 / 50%); font-size: 12px; }
.control-channel-row strong { font-size: 25px; }
.control-channel-row small { color: rgb(238 238 232 / 40%); font-size: 13px; }
.control-channel-row em { grid-column: 2; grid-row: 1; font-size: 12px; font-style: normal; }
.positive-line { border-color: #c8f35b; }
.positive-line em { color: #c8f35b; }
.negative-line { border-color: #ff745f; }
.negative-line em { color: #ff745f; }
.control-path-list { display: grid; margin-block-start: 15px; grid-template-columns: repeat(5, 1fr); gap: 18px; }
.control-path-list > div { display: grid; gap: 8px; }
.control-path-list span { font-size: 12px; font-weight: 720; }
.control-path-list .base { position: relative; overflow: hidden; height: 12px; border-radius: 99px; background: rgb(238 238 232 / 8%); }
.control-path-list .base b { position: absolute; inset-block: 0; inset-inline-start: 0; border-radius: inherit; }
.valid-layer { background: #ff745f; }
.reached-layer { inset-block: 4px !important; background: #c8f35b; }
.control-path-list strong { color: #c8f35b; font-size: 18px; }

.character-shell { padding: 18px; color: var(--ink); background: #0c0c0c; }
.character-header { min-block-size: 54px; padding-inline: 10px; color: #f8f3ec; }
.character-header span { color: rgb(248 243 236 / 55%); }
.character-header > div:last-child { display: grid; text-align: end; }
.character-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-template-rows: 190px 220px 170px 190px; gap: 12px; }
.bento-card { position: relative; overflow: hidden; min-inline-size: 0; padding: 22px; border-radius: 23px; }
.cream-card { background: #f7f0e8; }
.blush-card { background: #f3cbc8; }
.mint-card { background: #d8ead9; }
.coral-card { background: #f27968; }
.signal-card { color: #f8f3ec; background: radial-gradient(circle at 68% 42%, #ff9c70 0, #bd5f76 21%, #50305d 42%, #171319 68%); }
.card-index { position: absolute; inset-block-start: 18px; inset-inline-end: 20px; color: rgb(23 23 22 / 42%); font-size: 11px; font-weight: 800; }
.bento-card p,
.bento-card h3 { margin: 0; }
.bento-leads { grid-column: 1 / 4; grid-row: 1 / 3; }
.bento-sources { grid-column: 4 / 9; grid-row: 1; }
.bento-trial { grid-column: 9 / 11; grid-row: 1; }
.bento-quality { grid-column: 11 / 13; grid-row: 1 / 4; }
.bento-guide { grid-column: 4 / 11; grid-row: 2 / 4; }
.bento-site { grid-column: 1 / 4; grid-row: 3; }
.bento-promo { grid-column: 1 / 4; grid-row: 4; }
.bento-path { grid-column: 4 / 13; grid-row: 4; }
.bento-leads > p,
.bento-trial > p,
.bento-quality > p,
.bento-site > p,
.bento-promo > p { font-size: 15px; font-weight: 750; }
.bento-leads > strong { display: block; margin-block-start: 30px; font-size: clamp(75px, 8vw, 116px); font-weight: 570; letter-spacing: -.09em; line-height: .75; }
.bento-plan { color: #77716b; font-size: 25px; font-weight: 670; }
.bento-daily { display: flex; height: 105px; margin-block: 42px 10px; align-items: flex-end; gap: 3px; }
.bento-daily i { flex: 1; border-radius: 2px 2px 0 0; background: var(--coral); }
.bento-leads > b { color: #6f6963; font-size: 12px; }
.bento-sources h3 { color: var(--ink); font-size: 24px; letter-spacing: -.04em; }
.bento-source-list { display: grid; margin-block-start: 16px; grid-template-columns: repeat(5, 1fr); }
.bento-source-list > div { display: grid; padding-inline: 12px; border-inline-start: 1px solid rgb(23 23 22 / 14%); }
.bento-source-list > div:first-child { padding-inline-start: 0; border: 0; }
.bento-source-list span { font-size: 12px; font-weight: 700; }
.bento-source-list b { margin-block-start: 6px; font-size: 24px; }
.bento-source-list em { margin-block-start: 3px; font-size: 11px; font-style: normal; font-weight: 750; }
.bento-trial > strong { display: block; margin-block-start: 23px; font-size: 48px; letter-spacing: -.07em; }
.bento-trial-rule { overflow: hidden; height: 7px; margin-block: 16px 10px; border-radius: 99px; background: rgb(23 23 22 / 10%); }
.bento-trial-rule i { display: block; height: 100%; border-radius: inherit; background: var(--green); }
.bento-trial > b { color: #6d6761; font-size: 11px; }
.bento-quality > strong { display: block; margin-block-start: 28px; font-size: 58px; letter-spacing: -.08em; line-height: .8; }
.bento-quality-label { display: block; margin-block-start: 7px; font-size: 15px; font-weight: 700; line-height: 1; }
.bento-quality-states { display: grid; margin-block-start: 27px; gap: 8px; }
.bento-quality-states span { display: grid; padding-block-end: 8px; border-block-end: 1px solid rgb(23 23 22 / 12%); color: #716b65; font-size: 11px; }
.bento-quality-states b { color: var(--ink); font-size: 18px; }
.bento-reasons { display: grid; margin-block-start: 20px; gap: 8px; }
.bento-reasons span { display: flex; justify-content: space-between; font-size: 10px; }
.signal-copy { position: relative; z-index: 2; display: flex; height: 100%; padding-inline-end: 42%; flex-direction: column; justify-content: flex-end; }
.signal-copy > span { color: rgb(248 243 236 / 58%); font-size: 12px; font-weight: 750; text-transform: uppercase; }
.signal-copy > strong { margin-block: 6px 13px; font-size: 68px; letter-spacing: -.08em; line-height: .8; }
.signal-copy h3 { color: #f8f3ec; font-size: 25px; letter-spacing: -.04em; line-height: 1; }
.signal-copy p { max-inline-size: 330px; margin-block-start: 15px; color: rgb(248 243 236 / 55%); font-size: 12px; line-height: 1.4; }
.signal-orbit { position: absolute; inset-block-start: 50%; inset-inline-end: 8%; inline-size: min(38%, 240px); aspect-ratio: 1; border: 1px solid rgb(255 255 255 / 22%); border-radius: 50%; transform: translateY(-50%); }
.signal-orbit::before,
.signal-orbit::after { position: absolute; border: 1px solid rgb(255 255 255 / 16%); border-radius: 50%; content: ""; }
.signal-orbit::before { inset: 14%; }
.signal-orbit::after { inset: 28%; }
.signal-orbit i { position: absolute; inset: 42%; border-radius: 50%; background: #ffe2b4; box-shadow: 0 0 42px #ff916f; }
.signal-orbit b { position: absolute; inset-block-start: 9%; inset-inline-start: 42%; inline-size: 14px; aspect-ratio: 1; border-radius: 50%; background: #f7f0e8; }
.bento-site > strong,
.bento-promo > strong { display: inline-block; margin-block: 12px 4px; font-size: 52px; letter-spacing: -.08em; line-height: .8; }
.bento-site > span:not(.card-index),
.bento-promo > span:not(.card-index) { color: rgb(23 23 22 / 55%); font-size: 17px; font-weight: 700; }
.bento-site > b,
.bento-promo > b { display: block; margin-block-start: 13px; font-size: 12px; }
.bento-path h3 { color: var(--ink); font-size: 22px; letter-spacing: -.04em; }
.bento-path-list { display: grid; margin-block-start: 16px; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.bento-path-list > div { display: grid; gap: 7px; }
.bento-path-list span { font-size: 12px; font-weight: 720; }
.bento-path-list i { overflow: hidden; height: 8px; border-radius: 99px; background: #ddd4cc; }
.bento-path-list i b { display: block; height: 100%; border-radius: inherit; background: var(--green); }
.bento-path-list strong { font-size: 19px; }
.bento-path-list small { color: #77716b; font-size: 11px; }

@media (max-width: 1050px) {
  .editorial-leads,
  .editorial-sources { grid-column: span 12; border-inline-end: 0 !important; }
  .editorial-quality { grid-column: span 6; }
  .editorial-trial { grid-column: span 6; border-inline-end: 0 !important; }
  .editorial-channel-pair { grid-column: span 12; }
  .control-hero,
  .control-sources { grid-column: span 12; }
  .control-quality { grid-column: span 6; }
  .control-trial { grid-column: span 6; }
  .control-channels { grid-column: span 12; }
  .character-grid { grid-template-rows: auto; }
  .bento-leads { grid-column: span 5; grid-row: auto; }
  .bento-sources { grid-column: span 7; grid-row: auto; }
  .bento-trial,
  .bento-site,
  .bento-promo { grid-column: span 4; grid-row: auto; }
  .bento-quality { grid-column: span 4; grid-row: auto; }
  .bento-guide { min-block-size: 320px; grid-column: span 8; grid-row: auto; }
  .bento-path { grid-column: span 12; grid-row: auto; }
}

@media (max-width: 720px) {
  .direction-lab { padding: 24px 10px 60px; }
  .lab-header { align-items: flex-start; flex-direction: column; margin-block-end: 48px; }
  .lab-header h1 { font-size: 48px; }
  .lab-header nav { justify-content: flex-start; }
  .concept-section { margin-block-end: 70px; }
  .concept-intro { align-items: flex-start; flex-direction: column; gap: 8px; }
  .editorial-shell,
  .control-shell,
  .character-shell { min-block-size: 0; padding: 12px; border-radius: 22px; }
  .shell-header { padding-inline: 8px; }
  .editorial-grid,
  .control-grid,
  .character-grid { display: flex; flex-direction: column; }
  .editorial-grid article { padding: 22px 12px; border-inline-end: 0; }
  .editorial-leadline strong,
  .control-number strong { font-size: 86px; }
  .editorial-source-list > div { grid-template-columns: 82px minmax(55px, 1fr) 34px 50px; }
  .editorial-channel-pair { display: grid !important; }
  .editorial-path-grid,
  .control-path-list,
  .bento-path-list { grid-template-columns: 1fr; }
  .dark-panel { padding: 20px; }
  .control-mini-values { gap: 8px; }
  .bento-card { min-block-size: 210px; border-radius: 20px; }
  .bento-guide { min-block-size: 370px; }
  .signal-copy { padding-inline-end: 0; justify-content: flex-start; }
  .signal-orbit { inset-block-start: auto; inset-block-end: -3%; inline-size: 190px; transform: none; }
  .bento-quality { min-block-size: 400px; }
  .bento-source-list { grid-template-columns: repeat(2, 1fr); gap: 15px; }
  .bento-source-list > div { border: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .direction-lab { scroll-behavior: auto; }
  .lab-header a { transition: none; }
}
</style>
