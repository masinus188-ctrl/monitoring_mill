import { reactive, shallowReactive, ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'
import { session } from '../store'
import { downloadCsv, COLS } from './columns'
import { n } from './format'
import * as C from './charts'
import AppHeader from '../components/AppHeader.vue'
import FilterBar from '../components/FilterBar.vue'
import KpiCards from '../components/KpiCards.vue'
import AlarmPanel from '../components/AlarmPanel.vue'
import ChartCard from '../components/ChartCard.vue'
import RankingTable from '../components/RankingTable.vue'
import HeatmapTable from '../components/HeatmapTable.vue'
import DashboardTable from '../components/DashboardTable.vue'

export default {
  components: {
    AppHeader,
    FilterBar,
    KpiCards,
    AlarmPanel,
    ChartCard,
    RankingTable,
    HeatmapTable,
    DashboardTable
  },
  setup() {
    const f = reactive({ tahun: session.tahun[0], bulan: 0, reg: 0, mill: '' })
    const d = shallowReactive({
      ringkas: null,
      supplier: null,
      harian: null,
      bulanan: null,
      grading: null,
      losses: null,
      alarm: null,
      heatmap: null,
      curah_hujan: null,
      tbs_budget: null
    })
    const err = ref('')
    const last = ref('')
    const section = ref('overview')
    const route = useRoute()
    const router = useRouter()
    const sidebarCollapsed = ref(false)
    const appliedMonth = ref(f.bulan)
    const userBusy = ref(false)
    const userMessage = ref('')
    const userError = ref('')
    const users = ref([])
    const usersBusy = ref(false)
    const usersError = ref('')
    const currentUserId = ref(0)
    const deleteUserId = ref(0)
    const userDeleteMessage = ref('')
    const userDeleteError = ref('')
    const passwordReset = reactive({ id: 0, password: '' })
    const passwordResetBusy = ref(false)
    const passwordResetMessage = ref('')
    const passwordResetError = ref('')
    const newUser = reactive({ nama: '', username: '', password: '', role: 'viewer', reg: 0, mill: '' })
    const expanded = reactive({ produksi: true, losses: true })
    const greeting = computed(() => {
      const hour = new Date().getHours()
      const period = hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 19 ? 'sore' : 'malam'
      return `Selamat ${period}, ${session.user}`
    })

    const sections = {
      overview: ['Overview', 'Ringkasan kinerja, alarm, peringkat, dan heatmap operasional.'],
      peringkat: ['Peringkat', 'Perbandingan mill terbaik dan terburuk berdasarkan metrik kinerja.'],
      pengaturan: ['Pengaturan', 'Kelola user dan batas akses aplikasi.'],
      'tbs-terima': ['TBS Terima', 'Breakdown penerimaan TBS menurut kategori pemasok untuk setiap PKS.'],
      'tbs-olah': ['TBS Olah', 'Volume olah, kapasitas terpasang, kapasitas aktual, dan utilisasi tiap PKS.'],
      'oer-ker': ['OER / KER', 'Perbandingan rendemen minyak dan kernel antar PKS.'],
      'oil-losses': ['Oil Losses', 'Nilai oil losses, target, dan kontribusi setiap komponennya.'],
      'kernel-losses': ['Kernel Losses', 'Nilai kernel losses, target, dan kontribusi setiap komponennya.'],
      grading: ['Grading', 'Komposisi mutu buah berdasarkan hasil grading tiap PKS.'],
      'curah-hujan': ['Curah Hujan', 'Data curah hujan harian per PKS dari kolom CH produksi harian.'],
      biaya: ['Biaya', 'Realisasi biaya langsung, tidak langsung, total, dan indikator cost.'],
      detail: ['Detail', 'Tabel rekap kinerja per PKS yang dapat diunduh sebagai CSV.']
    }

    watch(() => route.query.section, id => {
      section.value = typeof id === 'string' && sections[id] ? id : 'overview'
    }, { immediate: true })

    const sectionTitle = computed(() => sections[section.value][0])
    const sectionDescription = computed(() => sections[section.value][1])
    const periodLabel = computed(() => `${f.tahun || '-'} · ${f.bulan ? `Bulan ${f.bulan}` : 'Tahun berjalan'}`)
    const achievement = (actual, target) => actual == null || target == null || Number(target) === 0
      ? '-'
      : `${n(Number(actual) / Number(target) * 100, 1)}%`
    const roleNames = { admin: 'Admin', operator: 'Operator', viewer: 'Viewer' }
    const roleDetails = { admin: 'Akses penuh', operator: 'Lihat dan input data', viewer: 'Hanya melihat data' }

    function userScope(user) {
      if (user.role === 'admin' || (!Number(user.reg) && !user.mill)) return 'Semua region dan mill'
      if (user.mill) return `${user.mill} · Region ${user.reg}`
      return `Semua mill · Region ${user.reg}`
    }

    function canDeleteUser(user) {
      if (Number(user.id) === currentUserId.value) return false
      const activeAdmins = users.value.filter(item => item.role === 'admin' && Number(item.aktif) === 1)
      return !(user.role === 'admin' && Number(user.aktif) === 1 && activeAdmins.length <= 1)
    }

    function deleteRestriction(user) {
      if (Number(user.id) === currentUserId.value) return 'Akun yang sedang digunakan tidak dapat dihapus.'
      if (user.role === 'admin' && Number(user.aktif) === 1
        && users.value.filter(item => item.role === 'admin' && Number(item.aktif) === 1).length <= 1) {
        return 'Admin aktif terakhir tidak dapat dihapus.'
      }
      return `Hapus user ${user.username}`
    }

    const totalCapacity = computed(() => d.ringkas?.mills.reduce((sum, mill) => sum + (+mill.kap || 0), 0) || 0)
    const supplierNames = { inti: 'Inti', plasma: 'Plasma', afiliasi: 'Afiliasi', pihak3: 'Pihak 3' }
    const supplierRows = computed(() => d.supplier?.mills.map(row => ({
      ...row,
      total: row.inti + row.plasma + row.afiliasi + row.pihak3
    })) || [])
    const supplierTotal = computed(() => d.supplier ? {
      ...d.supplier.total,
      total: Object.values(d.supplier.total).reduce((sum, value) => sum + value, 0)
    } : null)
    const topSupplier = computed(() => {
      if (!d.supplier) return '-'
      const [key, value] = Object.entries(d.supplier.total).sort((a, b) => b[1] - a[1])[0] || []
      return value ? `${supplierNames[key]} (${n(value)} ton)` : '-'
    })

    const supplierColumns = [['mill', 'PKS'], ['reg', 'Region'], ['inti', 'Inti', 0], ['plasma', 'Plasma', 0], ['afiliasi', 'Afiliasi', 0], ['pihak3', 'Pihak 3', 0], ['total', 'Total TBS', 0]]
    const olahColumns = [['mill', 'PKS'], ['reg', 'Region'], ['olah', 'TBS Olah (ton)', 0], ['kap', 'Kapasitas (ton/jam)', 1], ['kap_olah', 'Olah Aktual (ton/jam)', 1], ['util', 'Utilitas (%)', 1], ['ach', 'Capaian Target (%)', 1]]
    const oerKerColumns = [['mill', 'PKS'], ['olah', 'TBS Olah (ton)', 0], ['cpo', 'CPO (ton)', 0], ['oer', 'OER (%)', 2], ['t_oer', 'Target OER (%)', 2], ['kernel', 'Kernel (ton)', 0], ['ker', 'KER (%)', 2], ['t_ker', 'Target KER (%)', 2]]
    const oilLossColumns = [['mill', 'PKS'], ['ol', 'Oil Losses (%)', 3], ['t_ol', 'Target (%)', 3], ['ol_eb', 'Empty bunch', 3], ['ol_sludge', 'Sludge', 3], ['ol_wetnut', 'Wet nut', 3], ['ol_fibre', 'Fibre press', 3]]
    const kernelLossColumns = [['mill', 'PKS'], ['kl', 'Kernel Losses (%)', 3], ['t_kl', 'Target (%)', 3], ['kl_cyclone', 'Cyclone', 3], ['kl_destoner', 'Destoner', 3], ['kl_ltds1', 'LTDS 1', 3], ['kl_ltds2', 'LTDS 2', 3], ['kl_clhd', 'CL/HD', 3]]
    const gradingColumns = [['mill', 'PKS'], ['jjg', 'Sampel (janjang)', 0], ['ripe', 'Matang (%)', 2], ['unripe', 'Mentah (%)', 2], ['over', 'Lewat matang (%)', 2], ['eb', 'Tandan kosong (%)', 2], ['bb', 'Busuk (%)', 2], ['ab', 'Abnormal (%)', 2], ['tp', 'Tangkai panjang (%)', 2], ['sampah', 'Sampah (%)', 2], ['brondolan', 'Brondolan (%)', 2]]
    const curahHujanColumns = [['tanggal', 'Tanggal'], ['mill', 'PKS'], ['reg', 'Region'], ['ch', 'Curah Hujan (mm)', 1]]
    const biayaColumns = [['mill', 'PKS'], ['biaya_langsung', 'Biaya Langsung (Rp)', 0], ['biaya_tak_langsung', 'Biaya Tidak Langsung (Rp)', 0], ['biaya', 'Total Biaya (Rp)', 0], ['cost_tbs', 'Cost / TBS (Rp/ton)', 0], ['cost_pp', 'Cost / PP (Rp/ton)', 0]]
    const detailColumns = COLS
    const currency = value => value == null ? '-' : 'Rp ' + n(value, 0)

    function select(id) {
      section.value = id
      const query = { ...route.query }
      if (id === 'overview') delete query.section
      else query.section = id
      router.replace({ name: 'dashboard', query })
    }

    async function createUser() {
      userBusy.value = true
      userMessage.value = userError.value = ''
      try {
        const result = await api('admin_user_create', {}, { ...newUser }, session.csrf)
        userMessage.value = result.pesan
        Object.assign(newUser, { nama: '', username: '', password: '', role: 'viewer', reg: 0, mill: '' })
        await loadUsers()
      } catch (error) {
        userError.value = error.message
      } finally {
        userBusy.value = false
      }
    }

    async function loadUsers() {
      usersBusy.value = true
      usersError.value = ''
      try {
        const result = await api('admin_users')
        users.value = result.users
        currentUserId.value = Number(result.currentUserId)
      } catch (error) {
        usersError.value = error.message
      } finally {
        usersBusy.value = false
      }
    }

    async function deleteUser(user) {
      if (!window.confirm(`Hapus user ${user.nama} (${user.username})? Tindakan ini tidak dapat dibatalkan.`)) return
      deleteUserId.value = Number(user.id)
      userDeleteMessage.value = userDeleteError.value = ''
      try {
        const result = await api('admin_user_delete', {}, { id: Number(user.id) }, session.csrf)
        userDeleteMessage.value = result.pesan
        if (passwordReset.id === Number(user.id)) {
          passwordReset.id = 0
          passwordReset.password = ''
        }
        await loadUsers()
      } catch (error) {
        userDeleteError.value = error.message
      } finally {
        deleteUserId.value = 0
      }
    }

    async function resetUserPassword() {
      passwordResetBusy.value = true
      passwordResetMessage.value = passwordResetError.value = ''
      try {
        const result = await api('admin_user_reset_password', {}, { ...passwordReset }, session.csrf)
        passwordResetMessage.value = result.pesan
        passwordReset.password = ''
      } catch (error) {
        passwordResetError.value = error.message
      } finally {
        passwordResetBusy.value = false
      }
    }

    async function load() {
      err.value = ''
      const filters = { ...f }
      try {
        const names = Object.keys(d)
        const responses = await Promise.all(names.map(name => api(name, filters)))
        names.forEach((name, index) => (d[name] = responses[index]))
        appliedMonth.value = filters.bulan
        last.value = d.ringkas.last || '-'
      } catch (error) {
        err.value = error.message
      }
    }

    function exportCurrent() {
      if (!d.ringkas) return
      const exports = {
        'tbs-terima': [supplierRows.value, supplierColumns],
        'tbs-olah': [d.ringkas.mills, olahColumns],
        'oer-ker': [d.ringkas.mills, oerKerColumns],
        'oil-losses': [d.losses, oilLossColumns],
        'kernel-losses': [d.losses, kernelLossColumns],
        grading: [d.grading, gradingColumns],
        'curah-hujan': [d.curah_hujan, curahHujanColumns],
        biaya: [d.ringkas.mills, biayaColumns],
        detail: [d.ringkas.mills, detailColumns]
      }
      const [rows, columns] = exports[section.value] || [d.ringkas.mills, detailColumns]
      const totals = section.value === 'tbs-terima' ? supplierTotal.value
        : section.value === 'biaya' || section.value === 'detail' ? d.ringkas.total : null
      const exportRows = totals ? [...rows, { ...totals, mill: 'TOTAL' }] : rows
      downloadCsv(exportRows, columns, `monitoring-pks-${section.value}.csv`)
    }

    const charts = computed(() => d.ringkas && ({
      harian: C.harian(d.harian),
      bulanan: C.bulanan(d.bulanan),
      supplier: C.supplier(d.supplier.mills),
      tbsTerimaBulanan: C.tbsBudgetBulanan(d.tbs_budget.budget, d.tbs_budget.actual, 'masuk', appliedMonth.value),
      tbsTerimaTahunan: C.tbsBudgetTahunan(d.tbs_budget.budget, d.tbs_budget.actual, d.tbs_budget.annualBudget, d.tbs_budget.lastMonth, 'masuk'),
      tbsOlahBulanan: C.tbsBudgetBulanan(d.tbs_budget.budget, d.tbs_budget.actual, 'olah', appliedMonth.value),
      tbsOlahTahunan: C.tbsBudgetTahunan(d.tbs_budget.budget, d.tbs_budget.actual, d.tbs_budget.annualBudget, d.tbs_budget.lastMonth, 'olah'),
      tbsOlah: C.tbsOlah(d.ringkas.mills),
      oer: C.oerKer(d.ringkas.mills, 'OER', 't_oer'),
      ker: C.oerKer(d.ringkas.mills, 'KER', 't_ker'),
      curahHujan: C.curahHujan(d.curah_hujan),
      oilLoss: C.oilLoss(d.losses),
      kernelLoss: C.kernelLoss(d.losses),
      grading: C.grading(d.grading),
      komponenOil: C.komponenOil(d.losses),
      komponenKernel: C.komponenKernel(d.losses),
      biaya: C.biaya(d.ringkas.mills)
    }))

    onMounted(() => {
      load()
      if (session.role === 'admin') loadUsers()
    })

    return {
      session,
      f, d, err, last, section, sidebarCollapsed, appliedMonth,
      userBusy, userMessage, userError, users, usersBusy, usersError, currentUserId,
      deleteUserId, userDeleteMessage, userDeleteError, passwordReset, passwordResetBusy,
      passwordResetMessage, passwordResetError, newUser, expanded, greeting, sections,
      sectionTitle, sectionDescription, periodLabel, achievement, roleNames, roleDetails,
      userScope, canDeleteUser, deleteRestriction, totalCapacity, supplierNames,
      supplierRows, supplierTotal, topSupplier, supplierColumns, olahColumns,
      oerKerColumns, oilLossColumns, kernelLossColumns, gradingColumns, curahHujanColumns,
      biayaColumns, detailColumns, currency, n, select, createUser, loadUsers, deleteUser,
      resetUserPassword, load, exportCurrent, charts
    }
  }
}
