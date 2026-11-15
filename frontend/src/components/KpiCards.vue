<template>
  <div class="kpis">
    <div v-for="k in cards" :key="k.label" class="card kpi" :class="{ 'kpi-target': k.sub }">
      <div class="kpi-main">
        <div class="l">{{ k.label }}</div><div class="v">{{ k.value }}</div>
      </div>
      <div v-if="k.sub" class="s" :class="k.cls" v-html="k.sub"></div>
    </div>
  </div>
</template>

<script src="../utils/kpiCards.js"></script>
