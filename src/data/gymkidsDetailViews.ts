import type { DeepReadonly } from 'vue'
import type { DashboardSourceRow, GymkidsDashboardView } from './gymkidsSnapshot'

export interface SourceDetailRow extends DashboardSourceRow {
  attendanceRate: number
  attendanceRateLabel: string
}

export interface SourceDetailInsight {
  key: 'volume' | 'validity' | 'attendance'
  eyebrow: string
  label: string
  value: string
  helper: string
}

export interface GymkidsSourcesDetailView {
  total: number
  totalLabel: string
  periodLabel: string
  selectedDateLabel: string
  rows: SourceDetailRow[]
  insights: SourceDetailInsight[]
}

export type GymkidsMetricDetailKey = 'conversion' | 'validity' | 'site' | 'promo' | 'trial' | 'path'

export interface MetricDetailStep {
  label: string
  value: string
  helper: string
}

export interface MetricDetailTableCell {
  value: string
  helper: string
}

export interface MetricDetailTableRow {
  key: string
  label: string
  cells: MetricDetailTableCell[]
}

export interface GymkidsMetricDetailView {
  key: GymkidsMetricDetailKey
  eyebrow: string
  title: string
  periodLabel: string
  selectedDateLabel: string
  heroValue: string
  heroUnit: string
  heroHelper: string
  steps: MetricDetailStep[]
  tableEyebrow: string
  tableTitle: string
  tableNote: string
  columns: string[]
  rows: MetricDetailTableRow[]
  insights: SourceDetailInsight[]
}

const round = (value: number, precision = 1) => {
  const factor = 10 ** precision

  return Math.round(value * factor) / factor
}

const percentage = (value: number, total: number) => total > 0 ? round((value / total) * 100) : 0
const formatPercentage = (value: number) => `${String(round(value)).replace('.', ',')}%`
const formatNumber = (value: number) => value.toLocaleString('ru-RU')

const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
}).format(new Date(`${value}T00:00:00Z`))

const maxBy = <T>(rows: T[], getValue: (row: T) => number): T | undefined => rows.reduce<T | undefined>((best, row) => {
  if (!best || getValue(row) > getValue(best))
    return row

  return best
}, undefined)

export const buildGymkidsSourcesDetailView = (dashboard: DeepReadonly<GymkidsDashboardView>): GymkidsSourcesDetailView => {
  const rows = dashboard.sources.map(source => {
    const attendanceRate = percentage(source.reached, source.scheduled)

    return {
      ...source,
      attendanceRate,
      attendanceRateLabel: formatPercentage(attendanceRate),
    }
  })

  const activeRows = rows.filter(row => row.fact > 0)
  const volumeLeader = maxBy(activeRows, row => row.fact)
  const validityLeader = maxBy(activeRows, row => row.validRate)
  const attendanceLeader = maxBy(activeRows.filter(row => row.scheduled > 0), row => row.attendanceRate)

  return {
    total: dashboard.leads.fact,
    totalLabel: dashboard.leads.factLabel,
    periodLabel: dashboard.meta.periodLabel,
    selectedDateLabel: formatDate(dashboard.meta.selectedDate),
    rows,
    insights: [
      {
        key: 'volume',
        eyebrow: 'Максимум лидов',
        label: volumeLeader?.label ?? 'Нет данных',
        value: volumeLeader?.factLabel ?? '—',
        helper: volumeLeader ? `${volumeLeader.shareLabel} всего потока` : 'В выбранном срезе лидов нет',
      },
      {
        key: 'validity',
        eyebrow: 'Лучшая валидность',
        label: validityLeader?.label ?? 'Нет данных',
        value: validityLeader ? formatPercentage(validityLeader.validRate) : '—',
        helper: validityLeader ? `${validityLeader.valid} из ${validityLeader.fact} лидов` : 'В выбранном срезе лидов нет',
      },
      {
        key: 'attendance',
        eyebrow: 'Лучшая доходимость',
        label: attendanceLeader?.label ?? 'Нет данных',
        value: attendanceLeader?.attendanceRateLabel ?? '—',
        helper: attendanceLeader ? `${attendanceLeader.reached} из ${attendanceLeader.scheduled} записанных` : 'Нет записей на пробное',
      },
    ],
  }
}

const sourceRows = (dashboard: DeepReadonly<GymkidsDashboardView>, cell: (source: DeepReadonly<DashboardSourceRow>) => MetricDetailTableCell[]) => (
  dashboard.sources.map(source => ({
    key: source.key,
    label: source.label,
    cells: cell(source),
  }))
)

const step = (label: string, value: number, rate: number): MetricDetailStep => ({
  label,
  value: formatNumber(value),
  helper: formatPercentage(rate),
})

const insight = (key: SourceDetailInsight['key'], eyebrow: string, label: string, value: string, helper: string): SourceDetailInsight => ({
  key,
  eyebrow,
  label,
  value,
  helper,
})

export const buildGymkidsMetricDetailView = (
  key: GymkidsMetricDetailKey,
  dashboard: DeepReadonly<GymkidsDashboardView>,
): GymkidsMetricDetailView => {
  const leads = dashboard.leads.fact
  const scheduled = dashboard.cohort.scheduled
  const reached = dashboard.trial.reached
  const conversionRate = percentage(scheduled, leads)
  const reachedFromLeadsRate = percentage(reached, leads)
  const cohortReached = dashboard.cohort.reached
  const calendarNumber = (value: number) => dashboard.trial.available ? formatNumber(value) : '—'

  const calendarStep = (label: string, value: number, rate: number): MetricDetailStep => ({
    label, value: calendarNumber(value), helper: dashboard.trial.available ? formatPercentage(rate) : 'Нет данных',
  })

  const activeSources = dashboard.sources.filter(source => source.fact > 0)
  const bestReachedSource = maxBy(activeSources, source => source.reachedRate)

  const base = {
    key,
    periodLabel: dashboard.meta.periodLabel,
    selectedDateLabel: formatDate(dashboard.meta.selectedDate),
  }

  if (key === 'conversion') {
    return {
      ...base,
      eyebrow: 'Показатели периода',
      title: 'Лиды и пробные за период',
      heroValue: dashboard.trial.available ? formatPercentage(reachedFromLeadsRate) : '—',
      heroUnit: 'пробных к лидам периода',
      heroHelper: `${calendarNumber(reached)} дошли · ${leads} лидов периода`,
      steps: [
        step('Лиды', leads, 100),
        step('Валидные', dashboard.quality.valid, dashboard.quality.validRate),
        { label: 'Назначены на период', value: calendarNumber(dashboard.trial.scheduled), helper: 'Все месяцы создания лида' },
        calendarStep('Дошли', reached, dashboard.trial.attendanceRate),
      ],
      tableEyebrow: 'Каналы',
      tableTitle: 'Источники — отдельный когортный срез',
      tableNote: 'Только лиды выбранного периода, включая пробные других месяцев. Это не разбивка общего календаря пробных.',
      columns: ['Лиды', 'Записаны', 'Дошли', 'Конверсия'],
      rows: sourceRows(dashboard, source => [
        { value: source.factLabel, helper: source.shareLabel },
        { value: formatNumber(source.scheduled), helper: formatPercentage(source.scheduledRate) },
        { value: formatNumber(source.reached), helper: formatPercentage(source.reachedRate) },
        { value: formatPercentage(source.reachedRate), helper: 'от лидов' },
      ]),
      insights: [
        insight('volume', 'Дошли за период', 'Все месяцы лида', calendarNumber(reached), dashboard.trial.coverageNote),
        insight('validity', 'Лучшая конверсия', bestReachedSource?.label ?? 'Нет данных', bestReachedSource ? formatPercentage(bestReachedSource.reachedRate) : '—', bestReachedSource ? `${bestReachedSource.reached} дошли` : 'Нет лидов'),
        insight('attendance', 'Доходимость', 'Календарь пробных', dashboard.trial.attendanceRateLabel, `${calendarNumber(reached)} из ${calendarNumber(dashboard.trial.scheduled)} назначенных на период`),
      ],
    }
  }

  if (key === 'validity') {
    return {
      ...base,
      eyebrow: 'Качество лидов',
      title: 'Валидность заявок',
      heroValue: dashboard.quality.validRateLabel,
      heroUnit: 'валидных заявок',
      heroHelper: `${dashboard.quality.valid} из ${leads} лидов`,
      steps: [
        step('Валидные', dashboard.quality.valid, dashboard.quality.validRate),
        step('Невалидные', dashboard.quality.invalid, dashboard.quality.invalidRate),
        step('В работе', dashboard.quality.inWork, dashboard.quality.inWorkRate),
      ],
      tableEyebrow: 'Невалидные заявки',
      tableTitle: 'Причины отсева',
      tableNote: `CRM-срез: ${dashboard.quality.currentStages.map(stage => `${stage.label} — ${stage.value}`).join(' · ')}`,
      columns: ['Заявок', 'Доля'],
      rows: dashboard.quality.reasons.map(reason => ({
        key: reason.key,
        label: reason.label,
        cells: [
          { value: formatNumber(reason.value), helper: 'лидов' },
          { value: reason.shareLabel, helper: 'от невалидных' },
        ],
      })),
      insights: [
        insight('volume', 'Валидные', 'Готовы к движению', formatNumber(dashboard.quality.valid), dashboard.quality.validRateLabel),
        insight('validity', 'Невалидные', 'Исключены из воронки', formatNumber(dashboard.quality.invalid), dashboard.quality.invalidRateLabel),
        insight('attendance', 'В работе', 'Требуют решения', formatNumber(dashboard.quality.inWork), dashboard.quality.inWorkRateLabel),
      ],
    }
  }

  if (key === 'site' || key === 'promo') {
    const channel = key === 'site' ? dashboard.website : dashboard.promo
    const title = key === 'site' ? 'Сайт' : 'Промо'

    const cplNote = key === 'site'
      ? `CPL Яндекс: ${dashboard.website.cplLabel}. ${dashboard.website.cplBasis}`
      : dashboard.promo.agenciesAvailable
        ? dashboard.promo.agencies.map(agency => `${agency.label} — ${agency.value}`).join(' · ')
        : 'Разбивка по агентствам пока не передаётся.'

    return {
      ...base,
      eyebrow: 'Канал привлечения',
      title,
      heroValue: channel.factLabel,
      heroUnit: 'лидов в когорте',
      heroHelper: `${channel.forecastRateLabel} к плану · прогноз ${channel.forecastLabel}`,
      steps: [
        step('Лиды', channel.fact, 100),
        step('Валидные', channel.valid, channel.validRate),
        step('Записаны', channel.scheduled, channel.scheduledRate),
        step('Дошли', channel.reached, channel.reachedRate),
      ],
      tableEyebrow: 'Воронка канала',
      tableTitle: `Путь лидов «${title}»`,
      tableNote: cplNote,
      columns: ['Значение', 'От лидов'],
      rows: [
        { key: 'leads', label: 'Лиды', cells: [{ value: channel.factLabel, helper: channel.shareLabel }, { value: '100%', helper: 'база' }] },
        { key: 'valid', label: 'Валидные', cells: [{ value: formatNumber(channel.valid), helper: 'лидов' }, { value: formatPercentage(channel.validRate), helper: 'конверсия' }] },
        { key: 'scheduled', label: 'Записаны', cells: [{ value: formatNumber(channel.scheduled), helper: 'записей' }, { value: formatPercentage(channel.scheduledRate), helper: 'конверсия' }] },
        { key: 'reached', label: 'Дошли', cells: [{ value: formatNumber(channel.reached), helper: 'клиентов' }, { value: formatPercentage(channel.reachedRate), helper: 'конверсия' }] },
      ],
      insights: [
        insight('volume', 'План месяца', title, formatNumber(channel.plan), 'Утверждённая цель'),
        insight('validity', 'Прогноз', title, channel.forecastLabel, `${channel.forecastRateLabel} к плану`),
        insight('attendance', 'Дошли до пробного', title, formatNumber(channel.reached), `${formatPercentage(percentage(channel.reached, channel.scheduled))} от записанных`),
      ],
    }
  }

  if (key === 'trial') {
    return {
      ...base,
      eyebrow: 'Доходимость',
      title: 'Пробное занятие',
      heroValue: dashboard.trial.attendanceRateLabel,
      heroUnit: 'дошли до пробного',
      heroHelper: `${calendarNumber(reached)} из ${calendarNumber(dashboard.trial.scheduled)} назначенных на период`,
      steps: [
        calendarStep('Назначены на период', dashboard.trial.scheduled, 100),
        calendarStep('Дошли', reached, dashboard.trial.attendanceRate),
        calendarStep('Посещение не подтверждено', dashboard.trial.noConfirmation, percentage(dashboard.trial.noConfirmation, dashboard.trial.scheduled)),
      ],
      tableEyebrow: 'Пробные периода',
      tableTitle: 'Пробные по месяцу обращения',
      tableNote: `Только пробные выбранного периода, независимо от месяца появления лида. ${dashboard.trial.coverageNote}`,
      columns: ['Записаны', 'Дошли', 'Доходимость'],
      rows: dashboard.trial.byLeadMonth.map(month => ({
        key: month.period,
        label: new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month.period}-01T00:00:00Z`)),
        cells: [
          { value: formatNumber(month.scheduled), helper: 'на выбранные даты' },
          { value: formatNumber(month.reached), helper: 'посещений' },
          { value: formatPercentage(percentage(month.reached, month.scheduled)), helper: 'от записанных' },
        ],
      })),
      insights: [
        insight('volume', 'Назначены на период', 'Календарь пробных', calendarNumber(dashboard.trial.scheduled), 'Независимо от месяца создания лида'),
        insight('validity', 'Посещение не подтверждено', 'Без детализации причин', calendarNumber(dashboard.trial.noConfirmation), 'Не классифицируем как отмену или перенос'),
        insight('attendance', 'Лиды прошлых месяцев', 'Дошли в этом периоде', calendarNumber(dashboard.trial.previousLeadsReached), 'Включены в общий счётчик дошедших'),
      ],
    }
  }

  const pathDrops = [
    { label: 'Лид → валидный', value: Math.max(0, leads - dashboard.quality.valid) },
    { label: 'Валидный → записан', value: Math.max(0, dashboard.quality.valid - scheduled) },
    { label: 'Записан → дошёл', value: Math.max(0, scheduled - cohortReached) },
  ]

  return {
    ...base,
    eyebrow: 'Сквозная воронка',
    title: 'Путь до пробного',
    heroValue: formatNumber(cohortReached),
    heroUnit: 'дошли до пробного',
    heroHelper: `${formatPercentage(percentage(cohortReached, leads))} от ${leads} лидов; включая пробные других месяцев`,
    steps: [
      step('Лиды', leads, 100),
      step('Валидные', dashboard.quality.valid, dashboard.quality.validRate),
      step('Записаны', scheduled, conversionRate),
      step('Дошли', cohortReached, percentage(cohortReached, leads)),
    ],
    tableEyebrow: 'Каналы',
    tableTitle: 'Воронка по источникам',
    tableNote: 'Проценты в ячейках считаются от лидов канала.',
    columns: ['Лиды', 'Валидные', 'Записаны', 'Дошли'],
    rows: sourceRows(dashboard, source => [
      { value: source.factLabel, helper: source.shareLabel },
      { value: formatNumber(source.valid), helper: formatPercentage(source.validRate) },
      { value: formatNumber(source.scheduled), helper: formatPercentage(source.scheduledRate) },
      { value: formatNumber(source.reached), helper: formatPercentage(source.reachedRate) },
    ]),
    insights: pathDrops.map((drop, index) => insight(
      (['volume', 'validity', 'attendance'] as const)[index],
      `Потеря на шаге ${index + 1}`,
      drop.label,
      formatNumber(drop.value),
      'лидов в выбранной когорте',
    )),
  }
}
