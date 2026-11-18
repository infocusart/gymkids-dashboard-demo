import type { Plugin } from 'vite'

// These build tools also distribute their own copy of the matcher.
const buildOnlyPackages = ['picomatch', '@gymkids-dashboard/picomatch', 'tsx', 'case-police', 'vite-plugin-vue-devtools']

export function excludePicomatchFromClient(): Plugin {
  return {
    name: 'exclude-picomatch-from-client',
    apply: 'build',
    generateBundle() {
      for (const id of this.getModuleIds()) {
        const path = id.replaceAll('\\', '/').split('?')[0]
        const specifier = path.split('/node_modules/').at(-1) ?? path
        const packageName = buildOnlyPackages.find(name => specifier === name || specifier.startsWith(`${name}/`))
        if (packageName)
          this.error(`${packageName} is restricted to build tooling. Client import: ${id}`)
      }
    },
  }
}
