import type { GymkidsTrialCalendar } from './gymkidsTrialCalendar'

export type DashboardTone = 'positive' | 'warning' | 'negative' | 'neutral'
export type DashboardLoadState = 'idle' | 'loading' | 'ready' | 'error'

export const ACTIVE_STAGE_KEYS = [
  'assigned-operator',
  'contacting',
  'callback-agreed',
  'trial-scheduled',
] as const

export type SourceKey = string
export type ActiveStageKey = typeof ACTIVE_STAGE_KEYS[number]
export type MetricValue = number | null | { available?: boolean; value?: number | null }

export interface GymkidsManifestPeriod {
  month: string;
  from: string;
  to: string;
  payload_path: string;
  details_path?: string | null;
  data_status?: string;
  partial?: boolean;
}

export interface GymkidsManifestCenter {
  center_id: string;
  display_name: string;
  currency: string;
  timezone: string;
  default_period: string;
  periods: GymkidsManifestPeriod[];
  trial_history_path?: string;
  capabilities?: Record<string, boolean>;
}

export interface GymkidsManifest {
  schema_version: string;
  release_id: string;
  environment: string;
  generated_at: string;
  default_center_id: string;
  centers: GymkidsManifestCenter[];
}

export interface FunnelPath {
  leads: MetricValue;
  valid: MetricValue;
  scheduled: MetricValue;
  reached: MetricValue;
  valid_scheduled?: MetricValue;
  valid_reached?: MetricValue;
}

export interface FunnelDay {
  date: string;
  leads: MetricValue;
  valid: MetricValue;
  invalid: MetricValue;
  in_work: MetricValue;
  unknown?: MetricValue;
  scheduled: MetricValue;
  reached: MetricValue;
}

export interface StableCatalogRow {
  key: string;
  label: string;
}

export interface TrialCalendarDay {
  scheduled: MetricValue;
  reached: MetricValue;
  from_previous_months?: MetricValue;
}

export interface GymkidsSnapshotPayload {
  schema_version: string;
  generated_at: string;
  environment: string;
  request: {
    center_id: string;
    month: string;
    from: string;
    to: string;
    timezone: string;
  };
  center: {
    id: string;
    display_name: string;
    currency: string;
    timezone: string;
    capabilities?: Record<string, boolean>;
  };
  time_contract: {
    cohort: { basis: string; from: string; to: string };
    crm_snapshot: { as_of: string };
    trial_calendar: { basis: string; from: string; to: string };
  };
  data_status: {
    overall?: string;
    partial?: boolean;
    warnings?: Array<string | { message?: string; code?: string }>;
    sources?: Record<string, {
      available?: boolean;
      status?: string;
      metrics?: Record<string, MetricValue>;
    }>;
  };
  plan?: { month_days?: MetricValue };
  overview: {
    days: FunnelDay[];
    source_catalog: StableCatalogRow[];
    source_order_keys: string[];
    source_by_key_by_date: Record<string, Record<string, FunnelPath>>;
    invalid_reason_order: string[];
    invalid_reasons_by_date: Record<string, Record<string, MetricValue>>;
    stage_catalog: StableCatalogRow[];
    stage_order_keys: string[];
    stages_by_key_by_date: Record<string, Record<string, MetricValue>>;
    trial_calendar: Record<string, TrialCalendarDay>;
    yandex_by_date: Record<string, FunnelPath>;
  };
}

export interface GymkidsSnapshotDetails {
  schema_version: string;
  center?: { id: string };
  request?: { month: string };
  trial_cohort_matrix?: {
    lead_basis: string;
    trial_basis: string;
    scheduled?: number;
    reached?: number;
    cells: Array<{ lead_date: string; trial_date: string; scheduled: number; reached: number }>;
  };
  validity_trial_intersections?: {
    by_lead_date?: Record<string, {
      valid?: { leads?: MetricValue; scheduled?: MetricValue; reached?: MetricValue };
      invalid?: { scheduled?: MetricValue };
    }>;
  };
  invalid_reasons?: {
    catalog?: Array<{
      key: string;
      label: string;
      count?: number | null;
      group?: string;
    }>;
    by_lead_date?: Record<string, Record<string, MetricValue>>;
  };
  direct?: {
    available?: boolean;
    daily?: {
      available?: boolean;
      rows?: Array<{ date: string; spend_rub: MetricValue }>;
    };
  };
  promo_coverage?: {
    fields?: Record<string, {
      coverage_percent?: number | null;
      filled?: number | null;
      missing?: number | null;
      total?: number | null;
    }>;
  };
}

export interface DashboardSourceRow {
  key: SourceKey;
  label: string;
  fact: number;
  factLabel: string;
  plan: number;
  planAvailable?: boolean;
  valid: number;
  scheduled: number;
  reached: number;
  share: number;
  shareLabel: string;
  forecast: number;
  forecastLabel: string;
  forecastRate: number;
  forecastRateLabel: string;
  delta: number;
  deltaLabel: string;
  tone: DashboardTone;
  validRate: number;
  scheduledRate: number;
  reachedRate: number;
}

export interface DashboardReasonRow {
  key: string;
  label: string;
  value: number;
  share: number;
  shareLabel: string;
}

export interface GymkidsDashboardView {
  meta: {
    centerId: string;
    centerName: string;
    period: string;
    periodLabel: string;
    selectedDate: string;
    availableThroughDate: string;
    elapsedDays: number;
    daysInPeriod: number;
    dayLabel: string;
    crmSnapshot: string;
    generatedAt: string;
    isPartial: boolean;
    warnings: string[];
    planMode: 'approved' | 'required';
    planReady: boolean;
    planNote: string;
  };
  leads: {
    fact: number;
    factLabel: string;
    plan: number;
    planLabel: string;
    dailyPlan: number;
    dailyPlanLabel: string;
    dailyFact: number;
    dailyFactLabel: string;
    average: number;
    averageLabel: string;
    forecast: number;
    forecastLabel: string;
    forecastRate: number;
    forecastRateLabel: string;
    scaleMax: number;
    planPosition: number;
    forecastPosition: number;
    tone: DashboardTone;
    progress: number;
    chart: Array<{
      day: number;
      value: number | null;
      state: 'elapsed' | 'future';
      actualHeight: number;
      planHeight: number;
      displayHeight: number;
    }>;
  };
  cohort: {
    available: boolean;
    scheduled: number;
    reached: number;
    validScheduled: number | null;
    validReached: number | null;
    nonValidScheduled: number | null;
  };
  trial: {
    period: string;
    available: boolean;
    previousLeadsScheduled: number;
    previousLeadsReached: number;
    coverageStart: string;
    coverageNote: string;
    scheduled: number;
    reached: number;
    noConfirmation: number;
    attendanceRate: number;
    attendanceRateLabel: string;
    byLeadMonth: GymkidsTrialCalendar['byLeadMonth'];
    byDate: GymkidsTrialCalendar['byDate'];
    futureBookings: GymkidsTrialCalendar['futureBookings'];
  };
  quality: {
    valid: number;
    invalid: number;
    inWork: number;
    scheduled: number;
    reached: number;
    validRate: number;
    validRateLabel: string;
    invalidRate: number;
    invalidRateLabel: string;
    inWorkRate: number;
    inWorkRateLabel: string;
    reasons: DashboardReasonRow[];
    currentStages: Array<{ key: ActiveStageKey; label: string; value: number }>;
  };
  sources: DashboardSourceRow[];
  sourcesSummary: DashboardSourceRow[];
  website: DashboardSourceRow & {
    cpl: number | null;
    cplAvailable?: boolean;
    cplLabel: string;
    cplBasis: string;
  };
  promo: DashboardSourceRow & {
    agencies: Array<{ key: string; label: string; value: number }>;
    agenciesAvailable: boolean;
  };
}
