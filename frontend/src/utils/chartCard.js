import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

export default {
  props: { title: String, config: Object },
  setup(props) {
    const cv = ref(null)
    let chart = null

    function draw() {
      chart?.destroy()
      if (!props.config) return
      const config = JSON.parse(JSON.stringify(props.config))
      config.options = Object.assign({
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { boxWidth: 12 } } }
      }, config.options || {})
      chart = new Chart(cv.value, config)
    }

    onMounted(draw)
    watch(() => props.config, draw)
    onBeforeUnmount(() => chart?.destroy())

    return { cv }
  }
}
