<template>
  <div class="dashboard-shell">
    <aside class="dashboard-sidebar" :class="{ 'is-collapsed': sidebarCollapsed }">
      <div class="sidebar-brand">
        <span class="brand-mark" aria-hidden="true">
          <img src="../assets/pks-leaf-logo.png" alt="">
        </span>
        <span>Monitoring PKS<small>PERFORMANCE</small></span>
        <button
          class="sidebar-toggle"
          type="button"
          :aria-label="sidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'"
          :aria-expanded="!sidebarCollapsed"
          :title="sidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >{{ sidebarCollapsed ? '›' : '‹' }}</button>
      </div>
      <nav class="sidebar-nav" aria-label="Navigasi dashboard">
        <button class="nav-link" title="Overview" :class="{ active: section === 'overview' }" @click="select('overview')">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <circle cx="19.5" cy="12.5" r="9.5" />
              <circle cx="19.5" cy="12.5" r="6.5" />
              <path d="M17 12.5h5m-2.5-2.5v5" />
              <path d="m13 19-2.5-2.5L2.3 24.7a2.1 2.1 0 0 0 3 3L14 19" />
              <path d="m7.2 20 4.8 4.8" />
            </svg>
          </span> Overview
        </button>
        <button class="nav-link" title="Peringkat" :class="{ active: section === 'peringkat' }" @click="select('peringkat')">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M7 4h18v7a9 9 0 0 1-18 0V4Z" />
              <path d="M7 7H3v3a8 8 0 0 0 7.5 8M25 7h4v3a8 8 0 0 1-7.5 8M16 20v6m-5 0h10m-12 0h14v4H9v-4Z" />
              <path d="m16 6.5 1.4 2.8 3.1.5-2.25 2.2.55 3.1L16 13.6l-2.8 1.5.55-3.1-2.25-2.2 3.1-.5L16 6.5Z" />
            </svg>
          </span> Peringkat
        </button>
        <div class="nav-group">
          <button class="nav-link" title="Produksi" :class="{ expanded: expanded.produksi }" :aria-expanded="expanded.produksi" @click="expanded.produksi = !expanded.produksi">
            <span class="nav-icon" aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <path d="M3 13 7 6h18l4 7v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13Z" />
                <path d="M3 13h8l2 4h6l2-4h8M9 6V3h14v3M14 22h6v3h-6zM7 6 4 13m21-7 3 7" />
              </svg>
            </span> Produksi <span class="nav-chevron">{{ expanded.produksi ? '⌄' : '›' }}</span>
          </button>
          <div v-if="expanded.produksi" class="nav-submenu">
            <button class="nav-link" title="TBS Terima" :class="{ active: section === 'tbs-terima' }" @click="select('tbs-terima')">TBS Terima</button>
            <button class="nav-link" title="TBS Olah" :class="{ active: section === 'tbs-olah' }" @click="select('tbs-olah')">TBS Olah</button>
            <button class="nav-link" title="OER / KER" :class="{ active: section === 'oer-ker' }" @click="select('oer-ker')">OER / KER</button>
          </div>
        </div>
        <div class="nav-group">
          <button class="nav-link" title="Losses" :class="{ expanded: expanded.losses }" :aria-expanded="expanded.losses" @click="expanded.losses = !expanded.losses">
            <span class="nav-icon" aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <path d="m6 22 7-9 7 9 7-9" />
                <circle cx="6" cy="22" r="3" />
                <circle cx="13" cy="13" r="3" />
                <circle cx="20" cy="22" r="3" />
                <circle cx="27" cy="13" r="3" />
              </svg>
            </span> Losses <span class="nav-chevron">{{ expanded.losses ? '⌄' : '›' }}</span>
          </button>
          <div v-if="expanded.losses" class="nav-submenu">
            <button class="nav-link" title="Oil losses" :class="{ active: section === 'oil-losses' }" @click="select('oil-losses')">Oil losses</button>
            <button class="nav-link" title="Kernel losses" :class="{ active: section === 'kernel-losses' }" @click="select('kernel-losses')">Kernel losses</button>
          </div>
        </div>
        <button class="nav-link" title="Grading" :class="{ active: section === 'grading' }" @click="select('grading')">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <g fill="currentColor" stroke="none">
                <ellipse cx="11" cy="18" rx="8" ry="5.5" transform="rotate(-28 11 18)" />
                <ellipse cx="23" cy="8" rx="5.8" ry="4.3" transform="rotate(42 23 8)" />
                <ellipse cx="23" cy="24" rx="5.4" ry="3.8" transform="rotate(-32 23 24)" />
              </g>
              <g fill="none" stroke="#12366d" stroke-linecap="round" stroke-width="1.2">
                <path d="M3.5 18.5c2.2-.8 4.5-.7 6.7.4m-2.3-5.7c2.1-.4 4.2.2 5.7 1.7m-6.1 8c2.2-.5 4.5-1.6 6-3.4m-3.6-8.2c2.1.1 4.1 1 5.2 2.8m-1 8.6c1.9-1 3.2-2.5 3.9-4.5M20 5c1.6.1 3 .9 3.7 2.2m-5.2 2.2c1.5-.1 2.7.4 3.6 1.5m2.8-5.1c1.1.8 1.7 2.1 1.5 3.4m-4.6-.1c1.2.2 2.1 1 2.5 2.1m-4.7 10.1c1.4-.2 2.7.3 3.5 1.3m-4.9 1.5c1.4-.1 2.7.4 3.5 1.4m2.5-5c1 .7 1.4 1.8 1.2 2.9m-4-1c1 .2 1.8.8 2.2 1.7" />
              </g>
            </svg>
          </span> Grading
        </button>
        <button class="nav-link" title="Curah Hujan" :class="{ active: section === 'curah-hujan' }" @click="select('curah-hujan')">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M9 19H6.5a5 5 0 1 1 1.1-9.9A9 9 0 0 1 24.7 8a6 6 0 0 1 1.8 11" />
              <path d="M10 23c0 1.4-2 3.5-2 3.5S6 24.4 6 23a2 2 0 0 1 4 0Zm9 3c0 1.4-2 3.5-2 3.5S15 27.4 15 26a2 2 0 0 1 4 0Zm9-3c0 1.4-2 3.5-2 3.5S24 24.4 24 23a2 2 0 0 1 4 0Z" />
            </svg>
          </span> Curah Hujan
        </button>
        <button class="nav-link" title="Biaya" :class="{ active: section === 'biaya' }" @click="select('biaya')">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <ellipse cx="11" cy="5" rx="7.5" ry="3" />
              <path d="M3.5 5v15c0 1.7 3.4 3 7.5 3 1 0 2-.1 2.8-.3M18.5 5v11" />
              <path d="M3.5 10c0 1.7 3.4 3 7.5 3 2.2 0 4.2-.4 5.7-1M3.5 15c0 1.7 3.4 3 7.5 3 1.3 0 2.5-.1 3.6-.4M20 17c0-1.7 2-3 4.5-3s4.5 1.3 4.5 3-2 3-4.5 3c-1.4 0-2.7-.4-3.5-1" />
              <path d="M20 17v8c0 1.7 2 3 4.5 3s4.5-1.3 4.5-3v-8M20 21c0 1.7 2 3 4.5 3s4.5-1.3 4.5-3" />
              <circle cx="13.5" cy="22.5" r="6.5" />
              <circle cx="13.5" cy="22.5" r="5" />
              <path d="M12 20.5c.3-.6.9-.9 1.6-.9 1 0 1.7.5 1.7 1.2 0 .7-.7 1.1-1.7 1.4-.9.3-1.6.7-1.6 1.4 0 .8.7 1.3 1.7 1.3.8 0 1.4-.3 1.7-.9M13.5 18.8v7.4" />
            </svg>
          </span> Biaya
        </button>
        <button class="nav-link" title="Detail" :class="{ active: section === 'detail' }" @click="select('detail')">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M8 3h14l6 6v19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
              <path d="M22 3v6h6M16 8h3m-3 4h8m-8 4h7m-7 4h6m-6 4h4" />
              <circle cx="10.5" cy="17" r="6.5" />
              <path d="M15.2 21.7 21 27.5a2 2 0 0 0 2.8-2.8L18 19" />
              <path d="M8 14.5h5m-6 5h5" />
            </svg>
          </span> Detail
        </button>
        <router-link v-if="session.role !== 'viewer'" class="nav-link" :class="{ active: $route.name === 'input' }" title="Input Data" to="/input">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <ellipse cx="11" cy="12" rx="8" ry="3.5" />
              <path d="M3 12v14c0 1.9 3.6 3.5 8 3.5 3.1 0 5.8-.8 7.1-2M3 19c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5M3 25c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5" />
              <path d="M20 3h10v17H16V7l4-4Z" />
              <path d="M20 3v4h-4m3 5h8m-8 4h8" />
              <path d="M11 3v8m-4-4 4 4 4-4" />
            </svg>
          </span> Input Data
        </router-link>
      </nav>
      <div class="sidebar-bottom-row">
        <div class="sidebar-footer">
          <span class="status-dot"></span>
          Data {{ last || 'memuat…' }}
        </div>
        <button
          v-if="session.role === 'admin'"
          class="nav-link sidebar-settings"
          :class="{ active: section === 'pengaturan' }"
          type="button"
          aria-label="Pengaturan"
          title="Pengaturan"
          @click="select('pengaturan')"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M12.5 3.5 13.2 1h5.6l.7 2.5 2 .8 2.2-1.3 4 4-1.3 2.2.8 2 2.5.7v5.6l-2.5.7-.8 2 1.3 2.2-4 4-2.2-1.3-2 .8-.7 2.5h-5.6l-.7-2.5-2-.8-2.2 1.3-4-4 1.3-2.2-.8-2-2.5-.7v-5.6l2.5-.7.8-2-1.3-2.2 4-4 2.2 1.3 2-.8Z" />
              <circle cx="16" cy="14.7" r="4.3" />
              <path d="m23.5 3.4.4-1.5 3.3-.9 1.9 2.8-.9 1.3.4 1.6 1.3.8-.5 3.3-1.6.4-1 1.3" />
              <circle cx="25.2" cy="6.8" r="2.1" />
            </svg>
          </span>
        </button>
      </div>
    </aside>

    <section class="dashboard-workspace">
      <AppHeader :title="sectionTitle" :greeting="section === 'overview' ? greeting : ''" />
      <div v-if="err" class="err-bar">Gagal memuat data: {{ err }}</div>
      <div class="page-heading">
        <div>
          <p>{{ sectionDescription }}</p>
        </div>
        <span class="period-badge">{{ periodLabel }}</span>
      </div>
      <FilterBar v-if="section !== 'pengaturan'" :filters="f" @apply="load" @export="exportCurrent" />

      <main v-if="section === 'pengaturan'" class="dashboard-content settings-content">
        <section class="card settings-card">
          <h2>Tambah User</h2>
          <p>Buat akun baru dan tentukan role serta batas aksesnya.</p>
          <div v-if="userMessage" class="card ok settings-message">{{ userMessage }}</div>
          <div v-if="userError" class="card bad settings-message">{{ userError }}</div>
          <form class="settings-form" @submit.prevent="createUser">
            <label>Nama lengkap<input v-model.trim="newUser.nama" required maxlength="80" autocomplete="name"></label>
            <label>Username<input v-model.trim="newUser.username" required minlength="3" maxlength="40" autocomplete="username"></label>
            <label>Password<input v-model="newUser.password" required minlength="8" type="password" autocomplete="new-password"></label>
            <label>Role akses
              <select v-model="newUser.role">
                <option value="viewer">Viewer — hanya melihat</option>
                <option value="operator">Operator — melihat dan input data</option>
                <option value="admin">Admin — akses penuh</option>
              </select>
            </label>
            <label>Region akses
              <select v-model.number="newUser.reg" :disabled="newUser.role === 'admin' || !!newUser.mill">
                <option :value="0">Semua region</option>
                <option v-for="region in 4" :key="region" :value="region">Region {{ region }}</option>
              </select>
            </label>
            <label>Mill akses
              <select v-model="newUser.mill" :disabled="newUser.role === 'admin'">
                <option value="">Semua mill dalam region</option>
                <option v-for="mill in session.mills" :key="mill.kode" :value="mill.kode">{{ mill.kode }} — Region {{ mill.reg }}</option>
              </select>
            </label>
            <button type="submit" :disabled="userBusy">{{ userBusy ? 'Menyimpan…' : 'Tambahkan User' }}</button>
          </form>
        </section>
        <section class="card settings-card">
          <div class="user-list-heading">
            <div>
              <h2>Daftar User</h2>
              <p>Password tidak dapat ditampilkan karena disimpan dalam bentuk hash. Gunakan form reset untuk menetapkan password baru. Akun sendiri dan admin aktif terakhir tidak dapat dihapus.</p>
            </div>
            <button type="button" class="user-refresh" :disabled="usersBusy" @click="loadUsers">{{ usersBusy ? 'Memuat…' : 'Muat ulang' }}</button>
          </div>
          <div v-if="usersError" class="card bad settings-message">{{ usersError }}</div>
          <div class="user-table-wrap">
            <table class="user-table">
              <thead>
                <tr><th>Nama</th><th>Username</th><th>Role</th><th>Cakupan akses</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.nama }}</td>
                  <td>{{ user.username }}</td>
                  <td><strong>{{ roleNames[user.role] || user.role }}</strong><small>{{ roleDetails[user.role] }}</small></td>
                  <td>{{ userScope(user) }}</td>
                  <td><span :class="user.aktif ? 'user-active' : 'user-inactive'">{{ user.aktif ? 'Aktif' : 'Nonaktif' }}</span></td>
                  <td><button class="user-delete" type="button" :disabled="deleteUserId === Number(user.id) || !canDeleteUser(user)" :title="deleteRestriction(user)" :aria-label="`Hapus user ${user.username}`" @click="deleteUser(user)">{{ deleteUserId === Number(user.id) ? 'Menghapus…' : 'Hapus' }}</button></td>
                </tr>
                <tr v-if="!usersBusy && !users.length"><td colspan="6">Belum ada data user.</td></tr>
              </tbody>
            </table>
          </div>
          <div v-if="userDeleteMessage" class="card ok settings-message">{{ userDeleteMessage }}</div>
          <div v-if="userDeleteError" class="card bad settings-message">{{ userDeleteError }}</div>
          <form class="password-reset-form" @submit.prevent="resetUserPassword">
            <h3>Atur Ulang Password</h3>
            <label>Pilih user
              <select v-model.number="passwordReset.id" required>
                <option :value="0" disabled>Pilih user</option>
                <option v-for="user in users" :key="user.id" :value="Number(user.id)">{{ user.nama }} ({{ user.username }})</option>
              </select>
            </label>
            <label>Password baru<input v-model="passwordReset.password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required></label>
            <button type="submit" :disabled="passwordResetBusy || !users.length">{{ passwordResetBusy ? 'Menyimpan…' : 'Simpan Password Baru' }}</button>
          </form>
          <div v-if="passwordResetMessage" class="card ok settings-message">{{ passwordResetMessage }}</div>
          <div v-if="passwordResetError" class="card bad settings-message">{{ passwordResetError }}</div>
        </section>
      </main>
      <main v-else-if="d.ringkas" class="dash dashboard-content">
        <template v-if="section === 'overview'">
          <KpiCards :total="d.ringkas.total" />
          <AlarmPanel :alarm="d.alarm" />
          <div class="overview-daily-chart">
            <ChartCard title="TBS Olah Harian vs Target" :config="charts.harian" />
          </div>
          <div class="grid2">
            <HeatmapTable :hm="d.heatmap" />
            <ChartCard title="TBS Olah Bulanan" :config="charts.bulanan" />
          </div>
        </template>

        <template v-else-if="section === 'peringkat'">
          <RankingTable :rows="d.ringkas.mills" />
        </template>

        <template v-else-if="section === 'tbs-terima'">
          <div class="metric-strip">
            <div class="card kpi kpi-target">
              <div class="kpi-main">
                <div class="l">Total TBS Diterima</div>
                <div class="v">{{ n(d.ringkas.total.masuk) }} ton</div>
              </div>
              <div class="s">{{ n(d.tbs_budget.summaryBudget?.masuk) }} ton target · {{ achievement(d.tbs_budget.summaryActual?.masuk, d.tbs_budget.summaryBudget?.masuk) }} vs target</div>
            </div>
            <div class="card kpi"><div class="l">Pemasok Terbesar</div><div class="v">{{ topSupplier }}</div></div>
            <div class="card kpi"><div class="l">Total Pemasok</div><div class="v">4 kategori</div></div>
          </div>
          <ChartCard title="TBS Diterima per Pabrik dan Pemasok" :config="charts.supplier" />
          <ChartCard title="TBS Terima: Aktual vs Budget Bulanan" :config="charts.tbsTerimaBulanan" />
          <ChartCard title="TBS Terima: Kumulatif vs Budget Setahun" :config="charts.tbsTerimaTahunan" />
          <DashboardTable title="Breakdown TBS Terima per Pemasok" :rows="supplierRows" :columns="supplierColumns" :total="supplierTotal" />
        </template>

        <template v-else-if="section === 'tbs-olah'">
          <div class="metric-strip">
            <div class="card kpi kpi-target"><div class="kpi-main"><div class="l">Total TBS Diolah</div><div class="v">{{ n(d.ringkas.total.olah) }} ton</div></div><div class="s">{{ n(d.ringkas.total.t_olah) }} ton target · {{ achievement(d.ringkas.total.olah, d.ringkas.total.t_olah) }} vs target</div></div>
            <div class="card kpi"><div class="l">Kapasitas Terpasang</div><div class="v">{{ n(totalCapacity) }} ton/jam</div></div>
            <div class="card kpi"><div class="l">Utilitas</div><div class="v">{{ n(d.ringkas.total.util, 1) }}%</div></div>
          </div>
          <ChartCard title="TBS Olah per PKS" :config="charts.tbsOlah" />
          <ChartCard title="TBS Olah: Aktual vs Budget Bulanan" :config="charts.tbsOlahBulanan" />
          <ChartCard title="TBS Olah: Kumulatif vs Budget Setahun" :config="charts.tbsOlahTahunan" />
          <DashboardTable title="TBS Olah, Kapasitas, dan Utilitas per PKS" :rows="d.ringkas.mills" :columns="olahColumns" />
        </template>

        <template v-else-if="section === 'oer-ker'">
          <div class="metric-strip">
            <div class="card kpi"><div class="l">OER Aktual</div><div class="v">{{ n(d.ringkas.total.oer, 2) }}%</div><div class="s">Target: {{ n(d.ringkas.total.t_oer, 2) }}%</div></div>
            <div class="card kpi"><div class="l">KER Aktual</div><div class="v">{{ n(d.ringkas.total.ker, 2) }}%</div><div class="s">Target: {{ n(d.ringkas.total.t_ker, 2) }}%</div></div>
          </div>
          <ChartCard title="OER Aktual vs Target per PKS" :config="charts.oer" />
          <ChartCard title="KER Aktual vs Target per PKS" :config="charts.ker" />
          <DashboardTable title="OER dan KER per PKS" :rows="d.ringkas.mills" :columns="oerKerColumns" />
        </template>

        <template v-else-if="section === 'oil-losses'">
          <div class="metric-strip">
            <div class="card kpi"><div class="l">Oil Losses Rata-rata</div><div class="v">{{ n(d.ringkas.total.ol, 3) }}%</div></div>
            <div class="card kpi"><div class="l">Target Oil Losses</div><div class="v">{{ n(d.ringkas.total.t_ol, 3) }}%</div></div>
          </div>
          <ChartCard title="Oil Losses per PKS vs Target" :config="charts.oilLoss" />
          <ChartCard title="Komponen Oil Losses" :config="charts.komponenOil" />
          <DashboardTable title="Rincian Oil Losses per PKS" :rows="d.losses" :columns="oilLossColumns" />
        </template>

        <template v-else-if="section === 'kernel-losses'">
          <div class="metric-strip">
            <div class="card kpi"><div class="l">Kernel Losses Rata-rata</div><div class="v">{{ n(d.ringkas.total.kl, 3) }}%</div></div>
            <div class="card kpi"><div class="l">Target Kernel Losses</div><div class="v">{{ n(d.ringkas.total.t_kl, 3) }}%</div></div>
          </div>
          <ChartCard title="Kernel Losses per PKS vs Target" :config="charts.kernelLoss" />
          <ChartCard title="Komponen Kernel Losses" :config="charts.komponenKernel" />
          <DashboardTable title="Rincian Kernel Losses per PKS" :rows="d.losses" :columns="kernelLossColumns" />
        </template>

        <template v-else-if="section === 'grading'">
          <ChartCard title="Hasil Grading per PKS (% janjang)" :config="charts.grading" />
          <DashboardTable title="Rincian Hasil Grading" :rows="d.grading" :columns="gradingColumns" />
        </template>

        <template v-else-if="section === 'curah-hujan'">
          <ChartCard title="Curah Hujan Harian per PKS" :config="charts.curahHujan" />
          <DashboardTable title="Curah Hujan Harian per PKS" :rows="d.curah_hujan" :columns="curahHujanColumns" />
        </template>

        <template v-else-if="section === 'biaya'">
          <div class="metric-strip">
            <div class="card kpi"><div class="l">Biaya Langsung</div><div class="v">{{ currency(d.ringkas.total.biaya_langsung) }}</div></div>
            <div class="card kpi"><div class="l">Biaya Tidak Langsung</div><div class="v">{{ currency(d.ringkas.total.biaya_tak_langsung) }}</div></div>
            <div class="card kpi"><div class="l">Total Biaya</div><div class="v">{{ currency(d.ringkas.total.biaya) }}</div></div>
            <div class="card kpi"><div class="l">Cost / TBS</div><div class="v">{{ currency(d.ringkas.total.cost_tbs) }}</div></div>
            <div class="card kpi"><div class="l">Cost / Produk (PP)</div><div class="v">{{ currency(d.ringkas.total.cost_pp) }}</div></div>
          </div>
          <ChartCard title="Biaya Langsung dan Tidak Langsung per PKS" :config="charts.biaya" />
          <DashboardTable title="Rincian Biaya dan Cost per PKS" :rows="d.ringkas.mills" :columns="biayaColumns" :total="d.ringkas.total" />
        </template>

        <template v-else-if="section === 'detail'">
          <DashboardTable title="Detail Kinerja per PKS" :rows="d.ringkas.mills" :columns="detailColumns" :total="d.ringkas.total" />
        </template>
      </main>
      <div v-else-if="!err" class="dashboard-loading">Memuat data dashboard…</div>
    </section>
  </div>
</template>

<script src="../utils/dashboardView.js"></script>

<style src="../styles/dashboard.css"></style>
<style src="../styles/tables.css"></style>
