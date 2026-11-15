<template>
  <section class="login-page">
    <div class="login-content">
      <form class="login-form" @submit.prevent="submit">
        <div class="flex-row">
          <label class="lf--label" for="username" aria-label="Username">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="10" r="7" />
              <path d="M3 29c.8-7.3 6.1-12 13-12s12.2 4.7 13 12" />
            </svg>
          </label>
          <input
            id="username"
            v-model="username"
            class="lf--input"
            placeholder="Username"
            type="text"
            autocomplete="username"
            required
            autofocus
          >
        </div>
        <div class="flex-row">
          <label class="lf--label" for="password" aria-label="Password">
            <svg viewBox="0 0 104 104" aria-hidden="true">
              <path d="M60 67 47 80H36v10H26v10H9V84l35-35c-4-7-2-14 4-20l9-10c5-5 12-5 18-1l14 10c6 5 10 12 7 19-2 5-7 10-12 15-6 6-13 9-20 5l-4-3" />
              <circle class="password-key-dot" cx="75" cy="38" r="6" />
            </svg>
          </label>
          <input
            id="password"
            v-model="password"
            class="lf--input"
            placeholder="Password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
          >
          <button
            class="password-visibility"
            type="button"
            :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
            :aria-pressed="showPassword"
            :title="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <path d="m3 3 18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.1 3.6M6.2 6.3C3.5 8 2 12 2 12s3.5 6 10 6c1 0 1.9-.1 2.7-.4" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </svg>
          </button>
        </div>
        <div v-if="err" class="login-error" role="alert">{{ err }}</div>
        <button class="lf--submit" type="submit" :disabled="busy">
          {{ busy ? 'MEMPROSES…' : 'LOGIN' }}
        </button>
      </form>
      <p class="lf--forgot">Lupa password? Hubungi administrator.</p>
    </div>
  </section>
</template>

<script src="../utils/loginView.js"></script>

<style src="../styles/login.css"></style>
