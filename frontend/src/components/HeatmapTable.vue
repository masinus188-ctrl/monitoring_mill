<template>
  <div class="card">
    <h3>Heatmap Harian — {{ BL[hm.bulan - 1] || '' }}
      <select v-model="k">
        <option value="olah">TBS Olah (ton)</option><option value="oer">OER %</option><option value="ol">Oil Losses %</option><option value="util">Utilitas %</option>
      </select>
    </h3>
    <div class="sc"><table class="hm">
      <tr><th>Mill</th><th v-for="d in days" :key="d" class="c">{{ d }}</th></tr>
      <tr v-for="m in mills" :key="m">
        <td><b>{{ m }}</b></td>
        <td v-for="d in days" :key="d" :title="`${m} tgl ${d}: ${n(val(m, d), 2)}`" :style="{ background: color(val(m, d)) }">{{ cell(val(m, d)) }}</td>
      </tr>
    </table></div>
  </div>
</template>

<script src="../utils/heatmapTable.js"></script>
