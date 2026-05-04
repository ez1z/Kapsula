<template>
  <div class="home">
    <div class="page-header">
      <h1 class="page-title">{{ t('home.title') }}</h1>
    </div>

    <div class="filters mb-3">
      <div class="filter-tabs">
        <button
          v-for="type in ['all', 'barber', 'cafe', 'salon']"
          :key="type"
          :class="['filter-tab', { active: selectedType === type }]"
          @click="selectedType = type"
        >
          {{ type === 'all' ? t('home.filter_all') : t(`home.filter_${type}`) }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-secondary">{{ t('common.loading') }}</div>

    <div v-else-if="businesses.length === 0" class="text-center text-secondary">
      {{ t('business.no_slots') }}
    </div>

    <div v-else class="business-grid">
      <div
        v-for="business in filteredBusinesses"
        :key="business.id"
        class="business-card card"
        @click="goToBusiness(business.id)"
      >
        <div class="business-header">
          <span class="business-type badge" :class="`badge-${business.type}`">
            {{ t(`home.filter_${business.type}`) }}
          </span>
        </div>
        <h3 class="business-name">{{ business.name }}</h3>
        <p class="business-address text-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {{ business.address }}
        </p>
        <div class="business-hours text-secondary">
          {{ formatHours(business.hours) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useBusinessStore } from '@/stores/business.js';

const { t } = useI18n();
const router = useRouter();
const businessStore = useBusinessStore();

const selectedType = ref('all');
const loading = computed(() => businessStore.loading);
const businesses = computed(() => businessStore.businesses);

const filteredBusinesses = computed(() => {
  if (selectedType.value === 'all') return businesses.value;
  return businesses.value.filter(b => b.type === selectedType.value);
});

function formatHours(hours) {
  if (!hours || hours.length === 0) return '';
  const today = hours.find(h => h.day_of_week === new Date().getDay());
  if (!today) return '';
  if (today.is_day_off) return t('days.' + today.day_of_week) + ': ' + 'Closed';
  return `${today.open_time.slice(0, 5)} - ${today.close_time.slice(0, 5)}`;
}

function goToBusiness(id) {
  router.push(`/customer/business/${id}`);
}

onMounted(() => {
  businessStore.fetchBusinesses();
});
</script>

<style scoped>
.filters {
  margin-bottom: 1.5rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 9999px;
  background: var(--surface);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.business-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.business-card {
  cursor: pointer;
  transition: all 0.2s;
}

.business-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.business-header {
  margin-bottom: 0.5rem;
}

.business-type {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.badge-barber { background: #3B82F6; }
.badge-cafe { background: #8B5CF6; }
.badge-salon { background: #EC4899; }

.business-name {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.business-address {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.business-hours {
  font-size: 0.875rem;
}