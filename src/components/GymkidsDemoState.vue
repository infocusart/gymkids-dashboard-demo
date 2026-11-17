<script setup lang="ts">
import { computed } from 'vue'

type PreviewState = 'ready' | 'loading' | 'empty' | 'partial' | 'unavailable' | 'error'

const props = defineProps<{
  state: PreviewState
  label: string
}>()

const stateCopy = {
  ready: {
    eyebrow: 'Данные готовы',
    title: 'Показатели загружены',
    body: 'Фактический срез доступен.',
  },
  loading: {
    eyebrow: 'Загрузка',
    title: 'Собираем показатели',
    body: 'Подготавливаем данные за выбранный период.',
  },
  empty: {
    eyebrow: 'Нет данных',
    title: 'За период нет значений',
    body: 'Измените период или дождитесь первых обращений.',
  },
  partial: {
    eyebrow: 'Неполные данные',
    title: 'Покрытие периода частичное',
    body: 'Часть источников ещё не передала результат.',
  },
  unavailable: {
    eyebrow: 'Не подключено',
    title: 'Показатель пока недоступен',
    body: 'Здесь появятся данные после подключения источника.',
  },
  error: {
    eyebrow: 'Ошибка источника',
    title: 'Не удалось получить данные',
    body: 'Повторите загрузку или проверьте источник.',
  },
} as const

const copy = computed(() => stateCopy[props.state])
</script>

<template>
  <div
    class="demo-state"
    :data-state="state"
    role="status"
    :aria-label="`${label}: ${copy.title}`"
  >
    <span>{{ label }} · {{ copy.eyebrow }}</span>
    <strong>{{ copy.title }}</strong>
    <p>{{ copy.body }}</p>

    <div
      v-if="state === 'loading'"
      class="state-skeleton"
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
    </div>
  </div>
</template>

<style scoped>
.demo-state {
  position: absolute;
  z-index: 3;
  display: flex;
  inset: 18px;
  flex-direction: column;
  justify-content: center;
  color: inherit;
}

.demo-state > span {
  color: currentcolor;
  font-size: 13px;
  font-weight: 760;
  letter-spacing: .07em;
  opacity: .52;
  text-transform: uppercase;
}

.demo-state > strong {
  max-inline-size: 26ch;
  margin-block-start: 7px;
  font-size: clamp(19px, 2vw, 28px);
  font-weight: 720;
  letter-spacing: -.045em;
  line-height: 1;
}

.demo-state > p {
  max-inline-size: 38ch;
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.35;
  opacity: .62;
}

.demo-state[data-state="partial"] > strong { color: #b87418; }
.demo-state[data-state="error"] > strong { color: #d6574f; }

.state-skeleton {
  display: grid;
  inline-size: min(100%, 230px);
  margin-block-start: 12px;
  gap: 5px;
}

.state-skeleton i {
  block-size: 6px;
  border-radius: 99px;
  background: currentcolor;
  opacity: .12;
  transform-origin: left;
  animation: state-pulse 900ms ease-in-out infinite alternate;
}

.state-skeleton i:nth-child(2) { inline-size: 74%; }
.state-skeleton i:nth-child(3) { inline-size: 48%; }

@keyframes state-pulse {
  from { opacity: .08; transform: scaleX(.86); }
  to { opacity: .18; transform: scaleX(1); }
}

@media (max-width: 720px) {
  .demo-state { inset: 21px; }
  .demo-state > span { font-size: 13px; }
  .demo-state > strong { font-size: 24px; }
  .demo-state > p { font-size: 15px; }
}

@media (prefers-reduced-motion: reduce) {
  .state-skeleton i { animation: none; }
}
</style>
