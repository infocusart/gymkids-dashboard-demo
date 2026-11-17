import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, reactive } from 'vue'
import before from './fixtures/sales-selection-contract.json'

const records = [
  { centerId: 'novo-peredelkino', centerName: 'Ново', period: '2026-08' },
  { centerId: 'salaryevo', centerName: 'Саларьево', period: '2026-09' },
]

const exercise = (source: string, initial: Record<string, string>) => {
  const route = reactive({ query: { ...initial } })
  const calls: unknown[] = []

  const router = {
    replace: (value: { query: Record<string, string> }) => {
      calls.push(structuredClone(value))
      route.query = value.query

      return Promise.resolve()
    },
  }

  const code = ts.transpile(source, { target: ts.ScriptTarget.ESNext })
  const create = runInNewContext(`(function(computed,route,router,salesRecords){${code};return {center,period}})`)
  const selection = create(computed, route, router, records)
  const values = [[selection.center.value, selection.period.value]]

  selection.center.value = 'salaryevo'
  values.push([selection.center.value, selection.period.value])
  selection.period.value = '2026-08'
  values.push([selection.center.value, selection.period.value])

  return { values, calls, finalQuery: { ...route.query } }
}

test('sales setters retain router.replace, normalization and unrelated URL parameters', () => {
  for (const name of ['sales-bento', 'sales-v3'] as const) {
    const page = readFileSync(`src/pages/${name}.vue`, 'utf8')
    const current = page.slice(page.indexOf('const centers ='), page.indexOf('const record = computed'))
    for (const query of [
      { center: 'novo-peredelkino', period: '2026-08', extra: 'preserved', date: '2026-08-10' },
      { center: 'missing', period: 'missing', extra: 'preserved', date: '2026-08-10' },
    ]) {
      const baseline = exercise(before[name], query)

      assert.deepEqual(exercise(current, query), baseline)
      assert.equal(baseline.calls.length, 2)
      assert.equal(baseline.finalQuery.extra, 'preserved')
      assert.equal(baseline.finalQuery.date, query.date)
    }
  }
})
