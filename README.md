# Monitoring Harian PKS – MySQL + PHP API + Dashboard Vue 3

## Struktur
```
database/monitoring_pks.sql      skema + data dari Excel (sampai 12 Nov 2026)
database/02_pengembangan.sql     tabel users & ambang alarm (aman dijalankan berulang)
tools/import_excel_to_sql.py     regenerasi SQL dari Excel
tools/tambah_user.php            tambah/ubah akun (CLI)
dashboard/                       YANG DI-DEPLOY: api.php, auth.php, config.php + hasil build Vue (index.html, static/)
frontend/                        SUMBER Vue 3 + Vite (perlu hanya bila ingin mengubah tampilan)
  src/views/         LoginView, DashboardView, InputView
  src/components/    AppHeader, FilterBar, KpiCards, AlarmPanel, ChartCard, RankingTable, HeatmapTable, MillTable
  src/styles/        base.css, dashboard.css, tables.css, login.css, input.css   <- style terpisah (<style src="...">)
  src/utils/         charts.js (konfigurasi grafik), columns.js, format.js, inputFields.js
  src/api.js, store.js, router.js, main.js
```

## Menjalankan (tanpa Node.js)
1. `mysql -u root -p < database/monitoring_pks.sql` lalu `mysql -u root -p < database/02_pengembangan.sql`
2. Edit `dashboard/config.php` (atau env DB_HOST/DB_NAME/DB_USER/DB_PASS).
3. Taruh folder `dashboard` di htdocs/www, atau `cd dashboard && php -S localhost:8080`, buka http://localhost:8080
4. Login awal **admin / admin123** (WAJIB diganti): `php tools/tambah_user.php admin PasswordBaru admin`

## Mengubah tampilan (butuh Node.js 18+)
```
cd frontend && npm install
php -S 127.0.0.1:8080 -t ../dashboard      # terminal 1 (API)
npm run dev                                 # terminal 2 -> http://localhost:5173 (hot reload, proxy ke api.php)
npm run build                               # hasil ke ../dashboard (index.html + static/)
```
Sebelum build ulang, hapus folder lama: `rm -rf ../dashboard/static`.

## API (dashboard/api.php) – semua JSON
`login` (POST), `logout`, `meta`, `ringkas`, `harian`, `bulanan`, `grading`, `losses`, `alarm`, `heatmap`, `input_get`, `input_save` (POST, header `X-CSRF`).
Hak akses (role admin/operator/viewer; cakupan region/mill) ditegakkan di server.
