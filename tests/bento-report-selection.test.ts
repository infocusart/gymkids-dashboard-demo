import assert from 'node:assert/strict'
import test from 'node:test'
import { computed, ref } from 'vue'
import { useBentoReportSelection } from '../src/composables/useBentoReportSelection'
import type { GymkidsManifest } from '../src/data/gymkidsSnapshotTypes'
import manifest from '../public/data/snapshots/demo-2026-v1/manifest.json'

const centers = manifest.centers satisfies GymkidsManifest['centers']

function picker(selected: string, selectCenter: (id: string) => Promise<void>, syncSelectionQuery: () => void) {
  return useBentoReportSelection({
    centers: computed(() => centers),
    dashboard: ref(null),
    selectedCenterId: ref(selected),
    selectCenter,
    syncSelectionQuery,
    resetFocusMotion: async () => {},
    selectDate: () => {},
    selectPeriod: async () => {},
    replaceSelectionDate: () => {},
  })
}

function keydown(key: string) {
  return Object.assign(new Event('keydown', { cancelable: true }), { key }) as KeyboardEvent
}

test('Enter waits for the selected center to load before syncing the report URL', async () => {
  const calls: string[] = []
  const loading = Promise.withResolvers<void>()
  const started = Promise.withResolvers<void>()

  const selection = picker(centers[1].center_id, async id => {
    calls.push(id)
    started.resolve()

    await loading.promise
  }, () => calls.push('sync'))

  selection.isCenterMenuOpen.value = true

  const event = keydown('Enter')
  const pending = selection.handleCenterListboxKeydown(event)

  await started.promise
  assert.ok(event.defaultPrevented)
  assert.equal(selection.isCenterMenuOpen.value, false)
  assert.deepEqual(calls, [centers[0].center_id])
  loading.resolve()

  await pending
  assert.deepEqual(calls, [centers[0].center_id, 'sync'])
})

test('Space on the current center closes the picker without loading or syncing again', async () => {
  const selection = picker(centers[0].center_id, async () => assert.fail('unexpected reload'), () => assert.fail('unexpected URL update'))

  selection.isCenterMenuOpen.value = true

  const event = keydown(' ')

  await selection.handleCenterListboxKeydown(event)
  assert.ok(event.defaultPrevented)
  assert.equal(selection.isCenterMenuOpen.value, false)
})
