export type BentoTruthGrade = 'fact' | 'partial' | 'unavailable'

export interface BentoSourceRow {
  key: string
  label: string
  leads: number
  valid: number
  scheduled: number
  reached: number
}

export interface BentoReasonRow {
  label: string
  value: number
}

export interface BentoStageRow {
  key: string
  label: string
  value: number
}

export interface GymKidsBentoContract {
  meta: {
    centerId: string
    centerName: string
    period: string
    periodLabel: string
    snapshotId: string
    generatedAt: string
    status: 'yellow'
    partial: true
  }
  leads: {
    fact: number
    plan: null
    forecast: null
    dailyAverage: number
    daily: readonly number[]
    truthGrade: BentoTruthGrade
  }
  cohort: {
    leads: number
    valid: number
    invalid: number
    inWork: number
    scheduled: number
    reached: number
  }
  trialCalendar: {
    scheduled: number
    reached: number
    noShow: number
  }
  sources: readonly BentoSourceRow[]
  invalidReasons: readonly BentoReasonRow[]
  stages: {
    knownLeads: number
    sourceLeads: number
    rows: readonly BentoStageRow[]
  }
  website: {
    leads: number
    valid: number
    reached: number
    yandexTagged: number
    yandexValid: number
    cpl: null
  }
  promo: {
    leads: number
    valid: number
    scheduled: number
    reached: number
    agencyCoverage: 'unavailable'
  }
  sourceQuality: readonly {
    label: string
    reached: number
  }[]
}

/** Данные предоставлены для демонстрации и не отражают реальные показатели центров. */
export const gymkidsBento: GymKidsBentoContract = {
  meta: {
    centerId: 'novo-peredelkino',
    centerName: 'Ново-Переделкино',
    period: '2026-07',
    periodLabel: 'Июль 2026 · демо',
    snapshotId: 'demo-2026-v1',
    generatedAt: '2026-09-08T09:00:00+03:00',
    status: 'yellow',
    partial: true,
  },
  leads: {
    fact: 680,
    plan: null,
    forecast: null,
    dailyAverage: 21.9,
    daily: [
      20,
      21,
      22,
      23,
      24,
      20,
      21,
      22,
      23,
      24,
      20,
      21,
      22,
      23,
      24,
      20,
      21,
      22,
      23,
      24,
      20,
      21,
      22,
      23,
      24,
      20,
      21,
      22,
      23,
      24,
      20,
    ],
    truthGrade: 'fact',
  },
  cohort: {
    leads: 680,
    valid: 420,
    invalid: 160,
    inWork: 100,
    scheduled: 300,
    reached: 240,
  },
  trialCalendar: {
    scheduled: 300,
    reached: 240,
    noShow: 60,
  },
  sources: [
    {
      key: 'website',
      label: 'Сайт',
      leads: 200,
      valid: 140,
      scheduled: 100,
      reached: 80,
    },
    {
      key: 'promo',
      label: 'Промо',
      leads: 180,
      valid: 120,
      scheduled: 90,
      reached: 70,
    },
    {
      key: 'other',
      label: 'Остальные',
      leads: 300,
      valid: 160,
      scheduled: 110,
      reached: 90,
    },
  ],
  invalidReasons: [
    {
      label: 'Дубль / есть сделка',
      value: 100,
    },
    {
      label: 'Глухой недозвон',
      value: 60,
    },
  ],
  stages: {
    knownLeads: 680,
    sourceLeads: 680,
    rows: [
      {
        key: 'demo',
        label: 'Демонстрационные данные',
        value: 680,
      },
    ],
  },
  website: {
    leads: 200,
    valid: 140,
    reached: 80,
    yandexTagged: 100,
    yandexValid: 70,
    cpl: null,
  },
  promo: {
    leads: 180,
    valid: 120,
    scheduled: 90,
    reached: 70,
    agencyCoverage: 'unavailable',
  },
  sourceQuality: [
    {
      label: 'Сайт',
      reached: 80,
    },
    {
      label: 'Промо',
      reached: 70,
    },
  ],
}
