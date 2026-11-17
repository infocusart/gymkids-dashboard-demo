import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { displayChangelogLinks, displayChangelogRoutes, livePreviewLaunchPath } from '../src/lib/changelogDisplay'
import { safeChangelogHref, safeChangelogRoute } from '../src/lib/changelogLinks'
import { validateEvent } from '../scripts/changelog.mjs'

const badRoutes = [
  'javascript:alert(1)',
  'JavaScript:alert(1)',
  'java\tscript:alert(1)',
  'data:text/html,test',
  '//example.invalid',
  '/\\example.invalid',
  '/%2fexample.invalid',
  '/%252fexample.invalid',
  '/%5cexample.invalid',
  '/a/..//example.invalid',
  ' /safe',
  '/safe\n',
  '/%0d%0a',
  '/bad%ZZ',
  'https://github.com/example/repo',
  '',
  null,
  {},
  1,
]

test('rejects unsafe route families before native href binding and preserves valid selection URLs', () => {
  for (const value of badRoutes)
    assert.equal(safeChangelogRoute(value), null, JSON.stringify(value))
  const routes = ['/bento-preview?center=salaryevo&period=2026-09', '/prototype/details/trial-cohorts.html', '/changelog#history']

  assert.deepEqual(displayChangelogRoutes([...badRoutes, ...routes, routes[0]]), routes)
  assert.deepEqual(displayChangelogRoutes(null), [])
})

test('allows only approved HTTPS origins and strips unsafe ordinary links', () => {
  const allowed = 'https://github.com/infocusart/gymkids-dashboard-demo'

  assert.equal(safeChangelogHref(allowed), allowed)
  assert.equal(safeChangelogHref('/changelog'), '/changelog')
  for (const value of ['javascript:alert(1)', '//github.com/x', 'http://github.com/x', 'https://github.com.example.invalid', 'https://user:password@github.com/x', 'https://example.invalid', 'https://github.com:8443/x'])
    assert.equal(safeChangelogHref(value), null, value)
  assert.deepEqual(displayChangelogLinks([{ label: 'safe', url: allowed }, { label: 'unsafe', url: 'javascript:alert(1)' }, null]), [{ label: 'safe', url: allowed }])
})

test('preview launch paths also reject encoded network paths and unsafe characters', () => {
  for (const path of ['/review-preview/\nchg-a', '/review-preview/%5cchg-a', '//review-preview/chg-a'])
    assert.equal(livePreviewLaunchPath({ source: 'mcp_change_set', preview: { compatible: true, launch_path: path } }), null)
})

const event = () => ({
  schema_version: 1,
  event_id: 'evt-20261117T120000Z-security-test-abcd',
  work_id: 'security-test',
  occurred_at: '2026-11-17T12:00:00Z',
  title: 'Security test',
  summary: 'Test',
  actor: { id: 'test', name: 'Test', kind: 'human' },
  owner: { id: 'test', name: 'Test', kind: 'human' },
  action: 'progress',
  stage: 'in_progress',
  areas: [],
  routes: ['/bento-preview'],
  files: [],
  done: [],
  blockers: [],
  verification: [],
  next_step: null,
  source: { branch: null, commit: null },
  links: [{ label: 'Source', url: 'https://github.com/infocusart/gymkids-dashboard-demo' }],
})

test('the changelog writer rejects the same URL attack families before saving an event', () => {
  assert.doesNotThrow(() => validateEvent(event()))
  for (const route of badRoutes.filter(value => typeof value === 'string'))
    assert.throws(() => validateEvent({ ...event(), routes: [route] }))
  for (const url of ['javascript:alert(1)', '//example.invalid', '/\\example.invalid', 'https://example.invalid'])
    assert.throws(() => validateEvent({ ...event(), links: [{ label: 'Test', url }] }))
})

test('all changelog ordinary-link loops use the safe link boundary', () => {
  const source = readFileSync(new URL('../src/pages/changelog.vue', import.meta.url), 'utf8')

  assert.doesNotMatch(source, /v-for="link in (?:item|event)\.links"/)
  assert.equal((source.match(/v-for="link in displayChangelogLinks\(/g) ?? []).length, 3)
})
