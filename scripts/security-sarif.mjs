import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const directory = process.argv[2]
if (!directory)
  throw new Error('Usage: node scripts/security-sarif.mjs <SARIF directory>')
const files = readdirSync(directory).filter(name => name.endsWith('.sarif'))
if (!files.length)
  throw new Error('No SARIF results were produced')
let findings = 0
for (const file of files) {
  const report = JSON.parse(readFileSync(join(directory, file), 'utf8'))
  if (!Array.isArray(report.runs) || !report.runs.length)
    throw new Error(`${file}: missing analysis runs`)
  for (const run of report.runs) {
    if (!Array.isArray(run.results))
      throw new Error(`${file}: missing results`)
    if (!Array.isArray(run.invocations) || !run.invocations.length)
      throw new Error(`${file}: missing execution status`)
    for (const invocation of run.invocations) {
      if (invocation.executionSuccessful !== true)
        throw new Error(`${file}: analysis execution was not successful`)
      if (invocation.toolExecutionNotifications?.some(notification => ['warning', 'error'].includes(notification.level)))
        throw new Error(`${file}: analysis reported incomplete coverage or execution warnings`)
    }
    for (const invocation of run.invocations ?? []) {
      if (invocation.executionSuccessful === false)
        throw new Error(`${file}: analysis did not complete`)
      if (invocation.toolExecutionNotifications?.some(item => ['warning', 'error'].includes(item.level)))
        throw new Error(`${file}: unresolved scanner diagnostics`)
    }
    findings += run.results.length
    for (const result of run.results)
      console.error(`${file}: ${result.ruleId}: ${result.message?.text ?? 'finding'}`)
  }
}
if (findings)
  throw new Error(`Security analysis reported ${findings} findings`)
console.log(`Security analysis passed (${files.length} SARIF reports)`)
