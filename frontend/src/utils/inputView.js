import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { session } from '../store'
import { GROUPS } from './inputFields'
import AppHeader from '../components/AppHeader.vue'
import DashboardSidebar from '../components/DashboardSidebar.vue'

export default {
  components: { AppHeader, DashboardSidebar },
  setup() {
    const router = useRouter()
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
    const mill = ref(session.mills[0]?.kode || '')
    const tgl = ref(yesterday)
    const v = reactive({})
    const ada = ref(false)
    const msg = ref('')
    const err = ref('')
    const busy = ref(false)
    const keys = Object.values(GROUPS).flatMap(group => Object.keys(group))
    const csvFileInput = ref(null)
    const csvRows = ref([])
    const csvFileName = ref('')
    const csvError = ref('')
    const csvMessage = ref('')
    const csvBusy = ref(false)

    function goToSection(section) {
      router.push({ name: 'dashboard', query: { section } })
    }

    async function load() {
      msg.value = err.value = ''
      try {
        const { row } = await api('input_get', { mill: mill.value, tgl: tgl.value })
        ada.value = !!row
        keys.forEach(key => (v[key] = row ? row[key] : key === 'hari_olah' ? 1 : 0))
      } catch (error) {
        err.value = error.message
      }
    }

    async function save() {
      busy.value = true
      msg.value = err.value = ''
      try {
        msg.value = (await api('input_save', {}, {
          mill: mill.value,
          tgl: tgl.value,
          values: { ...v }
        }, session.csrf)).pesan
        ada.value = true
      } catch (error) {
        err.value = error.message
      } finally {
        busy.value = false
      }
    }

    function parseCsv(text, delimiter) {
      const rows = []
      const row = []
      let cell = ''
      let quoted = false
      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        if (quoted) {
          if (char === '"' && text[i + 1] === '"') {
            cell += '"'
            i++
          } else if (char === '"') quoted = false
          else cell += char
        } else if (char === '"' && cell === '') quoted = true
        else if (char === delimiter) {
          row.push(cell)
          cell = ''
        } else if (char === '\n' || char === '\r') {
          if (char === '\r' && text[i + 1] === '\n') i++
          row.push(cell)
          if (row.some(value => value.trim() !== '')) rows.push([...row])
          row.length = 0
          cell = ''
        } else cell += char
      }
      if (quoted) throw new Error('CSV memiliki tanda kutip yang tidak berpasangan.')
      row.push(cell)
      if (row.some(value => value.trim() !== '')) rows.push(row)
      return rows
    }

    function normalizeCsvNumber(value, line, key) {
      let normalized = value.trim().replace(/\s/g, '')
      if (normalized.includes(',') && normalized.includes('.')) {
        const decimal = normalized.lastIndexOf(',') > normalized.lastIndexOf('.') ? ',' : '.'
        normalized = decimal === ','
          ? normalized.replace(/\./g, '').replace(',', '.')
          : normalized.replace(/,/g, '')
      } else normalized = normalized.replace(',', '.')
      const number = Number(normalized)
      if (!Number.isFinite(number) || Math.abs(number) >= 1e9) {
        throw new Error(`Nilai "${value}" pada kolom ${key}, baris ${line}, bukan angka yang valid.`)
      }
      return number
    }

    function headerScore(headers = []) {
      const normalized = headers.map(value => value.trim().replace(/^\uFEFF/, '').toLowerCase())
      return normalized.filter(header => header === 'mill' || header === 'tgl' || keys.includes(header)).length
    }

    async function handleCsvFile(event) {
      csvError.value = csvMessage.value = ''
      csvRows.value = []
      const file = event.target.files?.[0]
      if (!file) return
      csvFileName.value = file.name
      if (file.size > 5 * 1024 * 1024) {
        csvError.value = 'Ukuran file maksimal 5 MB.'
        return
      }
      try {
        const text = (await file.text()).replace(/^\uFEFF/, '')
        const candidates = [',', ';', '\t'].map(delimiter => ({
          delimiter,
          rows: parseCsv(text, delimiter)
        }))
        candidates.sort((a, b) => headerScore(b.rows[0]) - headerScore(a.rows[0]))
        const rows = candidates[0].rows
        if (rows.length < 2) throw new Error('CSV harus memiliki header dan minimal satu baris data.')
        const headers = rows[0].map(value => value.trim().toLowerCase())
        if (new Set(headers).size !== headers.length) throw new Error('Nama kolom CSV tidak boleh duplikat.')
        const millIndex = headers.indexOf('mill')
        const dateIndex = headers.indexOf('tgl')
        if (millIndex < 0 || dateIndex < 0) throw new Error('CSV wajib memiliki kolom mill dan tgl.')
        const dataColumns = headers
          .map((header, index) => ({ header, index }))
          .filter(column => keys.includes(column.header))
        if (!dataColumns.length) throw new Error('Tidak ditemukan kolom data yang dikenal. Gunakan header dari template CSV.')

        const seen = new Set()
        const parsedRows = []
        for (let index = 1; index < rows.length; index++) {
          const cells = rows[index]
          const line = index + 1
          if (cells.length > headers.length && cells.slice(headers.length).some(value => value.trim())) {
            throw new Error(`Jumlah kolom pada baris ${line} melebihi jumlah header.`)
          }
          const rowMill = (cells[millIndex] || '').trim().toUpperCase()
          const rowDate = (cells[dateIndex] || '').trim()
          if (!session.mills.some(item => item.kode === rowMill)) {
            throw new Error(`Mill "${rowMill}" pada baris ${line} tidak tersedia untuk akun ini.`)
          }
          const parsedDate = new Date(`${rowDate}T00:00:00Z`)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(rowDate) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== rowDate) {
            throw new Error(`Tanggal pada baris ${line} tidak valid; gunakan YYYY-MM-DD.`)
          }
          const identity = `${rowMill}|${rowDate}`
          if (seen.has(identity)) throw new Error(`Mill ${rowMill} dan tanggal ${rowDate} terduplikasi dalam CSV.`)
          seen.add(identity)
          const values = {}
          for (const column of dataColumns) {
            const value = (cells[column.index] || '').trim()
            if (value) values[column.header] = normalizeCsvNumber(value, line, column.header)
          }
          if (!Object.keys(values).length) throw new Error(`Tidak ada nilai data pada baris ${line}.`)
          parsedRows.push({ mill: rowMill, tgl: rowDate, values, line, filled: Object.keys(values).length })
          if (parsedRows.length > 500) throw new Error('CSV melebihi batas 500 baris data.')
        }
        csvRows.value = parsedRows
      } catch (error) {
        csvFileName.value = ''
        csvError.value = error.message
      }
    }

    function downloadTemplate() {
      const csv = ['mill', 'tgl', ...keys].join(',') + '\r\n'
      const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'template-input-data-pks.csv'
      link.click()
      URL.revokeObjectURL(url)
    }

    async function importCsv() {
      csvBusy.value = true
      csvError.value = csvMessage.value = ''
      try {
        const result = await api('input_import', {}, { rows: csvRows.value }, session.csrf)
        csvMessage.value = result.pesan
        csvRows.value = []
        csvFileName.value = ''
        if (csvFileInput.value) csvFileInput.value.value = ''
      } catch (error) {
        csvError.value = error.message
      } finally {
        csvBusy.value = false
      }
    }

    onMounted(load)

    return {
      session, GROUPS, mill, tgl, v, ada, msg, err, busy, csvFileInput, csvRows,
      csvFileName, csvError, csvMessage, csvBusy, goToSection, load, save,
      handleCsvFile, downloadTemplate, importCsv
    }
  }
}
