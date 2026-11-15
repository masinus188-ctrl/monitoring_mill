import { computed, ref } from 'vue'
import { n } from './format'

export default {
  props: {
    title: { type: String, required: true },
    rows: { type: Array, default: () => [] },
    columns: { type: Array, required: true },
    total: { type: Object, default: null }
  },
  setup(props) {
    const key = ref(props.columns[0]?.[0] || 'mill')
    const dir = ref(1)

    function sort(column) {
      if (key.value === column) dir.value *= -1
      else {
        key.value = column
        dir.value = 1
      }
    }

    const sorted = computed(() => [...props.rows].sort((a, b) => {
      const left = a[key.value] ?? ''
      const right = b[key.value] ?? ''
      if (typeof left === 'number' && typeof right === 'number') return dir.value * (left - right)
      return dir.value * String(left).localeCompare(String(right), 'id')
    }))

    return { n, key, dir, sort, sorted }
  }
}
