import { useRouter } from 'vue-router'
import { api } from '../api'
import { clearSession } from '../store'

export default {
  props: { title: String, greeting: String },
  setup() {
    const router = useRouter()

    async function logout() {
      await api('logout').catch(() => {})
      clearSession()
      router.push('/login')
    }

    return { logout }
  }
}
