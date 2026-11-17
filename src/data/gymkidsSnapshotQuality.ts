import { ACTIVE_STAGE_KEYS } from './gymkidsSnapshotTypes'
import type { GymkidsDashboardView, GymkidsSnapshotDetails, GymkidsSnapshotPayload } from './gymkidsSnapshotTypes'
import { percent, valueOrZero } from './gymkidsSnapshotMetrics'
import { formatPercent } from './gymkidsSnapshotFormatting'

export const normalizedWarnings = (payload: GymkidsSnapshotPayload) => (payload.data_status.warnings ?? [])
  .map(warning => typeof warning === 'string' ? warning : warning.message ?? warning.code ?? '')
  .filter(Boolean)

export const buildSnapshotQuality = (
  payload: GymkidsSnapshotPayload,
  details: GymkidsSnapshotDetails | null | undefined,
  selectedDates: string[],
  invalid: number,
): Pick<GymkidsDashboardView['quality'], 'reasons' | 'currentStages'> => {
  const groupedReasons = payload.overview.invalid_reason_order.map((label, index) => {
    const value = selectedDates.reduce((sum, date) => sum + valueOrZero(payload.overview.invalid_reasons_by_date[date]?.[label]), 0)

    return {
      key: `reason-${index + 1}`,
      label,
      value,
      share: percent(value, invalid),
      shareLabel: formatPercent(percent(value, invalid)),
    }
  })

  const detailedReasonCatalog = details?.invalid_reasons?.catalog ?? []
  const detailedReasonsByDate = details?.invalid_reasons?.by_lead_date

  const detailedReasons = detailedReasonsByDate
    && detailedReasonCatalog.length > 0
    && selectedDates.every(date => detailedReasonsByDate[date])
    ? detailedReasonCatalog.map(reason => {
      const value = selectedDates.reduce((sum, date) => sum + valueOrZero(detailedReasonsByDate[date]?.[reason.key]), 0)

      return {
        key: reason.key,
        label: reason.label,
        value,
        share: percent(value, invalid),
        shareLabel: formatPercent(percent(value, invalid)),
      }
    })
    : null

  const reasons = (detailedReasons?.reduce((sum, reason) => sum + reason.value, 0) === invalid
    ? detailedReasons
    : groupedReasons)
    .filter(reason => reason.value > 0)
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, 'ru'))

  const stageLabels = Object.fromEntries(payload.overview.stage_catalog.map(row => [row.key, row.label]))

  const currentStages = ACTIVE_STAGE_KEYS.map(key => ({
    key,
    label: stageLabels[key] ?? key,
    value: selectedDates.reduce((sum, date) => sum + valueOrZero(payload.overview.stages_by_key_by_date[date]?.[key]), 0),
  }))

  return { reasons, currentStages }
}
