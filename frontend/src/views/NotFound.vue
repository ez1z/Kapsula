<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <p>{{ t('common.error') }} - Page not found</p>
      <router-link to="/" class="btn btn-primary">{{ t('nav.home') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  text-align: center;
}

h1 {
  font-size: 6rem;
  color: var(--primary);
}
</style>