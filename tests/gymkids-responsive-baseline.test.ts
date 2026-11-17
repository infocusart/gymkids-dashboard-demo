import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('src/pages/bento-preview.vue', 'utf8')
const styles = readFileSync('src/styles/bento-preview-v2.css', 'utf8')

test('path overview uses readable compact labels while retaining full source names', () => {
  assert.match(page, /'Прямое обращение в центр': 'Прямое'/)
  assert.match(page, /'Заявка с сайта': 'Сайт'/)
  assert.match(page, /'Промоутеры': 'Промо'/)
  assert.match(page, /'Колесо фортуны': 'Колесо'/)
  assert.match(page, /'Остальные источники': 'Остальное'/)
  assert.match(page, /<strong :title="source\.label">\{\{ pathSourceLabel\(source\.label\) \}\}<\/strong>/)
  assert.match(page, /:aria-label="`\$\{source\.label\}:/)
})

test('current October source card shortens the wheel source without changing its data key', () => {
  assert.match(page, /const sourceSummaryLabel = \(label: string\) => \(\{[\s\S]*?'Колесо фортуны': 'Колесо'/)
  assert.match(page, /<span :title="source\.label">\{\{ sourceSummaryLabel\(source\.label\) \}\}<\/span>/)
})

test('compact desktop cards fit without shrinking the accepted type scale', () => {
  assert.match(styles, /@media \(min-width: 1180px\) and \(max-width: 1279px\)/)
  assert.match(styles, /\.conversion-card \.trial-value strong \{ flex-basis: auto; inline-size: auto; \}/)
  assert.match(styles, /\.quality-value \{ margin-block-start: 22px; \}/)
  assert.match(styles, /\.quality-reasons \{ margin-block-start: 18px; \}/)
})

test('header pickers expose 44px touch geometry and a persistent keyboard focus ring', () => {
  assert.match(styles, /\.center-picker-trigger \{[\s\S]*?min-block-size: 44px;/)
  assert.match(styles, /\.period-trigger \{[\s\S]*?min-block-size: 54px;/)
  assert.match(styles, /\.center-picker-trigger:focus-visible \{[\s\S]*?outline: 2px solid/)
  assert.match(styles, /\.period-trigger:focus-visible \{[\s\S]*?outline: 2px solid/)
  assert.match(styles, /\.center-picker-trigger\.is-open:focus-visible \{[\s\S]*?box-shadow: 0 0 0 5px/)
  assert.match(styles, /\.period-trigger\.is-open:focus-visible \{[\s\S]*?box-shadow: 0 0 0 5px/)
})
