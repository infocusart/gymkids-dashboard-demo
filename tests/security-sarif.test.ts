import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

test('SARIF CI gate fails on alerts, missing output and failed analysis', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'gymkids-sarif-'))
  const run = () => spawnSync(process.execPath, ['scripts/security-sarif.mjs', directory], { encoding: 'utf8', timeout: 5000 })
  const report = (results: unknown[], invocation: Record<string, unknown> = { executionSuccessful: true }) => writeFileSync(path.join(directory, 'test.sarif'), JSON.stringify({ runs: [{ results, invocations: [invocation] }] }))

  try {
    assert.notEqual(run().status, 0)
    report([])
    assert.equal(run().status, 0)
    report([{ ruleId: 'test-alert', message: { text: 'Must block CI' } }])
    assert.notEqual(run().status, 0)
    report([], { executionSuccessful: false })
    assert.notEqual(run().status, 0)
    report([], { executionSuccessful: true, toolExecutionNotifications: [{ level: 'warning', message: { text: 'Incomplete extraction' } }] })
    assert.notEqual(run().status, 0)
    writeFileSync(path.join(directory, 'test.sarif'), JSON.stringify({ runs: [{ results: [], invocations: [] }] }))
    assert.notEqual(run().status, 0)
    writeFileSync(path.join(directory, 'test.sarif'), JSON.stringify({ runs: [{ invocations: [{ executionSuccessful: true }] }] }))
    assert.notEqual(run().status, 0)
    writeFileSync(path.join(directory, 'test.sarif'), JSON.stringify({ runs: [] }))
    assert.notEqual(run().status, 0)
    writeFileSync(path.join(directory, 'test.sarif'), '{}')
    assert.notEqual(run().status, 0)
  }
  finally {
    assert.ok(path.resolve(directory).startsWith(path.resolve(tmpdir()) + path.sep))
    rmSync(directory, { recursive: true, force: true })
  }
})
