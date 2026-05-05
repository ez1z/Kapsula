<template>
  <div class="admin-layout">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <router-link to="/admin" class="logo">{{ t('app.name') }}</router-link>
          <nav class="nav">
            <router-link to="/admin">{{ t('admin.dashboard') }}</router-link>
            <router-link to="/admin/businesses">{{ t('admin.businesses') }}</router-link>
          </nav>
          <div class="header-actions">
            <select v-model="locale" @change="changeLocale" class="locale-select">
              <option value="tk">TK</option>
              <option value="ru">RU</option>
              <option value="tr">TR</option>
              <option value="en">EN</option>
            </select>
            <button @click="handleLogout" class="btn btn-secondary btn-sm">{{ t('nav.logout') }}</button>
          </div>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

const { t, locale } = useI18n();
const router = useRouter();
const auth = useAuthStore();

function changeLocale() {
  localStorage.setItem('locale', locale.value);
}

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.nav {
  display: flex;
  gap: 1.5rem;
}

.nav a {
  color: var(--text-secondary);
}

.nav a.router-link-active {
  color: var(--primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.locale-select {
  width: auto;
  padding: 0.5rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.main {
  flex: 1;
  padding: 2rem 0;
}
</style>
