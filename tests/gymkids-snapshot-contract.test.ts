import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { adaptGymkidsSnapshot, validateGymkidsManifest } from '../src/data/gymkidsSnapshot'
import { snapshotContractHashes } from './helpers/snapshot-contract'

test('Yandex cost per lead distinguishes unavailable spend, explicit zero and dated amounts', () => {
  const payload = JSON.parse(readFileSync('public/data/snapshots/demo-2026-v1/centers/novo-peredelkino/2026-07.json', 'utf8'))
  const date = '2026-07-01'

  const withSpend = (values: Array<{ date: string; spend_rub: number | null }>) => adaptGymkidsSnapshot(payload, {
    schema_version: 'test',
    direct: { available: true, daily: { available: true, rows: values } },
  }, date).website

  for (const site of [adaptGymkidsSnapshot(payload, null, date).website, withSpend([]), withSpend([{ date, spend_rub: null }])]) {
    assert.equal(site.cplAvailable, false)
    assert.equal(site.cpl, null)
    assert.equal(site.cplLabel, '—')
  }
  const zero = withSpend([{ date, spend_rub: 0 }])

  assert.equal(zero.cplAvailable, true)
  assert.equal(zero.cpl, 0)
  assert.equal(withSpend([{ date, spend_rub: 180 }, { date: '2026-07-02', spend_rub: 240 }]).cpl, 180)
})

test('snapshot outputs match the expected contract for every fixture center and period', () => {
  const expected = JSON.parse(readFileSync('tests/fixtures/gymkids-snapshot-contract.json', 'utf8'))
  const actual = snapshotContractHashes(adaptGymkidsSnapshot)

  assert.equal(Object.keys(actual).length, expected.cases)
  for (const [key, hash] of Object.entries(expected.hashes))
    assert.equal(actual[key], hash, key)
})

test('manifest and snapshot rejection messages retain their original contracts', () => {
  const manifest = JSON.parse(readFileSync('public/data/snapshots/demo-2026-v1/manifest.json', 'utf8'))

  assert.throws(() => validateGymkidsManifest({ ...manifest, schema_version: 'unsupported' }), { message: 'Версия манифеста unsupported не поддерживается' })
  assert.throws(() => validateGymkidsManifest({ ...manifest, centers: [] }), { message: 'В манифесте нет доступных центров' })

  const payload = JSON.parse(readFileSync('public/data/snapshots/demo-2026-v1/centers/novo-peredelkino/2026-07.json', 'utf8'))

  assert.throws(() => adaptGymkidsSnapshot({ ...payload, schema_version: 'unsupported' }), { message: 'Версия данных unsupported не поддерживается' })
  assert.throws(() => adaptGymkidsSnapshot({ ...payload, overview: { ...payload.overview, days: [] } }), { message: 'В снимке нет дневных данных' })

  const missingSource = structuredClone(payload)
  const firstDay = [...missingSource.overview.days].sort((a, b) => a.date.localeCompare(b.date))[0].date
  const firstSource = missingSource.overview.source_order_keys[0]

  delete missingSource.overview.source_by_key_by_date[firstDay][firstSource]
  assert.throws(() => adaptGymkidsSnapshot(missingSource), { message: `[gymkids-snapshot] нет источника ${firstSource} за ${firstDay}` })
})
