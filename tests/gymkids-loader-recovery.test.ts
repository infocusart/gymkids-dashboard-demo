import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { useGymkidsDashboard } from '../src/composables/useGymkidsDashboard'

const selected = { centerId: 'profsoyuznaya', period: '2026-07', date: '2026-07-15' }
const options = { dataBaseUrl: '/data', releaseId: '', requestTimeoutMs: 1000 }
const respond = (input: RequestInfo | URL) => new Response(readFileSync(join(process.cwd(), 'public', new URL(String(input)).pathname)), { headers: { 'Content-Type': 'application/json' } })

const run = async (body: () => Promise<void>) => {
  const originalFetch = globalThis.fetch
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')

  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { origin: 'https://example.test', href: 'https://example.test/bento-preview' } } })
  try {
    await body()
  }
  finally {
    globalThis.fetch = originalFetch
    if (originalWindow)
      Object.defineProperty(globalThis, 'window', originalWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  }
}

for (const file of ['centers', 'details']) {
  for (const mismatch of ['center', 'period']) {
    test(`a report rejects ${file} from another ${mismatch} and recovers on retry`, () => run(async () => {
      let wrongFile = true
      globalThis.fetch = async input => {
        const url = new URL(String(input))
        if (wrongFile && url.pathname.endsWith(`/${file}/profsoyuznaya/2026-07.json`)) {
          url.pathname = mismatch === 'center'
            ? url.pathname.replace('/profsoyuznaya/', '/novo-peredelkino/')
            : url.pathname.replace('2026-07.json', '2026-06.json')
        }

        return respond(url)
      }

      const model = useGymkidsDashboard(options)

      await model.initialize(selected)
      assert.equal(model.state.value, 'error')
      assert.equal(model.dashboard.value, null)
      wrongFile = false
      await model.retry()
      assert.equal(model.state.value, 'ready')
      assert.equal(model.dashboard.value?.meta.centerId, selected.centerId)
      assert.equal(model.dashboard.value?.meta.period, selected.period)
    }))
  }
}

test('retry after initial pointer failure retains center, period and day', () => run(async () => {
  let fail = true
  globalThis.fetch = async input => {
    if (fail)
      throw new TypeError('Failed to fetch')

    return respond(input)
  }

  const dashboard = useGymkidsDashboard(options)

  await dashboard.initialize(selected)
  assert.equal(dashboard.state.value, 'error')
  assert.match(dashboard.error.value, /Не удалось связаться/)
  fail = false
  await dashboard.retry()
  assert.equal(dashboard.state.value, 'ready')
  assert.equal(dashboard.selectedCenterId.value, selected.centerId)
  assert.equal(dashboard.selectedPeriod.value, selected.period)
  assert.equal(dashboard.selectedDate.value, selected.date)
}))

test('a stalled pointer ends in a retryable error', () => run(async () => {
  globalThis.fetch = async (_input, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true }))

  const dashboard = useGymkidsDashboard({ ...options, requestTimeoutMs: 30 })

  await dashboard.initialize(selected)
  assert.equal(dashboard.state.value, 'error')
  assert.equal(dashboard.dashboard.value, null)
  assert.match(dashboard.error.value, /20 секунд/)
}))

test('a stalled optional detail request cannot bypass the operation deadline', () => run(async () => {
  globalThis.fetch = async (input, init) => String(input).includes('/details/')
    ? new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true }))
    : respond(input)

  const dashboard = useGymkidsDashboard({ ...options, requestTimeoutMs: 30 })

  await dashboard.initialize(selected)
  assert.equal(dashboard.state.value, 'error')
  assert.equal(dashboard.dashboard.value, null)
}))

test('retry after switching center uses the failed target, not the preceding center', () => run(async () => {
  let failTarget = false
  globalThis.fetch = async input => {
    if (failTarget && String(input).includes('/centers/profsoyuznaya/'))
      throw new TypeError('Failed to fetch')

    return respond(input)
  }

  const dashboard = useGymkidsDashboard(options)

  await dashboard.initialize({ ...selected, centerId: 'novo-peredelkino' })
  failTarget = true
  await dashboard.selectCenter(selected.centerId)
  assert.equal(dashboard.state.value, 'error')
  failTarget = false
  await dashboard.retry()
  assert.equal(dashboard.state.value, 'ready')
  assert.equal(dashboard.selectedCenterId.value, selected.centerId)
  assert.equal(dashboard.selectedPeriod.value, selected.period)
}))

test('late failure of an older initialization cannot replace a newer successful selection', () => run(async () => {
  let calls = 0
  globalThis.fetch = async input => {
    if (++calls === 1) {
      await new Promise(resolve => setTimeout(resolve, 60))
      throw new TypeError('late failure')
    }

    return respond(input)
  }

  const dashboard = useGymkidsDashboard(options)
  const older = dashboard.initialize({ ...selected, centerId: 'novo-peredelkino' })

  await dashboard.initialize(selected)
  await older
  assert.equal(dashboard.state.value, 'ready')
  assert.equal(dashboard.selectedCenterId.value, selected.centerId)
  assert.equal(dashboard.error.value, '')
}))
