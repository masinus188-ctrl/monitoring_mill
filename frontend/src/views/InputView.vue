<template>
  <div class="dashboard-shell">
    <DashboardSidebar active-section="input" :last="tgl" @navigate="goToSection" />
    <section class="dashboard-workspace">
      <AppHeader title="Input Data Harian" />
      <div class="page-heading">
        <div><p>Masukkan dan simpan data operasional harian PKS.</p></div>
        <span class="period-badge">{{ tgl }}</span>
      </div>
      <main class="dashboard-content input-content">
        <div v-if="msg" class="card ok input-message">✅ {{ msg }}</div>
        <div v-if="err" class="card bad input-message">⚠ {{ err }}</div>
        <section class="card csv-upload">
          <div class="csv-upload-heading">
            <div>
              <h2>Upload Data dari CSV</h2>
              <p>Gunakan file template atau pilih CSV berisi data satu atau beberapa mill dan tanggal.</p>
            </div>
            <button type="button" class="csv-template-button" @click="downloadTemplate">Unduh Template CSV</button>
          </div>
          <label class="csv-file-label">Pilih file CSV
            <input ref="csvFileInput" type="file" accept=".csv,text/csv" @change="handleCsvFile">
          </label>
          <p class="csv-hint">Kolom wajib: <code>mill</code>, <code>tgl</code>, dan minimal satu kolom data. Template memakai koma (,) sebagai pemisah kolom agar terbuka dalam beberapa kolom di Excel. Gunakan tanggal YYYY-MM-DD; kolom data yang kosong diisi 0 (Hari Olah default 1). Data dengan mill dan tanggal yang sama akan ditimpa. Maksimal 500 baris per upload.</p>
          <div v-if="csvError" class="csv-feedback bad" role="alert">{{ csvError }}</div>
          <div v-if="csvMessage" class="csv-feedback ok" role="status">{{ csvMessage }}</div>
          <div v-if="csvRows.length" class="csv-preview">
            <div class="csv-preview-heading">
              <strong>{{ csvFileName }} · {{ csvRows.length }} baris siap diimpor</strong>
              <button type="button" :disabled="csvBusy" @click="importCsv">{{ csvBusy ? 'Mengimpor…' : 'Impor CSV' }}</button>
            </div>
            <div class="csv-table-wrap">
              <table>
                <thead><tr><th>Baris</th><th>Mill</th><th>Tanggal</th><th>Kolom data terisi</th></tr></thead>
                <tbody>
                  <tr v-for="row in csvRows.slice(0, 5)" :key="`${row.mill}-${row.tgl}`">
                    <td>{{ row.line }}</td><td>{{ row.mill }}</td><td>{{ row.tgl }}</td><td>{{ row.filled }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <small v-if="csvRows.length > 5">Pratinjau 5 dari {{ csvRows.length }} baris.</small>
          </div>
        </section>
        <form class="input-form" @submit.prevent="save">
          <section class="card input-section">
            <h2>Pilih Mill &amp; Tanggal</h2>
            <div class="input-fields input-selection">
              <label>Mill
                <select v-model="mill" @change="load">
                  <option v-for="m in session.mills" :key="m.kode">{{ m.kode }}</option>
                </select>
              </label>
              <label>Tanggal<input type="date" v-model="tgl" @change="load"></label>
            </div>
            <small class="hint">{{ ada ? 'Data sudah ada — menyimpan akan menimpa.' : 'Belum ada data — akan dibuat baru.' }}</small>
          </section>
          <section v-for="(fields, grup) in GROUPS" :key="grup" class="card input-section">
            <h2>{{ grup }}</h2>
            <div class="input-fields">
              <label v-for="(label, k) in fields" :key="k">{{ label }}<input v-model="v[k]" inputmode="decimal"></label>
            </div>
          </section>
          <div class="input-actions">
            <button type="submit" :disabled="busy">{{ busy ? 'Menyimpan…' : `Simpan ${mill} — ${tgl}` }}</button>
          </div>
        </form>
      </main>
    </section>
  </div>
</template>

<script src="../utils/inputView.js"></script>

<style src="../styles/dashboard.css"></style>
<style src="../styles/input.css"></style>
