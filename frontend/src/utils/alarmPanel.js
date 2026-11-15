import { computed } from 'vue'
import { n } from './format'

export default {
  props: { alarm: Object },
  setup(props) {
    const groups = computed(() => {
      const grouped = new Map()
      for (const item of props.alarm.alarm) {
        if (!grouped.has(item.mill)) grouped.set(item.mill, [])
        grouped.get(item.mill).push(item)
      }
      return [...grouped].map(([mill, items]) => ({ mill, items }))
    })

    return { groups, n }
  }
}
