<template>
  <div class="register-page">
    <div class="register-card card">
      <h1 class="text-center mb-3">{{ t('app.name') }}</h1>
      <p class="text-center text-secondary mb-3">{{ t('auth.register') }}</p>

      <form @submit.prevent="handleRegister">
        <div class="mb-2">
          <label>{{ t('auth.name') }}</label>
          <input v-model="name" type="text" required />
        </div>

        <div class="mb-2">
          <label>{{ t('auth.phone') }}</label>
          <input v-model="phone" type="tel" placeholder="+99365123456" required />
        </div>

        <div class="mb-2">
          <label>{{ t('auth.password') }}</label>
          <input v-model="password" type="password" required minlength="6" />
        </div>

        <div class="mb-3">
          <label>{{ t('auth.role') }}</label>
          <select v-model="role" required>
            <option value="customer">{{ t('auth.role_customer') }}</option>
            <option value="business">{{ t('auth.role_business') }}</option>
          </select>
        </div>

        <div v-if="error" class="error-message mb-2">{{ error }}</div>

        <button type="submit" class="btn btn-primary" style="width: 100%" :disabled="loading">
          {{ loading ? t('common.loading') : t('auth.register') }}
        </button>
      </form>

      <p class="text-center mt-3">
        {{ t('auth.has_account') }}
        <router-link to="/login">{{ t('auth.login') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.js';

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const name = ref('');
const phone = ref('');
const password = ref('');
const role = ref('customer');
const loading = ref(false);
const error = ref('');

async function handleRegister() {
  loading.value = true;
  error.value = '';

  try {
    await auth.register(phone.value, password.value, name.value, role.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Registration failed';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.error-message {
  color: var(--error);
  font-size: 0.875rem;
}
</style>