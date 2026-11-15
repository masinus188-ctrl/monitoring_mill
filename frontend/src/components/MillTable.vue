<template>
  <div class="card"><h3>Rekap per Mill <small style="color:var(--mut)">(klik judul kolom untuk mengurutkan)</small></h3>
    <div class="sc"><table>
      <tr><th v-for="c in COLS" :key="c[0]" @click="sort(c[0])">{{ c[1] }}</th></tr>
      <tr v-for="r in sorted" :key="r.mill"><td v-for="c in COLS" :key="c[0]">{{ c[2] == null ? r[c[0]] : n(r[c[0]], c[2]) }}</td></tr>
      <tr class="tot"><td v-for="c in COLS" :key="c[0]">{{ c[0] === 'mill' ? 'TOTAL' : c[0] === 'reg' ? '' : n(total[c[0]], c[2]) }}</td></tr>
    </table></div>
  </div>
</template>

<script src="../utils/millTable.js"></script>
