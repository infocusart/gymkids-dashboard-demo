import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import vuetify from 'vite-plugin-vuetify'
import svgLoader from 'vite-svg-loader'
import { defineConfig } from 'vite'
import { excludePicomatchFromClient } from './scripts/lib/client-dependencies'
import foundation from './vite.config'

export default defineConfig({
  base: '/v2/',
  publicDir: false,
  resolve: foundation.resolve,
  define: foundation.define,
  plugins: [
    excludePicomatchFromClient(),
    {
      name: 'sales-page-metadata',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('/src/pages/sales-bento.vue')) {
          const navigation = /<RouterLink\s+:to="\{ path: '\/bento-preview-focus', query: \{ center, period \} \}"\s*>\s*Привлечение\s*<\/RouterLink>/
          if (!navigation.test(code))
            throw new Error('Sales navigation changed; review the public destination')

          return code
            .replace('definePage({ meta: { layout: \'blank\', public: true } })', '')
            .replace(navigation, '<a :href="`/bento-preview?center=$' + '{encodeURIComponent(center)}&period=$' + '{encodeURIComponent(period)}`">Привлечение</a>')
        }
      },
    },
    vue(),
    vuetify({ styles: { configFile: 'src/assets/styles/variables/_vuetify.scss' } }),
    Components({ dirs: ['src/@core/components', 'src/components/sales'], dts: false }),
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core', '@vueuse/math', 'vue-i18n', 'pinia'],
      dirs: ['./src/@core/utils', './src/@core/composable/', './src/composables/', './src/utils/'],
      vueTemplate: true,
      dts: false,
      ignore: ['useCookies', 'useStorage'],
    }),
    svgLoader(),
  ],
  build: {
    outDir: process.env.GYMKIDS_V2_OUT_DIR ?? 'dist-sales-v2',
    rollupOptions: { input: fileURLToPath(new URL('./v2.html', import.meta.url)) },
  },
})
