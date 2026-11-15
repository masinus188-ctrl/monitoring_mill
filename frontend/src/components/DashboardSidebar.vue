<template>
  <aside class="dashboard-sidebar" :class="{ 'is-collapsed': collapsed }">
    <div class="sidebar-brand">
      <span class="brand-mark" aria-hidden="true">
        <img src="../assets/pks-leaf-logo.png" alt="">
      </span>
      <span>Monitoring PKS<small>PERFORMANCE</small></span>
      <button
        class="sidebar-toggle"
        type="button"
        :aria-label="collapsed ? 'Buka sidebar' : 'Tutup sidebar'"
        :aria-expanded="!collapsed"
        :title="collapsed ? 'Buka sidebar' : 'Tutup sidebar'"
        @click="collapsed = !collapsed"
      >{{ collapsed ? '›' : '‹' }}</button>
    </div>
    <nav class="sidebar-nav" aria-label="Navigasi dashboard">
      <button class="nav-link" title="Overview" :class="{ active: activeSection === 'overview' }" @click="navigate('overview')">
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
      <button class="nav-link" title="Peringkat" :class="{ active: activeSection === 'peringkat' }" @click="navigate('peringkat')">
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
          <button class="nav-link" title="TBS Terima" :class="{ active: activeSection === 'tbs-terima' }" @click="navigate('tbs-terima')">TBS Terima</button>
          <button class="nav-link" title="TBS Olah" :class="{ active: activeSection === 'tbs-olah' }" @click="navigate('tbs-olah')">TBS Olah</button>
          <button class="nav-link" title="OER / KER" :class="{ active: activeSection === 'oer-ker' }" @click="navigate('oer-ker')">OER / KER</button>
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
          <button class="nav-link" title="Oil losses" :class="{ active: activeSection === 'oil-losses' }" @click="navigate('oil-losses')">Oil losses</button>
          <button class="nav-link" title="Kernel losses" :class="{ active: activeSection === 'kernel-losses' }" @click="navigate('kernel-losses')">Kernel losses</button>
        </div>
      </div>
      <button class="nav-link" title="Grading" :class="{ active: activeSection === 'grading' }" @click="navigate('grading')">
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
      <button class="nav-link" title="Curah Hujan" :class="{ active: activeSection === 'curah-hujan' }" @click="navigate('curah-hujan')">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <path d="M9 19H6.5a5 5 0 1 1 1.1-9.9A9 9 0 0 1 24.7 8a6 6 0 0 1 1.8 11" />
            <path d="M10 23c0 1.4-2 3.5-2 3.5S6 24.4 6 23a2 2 0 0 1 4 0Zm9 3c0 1.4-2 3.5-2 3.5S15 27.4 15 26a2 2 0 0 1 4 0Zm9-3c0 1.4-2 3.5-2 3.5S24 24.4 24 23a2 2 0 0 1 4 0Z" />
          </svg>
        </span> Curah Hujan
      </button>
      <button class="nav-link" title="Biaya" :class="{ active: activeSection === 'biaya' }" @click="navigate('biaya')">
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
      <button class="nav-link" title="Detail" :class="{ active: activeSection === 'detail' }" @click="navigate('detail')">
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
      <router-link v-if="session.role !== 'viewer'" class="nav-link" :class="{ active: isInput }" title="Input Data" to="/input">
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
        :class="{ active: activeSection === 'pengaturan' }"
        type="button"
        aria-label="Pengaturan"
        title="Pengaturan"
        @click="navigate('pengaturan')"
      >
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <path d="M12.5 3.5 13.2 1h5.6l.7 2.5 2 .8 2.2-1.3 4 4-1.3 2.2.8 2 2.5.7v5.6l-2.5.7-.8 2 1.3 2.2-4 4-2.2-1.3-2-.8-.7 2.5h-5.6l-.7-2.5-2-.8-2.2 1.3-4-4 1.3-2.2-.8-2-2.5-.7v-5.6l2.5-.7.8-2-1.3-2.2 4-4 2.2 1.3 2-.8Z" />
            <circle cx="16" cy="14.7" r="4.3" />
            <path d="m23.5 3.4.4-1.5 3.3-.9 1.9 2.8-.9 1.3.4 1.6 1.3.8-.5 3.3-1.6.4-1 1.3" />
            <circle cx="25.2" cy="6.8" r="2.1" />
          </svg>
        </span>
      </button>
    </div>
  </aside>
</template>

<script src="../utils/dashboardSidebar.js"></script>
