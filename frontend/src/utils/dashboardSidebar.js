import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { session } from '../store'

export default {
  props: { activeSection: String, last: String },
  emits: ['navigate'],
  setup(props, { emit }) {
    const route = useRoute()
    const collapsed = ref(false)
    const expanded = reactive({ produksi: true, losses: true })
    const isInput = route.name === 'input'

    function navigate(section) {
      emit('navigate', section)
    }

    return { session, collapsed, expanded, isInput, navigate }
  }
}
