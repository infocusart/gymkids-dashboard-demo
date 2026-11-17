import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const filename = process.argv[2] || 'coverage/lcov.info'
const source = readFileSync(filename, 'utf8')
let files = 0
let executableLines = 0

const output = source.split(/\r?\n/).map(line => {
  if (line.startsWith('LF:'))
    executableLines += Number(line.slice(3))
  if (!line.startsWith('SF:'))
    return line
  const name = line.slice(3).replaceAll('\\', '/')
  if (!(name.startsWith('src/') || name.startsWith('scripts/')) || name.split('/').includes('..') || !existsSync(path.resolve(name)))
    throw new Error(`Invalid LCOV source path: ${name}`)
  files++

  return `SF:${name}`
}).join('\n')

if (!files || !Number.isFinite(executableLines) || executableLines <= 0)
  throw new Error('Coverage report contains no source measurements')
writeFileSync(filename, output)
console.log(`LCOV verified: ${files} source files; ${executableLines} measured lines`)
