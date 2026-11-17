import assert from 'node:assert/strict'
import test from 'node:test'
import {
  normalizeGymkidsPreviewArtifact,
  normalizeGymkidsReviewPreviewArtifact,
} from '../src/lib/gymkidsMcpPreview'

const request = {
  changeId: 'chg-1234567890abcdef1234567890abcdef',
  contentHash: `sha256-${'a'.repeat(64)}`,
  origin: 'https://mcp.gymkids-fr.infocuslab.ru',
  centerId: 'novo-peredelkino',
  period: '2026-07',
}

const artifact = (changes: unknown[]) => ({
  schema_version: 'gymkids.preview.v1',
  change_id: request.changeId,
  content_hash: request.contentHash,
  scope: {
    center_id: request.centerId,
    center_name: 'Новопеределкино',
    period: request.period,
    from: '2026-07-01',
    to: '2026-07-31',
  },
  changes,
})

test('applies the exact colleague request to rename the sources card', () => {
  const preview = normalizeGymkidsPreviewArtifact(artifact([{
    block_id: 'main.lead-sources',
    operation: 'set_copy',
    payload: { title: 'Источники' },
  }]), request)

  assert.equal(preview.blocks['main.lead-sources']?.title, 'Источники')
})

test('merges typed changes for one bento block', () => {
  const preview = normalizeGymkidsPreviewArtifact(artifact([
    { block_id: 'main.site-leads', operation: 'set_visibility', payload: { visible: false } },
    { block_id: 'main.site-leads', operation: 'set_layout', payload: { layout: 'wide' } },
  ]), request)

  assert.deepEqual(preview.blocks['main.site-leads'], { visible: false, layout: 'wide' })
})

test('rejects a receipt for another center', () => {
  assert.throws(
    () => normalizeGymkidsPreviewArtifact({
      ...artifact([{ block_id: 'main.site-leads', operation: 'set_copy', payload: { title: 'Сайт' } }]),
      scope: { ...artifact([]).scope, center_id: 'salaryevo' },
    }, request),
    /другого центра/,
  )
})

test('rejects arbitrary blocks and untyped operations', () => {
  assert.throws(
    () => normalizeGymkidsPreviewArtifact(artifact([{
      block_id: 'shell.header',
      operation: 'replace_text',
      payload: { title: 'X' },
    }]), request),
    /неизвестный блок/,
  )
})

test('accepts a sanitized owner-session artifact without a private hash', () => {
  const preview = normalizeGymkidsReviewPreviewArtifact({
    schema_version: 'gymkids.review-preview.v1',
    change_id: request.changeId,
    scope: artifact([]).scope,
    changes: [{
      block_id: 'main.current-stages',
      operation: 'set_copy',
      payload: { title: 'CRM-стадии заявок за выбранный период' },
    }],
  }, request)

  assert.equal(preview.contentHash, null)
  assert.equal(
    preview.blocks['main.current-stages']?.title,
    'CRM-стадии заявок за выбранный период',
  )
})

test('owner-session artifact fails closed on center mismatch', () => {
  assert.throws(() => normalizeGymkidsReviewPreviewArtifact({
    schema_version: 'gymkids.review-preview.v1',
    change_id: request.changeId,
    scope: { ...artifact([]).scope, center_id: 'salaryevo' },
    changes: [{
      block_id: 'main.current-stages',
      operation: 'set_copy',
      payload: { title: 'CRM-стадии заявок за выбранный период' },
    }],
  }, request), /другого центра/)
})
