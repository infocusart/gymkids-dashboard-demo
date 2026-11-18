import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import test from 'node:test'

const require = createRequire(import.meta.url)

// Follow the active module graph. pnpm may retain unreachable copies in its store.
const queue = [path.resolve('package.json')]
const visited = new Set<string>()
const packages: string[] = []
const rollups: string[] = []
while (queue.length) {
  const manifest = realpathSync(queue.shift()!)
  if (visited.has(manifest))
    continue
  visited.add(manifest)

  const metadata = JSON.parse(readFileSync(manifest, 'utf8'))
  assert.notEqual(metadata.name, 'picomatch', 'reachable upstream matcher escaped the fork overrides')
  if (metadata.name === '@gymkids-dashboard/picomatch')
    packages.push(path.dirname(manifest))
  if (metadata.name === 'rollup')
    rollups.push(path.dirname(manifest))
  const dependencies = { ...metadata.dependencies, ...metadata.optionalDependencies, ...metadata.peerDependencies, ...(manifest === path.resolve('package.json') ? metadata.devDependencies : {}) }
  const resolver = createRequire(manifest)

  for (const name of Object.keys(dependencies)) {
    const dependency = resolver.resolve.paths(name)?.map(directory => path.join(directory, name, 'package.json')).find(existsSync)
    if (dependency)
      queue.push(dependency)
  }
}

test('repeated wildcard guards stay active independently of the nesting option', () => {
  const versions = packages.map(directory => require(path.join(directory, 'package.json')).version)

  assert.deepEqual([...new Set(versions)].sort(), ['2.3.2-gymkids.1', '4.0.7-gymkids.1'])
  for (const directory of packages) {
    const pm = require(directory)

    for (const options of [{}, { maxExtglobRecursion: false }, { maxExtglobRecursion: 2 }]) {
      // Inspect the compiled closure directly. A safe positive match alone would
      // also pass with the original repeating expression.
      const close = (pattern: string) => pm.parse(pattern, options).tokens.at(-1).output

      assert.equal(close('+(report*)'), ')')
      assert.equal(close('*(report*)'), ')?')
      assert.equal(pm.isMatch('reports.csv', '+(report*)', options), true)
      assert.equal(pm.isMatch('reports.csv', '+(report*)', { ...options, bash: true }), false)
      for (const [pattern, filename] of [
        ['+(report*|data*)', 'data.csv'],
        ['+(@(report*))', 'reports.csv'],
        ['+(assets/*.svg)', 'assets/logo.svg'],
        ['+(report**draft)', 'report-draft'],
      ]) {
        assert.equal(pm.isMatch(filename, pattern, options), false)
        assert.equal(pm.parse(pattern, options).tokens[1].value, pattern)
      }
    }
  }
})

test('installed Rollup distributions contain the reviewed parser in each embedded copy', () => {
  const expected = [
    ['dist/es/shared/node-entry.js', 'cb2c9e47d89cf7ea99d393f4ee50176fa9fd2f28eb086e27ff2df8b26539b95e'],
    ['dist/es/shared/watch.js', '0eeb4a9389abda48c3ed795d4d3243b43f76e9e3dd512b21bc0d2fdede95f915'],
    ['dist/shared/index.js', '436cc4ba7e5cd14400941759667a038fb6aedd44e249959a4c542d815c600422'],
    ['dist/shared/rollup.js', 'cb9eea270dee866e17f7ed3e8670c4c42ff5ece4a1549c5179e3b671d6dd0b0f'],
  ]

  assert.ok(rollups.length > 0)
  for (const directory of rollups) {
    assert.equal(require(path.join(directory, 'package.json')).version, '4.64.2')
    for (const [file, digest] of expected) {
      const bytes = readFileSync(path.join(directory, file))

      assert.equal(createHash('sha256').update(bytes).digest('hex'), digest, file)
    }
  }
})

test('patched matchers retain ordinary build globs, extglobs and literal stars', () => {
  const cases: [string, string, boolean][] = [
    ['src/**/*.vue', 'src/pages/reports/trial-path.vue', true],
    ['src/**/*.{ts,vue}', 'src/lib/reportPercent.ts', true],
    ['**/!(*.test).ts', 'src/lib/reportPercent.ts', true],
    ['**/!(*.test).ts', 'src/lib/reportPercent.test.ts', false],
    ['+(foo|bar)', 'foobarfoo', true],
    ['*(foo|bar)', 'barfoo', true],
    ['+(abc)', 'abcabc', true],
    ['+(a\\*)', 'a*a*', true],
    ['+([*]a)', '*a*a', true],
    ['+("a*")', 'a*a*', true],
    ['**/*.ts', 'src/main.js', false],
  ]

  for (const directory of packages) {
    const pm = require(directory)

    for (const [glob, file, expected] of cases)
      assert.equal(pm.isMatch(file, glob), expected, `${directory}: ${glob} -> ${file}`)
  }
})
