import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  displayChangelogLinks,
  displayChangelogRoutes,
  livePreviewLaunchPath,
  normalizeChangelogData,
  normalizeLiveActivity,
} from '../src/lib/changelogDisplay'
import { normalizeChangelogUrl } from '../src/lib/changelogUrls'
import { loadGymkidsMcpPreview, normalizeGymkidsPreviewOrigin } from '../src/lib/gymkidsMcpPreview'
import type { ChangelogData, LiveActivity } from '../src/types/changelog'

const unsafeRoutes = [
  'javascript:alert(1)',
  `${'javascript'.toUpperCase()}:alert(1)`,
  'data:text/html,<script>alert(1)</script>',
  '//evil.example',
  'https://example.com/page',
  '/\\evil.example',
  '/path with space',
  '/path\n',
  '/path%0a',
  '/%5cevil.example',
  '/bad%escape',
  '/bad%FF',
  '',
]

const safeRoutes = ['/prototype/foo', '/data-blueprint?tab=overview', '/bento-preview#sources']
const safeLink = { label: 'Documentation', url: 'https://example.com/help?q=hello%20world#part' }

test('changelog routes allow only valid internal paths and preserve them verbatim', () => {
  for (const route of safeRoutes)
    assert.equal(normalizeChangelogUrl(route), route)

  for (const route of unsafeRoutes)
    assert.equal(normalizeChangelogUrl(route), null, route)

  assert.deepEqual(displayChangelogRoutes([...unsafeRoutes, ...safeRoutes, safeRoutes[0], null]), safeRoutes)
  assert.deepEqual(displayChangelogRoutes(null), [])
})

test('changelog links retain HTTPS and internal URLs but reject dangerous and malformed values', () => {
  const unsafeLinks = [
    ...unsafeRoutes.filter(route => route !== 'https://example.com/page'),
    'http://example.com',
    'https://',
    'https:example.com',
    'https://user:password@example.com',
    'https://example.com:99999',
  ]

  assert.deepEqual(displayChangelogLinks([safeLink, { label: 'Internal', url: '/help' }]), [
    safeLink, { label: 'Internal', url: '/help' },
  ])
  for (const url of unsafeLinks)
    assert.deepEqual(displayChangelogLinks([{ label: 'Unsafe', url }]), [], url)

  assert.deepEqual(displayChangelogLinks([null, {}, { label: 1, url: '/help' }]), [])
  assert.deepEqual(displayChangelogLinks(undefined), [])
})

test('both changelog source adapters strip unsafe URLs without changing other fields', () => {
  const urls = { routes: [...safeRoutes, ...unsafeRoutes], links: [safeLink, { label: 'Bad', url: 'javascript:alert(1)' }] }

  const staticData = {
    generated_at: null,
    participants: [],
    summary: {},
    work_items: [{ work_id: 'work-demo', title: 'Unchanged', ...urls }],
    events: [{ event_id: 'evt-demo', summary: 'Unchanged event', ...urls }],
  } as ChangelogData

  const staticResult = normalizeChangelogData(staticData)

  assert.deepEqual(staticResult.work_items[0], { ...staticData.work_items[0], routes: safeRoutes, links: [safeLink] })
  assert.deepEqual(staticResult.events[0], { ...staticData.events[0], routes: safeRoutes, links: [safeLink] })
  assert.equal(staticData.work_items[0].routes.length, safeRoutes.length + unsafeRoutes.length)

  const liveData = {
    schema_version: 'demo',
    generated_at: '',
    summary: {},
    events: [],
    work_items: [{ work_id: 'work-demo', routes: urls.routes, title: 'Unchanged' }],
  } as LiveActivity

  const liveResult = normalizeLiveActivity(liveData)

  assert.deepEqual(liveResult.work_items[0], { ...liveData.work_items[0], routes: safeRoutes })
})

test('owner preview link uses the same URL validation at rendering', () => {
  for (const launchPath of ['/review-preview/\\evil', '/review-preview/path\n', 'javascript:alert(1)', '//evil.example']) {
    assert.equal(livePreviewLaunchPath({
      source: 'mcp_change_set',
      preview: { compatible: true, launch_path: launchPath },
    }), null)
  }
})

const cli = fileURLToPath(new URL('../scripts/changelog.mjs', import.meta.url))

const cliArgs = [
  'add',
  '--dry-run',
  '--work-id',
  'demo-work',
  '--stage',
  'planned',
  '--action',
  'planned',
  '--title',
  'Demo',
  '--summary',
  'Demo',
  '--actor-name',
  'Demo',
  '--actor-id',
  'demo',
  '--owner-name',
  'Demo',
]

const runCli = (extra: string[]) => spawnSync(process.execPath, [cli, ...cliArgs, ...extra], { encoding: 'utf8' })

test('changelog CLI rejects unsafe routes and links before writing any event', () => {
  for (const route of unsafeRoutes.filter(value => value && value === value.trim())) {
    const result = runCli(['--route', route])

    assert.notEqual(result.status, 0, route)
  }

  assert.notEqual(runCli(['--link', 'Bad=//evil.example']).status, 0)
  assert.notEqual(runCli(['--link', 'Bad=javascript:alert(1)']).status, 0)
  assert.equal(runCli(['--route', safeRoutes[0], '--link', 'Docs=https://example.com/help']).status, 0)
})

test('changelog build rejects an unsafe existing event before creating a projection', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'gymkids-changelog-security-'))
  const event = JSON.parse(runCli(['--route', safeRoutes[0]]).stdout)

  event.routes = ['javascript:alert(1)']
  for (const directory of ['scripts', 'src/lib', 'changelog/events'])
    mkdirSync(join(fixtureRoot, directory), { recursive: true })

  writeFileSync(join(fixtureRoot, 'package.json'), '{"type":"module"}')
  writeFileSync(join(fixtureRoot, 'scripts/changelog.mjs'), readFileSync(cli))
  writeFileSync(join(fixtureRoot, 'src/lib/changelogUrls.js'), readFileSync(new URL('../src/lib/changelogUrls.js', import.meta.url)))
  writeFileSync(join(fixtureRoot, 'changelog/events/demo.json'), JSON.stringify(event))

  const result = spawnSync(process.execPath, [join(fixtureRoot, 'scripts/changelog.mjs'), 'build'], { encoding: 'utf8' })

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /routes\[0\]/u)
})

const previewRequest = {
  changeId: 'chg-1234567890abcdef1234567890abcdef',
  contentHash: `sha256-${'a'.repeat(64)}`,
  origin: 'https://mcp.gymkids-fr.infocuslab.ru',
  centerId: 'novo-peredelkino',
  period: '2026-07',
}

test('preview rejects non-allowlisted origins before fetch, including a nonstandard HTTPS port', async () => {
  let calls = 0

  const fetcher: typeof fetch = async () => {
    calls++

    throw new Error('Unexpected network call')
  }

  for (const origin of [
    'https://mcp.gymkids-fr.infocuslab.ru:444',
    'https://mcp.gymkids-fr.infocuslab.ru.evil.example',
    'http://mcp.gymkids-fr.infocuslab.ru',
    'https://user:password@mcp.gymkids-fr.infocuslab.ru',
    'https://mcp.gymkids-fr.infocuslab.ru/path',
    'https://mcp.gymkids-fr.infocuslab.ru?test=1',
    'https://mcp.gymkids-fr.infocuslab.ru#test',
    'http://127.0.0.1:8787',
  ])
    await assert.rejects(loadGymkidsMcpPreview({ ...previewRequest, origin }, fetcher))

  assert.equal(calls, 0)
})

test('preview accepts the exact production origin and retains request privacy options', async () => {
  let calls = 0

  const fetcher: typeof fetch = async (input, init) => {
    calls++
    assert.equal(new URL(String(input)).origin, previewRequest.origin)
    assert.equal(init?.credentials, 'omit')
    assert.equal(init?.referrerPolicy, 'no-referrer')

    return new Response(JSON.stringify({
      schema_version: 'gymkids.preview.v1',
      change_id: previewRequest.changeId,
      content_hash: previewRequest.contentHash,
      scope: { center_id: previewRequest.centerId, period: previewRequest.period },
      changes: [{ block_id: 'main.plan-fact', operation: 'set_copy', payload: { title: 'Demo' } }],
    }))
  }

  const result = await loadGymkidsMcpPreview({ ...previewRequest, origin: `${previewRequest.origin}:443` }, fetcher)

  assert.equal(calls, 1)
  assert.equal(result.blocks['main.plan-fact'].title, 'Demo')
})

test('development preview requires an explicitly allowed exact local origin', () => {
  const localOrigin = 'http://127.0.0.1:8787'

  assert.equal(normalizeGymkidsPreviewOrigin(localOrigin, localOrigin), localOrigin)
  assert.equal(normalizeGymkidsPreviewOrigin('http://localhost:8787', 'http://localhost:8787'), 'http://localhost:8787')
  for (const origin of ['http://127.0.0.1:8788', 'http://localhost:8787', 'http://127.0.0.2:8787'])
    assert.throws(() => normalizeGymkidsPreviewOrigin(origin, localOrigin))

  assert.throws(() => normalizeGymkidsPreviewOrigin(localOrigin))
  assert.throws(() => normalizeGymkidsPreviewOrigin('http://evil.example', 'http://evil.example'))
})
