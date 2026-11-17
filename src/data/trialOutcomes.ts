export const trialOutcomesReport = {
  meta: {
    eyebrow: 'GYMKiDs · Ново‑Переделкино',
    title: 'Пробные занятия',
    subtitle: 'Запись и подтверждённое посещение',
    period: '1–28 февраля 2026',
    timeBasis: 'Когорта сделок, созданных в феврале',
    source: 'amoCRM',
    sourceRun: '20260626T125155Z',
    snapshotLabel: 'Зафиксированный исторический пакет',
  },
  totals: {
    scheduled: 236,
    confirmed: 185,
    withoutConfirmation: 51,
    confirmedRate: 78.4,
    withoutConfirmationRate: 21.6,
  },
  cards: [
    {
      key: 'scheduled',
      label: 'Назначено пробных',
      value: '236',
      helper: 'Дата и время пробного указаны в сделке',
      icon: 'tabler-calendar-event',
      tone: 'primary',
    },
    {
      key: 'confirmed',
      label: 'Посещение подтверждено',
      value: '185',
      helper: 'Факт подтверждённого посещения в CRM',
      icon: 'tabler-circle-check',
      tone: 'success',
    },
    {
      key: 'without-confirmation',
      label: 'Без подтверждения',
      value: '51',
      helper: 'Не переименовываем в «не пришли»',
      icon: 'tabler-clock-question',
      tone: 'warning',
    },
  ],
  outcomeRows: [
    {
      label: 'Подтверждённое посещение',
      value: 185,
      share: '78,4%',
      color: 'success',
      note: 'Подтверждено полем CRM в пределах февральской когорты.',
    },
    {
      label: 'Без подтверждения посещения',
      value: 51,
      share: '21,6%',
      color: 'warning',
      note: 'Разница между назначенными и подтверждёнными. Причина не предполагается.',
    },
  ],
  definitions: [
    {
      term: 'Назначено',
      meaning: 'У сделки заполнены дата и время пробного занятия.',
    },
    {
      term: 'Подтверждённое посещение',
      meaning: 'В CRM присутствует подтверждающий факт посещения пробного.',
    },
    {
      term: 'Без подтверждения',
      meaning: 'Назначение есть, но подтверждающий факт посещения в текущем пакете отсутствует.',
    },
  ],
  boundaries: [
    '«Без подтверждения» не означает автоматически, что человек не пришёл.',
    'Страница не показывает оплату, выручку, CAC, расписание или доступные слоты.',
    'Дневной ряд по дате пробного не выводится до отдельной сверенной витрины.',
  ],
} as const
