<template>
  <section class="card data-table-card">
    <div class="table-heading">
      <h3>{{ title }}</h3>
      <small>Klik judul kolom untuk mengurutkan</small>
    </div>
    <div class="sc">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column[0]" @click="sort(column[0])">
              {{ column[1] }} <span v-if="key === column[0]">{{ dir === 1 ? '↑' : '↓' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in sorted" :key="row.mill || row.kode || index">
            <td v-for="column in columns" :key="column[0]">
              {{ column[2] == null ? (row[column[0]] ?? '-') : n(row[column[0]], column[2]) }}
            </td>
          </tr>
          <tr v-if="total" class="tot">
            <td v-for="(column, index) in columns" :key="column[0]">
              {{ index === 0 ? 'TOTAL' : total[column[0]] == null ? '' : column[2] == null ? total[column[0]] : n(total[column[0]], column[2]) }}
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td :colspan="columns.length" class="table-empty">Tidak ada data untuk filter ini.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script src="../utils/dashboardTable.js"></script>
