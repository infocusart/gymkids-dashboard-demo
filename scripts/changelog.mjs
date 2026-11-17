#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { safeChangelogHref, safeChangelogRoute } from '../src/lib/changelogLinks.js'

const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const eventsRoot = join(repoRoot, 'changelog/events')
const projectionPath = join(repoRoot, 'public/data/changelog/index.json')

const stageMeta = {
  planned: { label: 'Запланировано', order: 10 },
  in_progress: { label: 'В работе', order: 20 },
  in_review: { label: 'На проверке', order: 30 },
  blocked: { label: 'Заблокировано', order: 40 },
  accepted: { label: 'Принято', order: 50 },
  released: { label: 'Опубликовано', order: 60 },
  cancelled: { label: 'Отменено', order: 70 },
}

const actionLabels = {
  planned: 'Запланировали',
  started: 'Начали работу',
  progress: 'Обновили прогресс',
  handoff: 'Передали работу',
  review_requested: 'Передали на проверку',
  blocked: 'Зафиксировали блокер',
  accepted: 'Приняли работу',
  released: 'Опубликовали',
  cancelled: 'Остановили работу',
}

const actorKinds = new Set(['human', 'agent'])
const actions = new Set(Object.keys(actionLabels))
const stages = new Set(Object.keys(stageMeta))
const publicStringBlocklist = [
  /\/Users\//i,
  /(?:^|\W)Bearer\s+[A-Za-z0-9._~-]+/i,
  /Authorization\s*:/i,
  /(?:api[_-]?key|token|password|secret)\s*[=:]/i,
  /https?:\/\/(?:127\.0\.0\.1|localhost|[^/]+\.local)(?:[:/]|$)/i,
]

function fail(message) {
  throw new Error(message)
}

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv
  const options = {}

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]

    if (!token.startsWith('--'))
      fail(`Неожиданный аргумент: ${token}`)

    const key = token.slice(2)
    const next = rest[index + 1]
    const value = !next || next.startsWith('--') ? true : next

    if (value !== true)
      index += 1

    if (options[key] === undefined)
      options[key] = value
    else if (Array.isArray(options[key]))
      options[key].push(value)
    else
      options[key] = [options[key], value]
  }

  return { command, options }
}

function option(options, key, fallback = null) {
  const value = options[key]

  if (Array.isArray(value))
    return value.at(-1)

  return value === undefined || value === true ? fallback : value
}

function listOption(options, key) {
  const value = options[key]

  if (value === undefined || value === true)
    return []

  return (Array.isArray(value) ? value : [value])
    .flatMap(item => String(item).split(','))
    .map(item => item.trim())
    .filter(Boolean)
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/giu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'participant'
}

function git(args, { optional = false } = {}) {
  try {
    return execFileSync('git', ['-C', repoRoot, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', optional ? 'ignore' : 'pipe'],
    }).trim()
  }
  catch (error) {
    if (optional)
      return null

    throw error
  }
}

function assertString(value, field, { nullable = false } = {}) {
  if (nullable && value === null)
    return

  if (typeof value !== 'string' || !value.trim())
    fail(`${field}: ожидается непустая строка`)
}

function assertStringArray(value, field) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim()))
    fail(`${field}: ожидается массив непустых строк`)
}

function validatePerson(person, field) {
  if (!person || typeof person !== 'object' || Array.isArray(person))
    fail(`${field}: ожидается объект участника`)

  assertString(person.id, `${field}.id`)
  assertString(person.name, `${field}.name`)

  if (!actorKinds.has(person.kind))
    fail(`${field}.kind: допустимы human или agent`)
}

function walkPublicStrings(value, path = 'event') {
  if (typeof value === 'string') {
    for (const pattern of publicStringBlocklist) {
      if (pattern.test(value))
        fail(`${path}: строка похожа на приватный путь, секрет или внутренний адрес`)
    }

    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => walkPublicStrings(item, `${path}[${index}]`))
    return
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => walkPublicStrings(item, `${path}.${key}`))
  }
}

export function validateEvent(event, sourcePath = 'event') {
  if (!event || typeof event !== 'object' || Array.isArray(event))
    fail(`${sourcePath}: ожидается JSON-объект`)

  if (event.schema_version !== 1)
    fail(`${sourcePath}.schema_version: поддерживается только версия 1`)

  assertString(event.event_id, `${sourcePath}.event_id`)
  assertString(event.work_id, `${sourcePath}.work_id`)
  assertString(event.occurred_at, `${sourcePath}.occurred_at`)
  assertString(event.title, `${sourcePath}.title`)
  assertString(event.summary, `${sourcePath}.summary`)
  validatePerson(event.actor, `${sourcePath}.actor`)
  validatePerson(event.owner, `${sourcePath}.owner`)

  if (!/^evt-\d{8}T\d{6}Z-[a-z0-9а-яё-]+-[a-f0-9]{4}$/iu.test(event.event_id))
    fail(`${sourcePath}.event_id: неверный формат`)

  if (!/^[a-z0-9][a-z0-9-]{2,80}$/u.test(event.work_id))
    fail(`${sourcePath}.work_id: используйте 3–81 символов a-z, 0-9 и дефис`)

  if (Number.isNaN(Date.parse(event.occurred_at)))
    fail(`${sourcePath}.occurred_at: ожидается ISO-дата`)

  if (!actions.has(event.action))
    fail(`${sourcePath}.action: неизвестное действие ${event.action}`)

  if (!stages.has(event.stage))
    fail(`${sourcePath}.stage: неизвестный этап ${event.stage}`)

  assertStringArray(event.areas, `${sourcePath}.areas`)
  assertStringArray(event.routes, `${sourcePath}.routes`)
  if (event.routes.some(route => !safeChangelogRoute(route)))
    fail(`${sourcePath}.routes: разрешены только безопасные site-relative маршруты`)
  assertStringArray(event.files, `${sourcePath}.files`)
  assertStringArray(event.done, `${sourcePath}.done`)
  assertStringArray(event.blockers, `${sourcePath}.blockers`)
  assertStringArray(event.verification, `${sourcePath}.verification`)
  assertString(event.next_step, `${sourcePath}.next_step`, { nullable: true })

  if (!event.source || typeof event.source !== 'object' || Array.isArray(event.source))
    fail(`${sourcePath}.source: ожидается объект`)

  assertString(event.source.branch, `${sourcePath}.source.branch`, { nullable: true })
  assertString(event.source.commit, `${sourcePath}.source.commit`, { nullable: true })

  if (event.source.commit !== null && !/^[a-f0-9]{40}$/u.test(event.source.commit))
    fail(`${sourcePath}.source.commit: ожидается полный Git SHA или null`)

  if (!Array.isArray(event.links))
    fail(`${sourcePath}.links: ожидается массив`)

  event.links.forEach((link, index) => {
    assertString(link?.label, `${sourcePath}.links[${index}].label`)
    assertString(link?.url, `${sourcePath}.links[${index}].url`)

    if (!safeChangelogHref(link.url))
      fail(`${sourcePath}.links[${index}].url: требуется безопасный маршрут или разрешённый HTTPS origin`)
  })

  const requiredPairs = {
    blocked: ['blocked'],
    review_requested: ['in_review'],
    accepted: ['accepted'],
    released: ['released'],
    cancelled: ['cancelled'],
  }

  if (requiredPairs[event.action] && !requiredPairs[event.action].includes(event.stage))
    fail(`${sourcePath}: action=${event.action} несовместим со stage=${event.stage}`)

  walkPublicStrings(event, sourcePath)
}

async function loadEvents() {
  await mkdir(eventsRoot, { recursive: true })
  const names = (await readdir(eventsRoot)).filter(name => name.endsWith('.json')).sort()
  const events = []
  const eventIds = new Set()

  for (const name of names) {
    const path = join(eventsRoot, name)
    const event = JSON.parse(await readFile(path, 'utf8'))
    const displayPath = relative(repoRoot, path)

    validateEvent(event, displayPath)

    if (eventIds.has(event.event_id))
      fail(`${displayPath}: event_id ${event.event_id} уже существует`)

    if (name !== `${event.event_id}.json`)
      fail(`${displayPath}: имя файла должно совпадать с event_id`)

    eventIds.add(event.event_id)
    events.push(event)
  }

  return events.sort((left, right) => Date.parse(left.occurred_at) - Date.parse(right.occurred_at))
}

async function checkAppendOnly() {
  const insideGit = git(['rev-parse', '--is-inside-work-tree'], { optional: true }) === 'true'

  if (!insideGit)
    return { checked: false, reason: 'git metadata unavailable' }

  const trackedOutput = git(['ls-tree', '-r', '--name-only', 'HEAD', '--', 'changelog/events'], { optional: true }) || ''
  const trackedPaths = trackedOutput.split('\n').map(item => item.trim()).filter(Boolean)

  for (const trackedPath of trackedPaths) {
    const currentPath = join(repoRoot, trackedPath)
    let current

    try {
      current = await readFile(currentPath, 'utf8')
    }
    catch {
      fail(`${trackedPath}: ранее зафиксированное событие удалено`)
    }

    const baseline = git(['show', `HEAD:${trackedPath}`])

    if (`${baseline}\n` !== current && baseline !== current)
      fail(`${trackedPath}: ранее зафиксированное событие изменено; добавьте новое событие вместо переписывания истории`)
  }

  return { checked: true, tracked_events: trackedPaths.length }
}

function personKey(person) {
  return `${person.kind}:${person.id}`
}

function buildProjection(events) {
  const people = new Map()
  const workMap = new Map()

  for (const event of events) {
    people.set(personKey(event.actor), event.actor)
    people.set(personKey(event.owner), event.owner)

    if (!workMap.has(event.work_id))
      workMap.set(event.work_id, [])

    workMap.get(event.work_id).push(event)
  }

  const workItems = [...workMap.entries()].map(([workId, workEvents]) => {
    const first = workEvents[0]
    const latest = workEvents.at(-1)
    const participants = new Map()

    workEvents.forEach((event) => {
      participants.set(personKey(event.actor), event.actor)
      participants.set(personKey(event.owner), event.owner)
    })

    return {
      work_id: workId,
      title: latest.title,
      summary: latest.summary,
      stage: latest.stage,
      stage_label: stageMeta[latest.stage].label,
      stage_order: stageMeta[latest.stage].order,
      owner: latest.owner,
      last_actor: latest.actor,
      created_at: first.occurred_at,
      updated_at: latest.occurred_at,
      next_step: latest.next_step,
      done: latest.done,
      blockers: latest.blockers,
      verification: latest.verification,
      areas: latest.areas,
      routes: latest.routes,
      files: latest.files,
      links: latest.links,
      source: latest.source,
      event_count: workEvents.length,
      participant_keys: [...participants.keys()],
      participants: [...participants.values()],
    }
  }).sort((left, right) => {
    const leftClosed = ['accepted', 'released', 'cancelled'].includes(left.stage)
    const rightClosed = ['accepted', 'released', 'cancelled'].includes(right.stage)

    if (leftClosed !== rightClosed)
      return leftClosed ? 1 : -1

    return Date.parse(right.updated_at) - Date.parse(left.updated_at)
  })

  const descendingEvents = [...events].reverse().map(event => ({
    ...event,
    action_label: actionLabels[event.action],
    stage_label: stageMeta[event.stage].label,
  }))

  const activeStages = new Set(['planned', 'in_progress', 'in_review', 'blocked'])

  return {
    schema_version: 1,
    generated_at: descendingEvents[0]?.occurred_at ?? null,
    stage_meta: stageMeta,
    summary: {
      work_items: workItems.length,
      active: workItems.filter(item => activeStages.has(item.stage)).length,
      in_review: workItems.filter(item => item.stage === 'in_review').length,
      blocked: workItems.filter(item => item.stage === 'blocked').length,
      participants: people.size,
      events: events.length,
    },
    participants: [...people.entries()]
      .map(([key, person]) => ({ key, ...person }))
      .sort((left, right) => left.name.localeCompare(right.name, 'ru')),
    work_items: workItems,
    events: descendingEvents,
  }
}

async function writeProjection(events) {
  const projection = buildProjection(events)

  await mkdir(dirname(projectionPath), { recursive: true })
  await writeFile(projectionPath, `${JSON.stringify(projection, null, 2)}\n`, 'utf8')

  return projection
}

function makePerson(name, id, kind) {
  return {
    id: id || slugify(name),
    name,
    kind,
  }
}

function nowEventId(actorId, now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/u, 'Z')

  return `evt-${stamp}-${slugify(actorId)}-${randomBytes(2).toString('hex')}`
}

function createEvent(options) {
  const workId = option(options, 'work-id')
  const stage = option(options, 'stage')
  const action = option(options, 'action')
  const title = option(options, 'title')
  const summary = option(options, 'summary')
  const actorName = option(options, 'actor-name', process.env.GYMKIDS_CHANGELOG_ACTOR || git(['config', 'user.name'], { optional: true }))
  const actorKind = option(options, 'actor-kind', 'human')
  const ownerName = option(options, 'owner-name', actorName)
  const ownerKind = option(options, 'owner-kind', actorKind)

  for (const [key, value] of Object.entries({ 'work-id': workId, stage, action, title, summary, 'actor-name': actorName, 'owner-name': ownerName })) {
    if (!value)
      fail(`add: обязателен --${key}`)
  }

  const occurredAt = option(options, 'occurred-at', new Date().toISOString())
  const actor = makePerson(actorName, option(options, 'actor-id'), actorKind)
  const owner = makePerson(ownerName, option(options, 'owner-id'), ownerKind)
  const sourceCommit = git(['rev-parse', 'HEAD'], { optional: true })
  const sourceBranch = git(['branch', '--show-current'], { optional: true })
  const links = listOption(options, 'link').map((item) => {
    const separator = item.indexOf('=')

    if (separator < 1)
      fail(`--link ожидает формат Название=https://...: ${item}`)

    return { label: item.slice(0, separator), url: item.slice(separator + 1) }
  })

  const event = {
    schema_version: 1,
    event_id: nowEventId(actor.id, new Date(occurredAt)),
    work_id: workId,
    occurred_at: occurredAt,
    actor,
    owner,
    action,
    stage,
    title,
    summary,
    areas: listOption(options, 'area'),
    routes: listOption(options, 'route'),
    files: listOption(options, 'file'),
    done: listOption(options, 'done'),
    next_step: option(options, 'next-step'),
    blockers: listOption(options, 'blocker'),
    verification: listOption(options, 'verification'),
    links,
    source: {
      branch: sourceBranch || null,
      commit: sourceCommit || null,
    },
  }

  validateEvent(event, 'new event')

  return event
}

function printHelp() {
  console.log(`GYMKiDs changelog\n\nКоманды:\n  node scripts/changelog.mjs check --append-only\n  node scripts/changelog.mjs build\n  node scripts/changelog.mjs add --work-id ... --action ... --stage ... --title ... --summary ... [поля]\n\nПовторяемые поля: --area --route --file --done --blocker --verification --link 'Название=https://...'\nУчастники: --actor-name --actor-id --actor-kind human|agent --owner-name --owner-id --owner-kind human|agent\nДля проверки без записи добавьте --dry-run.`)
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2))

  if (command === 'help' || options.help) {
    printHelp()
    return
  }

  if (command === 'check') {
    const events = await loadEvents()
    const appendOnly = options['append-only'] ? await checkAppendOnly() : { checked: false, reason: 'not requested' }

    console.log(JSON.stringify({ ok: true, events: events.length, append_only: appendOnly }, null, 2))
    return
  }

  if (command === 'build') {
    const events = await loadEvents()
    const appendOnly = await checkAppendOnly()
    const projection = await writeProjection(events)

    console.log(JSON.stringify({ ok: true, work_items: projection.summary.work_items, events: events.length, append_only: appendOnly, output: relative(repoRoot, projectionPath) }, null, 2))
    return
  }

  if (command === 'add') {
    const event = createEvent(options)

    if (options['dry-run']) {
      console.log(JSON.stringify(event, null, 2))
      return
    }

    await mkdir(eventsRoot, { recursive: true })
    const eventPath = join(eventsRoot, `${event.event_id}.json`)
    await writeFile(eventPath, `${JSON.stringify(event, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
    const events = await loadEvents()
    await writeProjection(events)

    console.log(JSON.stringify({ ok: true, event_id: event.event_id, path: relative(repoRoot, eventPath) }, null, 2))
    return
  }

  fail(`Неизвестная команда: ${command}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`[changelog] ${error.message}`)
    process.exitCode = 1
  })
}
