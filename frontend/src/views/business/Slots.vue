<template>
  <div class="slots-page">
    <div class="page-header">
      <h1 class="page-title">Generate Slots</h1>
    </div>

    <div class="card mb-3">
      <form @submit.prevent="handleGenerate">
        <div class="form-grid">
          <div class="form-group">
            <label>Date</label>
            <input type="date" v-model="form.date" required :min="today" />
          </div>

          <div class="form-group">
            <label>Start Time</label>
            <input type="time" v-model="form.start_time" required />
          </div>

          <div class="form-group">
            <label>End Time</label>
            <input type="time" v-model="form.end_time" required />
          </div>

          <div class="form-group">
            <label>Interval (minutes)</label>
            <input type="number" v-model="form.interval_minutes" required min="5" max="480" />
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? t('common.loading') : 'Generate Slots' }}
        </button>
      </form>
    </div>

    <div v-if="message" class="message mb-3" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.js';

const { t } = useI18n();
const auth = useAuthStore();

const form = ref({
  date: '',
  start_time: '09:00',
  end_time: '20:00',
  interval_minutes: 30,
});

const loading = ref(false);
const message = ref('');
const messageType = ref('');

const today = new Date().toISOString().split('T')[0];

async function handleGenerate() {
  loading.value = true;
  message.value = '';

  try {
    const businessResponse = await auth.api.get('/businesses');
    const businessId = businessResponse.data.data[0]?.id;

    if (!businessId) {
      message.value = 'No business found';
      messageType.value = 'error';
      return;
    }

    await auth.api.post(`/businesses/${businessId}/slots/generate`, form.value);

    message.value = 'Slots generated successfully!';
    messageType.value = 'success';
  } catch (err) {
    message.value = 'Failed to generate slots';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.message {
  padding: 1rem;
  border-radius: 0.5rem;
}

.message.success {
  background: #D1FAE5;
  color: #065F46;
}

.message.error {
  background: #FEE2E2;
  color: #991B1B;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
