export type Stage = 'planned' | 'in_progress' | 'in_review' | 'blocked' | 'changes_requested' | 'approved' | 'accepted' | 'released' | 'cancelled'

export interface Person { id: string; name: string; kind: 'human' | 'agent' }
export interface ChangelogLink { label: string; url: string }
export interface ChangelogSource { branch: string | null; commit: string | null }

export interface WorkItem {
  work_id: string
  title: string
  summary: string
  stage: Stage
  stage_label: string
  owner: Person
  last_actor: Person
  created_at: string
  updated_at: string
  next_step: string | null
  done: string[]
  blockers: string[]
  verification: string[]
  areas: string[]
  routes: string[]
  files: string[]
  links: ChangelogLink[]
  source: ChangelogSource
  event_count: number
  participant_keys: string[]
  participants: Person[]
}

export interface ChangeEvent {
  event_id: string
  work_id: string
  occurred_at: string
  actor: Person
  owner: Person
  action: string
  action_label: string
  stage: Stage
  stage_label: string
  title: string
  summary: string
  areas: string[]
  routes: string[]
  files: string[]
  done: string[]
  next_step: string | null
  blockers: string[]
  verification: string[]
  links: ChangelogLink[]
  source: ChangelogSource
}

export interface ChangelogData {
  generated_at: string | null
  summary: {
    work_items: number
    active: number
    in_review: number
    blocked: number
    participants: number
    events: number
  }
  participants: Array<Person & { key: string }>
  work_items: WorkItem[]
  events: ChangeEvent[]
}

export interface LivePerson { id: string; label: string }

export interface LivePathEvent {
  event_id: string
  work_id: string
  actor: LivePerson
  action: string
  action_label: string
  occurred_at: string
  revision: number
  summary: string
}

export interface LiveChange {
  block_id: string
  block_name: string
  operation: string
  payload: {
    title?: string
    subtitle?: string
    visible?: boolean
    layout?: 'default' | 'wide' | 'full'
  }
  summary: string
}

export interface LivePreviewDescriptor {
  state: 'ready' | 'incompatible'
  compatible: boolean
  launch_path: string | null
  issue: string | null
  scope: {
    center_id: string | null
    period: string | null
    date: string | null
    from: string | null
    to: string | null
    snapshot: string | null
  }
}

export interface LiveWorkItem {
  work_id: string
  source: 'mcp_change_set' | 'team_work_log'
  actor: LivePerson
  owner: LivePerson
  title: string
  objective: string
  release_intent: string
  release_summary: string | null
  stage: Stage
  stage_label: string
  created_at: string
  updated_at: string
  next_step: string
  done: string[]
  verification: string[]
  areas: string[]
  routes: string[]
  files: string[]
  changes: LiveChange[]
  preview: LivePreviewDescriptor | null
  path: LivePathEvent[]
  revision: number
}

export interface LiveActivity {
  schema_version: string
  generated_at: string
  summary: {
    work_items: number
    active: number
    in_review: number
    ready_for_release: number
    released: number
  }
  work_items: LiveWorkItem[]
  events: LivePathEvent[]
}
