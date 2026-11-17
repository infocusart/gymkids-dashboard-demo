interface ReleaseSummaryInput {
  objective: string
  release_intent: string
  release_summary: string | null
}

export const changelogRouteHref = (route: string) => route

export const displayChangelogRoutes = (routes: string[]) => [...new Set(routes.map(changelogRouteHref))]

export const livePreviewLaunchPath = (item: {
  source: string
  preview: { compatible: boolean; launch_path: string | null } | null
}) => (
  item.source === 'mcp_change_set'
  && item.preview?.compatible === true
  && item.preview.launch_path?.startsWith('/review-preview/')
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
