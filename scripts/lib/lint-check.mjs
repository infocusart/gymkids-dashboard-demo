import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'

// Require zero lint errors and warnings.
export const runLintCheck = async ({
  root,
  configFile = path.join(root, '.eslintrc.cjs'),
  patterns = ['.', 'scripts/lib/lint-check.mjs'],
}) => {
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: configFile,
    extensions: ['.ts', '.js', '.cjs', '.vue', '.tsx', '.jsx'],
    fix: false,
  })

  const results = await eslint.lintFiles(patterns)
  const errors = results.reduce((sum, result) => sum + result.errorCount, 0)
  const warnings = results.reduce((sum, result) => sum + result.warningCount, 0)
  const formatter = await eslint.loadFormatter('stylish')
  const output = formatter.format(results)
  if (output)
    console.error(output)

  console.log(`Strict lint: ${results.length} files; ${errors} errors; ${warnings} warnings (maximum 0).`)

  return errors || warnings ? 1 : 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../../', import.meta.url))

  process.exitCode = await runLintCheck({ root })
}
