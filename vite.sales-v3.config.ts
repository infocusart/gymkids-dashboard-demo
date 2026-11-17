import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import vuetify from 'vite-plugin-vuetify'
import svgLoader from 'vite-svg-loader'
import { defineConfig } from 'vite'
import foundation from './vite.config'

export default defineConfig({
  base: '/v3/',
  publicDir: false,
  resolve: foundation.resolve,
  define: foundation.define,
  plugins: [
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
    outDir: process.env.GYMKIDS_V3_OUT_DIR ?? 'dist-sales-v3',
    rollupOptions: { input: fileURLToPath(new URL('./v3.html', import.meta.url)) },
  },
})
