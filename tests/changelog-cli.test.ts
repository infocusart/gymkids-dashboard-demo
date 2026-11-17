import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { resolveGitExecutable } from '../scripts/changelog.mjs'

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
  assert.notEqual(run([...eventArguments, '--link', 'Invalid=http://example.invalid']).status, 0)
  assert.notEqual(run(['add', '--dry-run']).status, 0)
  assert.deepEqual(readdirSync('changelog/events').sort(), before)
})

test('changelog build creates a deterministic projection and confirms append-only verification', () => {
  const filename = 'public/data/changelog/index.json'
  const initial = run(['build'])

  assert.equal(initial.status, 0, initial.stderr)

  const before = JSON.parse(readFileSync(filename, 'utf8'))
  const built = run(['build'])

  assert.equal(built.status, 0, built.stderr)

  const receipt = JSON.parse(built.stdout)
  const after = JSON.parse(readFileSync(filename, 'utf8'))

  assert.equal(receipt.append_only.checked, true)
  assert.equal(receipt.events, after.events.length)
  assert.deepEqual(after, before)
})

test('append-only verification rejects edits and deletion of tracked events before building a projection', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'gymkids-append-only-'))

  const git = (args: string[]) => {
    const child = spawnSync(resolveGitExecutable(), ['-C', directory, ...args], { encoding: 'utf8', timeout: 10000 })

    assert.ifError(child.error)
    assert.equal(child.status, 0, child.stderr)
  }

  const cli = (...args: string[]) => spawnSync(process.execPath, [path.join(directory, 'scripts/changelog.mjs'), ...args], { encoding: 'utf8', timeout: 10000 })
  const event = JSON.parse(run(eventArguments).stdout)
  const eventPath = path.join(directory, 'changelog/events', `${event.event_id}.json`)
  const original = `${JSON.stringify(event)}\n`

  try {
    for (const name of ['scripts', 'src/lib', 'changelog/events'])
      mkdirSync(path.join(directory, name), { recursive: true })
    for (const name of ['scripts/changelog.mjs', 'src/lib/changelogUrls.js'])
      writeFileSync(path.join(directory, name), readFileSync(name))
    writeFileSync(path.join(directory, 'package.json'), '{"type":"module"}\n')
    writeFileSync(eventPath, original)
    git(['init', '--quiet'])
    git(['add', 'changelog/events'])
    git(['-c', 'user.name=QA fixture', '-c', 'user.email=qa@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'Fixture event'])

    assert.equal(cli('check', '--append-only').status, 0)
    writeFileSync(eventPath, JSON.stringify({ ...event, title: 'Changed after commit' }))

    const edited = cli('build')

    assert.notEqual(edited.status, 0)
    assert.match(edited.stderr, /событие изменено/)
    rmSync(eventPath)

    const deleted = cli('check', '--append-only')

    assert.notEqual(deleted.status, 0)
    assert.match(deleted.stderr, /событие удалено/)
    writeFileSync(eventPath, original)

    const built = cli('build')

    assert.equal(built.status, 0, built.stderr)

    const projection = JSON.parse(readFileSync(path.join(directory, 'public/data/changelog/index.json'), 'utf8'))

    assert.equal(projection.events.length, 1)
    assert.equal(projection.events[0].title, event.title)
  }
  finally {
    assert.equal(path.dirname(directory), path.resolve(tmpdir()))
    assert.ok(path.basename(directory).startsWith('gymkids-append-only-'))
    rmSync(directory, { recursive: true, force: true })
  }
})
