import { ref, computed } from 'vue'
import { COLS } from './columns'
import { n } from './format'

export default {
  props: { rows: Array, total: Object },
  setup(props) {
    const key = ref('mill')
    const dir = ref(1)

    function sort(column) {
      if (key.value === column) dir.value *= -1
      else {
        key.value = column
        dir.value = 1
      }
    }

    const sorted = computed(() => [...props.rows].sort((a, b) => (
      dir.value * ((a[key.value] ?? -1e18) > (b[key.value] ?? -1e18) ? 1 : -1)
    )))

    return { COLS, n, key, dir, sort, sorted }
  }
}
