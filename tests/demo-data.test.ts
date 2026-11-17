import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { baseBalance, salesRecords } from '../src/lib/planerkiSales'
import { monthlySales } from '../src/lib/salesMonthly'
import { getGymkidsApprovedLeadPlan } from '../src/data/gymkidsPlans'
import { adaptGymkidsSnapshot, validateGymkidsManifest } from '../src/data/gymkidsSnapshot'

const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const pointer = read('public/data/current.json')
const root = `public/data/snapshots/${pointer.release_id}`

test('demonstration data is labeled and every daily funnel reconciles', () => {
  assert.equal(pointer.environment, 'demo')
  assert.match(pointer.demo_notice, /не отражают реальные показатели/)

  const manifest = validateGymkidsManifest(read(`${root}/manifest.json`))

  assert.equal(manifest.centers.length, 18)
  for (const center of manifest.centers) {
    for (const period of center.periods) {
      const payload = read(`${root}/${period.payload_path}`)

      assert.equal(payload.environment, 'demo')
      assert.match(payload.demo_notice, /демонстрации/)
      for (const day of payload.overview.days) {
        assert.equal(day.valid + day.invalid + day.in_work, day.leads)
        assert.ok(day.reached <= day.scheduled && day.scheduled <= day.valid)

        const sources = Object.values(payload.overview.source_by_key_by_date[day.date]) as { leads: number }[]

        assert.equal(sources.reduce((sum, source) => sum + source.leads, 0), day.leads)
      }
      const view = adaptGymkidsSnapshot(payload, null)

      assert.ok(view.leads.fact > 0)
      assert.ok(view.meta.planReady)
    }
  }
})

test('demonstration plans have explicit provenance and unknown plans remain absent', () => {
  const plan = getGymkidsApprovedLeadPlan('novo-peredelkino', '2026-09')

  assert.ok(plan)
  assert.equal(plan.source.workbook, 'Демонстрационные данные')
  assert.equal((plan.internetLeads ?? 0) + (plan.promoLeads ?? 0) + (plan.eventsCallsOtherLeads ?? 0) + (plan.referralDirectLeads ?? 0), plan.totalLeads)
  assert.equal(getGymkidsApprovedLeadPlan('missing-center', '2026-09'), null)
})

test('synthetic sales separate groups, individual sales, refunds and balances', () => {
  const record = salesRecords.find(item => item.centerId === 'novo-peredelkino' && item.period === '2026-08')!
  const model = monthlySales(record)

  assert.equal(model.groups, 65)
  assert.equal(model.other, 9)
  assert.equal(model.allNew, 74)
  assert.equal(model.lostGroups, 40)
  assert.equal(model.replacement, 25)
  assert.equal(baseBalance(record), 49)
  assert.equal(model.purchaseRate, 74 / 160)
  assert.equal(model.attendanceRate, 160 / 220)
  assert.equal(model.leadTrialRate, 160 / 500)
})
