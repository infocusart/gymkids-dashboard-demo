import type { Plugin } from 'vite'

export function excludePicomatchFromClient(): Plugin {
  return {
    name: 'exclude-picomatch-from-client',
    apply: 'build',
    generateBundle() {
      for (const id of this.getModuleIds()) {
        const path = id.replaceAll('\\', '/').split('?')[0]
        if (path === 'picomatch' || path.startsWith('picomatch/') || path.includes('/node_modules/picomatch/'))
          this.error(`picomatch is restricted to build tooling. Client import: ${id}`)
      }
    },
  }
}
