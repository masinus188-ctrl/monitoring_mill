import { reactive } from 'vue'
import { api } from './api'

export const session = reactive({ ready: false, user: '', role: '', csrf: '', mills: [], tahun: [], last: null })
export async function loadSession() { Object.assign(session, await api('meta'), { ready: true }) }
export function clearSession() { Object.assign(session, { ready: false, user: '', role: '', csrf: '', mills: [] }) }
