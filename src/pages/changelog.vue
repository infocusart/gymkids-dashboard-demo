<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ReleaseWorkCard from '@/components/changelog/ReleaseWorkCard.vue'
import { displayChangelogLinks, displayChangelogRoutes, formatChangelogDate, normalizeChangelogData, normalizeLiveActivity, shortChangelogCommit } from '@/lib/changelogDisplay'
import type { ChangelogData, LiveActivity, Person, Stage } from '@/types/changelog'
import gymkidsWhiteLogoUrl from '@images/gymkids/white-logo.png'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const changelog = ref<ChangelogData | null>(null)
const loadState = ref<'loading' | 'ready' | 'error'>('loading')
const loadError = ref('')
const liveActivity = ref<LiveActivity | null>(null)
const liveLoadState = ref<'loading' | 'ready' | 'error'>('loading')
const liveLoadError = ref('')
const searchQuery = ref('')
const selectedStage = ref<'all' | Stage>('all')
const selectedParticipant = ref('all')
const showCompleted = ref(true)

const stageOptions: Array<{ value: 'all' | Stage; label: string }> = [
  { value: 'all', label: 'Все этапы' },
  { value: 'planned', label: 'Запланировано' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'in_review', label: 'На проверке' },
  { value: 'blocked', label: 'Заблокировано' },
  { value: 'changes_requested', label: 'Нужны изменения' },
  { value: 'approved', label: 'Готово к выпуску' },
  { value: 'accepted', label: 'Принято' },
  { value: 'released', label: 'Опубликовано' },
  { value: 'cancelled', label: 'Отменено' },
]

const closedStages: Stage[] = ['accepted', 'released', 'cancelled']
const personKey = (person: Person) => `${person.kind}:${person.id}`

const matchesSearch = (value: unknown) => {
  const query = searchQuery.value.trim().toLocaleLowerCase('ru-RU')

  if (!query)
    return true

  return JSON.stringify(value).toLocaleLowerCase('ru-RU').includes(query)
}

const filteredWorkItems = computed(() => (changelog.value?.work_items ?? []).filter(item => {
  const stageMatches = selectedStage.value === 'all' || item.stage === selectedStage.value
  const participantMatches = selectedParticipant.value === 'all' || item.participant_keys.includes(selectedParticipant.value)
  const visibilityMatches = showCompleted.value || !closedStages.includes(item.stage)

  return stageMatches && participantMatches && visibilityMatches && matchesSearch(item)
}))

const activeWorkItems = computed(() => filteredWorkItems.value.filter(item => !closedStages.includes(item.stage)))

const hasStaticActiveWork = computed(() => (changelog.value?.work_items ?? []).some(item => !closedStages.includes(item.stage)))

const completedWorkItems = computed(() => filteredWorkItems.value.filter(item => closedStages.includes(item.stage)))

const filteredEvents = computed(() => (changelog.value?.events ?? []).filter(event => {
  const stageMatches = selectedStage.value === 'all' || event.stage === selectedStage.value

  const participantMatches = selectedParticipant.value === 'all'
    || personKey(event.actor) === selectedParticipant.value
    || personKey(event.owner) === selectedParticipant.value

  return stageMatches && participantMatches && matchesSearch(event)
}))

const liveWorkItems = computed(() => liveActivity.value?.work_items ?? [])
const releaseCandidates = computed(() => liveWorkItems.value.filter(item => ['in_review', 'approved'].includes(item.stage)))
const liveUpdatedAt = computed(() => liveActivity.value?.generated_at ?? changelog.value?.generated_at ?? null)

const overviewSummary = computed(() => {
  const staticSummary = changelog.value?.summary

  const people = new Set([
    ...(changelog.value?.participants ?? []).map(person => person.name),
    ...liveWorkItems.value.flatMap(item => [item.actor.label, item.owner.label]),
  ])

  return {
    active: (staticSummary?.active ?? 0) + liveWorkItems.value.filter(item => !closedStages.includes(item.stage)).length,
    inReview: (staticSummary?.in_review ?? 0) + liveWorkItems.value.filter(item => item.stage === 'in_review').length,
    blocked: (staticSummary?.blocked ?? 0) + liveWorkItems.value.filter(item => ['blocked', 'changes_requested'].includes(item.stage)).length,
    participants: people.size,
    events: (staticSummary?.events ?? 0) + (liveActivity.value?.events.length ?? 0),
  }
})

const loadWorkActivity = async () => {
  liveLoadState.value = 'loading'
  liveLoadError.value = ''

  try {
    const response = await fetch('https://mcp.gymkids-fr.infocuslab.ru/public-work-activity', { cache: 'no-store' })

    if (!response.ok)
      throw new Error(`Живой MCP-поток вернул ${response.status}`)

    liveActivity.value = normalizeLiveActivity(await response.json())
    liveLoadState.value = 'ready'
  }
  catch (error) {
    liveLoadError.value = error instanceof Error ? error.message : 'Неизвестная ошибка MCP-потока'
    liveLoadState.value = 'error'
  }
}

const loadChangelog = async () => {
  loadState.value = 'loading'
  loadError.value = ''

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/changelog/index.json`, { cache: 'no-store' })

    if (!response.ok)
      throw new Error(`Источник журнала вернул ${response.status}`)

    changelog.value = normalizeChangelogData(await response.json())
    loadState.value = 'ready'
  }
  catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Неизвестная ошибка загрузки'
    loadState.value = 'error'
  }
}

const refreshAll = () => {
  loadChangelog()
  loadWorkActivity()
}

onMounted(refreshAll)
</script>

<template>
  <main class="changelog-page">
    <div class="changelog-glow changelog-glow-primary" />
    <div class="changelog-glow changelog-glow-secondary" />

    <section class="changelog-shell">
      <header class="changelog-header">
        <RouterLink
          class="changelog-brand"
          to="/bento-preview"
          aria-label="Вернуться в дашборд GYMKiDs"
        >
          <img
            :src="gymkidsWhiteLogoUrl"
            alt="GYMKiDs"
          >
          <span>Дашборд</span>
        </RouterLink>

        <div class="changelog-intro">
          <span class="changelog-eyebrow">Командная работа</span>
          <h1>Журнал работ</h1>
          <p>Кто что меняет, где работа сейчас и с какого места её продолжать.</p>
        </div>

        <div class="changelog-header-actions">
          <span>Обновлено<br><b>{{ formatChangelogDate(liveUpdatedAt) }}</b></span>
          <button
            type="button"
            :disabled="loadState === 'loading' || liveLoadState === 'loading'"
            @click="refreshAll"
          >
            {{ loadState === 'loading' || liveLoadState === 'loading' ? 'Обновляем…' : 'Обновить' }}
          </button>
        </div>
      </header>

      <section
        v-if="loadState === 'loading'"
        class="changelog-state"
        aria-live="polite"
      >
        <span>Журнал работ</span>
        <h2>Собираем текущую картину</h2>
        <p>Читаем события, ответственных, этапы и точки передачи.</p>
      </section>

      <section
        v-else-if="loadState === 'error'"
        class="changelog-state changelog-state-error"
        aria-live="assertive"
      >
        <span>Источник журнала</span>
        <h2>Не удалось загрузить события</h2>
        <p>{{ loadError }}</p>
        <button
          type="button"
          @click="loadChangelog"
        >
          Повторить
        </button>
      </section>

      <template v-else-if="changelog">
        <section
          class="changelog-overview"
          aria-label="Сводка журнала"
        >
          <article class="overview-lead">
            <span>Сейчас в работе</span>
            <strong>{{ overviewSummary.active }}</strong>
            <p>единиц работы требуют следующего действия</p>
          </article>
          <article>
            <span>На проверке</span>
            <strong>{{ overviewSummary.inReview }}</strong>
          </article>
          <article :data-alert="overviewSummary.blocked > 0">
            <span>С блокерами</span>
            <strong>{{ overviewSummary.blocked }}</strong>
          </article>
          <article>
            <span>Участники</span>
            <strong>{{ overviewSummary.participants }}</strong>
          </article>
          <article>
            <span>События</span>
            <strong>{{ overviewSummary.events }}</strong>
          </article>
        </section>

        <section
          class="release-track-section"
          aria-labelledby="release-track-title"
        >
          <div class="section-heading release-track-heading">
            <div>
              <span>Живой путь из MCP</span>
              <h2 id="release-track-title">
                Что коллеги хотят выпустить
              </h2>
              <p>Намерение, сделанные шаги, текущий ответственный и точка продолжения.</p>
            </div>
            <div
              class="live-indicator"
              :data-state="liveLoadState"
            >
              <i />{{ liveLoadState === 'ready' ? 'MCP live' : liveLoadState === 'loading' ? 'Подключаем…' : 'Нет связи' }}
            </div>
          </div>

          <div
            v-if="liveLoadState === 'ready' && liveActivity"
            class="release-metrics"
            aria-label="Сводка живой работы"
          >
            <span><b>{{ liveActivity.summary.active }}</b> в работе</span>
            <span><b>{{ liveActivity.summary.in_review }}</b> на проверке</span>
            <span data-ready><b>{{ liveActivity.summary.ready_for_release }}</b> готовы к выпуску</span>
            <span><b>{{ liveActivity.summary.released }}</b> опубликованы</span>
          </div>

          <div
            v-if="liveLoadState === 'loading'"
            class="live-work-state"
            aria-live="polite"
          >
            Загружаем персональные MCP-события…
          </div>
          <div
            v-else-if="liveLoadState === 'error'"
            class="live-work-state live-work-state-error"
            aria-live="assertive"
          >
            <div><b>Живой поток временно недоступен</b><span>{{ liveLoadError }}</span></div>
            <button
              type="button"
              @click="loadWorkActivity"
            >
              Повторить
            </button>
          </div>
          <div
            v-else-if="!liveWorkItems.length"
            class="live-work-state"
          >
            Коллеги ещё не открывали рабочих пакетов. Первый вызов <code>start_work</code> появится здесь сразу.
          </div>

          <div
            v-else
            class="release-work-list"
          >
            <ReleaseWorkCard
              v-for="item in liveWorkItems"
              :key="item.work_id"
              :item="item"
            />
          </div>

          <p
            v-if="releaseCandidates.length"
            class="release-candidate-note"
          >
            {{ releaseCandidates.length }} {{ releaseCandidates.length === 1 ? 'результат ждёт' : 'результата ждут' }} решения по выпуску.
          </p>
        </section>

        <section
          class="changelog-toolbar"
          aria-label="Фильтры журнала"
        >
          <label class="search-control">
            <span class="visually-hidden">Поиск по журналу</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            ><circle
              cx="11"
              cy="11"
              r="6.5"
            /><path d="m16 16 4 4" /></svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Модуль, страница, участник, следующий шаг…"
            >
          </label>
          <label>
            <span class="visually-hidden">Фильтр по этапу</span>
            <select v-model="selectedStage">
              <option
                v-for="stage in stageOptions"
                :key="stage.value"
                :value="stage.value"
              >{{ stage.label }}</option>
            </select>
          </label>
          <label>
            <span class="visually-hidden">Фильтр по участнику</span>
            <select v-model="selectedParticipant">
              <option value="all">Все участники</option>
              <option
                v-for="person in changelog.participants"
                :key="person.key"
                :value="person.key"
              >
                {{ person.name }} · {{ person.kind === 'agent' ? 'агент' : 'человек' }}
              </option>
            </select>
          </label>
          <label class="completed-toggle">
            <input
              v-model="showCompleted"
              type="checkbox"
            >
            <span>Показывать завершённое</span>
          </label>
        </section>

        <section
          v-if="hasStaticActiveWork"
          class="work-section"
          aria-labelledby="active-work-title"
        >
          <div class="section-heading">
            <div>
              <span>Из локального журнала</span>
              <h2 id="active-work-title">
                Другие активные работы
              </h2>
            </div>
            <b>{{ activeWorkItems.length }}</b>
          </div>

          <div
            v-if="activeWorkItems.length"
            class="work-grid"
          >
            <article
              v-for="item in activeWorkItems"
              :key="item.work_id"
              class="work-card"
              :data-stage="item.stage"
            >
              <header>
                <div>
                  <span class="stage-pill">{{ item.stage_label }}</span>
                  <span class="work-id">{{ item.work_id }}</span>
                </div>
                <span class="event-count">{{ item.event_count }} {{ item.event_count === 1 ? 'событие' : 'события' }}</span>
              </header>

              <h3>{{ item.title }}</h3>
              <p class="work-summary">
                {{ item.summary }}
              </p>

              <div class="people-row">
                <div>
                  <span>Ответственный сейчас</span>
                  <strong>{{ item.owner.name }} <small>{{ item.owner.kind === 'agent' ? 'AI' : 'человек' }}</small></strong>
                </div>
                <div>
                  <span>Последнее изменение</span>
                  <strong>{{ item.last_actor.name }}</strong>
                  <small>{{ formatChangelogDate(item.updated_at) }}</small>
                </div>
              </div>

              <div class="tag-row">
                <span
                  v-for="area in item.areas"
                  :key="area"
                >{{ area }}</span>
                <a
                  v-for="route in displayChangelogRoutes(item.routes)"
                  :key="route"
                  :href="route"
                >{{ route }}</a>
              </div>

              <section
                v-if="item.done.length"
                class="handoff-block handoff-done"
              >
                <span>Уже сделано</span>
                <ul>
                  <li
                    v-for="point in item.done"
                    :key="point"
                  >
                    {{ point }}
                  </li>
                </ul>
              </section>

              <section
                v-if="item.next_step"
                class="handoff-block handoff-next"
              >
                <span>Продолжить отсюда</span>
                <p>{{ item.next_step }}</p>
              </section>

              <section
                v-if="item.blockers.length"
                class="handoff-block handoff-blocked"
              >
                <span>Что мешает</span>
                <ul>
                  <li
                    v-for="blocker in item.blockers"
                    :key="blocker"
                  >
                    {{ blocker }}
                  </li>
                </ul>
              </section>

              <details class="technical-trace">
                <summary>Технический след</summary>
                <div>
                  <p><span>Ветка</span><code>{{ item.source.branch ?? 'не указана' }}</code></p>
                  <p><span>Коммит</span><code>{{ shortChangelogCommit(item.source.commit) }}</code></p>
                  <p
                    v-for="file in item.files"
                    :key="file"
                  >
                    <span>Файл</span><code>{{ file }}</code>
                  </p>
                  <p
                    v-for="check in item.verification"
                    :key="check"
                  >
                    <span>Проверка</span><b>{{ check }}</b>
                  </p>
                  <a
                    v-for="link in displayChangelogLinks(item.links)"
                    :key="link.url"
                    :href="link.url"
                  >{{ link.label }}</a>
                </div>
              </details>
            </article>
          </div>

          <div
            v-else
            class="empty-result"
          >
            <h3>Ничего не найдено</h3>
            <p>Сбросьте фильтры или измените запрос.</p>
          </div>
        </section>

        <section
          v-if="completedWorkItems.length"
          class="work-section completed-section"
          aria-labelledby="completed-work-title"
        >
          <div class="section-heading">
            <div>
              <span>Закрытый слой</span>
              <h2 id="completed-work-title">
                Принято и опубликовано
              </h2>
            </div>
            <b>{{ completedWorkItems.length }}</b>
          </div>
          <div class="completed-list">
            <article
              v-for="item in completedWorkItems"
              :key="item.work_id"
              :data-stage="item.stage"
            >
              <span class="stage-pill">{{ item.stage_label }}</span>
              <div class="completed-copy">
                <h3>{{ item.title }}</h3>
                <p>{{ item.summary }}</p>
                <div
                  v-if="item.routes.length || item.links.length"
                  class="completed-links"
                >
                  <a
                    v-for="route in displayChangelogRoutes(item.routes)"
                    :key="route"
                    :href="route"
                  >{{ route }}</a>
                  <a
                    v-for="link in displayChangelogLinks(item.links)"
                    :key="link.url"
                    :href="link.url"
                  >{{ link.label }}</a>
                </div>
              </div>
              <div><strong>{{ item.owner.name }}</strong><span>{{ formatChangelogDate(item.updated_at) }}</span></div>
            </article>
          </div>
        </section>

        <section
          class="timeline-section"
          aria-labelledby="timeline-title"
        >
          <div class="section-heading">
            <div>
              <span>Неизменяемая история</span>
              <h2 id="timeline-title">
                Все события
              </h2>
            </div>
            <b>{{ filteredEvents.length }}</b>
          </div>

          <div class="timeline-list">
            <article
              v-for="event in filteredEvents"
              :key="event.event_id"
              class="timeline-event"
              :data-stage="event.stage"
            >
              <div class="timeline-marker">
                <span />
              </div>
              <div class="timeline-meta">
                <time :datetime="event.occurred_at">{{ formatChangelogDate(event.occurred_at) }}</time>
                <span>{{ event.actor.name }}</span>
              </div>
              <div class="timeline-content">
                <header><span class="stage-pill">{{ event.stage_label }}</span><b>{{ event.action_label }}</b></header>
                <h3>{{ event.title }}</h3>
                <p>{{ event.summary }}</p>
                <div
                  v-if="event.routes.length || event.links.length"
                  class="event-links"
                >
                  <a
                    v-for="route in displayChangelogRoutes(event.routes)"
                    :key="route"
                    :href="route"
                  >{{ route }}</a>
                  <a
                    v-for="link in displayChangelogLinks(event.links)"
                    :key="link.url"
                    :href="link.url"
                  >{{ link.label }}</a>
                </div>
                <div
                  v-if="event.next_step"
                  class="timeline-next"
                >
                  <span>Следующий шаг</span>{{ event.next_step }}
                </div>
                <div class="timeline-footer">
                  <span>Дальше отвечает: <b>{{ event.owner.name }}</b></span>
                  <code>{{ event.work_id }}</code>
                </div>
              </div>
            </article>
          </div>
        </section>
      </template>
    </section>
  </main>
</template>

<style scoped src="../styles/changelog.css"></style>
