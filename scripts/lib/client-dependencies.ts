import type { Plugin } from 'vite'

// These build tools also distribute their own copy of the matcher.
const buildOnlyPackages = new Set(['picomatch', 'tsx', 'case-police', 'vite-plugin-vue-devtools'])

export function excludePicomatchFromClient(): Plugin {
  return {
    name: 'exclude-picomatch-from-client',
    apply: 'build',
    generateBundle() {
      for (const id of this.getModuleIds()) {
        const path = id.replaceAll('\\', '/').split('?')[0]
        const packageName = path.split('/node_modules/').at(-1)?.split('/')[0]
        if (packageName && buildOnlyPackages.has(packageName))
          this.error(`${packageName} is restricted to build tooling. Client import: ${id}`)
      }
    },
  }
}
