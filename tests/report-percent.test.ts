import assert from 'node:assert/strict'
import test from 'node:test'
import { parseReportPercent } from '../src/lib/reportPercent'

test('parses report percentages and rejects malformed or out-of-range values', () => {
  for (const [value, expected] of [['70%', 70], ['39,5%', 39.5], ['0%', 0], ['100.00%', 100], [' 42.25% ', 42.25], ['40', 40]] as const)
    assert.equal(parseReportPercent(value), expected, value)
  for (const value of ['—', '', '70%%', '7%0', '39,,5%', '-1%', '100.1%', '1e2%', 'Infinity', '<b>70%</b>', '7\n0%'])
    assert.equal(parseReportPercent(value), null, value)
})
