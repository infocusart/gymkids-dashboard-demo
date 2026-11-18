import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'vite'
import { excludePicomatchFromClient } from '../scripts/lib/client-dependencies'

function buildFixture(dependency: string, external = false, configFile: string | false = false) {
  return build({
    configFile,
    logLevel: 'silent',
    publicDir: false,
    plugins: [
      {
        name: 'fixture',
        enforce: 'pre',
        resolveId(id) {
          if (id === 'fixture')
            return id
          if (id === 'fixture-dependency')
            return { id: dependency, external }
        },
        load(id) {
          if (id === 'fixture')
            return 'export const load = () => import("fixture-dependency")'
          if (id === dependency)
            return 'export default 42'
        },
      },
      configFile === false && excludePicomatchFromClient(),
    ],
    build: {
      write: false,
      lib: { entry: 'fixture', formats: ['es'], fileName: 'fixture' },
      rollupOptions: { input: 'fixture' },
    },
  })
}

test('client build allows similarly named modules', async () => {
  await assert.doesNotReject(() => buildFixture('/node_modules/picomatch-helper/index.js'))
})

test('client build blocks bundled and external picomatch imports', async () => {
  for (const name of ['/node_modules/.pnpm/picomatch@4/node_modules/picomatch/index.js', 'picomatch', 'picomatch/posix'])
    await assert.rejects(buildFixture(name, !name.startsWith('/')), /picomatch is restricted to build tooling/)
})

test('client build blocks tools shipping embedded matchers', async () => {
  for (const name of ['tsx', 'case-police', 'vite-plugin-vue-devtools']) {
    for (const [id, external] of [[name, true], [`/node_modules/${name}/dist/cli.mjs`, false]] as const)
      await assert.rejects(buildFixture(id, external), new RegExp(`${name} is restricted to build tooling`))
  }
})

for (const config of ['vite.sales.config.ts', 'vite.sales-v3.config.ts']) {
  test(`${config} rejects a client import of picomatch`, async () => {
    await assert.rejects(buildFixture('picomatch', true, config), /picomatch is restricted to build tooling/)
  })
}
