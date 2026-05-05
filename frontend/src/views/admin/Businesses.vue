<template>
  <div class="businesses-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('admin.businesses') }}</h1>
    </div>

    <div v-if="loading" class="text-center text-secondary">{{ t('common.loading') }}</div>

    <div v-else-if="businesses.length === 0" class="text-center text-secondary">
      No businesses found
    </div>

    <div v-else class="businesses-list">
      <div
        v-for="business in businesses"
        :key="business.id"
        class="business-card card mb-2"
        :class="{ inactive: !business.is_active }"
      >
        <div class="business-header">
          <div class="business-info">
            <h3>{{ business.name }}</h3>
            <span class="badge" :class="business.is_active ? 'badge-confirmed' : 'badge-cancelled'">
              {{ business.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="business-type badge">{{ business.type }}</div>
        </div>
        <p class="text-secondary">{{ business.address }}</p>
        <p class="text-secondary">{{ business.phone }}</p>
        <div class="business-actions">
          <button
            v-if="business.is_active"
            @click="deactivateBusiness(business.id)"
            class="btn btn-secondary btn-sm"
          >
            {{ t('admin.deactivate') }}
          </button>
          <button
            v-else
            @click="activateBusiness(business.id)"
            class="btn btn-primary btn-sm"
          >
            {{ t('admin.activate') }}
          </button>
        </div>
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

const businesses = ref([]);
const loading = ref(false);

async function fetchBusinesses() {
  loading.value = true;
  try {
    const response = await auth.api.get('/admin/businesses');
    businesses.value = response.data.data;
  } catch (err) {
    console.error('Failed to fetch businesses:', err);
  } finally {
    loading.value = false;
  }
}

async function activateBusiness(id) {
  try {
    await auth.api.put(`/admin/businesses/${id}/activate`);
    await fetchBusinesses();
  } catch (err) {
    console.error('Failed to activate business:', err);
  }
}

async function deactivateBusiness(id) {
  try {
    await auth.api.put(`/admin/businesses/${id}/deactivate`);
    await fetchBusinesses();
  } catch (err) {
    console.error('Failed to deactivate business:', err);
  }
}

onMounted(() => {
  fetchBusinesses();
});
</script>

<style scoped>
.businesses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.business-card {
  border-left: 4px solid var(--primary);
}

.business-card.inactive {
  opacity: 0.7;
  border-left-color: var(--text-secondary);
}

.business-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.business-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.business-info h3 {
  margin: 0;
}

.business-type {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.business-actions {
  margin-top: 1rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.badge-confirmed { background: #D1FAE5; color: #065F46; }
.badge-cancelled { background: #FEE2E2; color: #991B1B; }
</style>
