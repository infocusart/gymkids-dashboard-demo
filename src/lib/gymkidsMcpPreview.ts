export type GymkidsPreviewLayout = 'default' | 'wide' | 'full'

export interface GymkidsPreviewBlock {
  title?: string
  subtitle?: string
  visible?: boolean
  layout?: GymkidsPreviewLayout
}

export interface GymkidsPreviewScope {
  center_id: string
  center_name: string
  period: string
  from: string
  to: string
}

export interface GymkidsPreviewResult {
  changeId: string
  contentHash: string | null
  scope: GymkidsPreviewScope
  blocks: Record<string, GymkidsPreviewBlock>
}

export interface GymkidsReviewPreviewRequest {
  changeId: string
  centerId: string
  period: string
}

export interface GymkidsPreviewRequest {
  changeId: string
  contentHash: string
  origin: string
  centerId: string
  period: string
}

const CHANGE_ID = /^chg-[a-f0-9]{32}$/
const CONTENT_HASH = /^sha256-[a-f0-9]{64}$/
const MONTH = /^\d{4}-(?:0[1-9]|1[0-2])$/

const ALLOWED_BLOCK_IDS = new Set([
  'main.plan-fact',
  'main.lead-sources',
  'main.trial-cohorts',
  'main.funnel-validity',
  'main.invalid-reasons',
  'main.current-stages',
  'main.site-leads',
  'main.promo-leads',
  'main.source-quality',
])

const isObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const plainText = (value: unknown, maximum: number) => (
  typeof value === 'string'
  && value.length > 0
  && value.length <= maximum
  && ![...value].some(character => character.charCodeAt(0) < 32 || character === '<' || character === '>')
)

const previewOrigin = (value: string) => {
  const origin = new URL(value)
  const production = origin.protocol === 'https:' && origin.hostname === 'mcp.gymkids-fr.infocuslab.ru'

  const local = import.meta.env.DEV
    && origin.protocol === 'http:'
    && ['127.0.0.1', 'localhost'].includes(origin.hostname)

  if ((!production && !local) || origin.pathname !== '/' || origin.search || origin.hash)
    throw new Error('Недопустимый источник MCP preview')

  return origin.origin
}

const parseChange = (value: unknown): [string, GymkidsPreviewBlock] => {
  if (!isObject(value) || typeof value.block_id !== 'string' || !ALLOWED_BLOCK_IDS.has(value.block_id))
    throw new Error('Preview содержит неизвестный блок bento')
  if (typeof value.operation !== 'string' || !isObject(value.payload))
    throw new Error('Preview содержит некорректную операцию')

  if (value.operation === 'set_copy') {
    const fields = Object.keys(value.payload)
    if (!fields.length || fields.some(field => !['title', 'subtitle'].includes(field)))
      throw new Error('Некорректный payload set_copy')
    if (value.payload.title !== undefined && !plainText(value.payload.title, 120))
      throw new Error('Некорректный title в preview')
    if (value.payload.subtitle !== undefined && !plainText(value.payload.subtitle, 240))
      throw new Error('Некорректный subtitle в preview')

    return [value.block_id, {
      ...(typeof value.payload.title === 'string' ? { title: value.payload.title } : {}),
      ...(typeof value.payload.subtitle === 'string' ? { subtitle: value.payload.subtitle } : {}),
    }]
  }

  if (value.operation === 'set_visibility') {
    if (Object.keys(value.payload).length !== 1 || typeof value.payload.visible !== 'boolean')
      throw new Error('Некорректный payload set_visibility')

    return [value.block_id, { visible: value.payload.visible }]
  }

  if (value.operation === 'set_layout') {
    if (
      Object.keys(value.payload).length !== 1
      || !['default', 'wide', 'full'].includes(String(value.payload.layout))
    )
      throw new Error('Некорректный payload set_layout')

    return [value.block_id, { layout: value.payload.layout as GymkidsPreviewLayout }]
  }

  throw new Error(`Неподдерживаемая операция preview: ${value.operation}`)
}

export const normalizeGymkidsPreviewArtifact = (
  payload: unknown,
  request: GymkidsPreviewRequest,
): GymkidsPreviewResult => {
  if (!isObject(payload) || payload.schema_version !== 'gymkids.preview.v1')
    throw new Error('Неподдерживаемая версия MCP preview')
  if (payload.change_id !== request.changeId || payload.content_hash !== request.contentHash)
    throw new Error('Preview не совпадает с квитанцией изменения')
  if (!isObject(payload.scope))
    throw new Error('В preview отсутствует область данных')
  if (payload.scope.center_id !== request.centerId || payload.scope.period !== request.period)
    throw new Error('Preview создан для другого центра или месяца')
  if (!Array.isArray(payload.changes) || payload.changes.length === 0)
    throw new Error('Preview не содержит изменений')

  const blocks: Record<string, GymkidsPreviewBlock> = {}
  for (const rawChange of payload.changes) {
    const [blockId, change] = parseChange(rawChange)

    blocks[blockId] = { ...blocks[blockId], ...change }
  }

  return {
    changeId: request.changeId,
    contentHash: request.contentHash,
    scope: payload.scope as unknown as GymkidsPreviewScope,
    blocks,
  }
}

export const loadGymkidsMcpPreview = async (
  request: GymkidsPreviewRequest,
  fetcher: typeof fetch = fetch,
): Promise<GymkidsPreviewResult> => {
  if (!CHANGE_ID.test(request.changeId) || !CONTENT_HASH.test(request.contentHash))
    throw new Error('Некорректная квитанция MCP preview')
  if (!request.centerId || !MONTH.test(request.period))
    throw new Error('Некорректная область MCP preview')

  const origin = previewOrigin(request.origin)
  const url = new URL(`/preview-artifacts/${request.changeId}`, origin)

  url.searchParams.set('content_hash', request.contentHash)

  const response = await fetcher(url, {
    headers: { Accept: 'application/json' },
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  })

  if (!response.ok)
    throw new Error(`MCP preview недоступен (${response.status})`)

  return normalizeGymkidsPreviewArtifact(await response.json(), request)
}

export const normalizeGymkidsReviewPreviewArtifact = (
  payload: unknown,
  request: GymkidsReviewPreviewRequest,
): GymkidsPreviewResult => {
  if (!isObject(payload) || payload.schema_version !== 'gymkids.review-preview.v1')
    throw new Error('Неподдерживаемая версия owner preview')
  if (payload.change_id !== request.changeId)
    throw new Error('Owner preview не совпадает с выбранным пакетом')
  if (!isObject(payload.scope))
    throw new Error('В owner preview отсутствует область данных')
  if (payload.scope.center_id !== request.centerId || payload.scope.period !== request.period)
    throw new Error('Owner preview создан для другого центра или месяца')
  if (!Array.isArray(payload.changes) || payload.changes.length === 0)
    throw new Error('Owner preview не содержит изменений')

  const blocks: Record<string, GymkidsPreviewBlock> = {}
  for (const rawChange of payload.changes) {
    const [blockId, change] = parseChange(rawChange)

    blocks[blockId] = { ...blocks[blockId], ...change }
  }

  return {
    changeId: request.changeId,
    contentHash: null,
    scope: payload.scope as unknown as GymkidsPreviewScope,
    blocks,
  }
}

export const loadGymkidsReviewPreview = async (
  request: GymkidsReviewPreviewRequest,
  fetcher: typeof fetch = fetch,
): Promise<GymkidsPreviewResult> => {
  if (!CHANGE_ID.test(request.changeId))
    throw new Error('Некорректный идентификатор owner preview')
  if (!request.centerId || !MONTH.test(request.period))
    throw new Error('Некорректная область owner preview')

  const response = await fetcher(`/review-preview/${request.changeId}/artifact`, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    referrerPolicy: 'no-referrer',
  })

  if (!response.ok)
    throw new Error(`Owner preview недоступен (${response.status})`)

  return normalizeGymkidsReviewPreviewArtifact(await response.json(), request)
}
