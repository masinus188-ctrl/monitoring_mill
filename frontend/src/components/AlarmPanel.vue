<template>
  <section class="alarm-panel">
    <h3>🚨 Perhatian Khusus ({{ alarm.alarm.length }})</h3>
    <div v-if="groups.length" class="alarm-grid">
      <article v-for="group in groups" :key="group.mill" class="card alarm">
        <h4>{{ group.mill }} <small>{{ group.items.length }} alarm</small></h4>
        <div v-for="(item, index) in group.items" :key="index" :class="{ bad: item.level === 'bad' }">
          • {{ item.metrik }}<span v-if="item.nilai != null">: {{ n(item.nilai, 2) }}</span>
        </div>
      </article>
    </div>
    <div v-else class="card ok">✅ Tidak ada alarm pada {{ alarm.tanggal }}</div>
  </section>
</template>

<script src="../utils/alarmPanel.js"></script>
