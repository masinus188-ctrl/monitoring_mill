// [kunci, judul, jumlah desimal (undefined = teks)]
export const COLS = [['mill', 'Mill'], ['reg', 'Region'], ['masuk', 'TBS Masuk (ton)', 0], ['olah', 'TBS Olah (ton)', 0],
  ['t_olah', 'Target Olah (ton)', 0], ['ach', 'Capaian (%)', 1], ['cpo', 'CPO (ton)', 0], ['oer', 'OER (%)', 2],
  ['t_oer', 'Target OER (%)', 2], ['kernel', 'Kernel (ton)', 0], ['ker', 'KER (%)', 2], ['kap', 'Kapasitas (ton/jam)', 1],
  ['kap_olah', 'Olah Aktual (ton/jam)', 1], ['util', 'Utilitas (%)', 1], ['ol', 'Oil Losses (%)', 2], ['kl', 'Kernel Losses (%)', 2],
  ['biaya_langsung', 'Biaya Langsung (Rp)', 0], ['biaya_tak_langsung', 'Biaya Tidak Langsung (Rp)', 0],
  ['biaya', 'Total Biaya (Rp)', 0], ['cost_tbs', 'Cost/TBS (Rp/ton)', 0], ['cost_pp', 'Cost/PP (Rp/ton)', 0]]

export function downloadCsv(rows, columns = COLS, filename = 'rekap_mill.csv') {
  const escape = value => {
    const text = String(value ?? '')
    return /[;"\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text
  }
  const s = [columns.map(c => escape(c[1])).join(';')]
    .concat(rows.map(r => columns.map(c => escape(r[c[0]])).join(';'))).join('\r\n')
  const a = document.createElement('a')
  const url = URL.createObjectURL(new Blob(['\ufeff' + s], { type: 'text/csv' }))
  a.href = url
  a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
