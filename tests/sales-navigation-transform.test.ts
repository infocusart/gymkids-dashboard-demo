import assert from 'node:assert/strict'
import test from 'node:test'
import type { Plugin, UserConfig } from 'vite'
import config from '../vite.sales.config'

const plugin = (config as UserConfig).plugins?.flat().find(item => item && 'name' in item && item.name === 'sales-page-metadata') as Plugin
const hook = plugin.transform

const transform = hook as (code: string, id: string) => string | undefined
const inline = '<RouterLink :to="{ path: \'/bento-preview-focus\', query: { center, period } }">Привлечение</RouterLink>'
const multiline = '<RouterLink\n :to="{ path: \'/bento-preview-focus\', query: { center, period } }"\n>\nПривлечение\n</RouterLink>'
const sibling = '<RouterLink to="/other">Соседняя ссылка</RouterLink>'

test('standalone sales replaces only its accepted destination with either template formatting', () => {
  assert.equal(typeof hook, 'function')

  const before = transform(`${sibling}${inline}${sibling}`, '/project/src/pages/sales-bento.vue')
  const after = transform(`${sibling}${multiline}${sibling}`, '/project/src/pages/sales-bento.vue')

  assert.equal(after, before)
  assert.equal(after?.split(sibling).length, 3)
  assert.ok(after?.includes('encodeURIComponent(center)'))
  assert.ok(after?.includes('encodeURIComponent(period)'))
  assert.equal(transform(inline, '/project/src/pages/other.vue'), undefined)
  assert.throws(() => transform(inline.replace('/bento-preview-focus', '/other'), '/project/src/pages/sales-bento.vue'), /Sales navigation changed/)
})
