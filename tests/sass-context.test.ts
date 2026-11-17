import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileString } from 'sass'

const mixin = (file: string, name: string) => {
  const text = readFileSync(file, 'utf8')
  const start = text.indexOf(`@mixin ${name}`)

  assert.ok(start >= 0)
  let depth = 0
  let cursor = text.indexOf('{', start)
  for (; cursor < text.length; cursor++) {
    if (text[cursor] === '{')
      depth++
    if (text[cursor] === '}' && --depth === 0)
      return text.slice(start, cursor + 1)
  }
  throw new Error(`Unterminated mixin ${name}`)
}

test('all four parent selectors flagged by Sonar resolve in their Sass mixin context', () => {
  const core = 'src/@core/scss/base/_mixins.scss'
  const layouts = 'src/@layouts/styles/_mixins.scss'
  const before = compileString(`${mixin(core, 'before-pseudo')}\n.probe { @include before-pseudo; }`).css
  const states = compileString(`${mixin(core, 'selected-states')}\n.probe { @include selected-states('.overlay'); }`).css
  const boxed = compileString(`%boxed-content-spacing { margin: auto; } %boxed-content { max-width: 100%; }\n${mixin(layouts, 'boxed-content')}\n.probe { @include boxed-content; }`).css

  const rtl = compileString(`@use 'test:variables' as variables;\n${mixin(layouts, 'rtl')}\n.probe { @include rtl { color: red; } }`, {
    importers: [{
      canonicalize: url => url === 'test:variables' ? new URL('test:variables') : null,
      load: () => ({ contents: '$enable-rtl-styles: true;', syntax: 'scss' }),
    }],
  }).css

  assert.match(before, /\.probe::before/)
  assert.match(states, /\.probe:hover \.overlay/)
  assert.match(boxed, /\.layout-content-width-boxed\.probe/)
  assert.match(rtl, /\[dir=rtl\] \.probe/)
  for (const css of [before, states, boxed, rtl])
    assert.doesNotMatch(css, /(^|\n)\s*&/)
})
