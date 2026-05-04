<template>
  <div class="booking-page">
    <button @click="$router.back()" class="btn btn-secondary mb-3">
      {{ t('common.back') }}
    </button>

    <div class="card">
      <h1 class="mb-3">{{ t('booking.title') }}</h1>

      <div v-if="loading" class="text-center text-secondary">{{ t('common.loading') }}</div>

      <form v-else-if="!success" @submit.prevent="handleSubmit">
        <div class="form-group mb-2">
          <label>{{ t('booking.name') }}</label>
          <input v-model="customerName" type="text" required />
        </div>

        <div class="form-group mb-2">
          <label>{{ t('booking.phone') }}</label>
          <input v-model="customerPhone" type="tel" required placeholder="+99365123456" />
        </div>

        <div class="form-group mb-3">
          <label>{{ t('booking.notes') }}</label>
          <textarea v-model="notes" rows="3"></textarea>
        </div>

        <div v-if="error" class="error-message mb-2">{{ error }}</div>

        <button type="submit" class="btn btn-primary" style="width: 100%" :disabled="submitting">
          {{ submitting ? t('booking.pending') : t('booking.confirm') }}
        </button>
      </form>

      <div v-else class="success-message">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <h2>{{ t('booking.success') }}</h2>
        <router-link to="/customer/bookings" class="btn btn-primary mt-3">
          {{ t('nav.bookings') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useBusinessStore } from '@/stores/business.js';
import { useAuthStore } from '@/stores/auth.js';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const businessStore = useBusinessStore();
const auth = useAuthStore();

const customerName = ref(auth.user?.name || '');
const customerPhone = ref(auth.user?.phone || '');
const notes = ref('');
const loading = ref(false);
const submitting = ref(false);
const success = ref(false);
const error = ref('');

const slotId = route.params.slotId;

async function handleSubmit() {
  submitting.value = true;
  error.value = '';

  try {
    await businessStore.createBooking(
      parseInt(slotId),
      customerName.value,
      customerPhone.value,
      notes.value
    );
    success.value = true;
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Booking failed';
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    await businessStore.lockSlot(parseInt(slotId));
  } catch (err) {
    error.value = 'Could not reserve slot. It may already be taken.';
  } finally {
    loading.value = false;
  }
});

onUnmounted(async () => {
  if (!success.value) {
    try {
      await businessStore.unlockSlot(parseInt(slotId));
    } catch {}
  }
});
</script>

<style scoped>
.booking-page {
  max-width: 500px;
  margin: 0 auto;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.error-message {
  color: var(--error);
  font-size: 0.875rem;
}

.success-message {
  text-align: center;
  padding: 2rem 0;
}

.success-message h2 {
  color: var(--success);
  margin-top: 1rem;
}
</style>