import { computed, readonly, ref } from 'vue'
import { type TrialHistorySlice, buildGymkidsTrialCalendar, decodeGymkidsTrialHistory } from '@/data/gymkidsTrialCalendar'
import {
  type DashboardLoadState,
  GYMKIDS_SNAPSHOT_RELEASE,
  type GymkidsDashboardView,
  type GymkidsManifest,
  type GymkidsManifestCenter,
  type GymkidsManifestPeriod,
  type GymkidsSnapshotDetails,
  type GymkidsSnapshotPayload,
  adaptGymkidsSnapshot,
  validateGymkidsManifest,
} from '@/data/gymkidsSnapshot'

interface DashboardSelection {
  centerId?: string | null
  period?: string | null
  date?: string | null
}

interface DashboardOptions {
  dataBaseUrl?: string
  releaseId?: string
  requestTimeoutMs?: number
}

interface GymkidsCurrentPointer {
  schema_version: 'gymkids.current.v1'
  release_id: string
  manifest_path: string
  generated_at: string
  data_cutoff: string
}

const errorMessage = (error: unknown) => error instanceof TypeError
  ? 'Не удалось связаться с сервером. Проверьте соединение и нажмите «Повторить».'
  : error instanceof Error ? error.message : 'Не удалось загрузить данные. Нажмите «Повторить».'

const fetchJson = async <T>(url: URL, signal: AbortSignal): Promise<T> => {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok)
    throw new Error(`HTTP ${response.status}: данные недоступны`)

  try {
    return await response.json() as T
  }
  catch {
    throw new Error('Источник вернул повреждённый JSON')
  }
}

const absoluteUrl = (path: string, base?: URL) => {
  if (/^https?:\/\//i.test(path))
    return new URL(path)

  if (path.startsWith('/'))
    return new URL(path, window.location.origin)

  return new URL(path, base ?? window.location.href)
}

export const useGymkidsDashboard = (options: DashboardOptions = {}) => {
  const releaseId = (options.releaseId ?? import.meta.env.VITE_GYMKIDS_SNAPSHOT_RELEASE ?? '').trim()
  const dataBaseUrl = (options.dataBaseUrl ?? import.meta.env.VITE_GYMKIDS_DATA_BASE_URL ?? '/data').replace(/\/$/, '')
  const manifestUrl = ref(absoluteUrl(`${dataBaseUrl}/snapshots/${releaseId || GYMKIDS_SNAPSHOT_RELEASE}/manifest.json`))
  const current = ref<GymkidsCurrentPointer | null>(null)
  const state = ref<DashboardLoadState>('idle')
  const error = ref('')
  const manifest = ref<GymkidsManifest | null>(null)
  const payload = ref<GymkidsSnapshotPayload | null>(null)
  const details = ref<GymkidsSnapshotDetails | null>(null)
  const trialHistory = ref<TrialHistorySlice[]>([])
  const dashboard = ref<GymkidsDashboardView | null>(null)
  const selectedCenterId = ref('')
  const selectedPeriod = ref('')
  const selectedDate = ref('')
  let loadSequence = 0
  let controller: AbortController | null = null
  let requestedSelection: DashboardSelection = {}
  const requestTimeoutMs = options.requestTimeoutMs ?? 20_000

  interface LoadOperation {
    sequence: number
    signal: AbortSignal
    timedOut: boolean
    timer: ReturnType<typeof setTimeout>
  }

  const beginLoad = (): LoadOperation => {
    controller?.abort()
    controller = new AbortController()

    const operation = {
      sequence: ++loadSequence,
      signal: controller.signal,
      timedOut: false,
      timer: undefined as unknown as ReturnType<typeof setTimeout>,
    }

    const currentController = controller

    operation.timer = setTimeout(() => {
      operation.timedOut = true
      currentController.abort()
    }, requestTimeoutMs)
    state.value = 'loading'
    error.value = ''

    return operation
  }

  const assertCurrent = (operation: LoadOperation) => {
    if (operation.sequence !== loadSequence || operation.signal.aborted)
      throw new DOMException('Load cancelled', 'AbortError')
  }

  const loadFailed = (loadError: unknown, operation: LoadOperation) => {
    if (operation.sequence !== loadSequence)
      return
    if (operation.signal.aborted && !operation.timedOut)
      return

    payload.value = null
    details.value = null
    dashboard.value = null
    error.value = operation.timedOut
      ? 'Сервер не ответил за 20 секунд. Нажмите «Повторить» — выбранные центр и период сохранятся.'
      : errorMessage(loadError)
    state.value = 'error'
  }

  const optionalDetails = async (url: URL, signal: AbortSignal) => {
    try {
      return await fetchJson<GymkidsSnapshotDetails>(url, signal)
    }
    catch (loadError) {
      if (signal.aborted)
        throw loadError

      return null
    }
  }

  const centers = computed(() => manifest.value?.centers ?? [])
  const activeCenter = computed(() => centers.value.find(center => center.center_id === selectedCenterId.value) ?? null)
  const periods = computed(() => [...(activeCenter.value?.periods ?? [])].sort((left, right) => right.month.localeCompare(left.month)))
  const activePeriod = computed(() => periods.value.find(period => period.month === selectedPeriod.value) ?? null)

  const rebuildDashboard = () => {
    if (!payload.value)
      return

    const date = selectedDate.value >= payload.value.request.from && selectedDate.value <= payload.value.request.to
      ? selectedDate.value
      : payload.value.request.to

    const calendar = buildGymkidsTrialCalendar(trialHistory.value, payload.value.center.id, payload.value.request.from, date)

    dashboard.value = adaptGymkidsSnapshot(payload.value, details.value, selectedDate.value, calendar)
    selectedDate.value = dashboard.value.meta.selectedDate
  }

  const centerById = (centerId?: string | null) => centers.value.find(center => center.center_id === centerId)
  const periodByKey = (center: GymkidsManifestCenter, period?: string | null) => center.periods.find(item => item.month === period)

  const resolveManifestUrl = async (signal: AbortSignal) => {
    if (releaseId) {
      current.value = null

      return absoluteUrl(`${dataBaseUrl}/snapshots/${releaseId}/manifest.json`)
    }

    const pointerUrl = absoluteUrl(`${dataBaseUrl}/current.json`)
    const pointer = await fetchJson<GymkidsCurrentPointer>(pointerUrl, signal)

    if (
      pointer.schema_version !== 'gymkids.current.v1'
      || !/^[a-z0-9][a-z0-9.-]+$/.test(pointer.release_id)
      || pointer.manifest_path !== `snapshots/${pointer.release_id}/manifest.json`
    )
      throw new Error('Указатель текущего снимка повреждён')

    current.value = pointer

    return absoluteUrl(pointer.manifest_path, new URL('./', pointerUrl))
  }

  const readSnapshot = async (
    center: GymkidsManifestCenter,
    period: GymkidsManifestPeriod,
    date: string | null | undefined,
    operation: LoadOperation,
  ) => {
    const signal = operation.signal

    selectedCenterId.value = center.center_id
    selectedPeriod.value = period.month
    selectedDate.value = date ?? period.to
    requestedSelection = { centerId: center.center_id, period: period.month, date: selectedDate.value }

    const payloadUrl = absoluteUrl(period.payload_path, manifestUrl.value)
    const detailsUrl = period.details_path ? absoluteUrl(period.details_path, manifestUrl.value) : null

    const [nextPayload, nextDetails] = await Promise.all([
      fetchJson<GymkidsSnapshotPayload>(payloadUrl, signal),
      detailsUrl ? optionalDetails(detailsUrl, signal) : Promise.resolve(null),
    ])

    assertCurrent(operation)

    // Load disjoint lead cohorts from this immutable release; no raw CRM records.
    const nextHistory = center.trial_history_path
      ? decodeGymkidsTrialHistory(await fetchJson<unknown>(absoluteUrl(center.trial_history_path, manifestUrl.value), signal), center.center_id)
      : await Promise.all(center.periods.map(async sourcePeriod => ({
        period: sourcePeriod.month,
        details: sourcePeriod.month === period.month
          ? nextDetails
          : sourcePeriod.details_path
            ? await optionalDetails(absoluteUrl(sourcePeriod.details_path, manifestUrl.value), signal)
            : null,
      })))

    assertCurrent(operation)

    payload.value = nextPayload
    details.value = nextDetails
    trialHistory.value = nextHistory
    selectedDate.value = date ?? nextPayload.request.to
    rebuildDashboard()
    state.value = 'ready'
  }

  const loadSnapshot = async (center: GymkidsManifestCenter, period: GymkidsManifestPeriod, date?: string | null) => {
    const operation = beginLoad()
    try {
      await readSnapshot(center, period, date, operation)
    }
    catch (loadError) {
      loadFailed(loadError, operation)
    }
    finally {
      clearTimeout(operation.timer)
    }
  }

  const initialize = async (selection: DashboardSelection = requestedSelection) => {
    requestedSelection = { ...selection }

    const operation = beginLoad()
    try {
      const nextManifestUrl = await resolveManifestUrl(operation.signal)
      const nextManifest = validateGymkidsManifest(await fetchJson<GymkidsManifest>(nextManifestUrl, operation.signal))

      assertCurrent(operation)
      manifestUrl.value = nextManifestUrl
      manifest.value = nextManifest

      const center = centerById(selection.centerId)
        ?? centerById(nextManifest.default_center_id)
        ?? centers.value[0]

      const period = periodByKey(center, selection.period)
        ?? periodByKey(center, center.default_period)
        ?? [...center.periods].sort((left, right) => right.month.localeCompare(left.month))[0]

      if (!period)
        throw new Error(`Для центра «${center.display_name}» нет доступных периодов`)

      await readSnapshot(center, period, selection.date, operation)
    }
    catch (loadError) {
      loadFailed(loadError, operation)
    }
    finally {
      clearTimeout(operation.timer)
    }
  }

  const selectCenter = async (centerId: string) => {
    const center = centerById(centerId)

    if (!center)
      return

    const period = periodByKey(center, selectedPeriod.value)
      ?? periodByKey(center, center.default_period)
      ?? [...center.periods].sort((left, right) => right.month.localeCompare(left.month))[0]

    if (period)
      await loadSnapshot(center, period)
  }

  const selectPeriod = async (period: string) => {
    const center = activeCenter.value
    const nextPeriod = center ? periodByKey(center, period) : null

    if (center && nextPeriod)
      await loadSnapshot(center, nextPeriod)
  }

  const selectDate = (date: string) => {
    selectedDate.value = date
    requestedSelection = { centerId: selectedCenterId.value, period: selectedPeriod.value, date }
    rebuildDashboard()
  }

  const retry = async () => {
    const center = activeCenter.value
    const period = activePeriod.value

    if (center && period)
      await loadSnapshot(center, period, selectedDate.value)
    else
      await initialize(requestedSelection)
  }

  return {
    state: readonly(state),
    error: readonly(error),
    manifest: readonly(manifest),
    current: readonly(current),
    dashboard: readonly(dashboard),
    selectedCenterId: readonly(selectedCenterId),
    selectedPeriod: readonly(selectedPeriod),
    selectedDate: readonly(selectedDate),
    centers,
    periods,
    activeCenter,
    activePeriod,
    initialize,
    selectCenter,
    selectPeriod,
    selectDate,
    retry,
  }
}
