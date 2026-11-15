<template>
  <div class="bar">
    <label>Tahun<select v-model="filters.tahun"><option v-for="t in session.tahun" :key="t" :value="t">{{ t }}</option></select></label>
    <label>Bulan<select v-model.number="filters.bulan"><option :value="0">Semua (YTD)</option><option v-for="(b, i) in BL" :key="i" :value="i + 1">{{ b }}</option></select></label>
    <label>Region<select v-model.number="filters.reg"><option :value="0">Semua</option><option v-for="r in 4" :key="r" :value="r">{{ r }}</option></select></label>
    <label>Mill<select v-model="filters.mill"><option value="">Semua</option><option v-for="m in session.mills" :key="m.kode">{{ m.kode }}</option></select></label>
    <button @click="$emit('apply')">Terapkan</button>
    <button class="sec" @click="$emit('export')">Export CSV</button>
  </div>
</template>

<script src="../utils/filterBar.js"></script>
