import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { GymkidsDashboardView, GymkidsManifest, GymkidsSnapshotDetails, GymkidsSnapshotPayload } from '../../src/data/gymkidsSnapshot'

type Adapter = (payload: GymkidsSnapshotPayload, details?: GymkidsSnapshotDetails | null, date?: string) => GymkidsDashboardView
const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'))

// Complete output contracts for the demonstration dataset.
export const snapshotContractHashes = (adapt: Adapter, dataRoot = 'public/data') => {
  const pointer = readJson(join(dataRoot, 'current.json'))
  const root = join(dataRoot, 'snapshots', pointer.release_id)
  const manifest: GymkidsManifest = readJson(join(root, 'manifest.json'))
  const hashes: Record<string, string> = {}

  for (const center of manifest.centers) {
    for (const period of center.periods) {
      const payload: GymkidsSnapshotPayload = readJson(join(root, period.payload_path))
      const details: GymkidsSnapshotDetails | null = period.details_path ? readJson(join(root, period.details_path)) : null
      const dates = [undefined, payload.overview.days[0].date, payload.overview.days[Math.floor(payload.overview.days.length / 2)].date, '1900-01-01']
      for (const [index, date] of dates.entries()) {
        for (const withDetails of [true, false]) {
          const key = `${center.center_id}/${period.month}/${index}/${withDetails ? 'details' : 'no-details'}`

          hashes[key] = createHash('sha256').update(JSON.stringify(adapt(payload, withDetails ? details : null, date))).digest('hex')
        }
      }
    }
  }

  return hashes
}
