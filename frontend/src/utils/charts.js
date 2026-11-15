// Pembuat konfigurasi Chart.js (data polos, tanpa fungsi)
import { BL } from './format'
const C = ['#2e7d32', '#9ccc65', '#fbc02d', '#ef6c00', '#8d6e63', '#546e7a', '#7b1fa2', '#00838f']
const bar = (labels, sets, options) => ({ type: 'bar', data: { labels, datasets: sets }, options })

export const harian = hr => ({ type: 'bar', data: { labels: hr.map(x => x.tanggal.slice(5)), datasets: [
  { type: 'bar', label: 'TBS Olah', data: hr.map(x => x.olah), backgroundColor: '#9ccc65', yAxisID: 'y' },
  { type: 'line', label: 'Target', data: hr.map(x => x.target), borderColor: '#ef6c00', pointRadius: 0, borderDash: [5, 4], yAxisID: 'y' },
  { type: 'line', label: 'OER %', data: hr.map(x => x.oer), borderColor: '#1b5e20', pointRadius: 0, yAxisID: 'y2', spanGaps: true }] },
  options: { scales: { y: { title: { display: true, text: 'ton' } }, y2: { position: 'right', grid: { drawOnChartArea: false }, min: 15, title: { display: true, text: 'OER %' } } } } })

export const bulanan = bl => {
  const m12 = a => BL.map((_, i) => (a.find(x => x.bulan == i + 1) || {}).olah ?? null)
  return { type: 'bar', data: { labels: BL, datasets: [
    { type: 'bar', label: 'Aktual', data: m12(bl.aktual), backgroundColor: '#2e7d32' },
    { type: 'line', label: 'Target', data: m12(bl.target), borderColor: '#ef6c00', borderDash: [5, 4] },
    { type: 'line', label: 'Tahun lalu', data: m12(bl.lalu), borderColor: '#546e7a' }] } }
}

export const capaian = r => bar(r.map(x => x.mill), [{ label: '% Pencapaian', data: r.map(x => x.ach),
  backgroundColor: r.map(x => x.ach >= 100 ? '#2e7d32' : x.ach >= 90 ? '#fbc02d' : '#c62828') }], { indexAxis: 'y', plugins: { legend: { display: false } } })

export const supplier = r => bar(r.map(x => x.mill), [
  { label: 'Inti', data: r.map(x => x.inti), backgroundColor: '#315fbd', stack: 'tbs' },
  { label: 'Plasma', data: r.map(x => x.plasma), backgroundColor: '#5d8be8', stack: 'tbs' },
  { label: 'Afiliasi', data: r.map(x => x.afiliasi), backgroundColor: '#35b6a4', stack: 'tbs' },
  { label: 'Pihak 3', data: r.map(x => x.pihak3), backgroundColor: '#f0a34a', stack: 'tbs' },
], { scales: { x: { stacked: true }, y: { stacked: true, title: { display: true, text: 'ton' } } } })

const monthValues = (rows, key) => BL.map((_, i) => {
  const row = rows.find(x => Number(x.bulan) === i + 1)
  return row && (row.jumlah == null || Number(row.jumlah) > 0) ? Number(row[key]) : null
})
const monthlySeries = (rows, key, month) => {
  const values = monthValues(rows, key)
  return month ? { labels: [BL[month - 1]], data: [values[month - 1]] } : { labels: BL, data: values }
}
const cumulative = values => {
  let total = 0
  return values.map(value => {
    if (value == null) return null
    total += value
    return total
  })
}
export const tbsBudgetBulanan = (budget, actual, metric, month = 0) => {
  const actualSeries = monthlySeries(actual, metric, month)
  const budgetSeries = monthlySeries(budget, metric, month)
  return bar(actualSeries.labels, [
    { label: 'Aktual', data: actualSeries.data, backgroundColor: '#315fbd' },
    { label: 'Budget Bulanan', data: budgetSeries.data, backgroundColor: '#35b6a4' },
  ], { interaction: { mode: 'index', intersect: false }, scales: { y: { beginAtZero: true, title: { display: true, text: 'ton' } } } })
}
export const tbsBudgetTahunan = (budget, actual, annualBudget, lastMonth, metric) => {
  const actualByMonth = monthValues(actual, metric)
  const actualToDate = cumulative(actualByMonth.map((value, i) => i < lastMonth ? value ?? 0 : null))
  const annualTarget = annualBudget?.jumlah > 0 ? Number(annualBudget[metric]) : null
  return { type: 'line', data: { labels: BL, datasets: [
    { label: 'Aktual Kumulatif', data: actualToDate, borderColor: '#315fbd', backgroundColor: '#315fbd', pointRadius: 2, tension: 0.2 },
    { label: 'Budget Kumulatif', data: cumulative(monthValues(budget, metric).map(value => value ?? 0)), borderColor: '#35b6a4', backgroundColor: '#35b6a4', pointRadius: 2, tension: 0.2 },
    { label: 'Total Budget Setahun', data: BL.map(() => annualTarget), borderColor: '#ef6c00', borderDash: [6, 4], pointRadius: 0 },
  ] }, options: { interaction: { mode: 'index', intersect: false }, scales: { y: { beginAtZero: true, title: { display: true, text: 'ton' } } } } }
}

export const tbsOlah = r => bar(r.map(x => x.mill), [
  { label: 'TBS Olah (ton)', data: r.map(x => x.olah), backgroundColor: '#315fbd', yAxisID: 'y' },
  { type: 'line', label: 'Utilitas (%)', data: r.map(x => x.util), borderColor: '#35b6a4', backgroundColor: '#35b6a4', yAxisID: 'y1' },
], { scales: { y: { title: { display: true, text: 'ton' } }, y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: '%' } } } })

export const oerKer = (rows, metric, target) => bar(rows.map(row => row.mill), [
  { label: `${metric} Aktual (%)`, data: rows.map(row => row[metric.toLowerCase()]), backgroundColor: '#315fbd' },
  { label: `Target ${metric} (%)`, data: rows.map(row => row[target]), backgroundColor: '#f0a34a' },
], { interaction: { mode: 'index', intersect: false }, scales: { y: { beginAtZero: true, title: { display: true, text: '%' } } } })

export const curahHujan = rows => {
  const dates = [...new Set(rows.map(row => row.tanggal))].sort()
  const mills = [...new Set(rows.map(row => row.mill))].sort()
  return { type: 'line', data: { labels: dates, datasets: mills.map((mill, i) => {
    const byDate = new Map(rows.filter(row => row.mill === mill).map(row => [row.tanggal, Number(row.ch)]))
    return { label: mill, data: dates.map(date => byDate.get(date) ?? null), borderColor: C[i % C.length], backgroundColor: C[i % C.length], pointRadius: 0, pointHoverRadius: 4, tension: 0.2, spanGaps: false }
  }) }, options: { interaction: { mode: 'index', intersect: false }, scales: {
    x: { ticks: { maxTicksLimit: 12 } }, y: { beginAtZero: true, title: { display: true, text: 'Curah hujan (mm)' } },
  } } }
}

export const oer = r => bar(r.map(x => x.mill), [{ label: 'OER aktual', data: r.map(x => x.oer), backgroundColor: '#2e7d32' },
  { label: 'OER target', data: r.map(x => x.t_oer), backgroundColor: '#ffcc80' }], { scales: { y: { min: 15 } } })

const G = [['ripe', 'Matang'], ['unripe', 'Mentah'], ['over', 'Lewat matang'], ['eb', 'Tandan kosong'], ['bb', 'Busuk'], ['ab', 'Abnormal'], ['tp', 'Tangkai panjang']]
export const grading = g => bar(g.map(x => x.mill), G.map((k, i) => ({ label: k[1], data: g.map(x => x[k[0]]), backgroundColor: C[i] })),
  { scales: { x: { stacked: true }, y: { stacked: true, max: 100 } } })

export const oilLoss = l => bar(l.map(x => x.mill), [{ label: 'Aktual', data: l.map(x => x.ol), backgroundColor: '#8d6e63' }, { label: 'Target', data: l.map(x => x.t_ol), backgroundColor: '#ffcc80' }])
export const kernelLoss = l => bar(l.map(x => x.mill), [{ label: 'Aktual', data: l.map(x => x.kl), backgroundColor: '#8d6e63' }, { label: 'Target', data: l.map(x => x.t_kl), backgroundColor: '#ffcc80' }])
export const biaya = r => bar(r.map(x => x.mill), [
  { label: 'Biaya Langsung (Rp)', data: r.map(x => x.biaya_langsung), backgroundColor: '#315fbd', stack: 'biaya' },
  { label: 'Biaya Tidak Langsung (Rp)', data: r.map(x => x.biaya_tak_langsung), backgroundColor: '#35b6a4', stack: 'biaya' },
], { scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } })

const stack = (l, keys, names) => bar(l.map(x => x.mill), keys.map((k, i) => ({ label: names[i], data: l.map(x => x[k]), backgroundColor: C[i] })), { scales: { x: { stacked: true }, y: { stacked: true } } })
export const komponenOil = l => stack(l, ['ol_eb', 'ol_sludge', 'ol_wetnut', 'ol_fibre'], ['Empty bunch', 'Sludge waste', 'Wet nut', 'Fibre press'])
export const komponenKernel = l => stack(l, ['kl_cyclone', 'kl_destoner', 'kl_ltds1', 'kl_ltds2', 'kl_clhd'], ['Fibre cyclone', 'Destoner', 'LTDS 1', 'LTDS 2', 'CL/HD'])
