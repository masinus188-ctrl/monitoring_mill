export const BL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
export const n = (v, d = 0) => v == null || isNaN(v) ? '-' : (+v).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d })
