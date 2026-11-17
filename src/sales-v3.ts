import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import SalesV3 from '@/pages/sales-v3.vue'
import pinia from '@/plugins/2.pinia'
import vuetify from '@/plugins/vuetify'
import layouts from '@/plugins/layouts'
import iconify from '@/plugins/iconify'
import fonts from '@/plugins/webfontloader'
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

const router = createRouter({
  history: createWebHistory('/v3/'),
  routes: [{ path: '/', component: SalesV3 }],
  scrollBehavior: () => ({ top: 0 }),
})

const app = createApp(App)

app.use(router)
pinia(app)
vuetify(app)
layouts(app)
iconify()
fonts()
app.mount('#app')
