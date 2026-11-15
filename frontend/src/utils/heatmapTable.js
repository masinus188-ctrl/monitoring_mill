import { ref, computed } from 'vue'
import { BL, n } from './format'

const MILL_ORDER = ['SLM', 'NBM', 'SYM', 'SGM', 'SKM', 'MLM', 'NKM', 'SCM', 'SJM', 'KTM', 'PKM']

export default {
  props: { hm: Object },
  setup(props) {
    const k = ref('olah')
    const days = computed(() => Array.from({ length: props.hm.hari }, (_, i) => i + 1))
    const mills = computed(() => [...new Set(props.hm.data.map(item => item.mill))]
      .sort((a, b) => {
        const indexA = MILL_ORDER.indexOf(a)
        const indexB = MILL_ORDER.indexOf(b)
        if (indexA < 0 && indexB < 0) return a.localeCompare(b)
        if (indexA < 0) return 1
        if (indexB < 0) return -1
        return indexA - indexB
      }))
    const map = computed(() => Object.fromEntries(props.hm.data.map(item => [item.mill + '|' + item.d, item])))
    const range = computed(() => {
      const values = props.hm.data.map(item => item[k.value]).filter(value => value != null)
      return [Math.min(...values), Math.max(...values)]
    })
    const val = (mill, day) => map.value[mill + '|' + day]?.[k.value]
    const cell = value => value == null ? '' : n(value, k.value === 'olah' ? 0 : 1)

    function color(value) {
      if (value == null) return '#eee'
      const [low, high] = range.value
      let ratio = (value - low) / ((high - low) || 1)
      if (k.value === 'ol') ratio = 1 - ratio
      return `hsl(${ratio * 120},60%,62%)`
    }

    return { BL, n, k, days, mills, val, cell, color }
  }
}
