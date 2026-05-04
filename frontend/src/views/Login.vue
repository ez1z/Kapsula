<template>
  <div class="login-page">
    <div class="login-card card">
      <h1 class="text-center mb-3">{{ t('app.name') }}</h1>
      <p class="text-center text-secondary mb-3">{{ t('auth.login') }}</p>

      <form @submit.prevent="handleLogin">
        <div class="mb-2">
          <label>{{ t('auth.phone') }}</label>
          <input v-model="phone" type="tel" placeholder="+99365123456" required />
        </div>

        <div class="mb-3">
          <label>{{ t('auth.password') }}</label>
          <input v-model="password" type="password" required />
        </div>

        <div v-if="error" class="error-message mb-2">{{ error }}</div>

        <button type="submit" class="btn btn-primary" style="width: 100%" :disabled="loading">
          {{ loading ? t('common.loading') : t('auth.login') }}
        </button>
      </form>

      <p class="text-center mt-3">
        {{ t('auth.no_account') }}
        <router-link to="/register">{{ t('auth.register') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.js';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const phone = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';

  try {
    await auth.login(phone.value, password.value);
    const redirect = route.query.redirect || '/';
    router.push(redirect);
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.error-message {
  color: var(--error);
  font-size: 0.875rem;
}
</style>