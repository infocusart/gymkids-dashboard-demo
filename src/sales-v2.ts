import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import SalesDashboard from '@/pages/sales-bento.vue'
import pinia from '@/plugins/2.pinia'
import vuetify from '@/plugins/vuetify'
import layouts from '@/plugins/layouts'
import iconify from '@/plugins/iconify'
import fonts from '@/plugins/webfontloader'
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// A dedicated entry keeps unrelated local pages out of the public release.
const router = createRouter({
  history: createWebHistory('/v2/'),
  routes: [
    { path: '/', component: SalesDashboard },
  ],
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
