<template>
  <div class="bookings-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('nav.bookings') }}</h1>
    </div>

    <div v-if="loading" class="text-center text-secondary">{{ t('common.loading') }}</div>

    <div v-else-if="bookings.length === 0" class="text-center text-secondary">
      {{ t('business.no_slots') }}
    </div>

    <div v-else class="bookings-list">
      <div v-for="booking in bookings" :key="booking.id" class="booking-card card mb-2">
        <div class="booking-header">
          <span class="badge" :class="`badge-${booking.status}`">
            {{ t(`status.${booking.status}`) }}
          </span>
          <span class="booking-date text-secondary">
            {{ formatDate(booking.starts_at) }}
          </span>
        </div>
        <h3 class="booking-business">{{ booking.business_name }}</h3>
        <p class="booking-service text-secondary">
          {{ booking.service_name }} - {{ booking.staff_name }}
        </p>
        <div class="booking-time">
          {{ formatTime(booking.starts_at) }} - {{ formatTime(booking.ends_at) }}
        </div>
        <p v-if="booking.customer_name" class="booking-customer">
          {{ booking.customer_name }} ({{ booking.customer_phone }})
        </p>
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

const bookings = ref([]);
const loading = ref(false);

function formatDate(datetime) {
  return new Date(datetime).toLocaleDateString();
}

function formatTime(datetime) {
  return new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function fetchBookings() {
  loading.value = true;
  try {
    const response = await auth.api.get('/bookings');
    bookings.value = response.data.data;
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchBookings();
});
</script>

<style scoped>
.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.booking-card {
  border-left: 4px solid var(--primary);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.booking-business {
  margin-bottom: 0.25rem;
}

.booking-service {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.booking-time {
  font-weight: 500;
  color: var(--primary);
}

.booking-customer {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.badge-pending { background: #FEF3C7; color: #92400E; }
.badge-confirmed { background: #D1FAE5; color: #065F46; }
.badge-cancelled { background: #FEE2E2; color: #991B1B; }
.badge-no_show { background: #E5E7EB; color: #374151; }
</style>
