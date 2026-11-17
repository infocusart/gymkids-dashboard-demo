import assert from 'node:assert/strict'
import test from 'node:test'
import { bentoFocusLayoutArea, bentoFocusLayoutHasOverlap } from '../src/lib/bentoFocusLayouts'
import { trialFocusLayout, trialTiming } from '../src/lib/bentoTrialLayout'
import { freezeTrialDetails, trialContentRects } from '../src/lib/bentoTrialContent'

test('closing captures the summary inside the card border without rounding', () => {
  const summary = { getBoundingClientRect: () => ({ left: 590, top: 445, width: 347, height: 46.4375 }) }

  const card = {
    clientLeft: 1,
    clientTop: 1,
    getBoundingClientRect: () => ({ left: 573, top: 321 }),
    querySelectorAll: () => [summary],
  } as unknown as HTMLElement

  assert.deepEqual(trialContentRects(card).get(summary as unknown as HTMLElement), {
    left: 16, top: 123, width: 347, height: 46.4375,
  })
})

test('departing details retain their expanded box and cannot intercept another click', () => {
  const attributes = new Map<string, string>()

  const details = {
    style: {},
    getBoundingClientRect: () => ({ left: 590, top: 505, width: 347, height: 400.4375 }),
    setAttribute: (name: string, value: string) => attributes.set(name, value),
  }

  const card = {
    clientLeft: 1,
    clientTop: 1,
    getBoundingClientRect: () => ({ left: 573, top: 321 }),
    querySelector: () => details,
  } as unknown as HTMLElement

  freezeTrialDetails(card)
  assert.deepEqual(details.style, {
    position: 'absolute', left: '16px', top: '183px', width: '347px', height: '400.4375px', margin: '0',
  })
  assert.equal(attributes.get('inert'), '')
  assert.doesNotThrow(() => freezeTrialDetails({ querySelector: () => null } as unknown as HTMLElement))
})

const overview = {
  1: { x: 0, y: 0, w: 3, h: 2 },
  2: { x: 3, y: 0, w: 4, h: 1 },
  3: { x: 7, y: 0, w: 2, h: 1 },
  4: { x: 9, y: 0, w: 3, h: 3 },
  5: { x: 3, y: 1, w: 6, h: 2 },
  6: { x: 0, y: 2, w: 3, h: 1 },
  7: { x: 0, y: 3, w: 3, h: 1 },
  8: { x: 3, y: 3, w: 3, h: 1 },
  9: { x: 6, y: 3, w: 6, h: 1 },
} as const

test('Trial endpoint changes only Trial and Forecast, keeping Sources left of Conversion', () => {
  assert.deepEqual(trialFocusLayout, {
    ...overview,
    8: { ...overview[8], y: 1, h: 3 },
    5: { ...overview[5], x: 6, w: 3 },
  })
  assert.equal(bentoFocusLayoutArea(trialFocusLayout), 48)
  assert.equal(bentoFocusLayoutHasOverlap(trialFocusLayout), false)
  assert.ok(trialFocusLayout[2].x < trialFocusLayout[3].x)
  assert.throws(() => assert.deepEqual(overview, trialFocusLayout), 'static layout must fail acceptance')
})

test('shared-clock opening and mirrored return clear the corner, preserving bottom and right', () => {
  const clamp = (value: number) => Math.min(1, Math.max(0, value))
  const heightEase = (t: number) => t < 0.5 ? 8 * t ** 4 : 1 - 8 * (1 - t) ** 4

  for (const opening of [true, false]) {
    for (let step = 0; step <= 1000; step++) {
      const time = trialTiming.height * step / 1000
      const reflowStart = opening ? 0 : trialTiming.height - trialTiming.reflow
      const reflowTime = clamp((time - reflowStart) / trialTiming.reflow)
      const reflow = opening ? 1 - (1 - reflowTime) ** 4 : 1 - reflowTime ** 4
      const growth = opening ? heightEase(time / trialTiming.height) : 1 - heightEase(time / trialTiming.height)
      const top = 580 - 376 * growth
      const height = 222 + 376 * growth
      const forecastLeft = 393 + 393 * reflow
      const forecastWidth = 774 - 393 * reflow

      assert.ok(top >= 568 || forecastLeft >= 774, `cards cross at ${time}s, opening=${opening}`)
      assert.ok(Math.abs(top + height - 802) < 1e-9)
      assert.ok(Math.abs(forecastLeft + forecastWidth - 1167) < 1e-9)
      if (opening && step > 0) {
        assert.ok(top < 580, 'Trial starts immediately')
        assert.ok(forecastLeft > 393, 'Forecast starts on the same clock')
      }
    }
  }
})
