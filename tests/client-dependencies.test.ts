import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'vite'
import { excludePicomatchFromClient } from '../scripts/lib/client-dependencies'

function buildFixture(dependency: string, external = false) {
  return build({
    configFile: false,
    logLevel: 'silent',
    publicDir: false,
    plugins: [
      {
        name: 'fixture',
        resolveId: id => id === 'fixture' || id === dependency ? id : null,
        load(id) {
          if (id === 'fixture')
            return `export const load = () => import(${JSON.stringify(dependency)})`
          if (id === dependency)
            return 'export default 42'
        },
      },
      excludePicomatchFromClient(),
    ],
    build: {
      write: false,
      lib: { entry: 'fixture', formats: ['es'], fileName: 'fixture' },
      rollupOptions: { input: 'fixture', external: external ? [dependency] : [] },
    },
  })
}

test('client build allows similarly named modules', async () => {
  await buildFixture('/node_modules/picomatch-helper/index.js')
})

test('client build blocks bundled and external picomatch imports', async () => {
  for (const name of ['/node_modules/.pnpm/picomatch@4/node_modules/picomatch/index.js', 'picomatch', 'picomatch/posix'])
    await assert.rejects(buildFixture(name, !name.startsWith('/')), /picomatch is restricted to build tooling/)
})
