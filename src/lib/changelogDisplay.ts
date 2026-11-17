import { normalizeChangelogUrl } from './changelogUrls'
import type { ChangelogData, ChangelogLink, LiveActivity } from '@/types/changelog'

interface ReleaseSummaryInput {
  objective: string
  release_intent: string
  release_summary: string | null
}

export const changelogRouteHref = (route: unknown) => normalizeChangelogUrl(route)

export const displayChangelogRoutes = (routes: unknown): string[] => (
  Array.isArray(routes)
    ? [...new Set(routes.map(changelogRouteHref).filter((route): route is string => route !== null))]
    : []
)

export const displayChangelogLinks = (links: unknown): ChangelogLink[] => (
  Array.isArray(links)
    ? links.flatMap((link: unknown) => {
      if (!link || typeof link !== 'object' || !('url' in link) || !('label' in link) || typeof link.label !== 'string')
        return []

      const url = normalizeChangelogUrl(link.url, true)

      return url ? [{ label: link.label, url }] : []
    })
    : []
)

export const normalizeChangelogData = (data: ChangelogData): ChangelogData => ({
  ...data,
  work_items: data.work_items.map(item => ({
    ...item, routes: displayChangelogRoutes(item.routes), links: displayChangelogLinks(item.links),
  })),
  events: data.events.map(event => ({
    ...event, routes: displayChangelogRoutes(event.routes), links: displayChangelogLinks(event.links),
  })),
})

export const normalizeLiveActivity = (data: LiveActivity): LiveActivity => ({
  ...data,
  work_items: data.work_items.map(item => ({
    ...item, routes: displayChangelogRoutes(item.routes),
  })),
})

export const livePreviewLaunchPath = (item: {
  source: string
  preview: { compatible: boolean; launch_path: string | null } | null
}) => (
  item.source === 'mcp_change_set'
  && item.preview?.compatible === true
  && changelogRouteHref(item.preview.launch_path)?.startsWith('/review-preview/')
    ? item.preview.launch_path
    : null
)

export const formatChangelogDate = (value: string | null) => (
  value
    ? new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow',
    }).format(new Date(value))
    : 'ещё нет событий'
)

export const shortChangelogCommit = (commit: string | null) => commit ? commit.slice(0, 8) : 'без коммита'

export const formatRussianCount = (count: number, one: string, few: string, many: string) => {
  const mod100 = count % 100
  const mod10 = count % 10

  if (mod100 >= 11 && mod100 <= 14)
    return `${count} ${many}`

  if (mod10 === 1)
    return `${count} ${one}`

  if (mod10 >= 2 && mod10 <= 4)
    return `${count} ${few}`

  return `${count} ${many}`
}

export const releaseDecisionSummary = (item: ReleaseSummaryInput) => {
  const releaseSummary = item.release_summary?.trim()

  if (releaseSummary && releaseSummary.length <= 180)
    return releaseSummary

  return item.objective.trim() || item.release_intent.trim() || releaseSummary || 'Описание результата пока не добавлено.'
}
