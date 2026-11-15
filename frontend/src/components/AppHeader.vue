<template>
  <header class="app-header">
    <h1>{{ title }}</h1>
    <span v-if="greeting" class="header-greeting">{{ greeting }}</span>
    <button class="header-logout" type="button" aria-label="Keluar" title="Keluar" @click="logout">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 17v-2h4v-4h-4V9l-5 4 5 4Zm9-14H5a2 2 0 0 0-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
      </svg>
    </button>
  </header>
</template>

<script src="../utils/appHeader.js"></script>
