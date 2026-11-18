import type { GymkidsTrialCalendar } from './gymkidsTrialCalendar'
import type { GymkidsDashboardView, GymkidsManifest, GymkidsSnapshotDetails, GymkidsSnapshotPayload } from './gymkidsSnapshotTypes'
import { selectSnapshotWindow, summarizeSnapshotCohort } from './gymkidsSnapshotAggregation'
import { buildSnapshotSources, fallbackSource } from './gymkidsSnapshotSources'
import { buildSnapshotQuality, normalizedWarnings } from './gymkidsSnapshotQuality'
import { metric, percent, round, toneForRate, valueOrZero } from './gymkidsSnapshotMetrics'
import { formatMoney, formatNumber, formatPercent, periodLabel } from './gymkidsSnapshotFormatting'

// Preserve the public import surface while implementation modules stay explicit.
export type {
  DashboardTone, DashboardLoadState, GymkidsManifestPeriod, GymkidsManifestCenter,
  GymkidsManifest, GymkidsSnapshotPayload, GymkidsSnapshotDetails,
  DashboardSourceRow, DashboardReasonRow, GymkidsDashboardView,
} from './gymkidsSnapshotTypes'

export const GYMKIDS_SNAPSHOT_RELEASE = 'real-2026-08-17-v2'
export const GYMKIDS_SNAPSHOT_SCHEMA = 'gymkids.manager-dashboard.v1'
export const GYMKIDS_MANIFEST_SCHEMA = 'gymkids.manifest.v1'

export const validateGymkidsManifest = (manifest: GymkidsManifest) => {
  if (manifest.schema_version !== GYMKIDS_MANIFEST_SCHEMA)
    throw new Error(`Версия манифеста ${manifest.schema_version || '—'} не поддерживается`)

  if (!manifest.centers?.length)
    throw new Error('В манифесте нет доступных центров')

  return manifest
}

const calculateDirectSpend = (details: GymkidsSnapshotDetails | null | undefined, selectedDate: string): number | null => {
  const direct = details?.direct
  if (direct?.available !== true || direct.daily?.available !== true)
    return null

  const rows = direct.daily.rows?.filter(row => row.date <= selectedDate)
  if (!rows?.length)
    return null

  let total = 0
  for (const row of rows) {
    const spend = metric(row.spend_rub)
    if (spend === null)
      return null
    total += spend
  }

  return total
}

export const adaptGymkidsSnapshot = (
  payload: GymkidsSnapshotPayload,
  details?: GymkidsSnapshotDetails | null,
  requestedDate?: string,
  trialCalendar?: GymkidsTrialCalendar,
): GymkidsDashboardView => {
  if (payload.schema_version !== GYMKIDS_SNAPSHOT_SCHEMA)
    throw new Error(`Версия данных ${payload.schema_version || '—'} не поддерживается`)

  if (!payload.overview?.days?.length)
    throw new Error('В снимке нет дневных данных')

  const selection = selectSnapshotWindow(payload, requestedDate)
  const { selectedRows, selectedDates, selectedDate, availableThroughDate, period } = selection

  const {
    approvedPlan, hasApprovedTotalPlan, elapsedDays, monthDays, fact, leadPlan,
    valid, invalid, inWork, cohortScheduled, cohortReached, validScheduled, validReached,
    leadForecast, forecastRate, scaleMax, dailyPlan, dailyFact, maxDaily, rowsByDay,
  } = summarizeSnapshotCohort(payload, details, selection)

  const { sources, sourcesSummary } = buildSnapshotSources(payload, selectedDates, elapsedDays, monthDays, fact, approvedPlan)
  const { reasons, currentStages } = buildSnapshotQuality(payload, details, selectedDates, invalid)

  const trial = trialCalendar ?? { available: false, scheduled: 0, reached: 0, previousLeadsScheduled: 0, previousLeadsReached: 0, coverageStart: '', missingPeriods: [], byLeadMonth: [], byDate: [], futureBookings: { available: false, scheduled: 0, byTrialMonth: [] } }
  const attendanceRate = percent(trial.reached, trial.scheduled)

  const directSpend = calculateDirectSpend(details, selectedDate)
  const yandexLeads = selectedDates.reduce((sum, date) => sum + valueOrZero(payload.overview.yandex_by_date[date]?.leads), 0)
  const cpl = directSpend !== null && yandexLeads > 0 ? directSpend / yandexLeads : null
  const websiteSource = fallbackSource(sources.find(source => source.key === 'website'), 'website', 'Заявка с сайта')
  const promoSource = fallbackSource(sources.find(source => source.key === 'promo'), 'promo', 'Промоутеры')
  const warnings = normalizedWarnings(payload)

  if (valid + invalid + inWork !== fact)
    warnings.push('Баланс валидности не совпадает с общим числом лидов.')

  if (sources.some(source => source.reached > source.scheduled || source.scheduled > source.valid || source.valid > source.fact))
    warnings.push('Для части источников опубликованные этапы воронки не являются строго вложенными.')

  return {
    meta: {
      centerId: payload.center.id,
      centerName: payload.center.display_name,
      period,
      periodLabel: periodLabel(period),
      selectedDate,
      availableThroughDate,
      elapsedDays,
      daysInPeriod: monthDays,
      dayLabel: `${elapsedDays} из ${monthDays} дней`,
      crmSnapshot: payload.time_contract.crm_snapshot.as_of,
      generatedAt: payload.generated_at,
      isPartial: payload.data_status.partial === true,
      warnings,
      planMode: hasApprovedTotalPlan ? 'approved' : 'required',
      planReady: hasApprovedTotalPlan,
      planNote: hasApprovedTotalPlan
        ? `Утверждённый план: ${approvedPlan!.source.workbook}, лист «${approvedPlan!.source.sheet}»`
        : approvedPlan
          ? `Общий план не заполнен в ${approvedPlan!.source.workbook}, лист «${approvedPlan!.source.sheet}»`
          : 'Для выбранного центра и месяца нет утверждённого плана',
    },
    leads: {
      fact,
      factLabel: formatNumber(fact),
      plan: leadPlan,
      planLabel: formatNumber(leadPlan),
      dailyPlan: round(dailyPlan),
      dailyPlanLabel: String(round(dailyPlan)).replace('.', ','),
      dailyFact: round(dailyFact),
      dailyFactLabel: String(round(dailyFact)).replace('.', ','),
      average: round(dailyFact),
      averageLabel: String(round(dailyFact)).replace('.', ','),
      forecast: leadForecast,
      forecastLabel: formatNumber(leadForecast),
      forecastRate,
      forecastRateLabel: formatPercent(forecastRate),
      scaleMax,
      planPosition: percent(leadPlan, scaleMax),
      forecastPosition: percent(leadForecast, scaleMax),
      tone: toneForRate(forecastRate, leadPlan > 0),
      progress: Math.min(100, percent(fact, leadPlan)),
      chart: Array.from({ length: monthDays }, (_, index) => {
        const day = index + 1
        const row = rowsByDay[day]
        const isElapsed = day <= elapsedDays
        const value = isElapsed ? valueOrZero(row?.leads) : null

        return {
          day,
          value,
          state: isElapsed ? 'elapsed' as const : 'future' as const,
          actualHeight: isElapsed ? round(((value ?? 0) / maxDaily) * 100) : 0,
          planHeight: round((dailyPlan / maxDaily) * 100),
          displayHeight: round(((isElapsed ? value ?? 0 : dailyPlan) / maxDaily) * 100),
        }
      }),
    },
    cohort: {
      available: selectedRows.every(row => metric(row.leads) !== null && metric(row.reached) !== null),
      scheduled: cohortScheduled,
      reached: cohortReached,
      validScheduled,
      validReached,
      nonValidScheduled: validScheduled === null ? null : cohortScheduled - validScheduled,
    },
    trial: {
      period,
      available: trial.available,
      previousLeadsScheduled: trial.previousLeadsScheduled,
      previousLeadsReached: trial.previousLeadsReached,
      coverageStart: trial.coverageStart,
      coverageNote: trial.available
        ? `Пробные по назначенной дате из текущих полей CRM, независимо от месяца лида. История лидов с ${trial.coverageStart}. Отметки посещения раньше даты пробного не считаются подтверждением; перезаписанные даты прошлых занятий не восстановлены.`
        : 'Общий календарь пробных недоступен: не загружены все месячные выборки.',
      scheduled: trial.scheduled,
      reached: trial.reached,
      noConfirmation: Math.max(0, trial.scheduled - trial.reached),
      attendanceRate,
      attendanceRateLabel: trial.available ? formatPercent(attendanceRate) : '—',
      byLeadMonth: trial.byLeadMonth,
      byDate: trial.byDate,
      futureBookings: trial.futureBookings,
    },
    quality: {
      valid,
      invalid,
      inWork,
      scheduled: cohortScheduled,
      reached: cohortReached,
      validRate: percent(valid, fact),
      validRateLabel: formatPercent(percent(valid, fact)),
      invalidRate: percent(invalid, fact),
      invalidRateLabel: formatPercent(percent(invalid, fact)),
      inWorkRate: percent(inWork, fact),
      inWorkRateLabel: formatPercent(percent(inWork, fact)),
      reasons,
      currentStages,
    },
    sources,
    sourcesSummary,
    website: {
      ...websiteSource,
      cpl,
      cplAvailable: cpl !== null,
      cplLabel: cpl === null ? '—' : formatMoney(cpl),
      cplBasis: 'расход Direct / лиды Яндекс CRM',
    },
    promo: {
      ...promoSource,
      agencies: [],
      agenciesAvailable: false,
    },
  }
}
