import assert from 'node:assert/strict'
import test from 'node:test'
import {
  displayChangelogRoutes,
  formatRussianCount,
  livePreviewLaunchPath,
  releaseDecisionSummary,
} from '../src/lib/changelogDisplay'

test('keeps technical routes truthful instead of turning legacy pages into a bento preview', () => {
  assert.deepEqual(displayChangelogRoutes([
    '/prototype/details/funnel-progression.html',
    '/prototype/details/lead-sources.html',
    '/prototype/details/trial-cohorts.html',
  ]), [
    '/prototype/details/funnel-progression.html',
    '/prototype/details/lead-sources.html',
    '/prototype/details/trial-cohorts.html',
  ])
})

test('offers only a compatible owner review launch path', () => {
  assert.equal(livePreviewLaunchPath({
    source: 'mcp_change_set',
    preview: { compatible: true, launch_path: '/review-preview/chg-123' },
  }), '/review-preview/chg-123')
  assert.equal(livePreviewLaunchPath({
    source: 'mcp_change_set',
    preview: { compatible: false, launch_path: null },
  }), null)
  assert.equal(livePreviewLaunchPath({
    source: 'team_work_log',
    preview: { compatible: true, launch_path: '/review-preview/chg-123' },
  }), null)
})

test('keeps a concise release summary and falls back from a long diff to the objective', () => {
  assert.equal(releaseDecisionSummary({
    objective: 'Короткая суть работы.',
    release_intent: 'Резервное описание.',
    release_summary: 'Заявки: заголовок → «Все заявки»',
  }), 'Заявки: заголовок → «Все заявки»')

  assert.equal(releaseDecisionSummary({
    objective: 'Короткая суть работы.',
    release_intent: 'Резервное описание.',
    release_summary: 'x'.repeat(181),
  }), 'Короткая суть работы.')
})

test('uses Russian count forms in card metadata', () => {
  assert.equal(formatRussianCount(1, 'шаг', 'шага', 'шагов'), '1 шаг')
  assert.equal(formatRussianCount(4, 'шаг', 'шага', 'шагов'), '4 шага')
  assert.equal(formatRussianCount(11, 'шаг', 'шага', 'шагов'), '11 шагов')
  assert.equal(formatRussianCount(21, 'шаг', 'шага', 'шагов'), '21 шаг')
})
