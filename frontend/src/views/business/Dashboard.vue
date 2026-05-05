<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">{{ t('admin.dashboard') }}</h1>
    </div>

    <div class="stats-grid mb-3">
      <div class="stat-card card">
        <h3>{{ t('admin.total_bookings') }}</h3>
        <p class="stat-value">{{ stats.total }}</p>
      </div>
      <div class="stat-card card">
        <h3>Pending</h3>
        <p class="stat-value">{{ stats.pending }}</p>
      </div>
      <div class="stat-card card">
        <h3>Confirmed</h3>
        <p class="stat-value">{{ stats.confirmed }}</p>
      </div>
    </div>

    <div class="recent-bookings">
      <h2 class="mb-2">Recent Bookings</h2>
      <div v-if="loading" class="text-center text-secondary">{{ t('common.loading') }}</div>
      <div v-else-if="bookings.length === 0" class="text-center text-secondary">No bookings yet</div>
      <div v-else class="bookings-list">
        <div v-for="booking in bookings.slice(0, 10)" :key="booking.id" class="booking-row card">
          <div class="booking-info">
            <span class="badge" :class="`badge-${booking.status}`">
              {{ t(`status.${booking.status}`) }}
            </span>
            <span class="booking-customer">{{ booking.customer_name }}</span>
            <span class="booking-service text-secondary">{{ booking.service_name }}</span>
          </div>
          <div class="booking-time">
            {{ formatDateTime(booking.starts_at) }}
          </div>
          <div class="booking-actions">
            <button
              v-if="booking.status === 'pending'"
              @click="confirmBooking(booking.id)"
              class="btn btn-primary btn-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.js';

const { t } = useI18n();
const auth = useAuthStore();

const bookings = ref([]);
const loading = ref(false);

const stats = computed(() => ({
  total: bookings.value.length,
  pending: bookings.value.filter(b => b.status === 'pending').length,
  confirmed: bookings.value.filter(b => b.status === 'confirmed').length,
}));

function formatDateTime(datetime) {
  const d = new Date(datetime);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

async function confirmBooking(id) {
  try {
    await auth.api.put(`/bookings/${id}/confirm`);
    await fetchBookings();
  } catch (err) {
    console.error('Failed to confirm booking:', err);
  }
}

onMounted(() => {
  fetchBookings();
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
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.booking-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.booking-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.booking-customer {
  font-weight: 500;
}

.booking-time {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.booking-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .booking-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
