<template>
  <section class="ranking-panel">
    <header class="ranking-heading">
      <span class="ranking-heading-icon" aria-hidden="true">🏆</span>
      <div>
        <h3>Peringkat Mill</h3>
        <p>Bandingkan 3 mill teratas dan terbawah untuk setiap metrik.</p>
      </div>
      <span class="ranking-mill-count">{{ rows.length }} Mill</span>
    </header>

    <div class="ranking-grid">
      <article v-for="metric in metrics" :key="metric.key" class="ranking-card">
        <header class="ranking-card-heading">
          <span class="ranking-metric-icon" aria-hidden="true">{{ metric.icon }}</span>
          <div>
            <h4>{{ metric.label }}</h4>
            <small>{{ metric.higherIsBetter ? 'Semakin tinggi semakin baik' : 'Semakin rendah semakin baik' }}</small>
          </div>
        </header>

        <div class="ranking-switch" role="group" :aria-label="`Pilih peringkat ${metric.label}`">
          <button
            type="button"
            :class="{ active: activeSide(metric.key) === 'best' }"
            :aria-pressed="activeSide(metric.key) === 'best'"
            @click="activeSides[metric.key] = 'best'"
          >✦ Terbaik</button>
          <button
            type="button"
            :class="{ active: activeSide(metric.key) === 'worst' }"
            :aria-pressed="activeSide(metric.key) === 'worst'"
            @click="activeSides[metric.key] = 'worst'"
          >Perlu perhatian</button>
        </div>

        <ol v-if="activeRanking(metric).length" class="ranking-list">
          <li v-for="(mill, index) in activeRanking(metric)" :key="mill.mill" class="ranking-item">
            <span class="ranking-position" :class="`position-${index + 1}`">{{ index + 1 }}</span>
            <span class="ranking-mill-name">{{ mill.mill }}</span>
            <strong class="ranking-value">{{ n(mill[metric.key], 2) }}</strong>
          </li>
        </ol>
        <p v-else class="ranking-empty">Belum ada data untuk metrik ini.</p>
      </article>
    </div>

    <section class="ranking-table-card">
      <header class="ranking-table-heading">
        <div>
          <h4>Daftar Peringkat Mill</h4>
          <p>Ringkasan tiga mill terbaik dan terbawah untuk setiap metrik.</p>
        </div>
        <span>{{ metrics.length }} metrik</span>
      </header>
      <div class="ranking-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Metrik</th>
              <th>Terbaik</th>
              <th>Perlu perhatian</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metric in metrics" :key="metric.key">
              <th scope="row">
                <span class="ranking-table-metric">{{ metric.icon }} {{ metric.label }}</span>
                <small>{{ metric.higherIsBetter ? 'Nilai tinggi lebih baik' : 'Nilai rendah lebih baik' }}</small>
              </th>
              <td>
                <ol class="ranking-table-list best-list">
                  <li v-for="(mill, index) in metric.best" :key="mill.mill">
                    <span>{{ index + 1 }}.</span> {{ mill.mill }} <strong>{{ n(mill[metric.key], 2) }}</strong>
                  </li>
                </ol>
              </td>
              <td>
                <ol class="ranking-table-list attention-list">
                  <li v-for="(mill, index) in metric.worst" :key="mill.mill">
                    <span>{{ index + 1 }}.</span> {{ mill.mill }} <strong>{{ n(mill[metric.key], 2) }}</strong>
                  </li>
                </ol>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script src="../utils/rankingTable.js"></script>

<style src="../styles/ranking.css" scoped></style>
