import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { rgbaToHex } from '../src/@core/utils/colorConverter'
import { formatDate, kFormatter } from '../src/@core/utils/formatters'
import { passwordValidator } from '../src/@core/utils/validators'
import { stripParenthesizedNotes } from '../src/lib/reportText'
import { slugify } from '../scripts/changelog.mjs'

test('report number formatting preserves the original output across thresholds and signs', () => {
  const legacy = (num: number) => Math.abs(num) > 9999 ? `${Math.sign(num) * +((Math.abs(num) / 1000).toFixed(1))}k` : Math.abs(num).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const values = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -0, 9999.5, 9999.99, 10000, -10000]
  for (let value = -20000; value <= 20000; value += 17)
    values.push(value / 2, value)
  for (const value of values)
    assert.equal(kFormatter(value), legacy(value), String(value))
})

test('date formatting keeps caller options separate from the shared immutable default', () => {
  const value = '2026-11-17T12:00:00Z'
  const options: Intl.DateTimeFormatOptions = { year: '2-digit', timeZone: 'UTC' }

  assert.equal(formatDate(value, options), new Intl.DateTimeFormat('en-US', options).format(new Date(value)))
  assert.deepEqual(options, { year: '2-digit', timeZone: 'UTC' })
  assert.equal(formatDate(value), new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)))
  assert.equal(formatDate(''), '')
})

test('password validation keeps the existing policy including line boundaries', () => {
  const legacy = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/
  const values = ['Abcdef1!', 'short1!', 'ABCDEFG1!', 'abcdefg1!', 'Abcdefg!', 'Abcdef12', '', '😀Aa123!', 'Abc1!\nxyz', 'abc\nDEF1!', 'Abcdef1!\r\nother', 'Abcdef1!\u2028text']
  let seed = 571
  const alphabet = 'abAZ19!% _\n\r\u2028\u2029'
  for (let index = 0; index < 4096; index++) {
    let value = ''
    for (let length = 0; length < index % 24; length++) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      value += alphabet[seed % alphabet.length]
    }
    values.push(value)
  }
  for (const value of values)
    assert.equal(passwordValidator(value) === true, legacy.test(value), JSON.stringify(value))
})

test('long invalid passwords and unmatched report notes finish within a time bound', () => {
  const script = `
    const {passwordValidator}=await import(process.argv[1]);
    const {stripParenthesizedNotes}=await import(process.argv[2]);
    if(passwordValidator('a'.repeat(200000))===true) process.exit(1);
    const label='('.repeat(200000);
    if(stripParenthesizedNotes(label)!==label) process.exit(1);
  `

  const child = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', script, new URL('../src/@core/utils/validators.ts', import.meta.url).href, new URL('../src/lib/reportText.ts', import.meta.url).href], { timeout: 5000, encoding: 'utf8' })

  assert.ifError(child.error)
  assert.equal(child.status, 0, child.stderr)
})

test('report notes and changelog identities preserve existing string transformations', () => {
  const values = ['', 'Прямое (центр)', 'A (note) B', 'a\n (b) c', 'a((b)c)', '(a)(b)', 'x(y', ' x ) y ', '___Игорь___', 'Émma / Grimm', '-'.repeat(20000)]
  let seed = 52
  const alphabet = 'abАЯ- ()\t\n😊'
  for (let index = 0; index < 4096; index++) {
    let value = ''
    for (let length = 0; length < index % 48; length++) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      value += alphabet[seed % alphabet.length]
    }
    values.push(value)
  }
  for (const value of values) {
    assert.equal(stripParenthesizedNotes(value), value.replace(/\s*\([^)]*\)/g, '').trim(), JSON.stringify(value))

    const oldSlug = value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9\u0430-\u044Fё]+/giu, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'participant'

    assert.equal(slugify(value), oldSlug)
  }
})

test('RGBA conversion keeps colors and optional alpha with explicit prefix and suffix parsing', () => {
  assert.equal(rgbaToHex('rgb(255, 0, 16)'), '#ff0010')
  assert.equal(rgbaToHex('rgba(0, 128, 255, 0.5)'), '#0080ff80')
  assert.equal(rgbaToHex('rgba(0, 128, 255, 0.5)', true), '#0080ff')
})
