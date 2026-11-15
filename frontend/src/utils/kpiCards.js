import { computed } from 'vue'
import { n } from './format'

export default {
  props: { total: Object },
  setup(props) {
    function difference(actual, target, inverse) {
      if (actual == null || target == null || !target) return {}
      const percent = (actual - target) / target * 100
      return {
        sub: (percent >= 0 ? '▲ ' : '▼ ') + n(Math.abs(percent), 1) + '% vs target',
        cls: (inverse ? percent <= 0 : percent >= 0) ? 'ok' : 'bad'
      }
    }

    const cards = computed(() => {
      const total = props.total
      return [
        { label: 'TBS Diolah (ton)', value: n(total.olah), ...difference(total.olah, total.t_olah) },
        { label: 'CPO (ton)', value: n(total.cpo), ...difference(total.cpo, total.t_cpo) },
        { label: 'OER (%)', value: n(total.oer, 2), ...difference(total.oer, total.t_oer) },
        { label: 'KER (%)', value: n(total.ker, 2), ...difference(total.ker, total.t_ker) },
        { label: 'Utilitas Pabrik (%)', value: n(total.util, 1), ...difference(total.util, total.t_util) },
        { label: 'Oil Losses (%)', value: n(total.ol, 2), ...difference(total.ol, total.t_ol, true) },
        { label: 'Biaya / Kg TBS (Rp)', value: n(total.cost_tbs, 1), ...difference(total.cost_tbs, total.t_cost_tbs, true) }
      ]
    })

    return { cards }
  }
}
