import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

test('coverage import rejects missing measurements and preserves counts while normalizing paths', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'gymkids-coverage-'))
  const report = path.join(directory, 'lcov.info')
  const run = () => spawnSync(process.execPath, ['scripts/coverage-check.mjs', report], { encoding: 'utf8', timeout: 5000 })

  try {
    assert.notEqual(run().status, 0)
    writeFileSync(report, '')
    assert.notEqual(run().status, 0)
    writeFileSync(report, 'SF:../outside.ts\nDA:1,0\nLF:1\nend_of_record\n')
    assert.notEqual(run().status, 0)
    writeFileSync(report, 'SF:src\\lib\\reportText.ts\nDA:1,0\nLF:1\nLH:0\nend_of_record\n')
    assert.equal(run().status, 0)
    assert.equal(readFileSync(report, 'utf8'), 'SF:src/lib/reportText.ts\nDA:1,0\nLF:1\nLH:0\nend_of_record\n')
  }
  finally {
    assert.ok(path.resolve(directory).startsWith(path.resolve(tmpdir()) + path.sep))
    rmSync(directory, { recursive: true, force: true })
  }
})
