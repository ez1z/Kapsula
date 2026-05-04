<template>
  <div class="bookings-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('nav.bookings') }}</h1>
    </div>

    <div v-if="loading" class="text-center text-secondary">{{ t('common.loading') }}</div>

    <div v-else-if="bookings.length === 0" class="text-center text-secondary">
      No bookings found
    </div>

    <div v-else class="bookings-list">
      <div v-for="booking in bookings" :key="booking.id" class="booking-card card mb-2">
        <div class="booking-header">
          <span class="badge" :class="`badge-${booking.status}`">
            {{ t(`status.${booking.status}`) }}
          </span>
          <span class="booking-date text-secondary">
            {{ formatDateTime(booking.starts_at) }}
          </span>
        </div>
        <div class="booking-details">
          <div class="detail">
            <span class="label">Customer:</span>
            <span>{{ booking.customer_name }}</span>
          </div>
          <div class="detail">
            <span class="label">Phone:</span>
            <span>{{ booking.customer_phone }}</span>
          </div>
          <div class="detail">
            <span class="label">Service:</span>
            <span>{{ booking.service_name }}</span>
          </div>
          <div class="detail">
            <span class="label">Staff:</span>
            <span>{{ booking.staff_name }}</span>
          </div>
        </div>
        <div v-if="booking.notes" class="booking-notes text-secondary">
          {{ booking.notes }}
        </div>
        <div class="booking-actions">
          <button
            v-if="booking.status === 'pending'"
            @click="confirmBooking(booking.id)"
            class="btn btn-primary btn-sm"
          >
            Confirm
          </button>
          <button
            v-if="booking.status === 'confirmed'"
            @click="markNoShow(booking.id)"
            class="btn btn-secondary btn-sm"
          >
            No Show
          </button>
          <button
            v-if="booking.status !== 'cancelled'"
            @click="cancelBooking(booking.id)"
            class="btn btn-danger btn-sm"
          >
            Cancel
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

const bookings = ref([]);
const loading = ref(false);

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

async function cancelBooking(id) {
  try {
    await auth.api.put(`/bookings/${id}/cancel`);
    await fetchBookings();
  } catch (err) {
    console.error('Failed to cancel booking:', err);
  }
}

async function markNoShow(id) {
  try {
    await auth.api.put(`/bookings/${id}/no-show`);
    await fetchBookings();
  } catch (err) {
    console.error('Failed to mark no-show:', err);
  }
}

onMounted(() => {
  fetchBookings();
});
</script>

<style scoped>
.booking-card {
  border-left: 4px solid var(--primary);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.booking-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail {
  display: flex;
  gap: 0.5rem;
}

.label {
  color: var(--text-secondary);
}

.booking-notes {
  font-style: italic;
  margin-bottom: 1rem;
}

.booking-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.badge-pending { background: #FEF3C7; color: #92400E; }
.badge-confirmed { background: #D1FAE5; color: #065F46; }
.badge-cancelled { background: #FEE2E2; color: #991B1B; }
.badge-no_show { background: #E5E7EB; color: #374151; }

@media (max-width: 768px) {
  .booking-details {
    grid-template-columns: 1fr;
  }
}