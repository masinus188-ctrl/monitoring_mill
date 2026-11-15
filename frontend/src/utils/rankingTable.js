import { computed, reactive } from 'vue'
import { n } from './format'

export default {
  props: { rows: { type: Array, default: () => [] } },
  setup(props) {
    const activeSides = reactive({})
    const definitions = [
      ['ach', '% Capai Target', true, '🎯'],
      ['oer', 'OER %', true, '🌿'],
      ['ker', 'KER %', true, '🥥'],
      ['util', 'Utilitas %', true, '⚙️'],
      ['ol', 'Oil Losses %', false, '💧'],
      ['kl', 'Kernel Losses %', false, '🫘'],
      ['cost_tbs', 'Biaya/TBS', false, '💰']
    ]

    const metrics = computed(() => definitions.map(([key, label, higherIsBetter, icon]) => {
      const ranked = props.rows
        .filter(row => row[key] != null && Number.isFinite(Number(row[key])))
        .slice()
        .sort((a, b) => higherIsBetter ? Number(b[key]) - Number(a[key]) : Number(a[key]) - Number(b[key]))
      return {
        key,
        label,
        icon,
        higherIsBetter,
        best: ranked.slice(0, 3),
        worst: ranked.slice(-3).reverse()
      }
    }).filter(metric => metric.best.length))

    function activeSide(key) {
      return activeSides[key] || 'best'
    }

    function activeRanking(metric) {
      return metric[activeSide(metric.key)]
    }

    return { n, activeSides, metrics, activeSide, activeRanking }
  }
}
