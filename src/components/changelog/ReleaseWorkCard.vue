<script setup lang="ts">
import { computed } from 'vue'
import {
  displayChangelogRoutes,
  formatChangelogDate,
  formatRussianCount,
  livePreviewLaunchPath,
  releaseDecisionSummary,
} from '@/lib/changelogDisplay'
import type { LiveWorkItem } from '@/types/changelog'

const props = defineProps<{
  item: LiveWorkItem
}>()

const routes = computed(() => displayChangelogRoutes(props.item.routes))
const previewLaunchPath = computed(() => livePreviewLaunchPath(props.item))
const previewNeedsRebuild = computed(() => props.item.preview?.state === 'incompatible')
const decisionSummary = computed(() => releaseDecisionSummary(props.item))
const changeCount = computed(() => formatRussianCount(props.item.changes.length, 'изменение', 'изменения', 'изменений'))
const pathCount = computed(() => formatRussianCount(props.item.path.length, 'шаг', 'шага', 'шагов'))
const sourceLabel = computed(() => props.item.source === 'mcp_change_set' ? 'изменение дашборда' : 'работа по сайту')
</script>

<template>
  <article
    class="release-work-card"
    :data-stage="item.stage"
  >
    <header class="release-card-header">
      <div class="release-actor">
        <strong>{{ item.actor.label }}</strong>
        <span>{{ sourceLabel }}</span>
      </div>
      <div class="release-status">
        <span class="release-stage-pill">{{ item.stage_label }}</span>
        <time :datetime="item.updated_at">{{ formatChangelogDate(item.updated_at) }}</time>
      </div>
    </header>

    <div class="release-decision">
      <section
        class="release-brief"
        aria-label="Суть результата"
      >
        <span>{{ item.release_summary ? 'Кандидат в релиз' : 'Намерение' }}</span>
        <h3>{{ item.title }}</h3>
        <p>{{ decisionSummary }}</p>
        <div
          class="release-counts"
          aria-label="Объём работы"
        >
          <span>{{ changeCount }}</span>
          <span>{{ pathCount }}</span>
          <span v-if="item.areas.length">{{ formatRussianCount(item.areas.length, 'зона', 'зоны', 'зон') }}</span>
        </div>
      </section>

      <aside
        class="release-handoff"
        aria-label="Ответственный и следующий шаг"
      >
        <span>Сейчас отвечает</span>
        <strong>{{ item.owner.label }}</strong>
        <p>{{ item.next_step }}</p>
        <a
          v-if="previewLaunchPath"
          class="release-primary-action"
          :href="previewLaunchPath"
        >
          Открыть preview
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
          ><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" /></svg>
        </a>
        <p
          v-else-if="previewNeedsRebuild"
          class="release-preview-warning"
          role="status"
        >
          Этот preview собран для старого экрана и не применяется к текущему Bento. Нужен новый пакет для main.dashboard.
        </p>
      </aside>
    </div>

    <details class="release-details">
      <summary>
        <span>Детали работы</span>
        <small>изменения, путь и проверки</small>
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
        ><path d="m4 6 4 4 4-4" /></svg>
      </summary>

      <div class="release-details-body">
        <section
          v-if="item.changes.length"
          class="release-detail-section"
        >
          <h4>Что меняется</h4>
          <ul class="release-change-list">
            <li
              v-for="change in item.changes"
              :key="`${change.block_id}:${change.operation}`"
            >
              {{ change.summary }}
            </li>
          </ul>
        </section>

        <section
          v-if="item.path.length"
          class="release-detail-section"
        >
          <h4>Путь работы</h4>
          <ol
            class="release-path"
            aria-label="Путь работы"
          >
            <li
              v-for="event in item.path"
              :key="event.event_id"
            >
              <i />
              <div>
                <span>{{ event.action_label }}</span>
                <p>{{ event.summary }}</p>
                <small>{{ event.actor.label }} · {{ formatChangelogDate(event.occurred_at) }}</small>
              </div>
            </li>
          </ol>
        </section>

        <section class="release-detail-section release-technical-trace">
          <h4>Технический след</h4>
          <dl>
            <div><dt>Пакет</dt><dd><code>{{ item.work_id }}</code></dd></div>
            <div v-if="item.areas.length">
              <dt>Зоны</dt><dd>{{ item.areas.join(' · ') }}</dd>
            </div>
            <div v-if="routes.length">
              <dt>Маршруты</dt><dd>
                <a
                  v-for="route in routes"
                  :key="route"
                  :href="route"
                >{{ route }}</a>
              </dd>
            </div>
            <div v-if="item.done.length">
              <dt>Готово</dt><dd>{{ item.done.join(' · ') }}</dd>
            </div>
            <div v-if="item.verification.length">
              <dt>Проверено</dt><dd>{{ item.verification.join(' · ') }}</dd>
            </div>
            <div v-if="item.files.length">
              <dt>Файлы</dt><dd><code>{{ item.files.join(' · ') }}</code></dd>
            </div>
          </dl>
        </section>
      </div>
    </details>
  </article>
</template>

<style scoped src="../../styles/changelog-release-card.css"></style>
