import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, ref } from 'vue'
import type { useGymkidsDashboard } from './useGymkidsDashboard'

type ReportSelectionState = Pick<ReturnType<typeof useGymkidsDashboard>,
  'dashboard' | 'centers' | 'selectedCenterId' | 'selectCenter' | 'selectPeriod' | 'selectDate'>

interface ReportSelectionOptions extends ReportSelectionState {
  resetFocusMotion: (animate?: boolean) => Promise<void>
  syncSelectionQuery: () => void
  replaceSelectionDate: (date: string) => void
}

export const useBentoReportSelection = ({
  dashboard, centers, selectedCenterId, selectCenter, selectPeriod,
  selectDate: selectDashboardDate, resetFocusMotion, syncSelectionQuery, replaceSelectionDate,
}: ReportSelectionOptions) => {
  const centerPickerRef = ref<HTMLElement | null>(null)
  const centerButtonRef = ref<HTMLButtonElement | null>(null)
  const centerListboxRef = ref<HTMLElement | null>(null)
  const isCenterMenuOpen = ref(false)
  const activeCenterIndex = ref(0)
  const selectedCenterIndex = computed(() => Math.max(0, centers.value.findIndex(center => center.center_id === selectedCenterId.value)))
  const selectedCenterLabel = computed(() => centers.value[selectedCenterIndex.value]?.display_name ?? 'Выбрать центр')
  const centerTriggerLabel = computed(() => `Выбрать центр. Сейчас ${selectedCenterLabel.value}`)
  const centerOptionId = (centerId: string) => `center-option-${centerId}`

  const activeCenterOptionId = computed(() => {
    const center = centers.value[activeCenterIndex.value]

    return center ? centerOptionId(center.center_id) : undefined
  })

  const calendarWeekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const
  const periodPickerRef = ref<HTMLElement | null>(null)
  const periodButtonRef = ref<HTMLButtonElement | null>(null)
  const isCalendarOpen = ref(false)
  const reportYear = computed(() => Number(dashboard.value?.meta.period.slice(0, 4) ?? new Date().getFullYear()))
  const reportMonth = computed(() => Number(dashboard.value?.meta.period.slice(5, 7) ?? 1))
  const selectedDay = computed(() => Number(dashboard.value?.meta.selectedDate.slice(-2) ?? 1))

  const calendarCells = computed(() => {
    const days = dashboard.value?.meta.daysInPeriod ?? 0
    const firstMonthDayOffset = (new Date(reportYear.value, reportMonth.value - 1, 1).getDay() + 6) % 7
    const calendarCellCount = Math.ceil((firstMonthDayOffset + days) / 7) * 7

    return Array.from({ length: calendarCellCount }, (_, index) => {
      const day = index - firstMonthDayOffset + 1

      return day > 0 && day <= days ? day : null
    })
  })

  const reportDateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
  const selectedDateLabel = computed(() => reportDateFormatter.format(new Date(reportYear.value, reportMonth.value - 1, selectedDay.value)))
  const availableThroughDay = computed(() => Number(dashboard.value?.meta.availableThroughDate.slice(-2) ?? 1))
  const lastAvailableDateLabel = computed(() => reportDateFormatter.format(new Date(reportYear.value, reportMonth.value - 1, availableThroughDay.value)))
  const selectedDayLabel = computed(() => `${selectedDay.value} из ${dashboard.value?.meta.daysInPeriod ?? 0} дней`)

  const freshnessFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  })

  const dataFreshnessLabel = computed(() => {
    const generatedAt = dashboard.value?.meta.generatedAt

    if (!generatedAt)
      return ''

    const generatedDate = new Date(generatedAt)

    return Number.isNaN(generatedDate.valueOf())
      ? `Срез по ${lastAvailableDateLabel.value}`
      : `Обновлено ${freshnessFormatter.format(generatedDate)} · срез по ${lastAvailableDateLabel.value}`
  })

  const periodTriggerLabel = computed(() => `Выбрать дату отчёта. Сейчас ${selectedDateLabel.value} ${reportYear.value} года`)

  const formatPeriodOption = (period: string) => new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${period}-01T00:00:00Z`))

  const calendarDayId = (day: number) => `report-day-${dashboard.value?.meta.period ?? 'period'}-${day}`

  const calendarDayLabel = (day: number) => {
    const label = reportDateFormatter.format(new Date(reportYear.value, reportMonth.value - 1, day))

    if (day > availableThroughDay.value)
      return `${label}, данных пока нет`

    if (day === availableThroughDay.value)
      return `${label}, последние доступные данные`

    return label
  }

  const leadDayTooltipLabel = (day: number, value: number) => {
    const date = reportDateFormatter.format(new Date(reportYear.value, reportMonth.value - 1, day))
    const absoluteValue = Math.abs(value)
    const lastTwoDigits = absoluteValue % 100
    const lastDigit = absoluteValue % 10

    const leadWord = lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? 'лидов'
      : lastDigit === 1
        ? 'лид'
        : lastDigit >= 2 && lastDigit <= 4
          ? 'лида'
          : 'лидов'

    return `${date} · ${value.toLocaleString('ru-RU')} ${leadWord}`
  }

  const focusCalendarDay = (day: number) => {
    const safeDay = Math.min(availableThroughDay.value, Math.max(1, day))

    document.getElementById(calendarDayId(safeDay))?.focus()
  }

  const scrollActiveCenterIntoView = () => {
    const optionId = activeCenterOptionId.value

    if (optionId)
      nextTick(() => document.getElementById(optionId)?.scrollIntoView({ block: 'nearest' }))
  }

  const setActiveCenterIndex = (index: number) => {
    const centerCount = centers.value.length

    if (!centerCount)
      return

    activeCenterIndex.value = (index + centerCount) % centerCount
    scrollActiveCenterIntoView()
  }

  const closeCenterMenu = (restoreFocus = false) => {
    isCenterMenuOpen.value = false

    if (restoreFocus)
      nextTick(() => centerButtonRef.value?.focus())
  }

  const closeCalendar = (restoreFocus = false) => {
    isCalendarOpen.value = false

    if (restoreFocus)
      nextTick(() => periodButtonRef.value?.focus())
  }

  const openCenterMenu = () => {
    closeCalendar()
    setActiveCenterIndex(selectedCenterIndex.value)
    isCenterMenuOpen.value = true

    nextTick(() => {
      centerListboxRef.value?.focus()
      scrollActiveCenterIntoView()
    })
  }

  const toggleCenterMenu = () => {
    if (isCenterMenuOpen.value)
      closeCenterMenu()
    else
      openCenterMenu()
  }

  const toggleCalendar = () => {
    closeCenterMenu()
    isCalendarOpen.value = !isCalendarOpen.value

    if (isCalendarOpen.value)
      nextTick(() => focusCalendarDay(selectedDay.value))
  }

  const selectReportDay = (day: number) => {
    const view = dashboard.value

    if (!view || day < 1 || day > availableThroughDay.value)
      return

    const date = `${view.meta.period}-${String(day).padStart(2, '0')}`

    resetFocusMotion(false).catch(() => undefined)
    selectDashboardDate(date)
    closeCalendar(true)

    replaceSelectionDate(date)
  }

  const selectCenterOption = async (centerId: string) => {
    closeCenterMenu(true)

    if (centerId === selectedCenterId.value)
      return

    await resetFocusMotion(false)
    await selectCenter(centerId)
    syncSelectionQuery()
  }

  const handleCenterButtonKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      openCenterMenu()

      if (event.key === 'Home')
        setActiveCenterIndex(0)
      else if (event.key === 'End')
        setActiveCenterIndex(centers.value.length - 1)

      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleCenterMenu()
    }
  }

  const handleCenterListboxKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveCenterIndex(activeCenterIndex.value + (event.key === 'ArrowDown' ? 1 : -1))

      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setActiveCenterIndex(event.key === 'Home' ? 0 : centers.value.length - 1)

      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()

      const center = centers.value[activeCenterIndex.value]

      if (center)
        selectCenterOption(center.center_id)

      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeCenterMenu(true)

      return
    }

    if (event.key === 'Tab')
      closeCenterMenu()
  }

  const handlePeriodChange = async (event: Event) => {
    await resetFocusMotion(false)
    await selectPeriod((event.target as HTMLSelectElement).value)
    closeCalendar()
    syncSelectionQuery()
  }

  const handleCalendarDayKeydown = (event: KeyboardEvent, day: number) => {
    const dayDelta = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }[event.key]

    if (dayDelta !== undefined) {
      event.preventDefault()
      focusCalendarDay(day + dayDelta)

      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusCalendarDay(1)
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusCalendarDay(availableThroughDay.value)
    }
  }

  onClickOutside(centerPickerRef, () => closeCenterMenu())
  onClickOutside(periodPickerRef, () => closeCalendar())

  return {
    centerPickerRef,
    centerButtonRef,
    centerListboxRef,
    isCenterMenuOpen,
    activeCenterIndex,
    selectedCenterLabel,
    centerTriggerLabel,
    centerOptionId,
    activeCenterOptionId,
    calendarWeekdays,
    periodPickerRef,
    periodButtonRef,
    isCalendarOpen,
    selectedDay,
    calendarCells,
    selectedDateLabel,
    availableThroughDay,
    lastAvailableDateLabel,
    selectedDayLabel,
    dataFreshnessLabel,
    periodTriggerLabel,
    formatPeriodOption,
    calendarDayId,
    calendarDayLabel,
    leadDayTooltipLabel,
    toggleCenterMenu,
    toggleCalendar,
    selectReportDay,
    selectCenterOption,
    setActiveCenterIndex,
    handleCenterButtonKeydown,
    handleCenterListboxKeydown,
    handlePeriodChange,
    handleCalendarDayKeydown,
    closeCenterMenu,
    closeCalendar,
  }
}
