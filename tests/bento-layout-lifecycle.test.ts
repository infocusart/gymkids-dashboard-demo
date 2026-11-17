import assert from 'node:assert/strict'
import test from 'node:test'
import { closeBentoLayout } from '../src/lib/bentoLayoutLifecycle'

test('busy close queues without starting a concurrent transition', async () => {
  const events: unknown[] = []

  await closeBentoLayout({
    isActive: () => true,
    requestClose: requested => events.push(requested),
    animate: async opening => {
      events.push(opening)

      return true
    },
  }, true, () => events.push('settled'))
  assert.deepEqual(events, [true])
})

test('successful closing clears the request before animation and settles afterwards', async () => {
  const events: unknown[] = []

  await closeBentoLayout({
    isActive: () => true,
    requestClose: requested => events.push(['request', requested]),
    animate: async opening => {
      events.push(['animate', opening])

      return true
    },
  }, false, () => events.push('settled'))
  assert.deepEqual(events, [['request', false], ['animate', false], 'settled'])
})

test('cancelled or rejected closing cannot settle the overview', async () => {
  let settled = false
  const layout = { isActive: () => true, requestClose: () => {}, animate: async () => false }

  await closeBentoLayout(layout, false, () => {
    settled = true
  })
  assert.equal(settled, false)
  await assert.rejects(closeBentoLayout({
    ...layout,
    animate: async () => {
      throw new Error('cancelled')
    },
  }, false, () => {
    settled = true
  }))
  assert.equal(settled, false)
})
