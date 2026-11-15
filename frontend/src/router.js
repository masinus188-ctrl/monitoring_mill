import { createRouter, createWebHashHistory } from 'vue-router'
import { session, loadSession } from './store'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import InputView from './views/InputView.vue'

const router = createRouter({
  history: createWebHashHistory(),   // mode hash: tidak perlu konfigurasi rewrite di web server
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/input', name: 'input', component: InputView },
    { path: '/login', name: 'login', component: LoginView },
  ],
})

router.beforeEach(async to => {
  if (to.name === 'login') return true
  if (!session.ready) { try { await loadSession() } catch (e) { return { name: 'login' } } }
  if (to.name === 'input' && session.role === 'viewer') return { name: 'dashboard' }
})
export default router
