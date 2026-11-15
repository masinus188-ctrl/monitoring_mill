import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { loadSession } from '../store'

export default {
  setup() {
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const err = ref('')
    const busy = ref(false)
    const showPassword = ref(false)

    async function submit() {
      busy.value = true
      err.value = ''
      try {
        await api('login', {}, { username: username.value, password: password.value })
        await loadSession()
        router.push('/')
      } catch (error) {
        err.value = error.message
      } finally {
        busy.value = false
      }
    }

    return { username, password, err, busy, showPassword, submit }
  }
}
