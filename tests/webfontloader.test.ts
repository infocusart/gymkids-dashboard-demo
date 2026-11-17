import assert from 'node:assert/strict'
import test from 'node:test'
import loadFontPlugin from '../src/plugins/webfontloader'

test('optional font loading settles its failure and retains the fallback path without a browser', { timeout: 5000 }, async () => {
  const original = console.warn
  const warnings: string[] = []

  let resolveWarning: () => void = () => {}

  const warned = new Promise<void>(resolve => {
    resolveWarning = resolve
  })

  console.warn = message => {
    warnings.push(String(message))
    resolveWarning()
  }
  try {
    assert.equal(loadFontPlugin(), undefined)
    await warned
    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /системные шрифты/)
  }
  finally {
    console.warn = original
  }
})
