import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { adaptGymkidsSnapshot } from '../src/data/gymkidsSnapshot'
import { getFeaturedSourceCards } from '../src/data/gymkidsFeaturedSources'

const fixture = () => {
  const pointer = JSON.parse(readFileSync('public/data/current.json', 'utf8'))
  const root = `public/data/snapshots/${pointer.release_id}`

  return JSON.parse(readFileSync(`${root}/centers/novo-peredelkino/2026-07.json`, 'utf8'))
}

const view = () => adaptGymkidsSnapshot(fixture(), null)

test('top cards follow raw source volume, stable keys break ties regardless of source order', () => {
  const dashboard = view()
  const source = dashboard.sources[0]

  dashboard.sources = [
    { ...source, key: 'telegram', label: 'Телеграм', fact: 100, planAvailable: false },
    { ...source, key: 'instagram', label: 'Инстаграм', fact: 100, planAvailable: false },
    { ...source, key: 'website', fact: 50 },
  ]
  assert.deepEqual(getFeaturedSourceCards(dashboard).map(row => row.key), ['instagram', 'telegram'])
  dashboard.sources.reverse()
  assert.deepEqual(getFeaturedSourceCards(dashboard).map(row => row.key), ['instagram', 'telegram'])

  const [first, second] = getFeaturedSourceCards(dashboard)

  assert.equal(first.plan, null)
  assert.equal(second.forecastRate, null)
  assert.equal(first.cpl, null)
})
test('one or zero active sources keeps empty slots unavailable instead of repeating a leader', () => {
  const dashboard = view()

  dashboard.sources = dashboard.sources.slice(0, 1)

  const cards = getFeaturedSourceCards(dashboard)

  assert.equal(cards[1].available, false)
  assert.equal(cards[1].fact, null)
  dashboard.sources = []
  assert.ok(getFeaturedSourceCards(dashboard).every(card => !card.available && card.fact === null && card.plan === null))
})
test('available plans follow their source in either slot and explicit zero is distinct from missing', () => {
  const dashboard = view()
  const source = dashboard.sources[0]

  dashboard.sources = [
    { ...source, key: 'promo', label: 'Промоутеры', fact: 50, plan: 0, planAvailable: true },
    { ...source, key: 'website', label: 'Заявка с сайта', fact: 100, plan: 220, planAvailable: true },
  ]
  dashboard.website.cpl = 485
  dashboard.website.cplAvailable = true
  let cards = getFeaturedSourceCards(dashboard)
  assert.equal(cards[0].plan, 220)
  assert.equal(cards[0].cpl, 485)
  assert.equal(cards[1].plan, 0)
  assert.equal(cards[1].forecastRate, null)
  dashboard.sources[0].fact = 200
  cards = getFeaturedSourceCards(dashboard)
  assert.equal(cards[0].key, 'promo')
  assert.equal(cards[0].cpl, null)
  assert.equal(cards[1].key, 'website')
  assert.equal(cards[1].cpl, 485)
  dashboard.website.cplAvailable = false
  assert.equal(getFeaturedSourceCards(dashboard)[1].cpl, null)
})
test('changing cutoff recomputes the leaders from the selected slice', () => {
  const payload = fixture()
  const early = adaptGymkidsSnapshot(payload, null, '2026-07-01')
  const late = adaptGymkidsSnapshot(payload, null, '2026-07-31')
  for (const dashboard of [early, late]) {
    const expected = [...dashboard.sources].sort((a, b) => b.fact - a.fact || a.key.localeCompare(b.key, 'en')).slice(0, 2)

    assert.deepEqual(getFeaturedSourceCards(dashboard).filter(card => card.available).map(card => card.fact), expected.map(row => row.fact))
  }
})
