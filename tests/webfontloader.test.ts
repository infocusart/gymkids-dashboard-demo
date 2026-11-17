import assert from 'node:assert/strict'
import test from 'node:test'
import loadFontPlugin from '../src/plugins/webfontloader'

test('optional font loading settles its failure and retains the fallback path without a browser', async () => {
  const original = console.warn
  const warnings: string[] = []

  console.warn = message => warnings.push(String(message))
  try {
    await loadFontPlugin()
    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /системные шрифты/)
  }
  finally {
    console.warn = original
  }
})
