import { session } from '../store'
import { BL } from './format'

export default {
  props: { filters: Object },
  emits: ['apply', 'export'],
  setup() {
    return { session, BL }
  }
}
