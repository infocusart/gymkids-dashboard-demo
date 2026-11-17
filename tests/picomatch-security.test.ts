import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import test from 'node:test'

const require = createRequire(import.meta.url)

// Follow the active module graph. pnpm may retain unreachable copies in its store.
const queue = [path.resolve('package.json')]
const visited = new Set<string>()
const packages: string[] = []
while (queue.length) {
  const manifest = realpathSync(queue.shift()!)
  if (visited.has(manifest))
    continue
  visited.add(manifest)

  const metadata = JSON.parse(readFileSync(manifest, 'utf8'))
  if (metadata.name === 'picomatch')
    packages.push(path.dirname(manifest))
  const dependencies = { ...metadata.dependencies, ...metadata.optionalDependencies, ...metadata.peerDependencies, ...(manifest === path.resolve('package.json') ? metadata.devDependencies : {}) }
  const resolver = createRequire(manifest)

  for (const name of Object.keys(dependencies)) {
    const dependency = resolver.resolve.paths(name)?.map(directory => path.join(directory, name, 'package.json')).find(existsSync)
    if (dependency)
      queue.push(dependency)
  }
}

test('every installed picomatch copy rejects repeated wildcard extglobs within a time bound', () => {
  assert.ok(packages.length >= 2, 'Both locked picomatch versions must be installed')
  for (const directory of packages) {
    // Child processes make a regression fail instead of hanging the test runner.
    const script = `
      const assert = require('node:assert/strict');
      const pm = require(process.argv[1]);
      const patterns = ['+(*a)', '*(a*)', '+(*)z', '+(a*b)', '+(@(*a))', '+(*a|b)', '+([*a)', '+(x**a)'];
      for (const pattern of patterns) {
        for (const options of [{}, { capture: true }, { maxExtglobRecursion: false }]) {
          const matcher = pm(pattern, options);
          for (const prefix of ['a', '[a', 'xa'])
            assert.equal(matcher(prefix.repeat(48) + '!'), false, pattern);
        }
      }
    `

    const child = spawnSync(process.execPath, ['-e', script, directory], { timeout: 3000, encoding: 'utf8' })

    assert.ifError(child.error)
    assert.equal(child.status, 0, `${directory}\n${child.stderr}`)
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
