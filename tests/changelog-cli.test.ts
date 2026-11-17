import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import test from 'node:test'

const run = (args: string[], env = process.env) => spawnSync(process.execPath, ['scripts/changelog.mjs', ...args], { encoding: 'utf8', env, timeout: 15000 })
const eventArguments = ['add', '--work-id', 'qa-cli-contract', '--action', 'planned', '--stage', 'planned', '--title', 'QA fixture', '--summary', 'Dry run only', '--actor-name', 'QA fixture', '--owner-name', 'QA fixture', '--dry-run']

test('changelog CLI checks tracked history and fails closed when Git is unavailable', () => {
  const valid = run(['check', '--append-only'])

  assert.equal(valid.status, 0, valid.stderr)
  assert.match(valid.stdout, /"checked": true/)

  const unavailable = run(['check', '--append-only'], { ...process.env, GYMKIDS_GIT_EXECUTABLE: './untrusted-git' })

  assert.notEqual(unavailable.status, 0)
  assert.match(unavailable.stderr, /absolute path/)
  assert.equal(run(['help']).status, 0)
})

test('changelog CLI dry runs validate complete events and never write rejected links', () => {
  const before = readdirSync('changelog/events').sort()
  const valid = run([...eventArguments, '--route', '/bento-preview', '--link', 'Source=https://github.com/infocusart/gymkids-dashboard-demo'])

  assert.equal(valid.status, 0, valid.stderr)
  assert.match(valid.stdout, /qa-cli-contract/)
  assert.notEqual(run([...eventArguments, '--route', 'javascript:alert(1)']).status, 0)
  assert.notEqual(run([...eventArguments, '--link', 'Invalid=https://example.invalid']).status, 0)
  assert.notEqual(run(['add', '--dry-run']).status, 0)
  assert.deepEqual(readdirSync('changelog/events').sort(), before)
})
