<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">{{ t('admin.dashboard') }}</h1>
    </div>

    <div v-if="loading" class="text-center text-secondary">{{ t('common.loading') }}</div>

    <div v-else class="stats-grid">
      <div class="stat-card card">
        <h3>{{ t('admin.total_businesses') }}</h3>
        <p class="stat-value">{{ stats.businesses }}</p>
      </div>
      <div class="stat-card card">
        <h3>{{ t('admin.total_users') }}</h3>
        <p class="stat-value">{{ stats.users }}</p>
      </div>
      <div class="stat-card card">
        <h3>{{ t('admin.total_bookings') }}</h3>
        <p class="stat-value">{{ stats.bookings }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.js';

const { t } = useI18n();
const auth = useAuthStore();

const stats = ref({ businesses: 0, users: 0, bookings: 0 });
const loading = ref(false);

async function fetchStats() {
  loading.value = true;
  try {
    const response = await auth.api.get('/admin/stats');
    stats.value = response.data.data;
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  text-align: center;
}

.stat-card h3 {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
