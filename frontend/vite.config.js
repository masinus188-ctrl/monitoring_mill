import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Build menghasilkan index.html + folder static/ langsung ke ../dashboard (berdampingan dengan api.php)
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: { outDir: '../dashboard', emptyOutDir: false, assetsDir: 'static' },
  // Mode dev: jalankan "php -S 127.0.0.1:8080 -t ../dashboard" lalu "npm run dev"
  server: { proxy: { '/api.php': 'http://127.0.0.1:8080' } },
})
