import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { gymkidsPromoEconomicsDemo as demo } from '../src/data/gymkidsPromoEconomics'

test('promo fixture balances every person and all economic denominators', () => {
  assert.equal(demo.mode, 'demo')
  for (const person of demo.people) {
    assert.equal(person.valid + person.invalid + person.inWork, person.leads)
    assert.ok(person.reached <= person.scheduled && person.scheduled <= person.valid)
    assert.ok(person.key.startsWith('demo-'))
  }
  const sum = (key: 'leads' | 'valid' | 'reached') => demo.people.reduce((total, person) => total + person[key], 0)

  assert.equal(demo.leads, sum('leads'))
  assert.deepEqual(demo.costs.map(cost => cost.count), [sum('leads'), sum('valid'), sum('reached')])
  for (const cost of demo.costs)
    assert.equal(cost.valueLabel, `${Math.round(demo.spend / cost.count).toLocaleString('ru-RU')} ₽`)
})

test('promo demo is isolated from the universal source cards and cannot feed real dashboard totals', () => {
  const page = readFileSync(new URL('../src/pages/bento-preview.vue', import.meta.url), 'utf8')

  assert.doesNotMatch(page, /BentoPromoDetails|gymkidsPromoEconomicsDemo/)

  const adapter = readFileSync(new URL('../src/data/gymkidsSnapshot.ts', import.meta.url), 'utf8')

  assert.doesNotMatch(adapter, /gymkidsPromoEconomicsDemo/)

  const component = readFileSync(new URL('../src/components/bento/BentoPromoDetails.vue', import.meta.url), 'utf8')

  assert.match(component, /Демо<\/span>/)
  assert.match(component, /ещё не подключены/)
  assert.match(component, /@click.stop=/)
  assert.match(component, /aria-expanded=/)
  assert.match(component, /const selectedPerson = ref<string \| null>\(null\)/)
  for (const key of ['leads', 'valid', 'invalid', 'inWork', 'scheduled', 'reached'])
    assert.match(component, new RegExp(`key: '${key}'`))
})
