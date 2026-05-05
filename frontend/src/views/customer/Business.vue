<template>
  <div class="business-detail">
    <button @click="$router.back()" class="btn btn-secondary mb-3">
      {{ t('common.back') }}
    </button>

    <div v-if="loading" class="text-center text-secondary">{{ t('common.loading') }}</div>

    <template v-else-if="business">
      <div class="business-header card mb-3">
        <div class="business-title">
          <h1>{{ business.name }}</h1>
          <span class="badge" :class="`badge-${business.type}`">{{ business.type }}</span>
        </div>
        <p class="text-secondary">{{ business.address }}</p>
        <p class="text-secondary">{{ business.phone }}</p>
      </div>

      <div class="services card mb-3">
        <h2 class="mb-2">{{ t('business.services') }}</h2>
        <div class="service-list">
          <div
            v-for="service in business.services"
            :key="service.id"
            class="service-item"
            :class="{ selected: selectedService?.id === service.id }"
            @click="selectedService = service"
          >
            <div class="service-info">
              <span class="service-name">{{ service.name }}</span>
              <span class="service-duration text-secondary">{{ service.duration_minutes }} min</span>
            </div>
            <span class="service-price">{{ service.price }} TMT</span>
          </div>
        </div>
      </div>

      <div class="date-picker card mb-3">
        <h2 class="mb-2">{{ t('booking.select_slot') }}</h2>
        <input type="date" v-model="selectedDate" :min="today" @change="fetchSlots" class="mb-2" />
      </div>

      <div v-if="slots.length > 0" class="slots card mb-3">
        <h2 class="mb-2">{{ t('booking.select_slot') }}</h2>
        <div class="slots-grid">
          <button
            v-for="slot in slots"
            :key="slot.id"
            class="slot-btn"
            :class="{ selected: selectedSlot?.id === slot.id }"
            @click="selectSlot(slot)"
            :disabled="slot.status !== 'available'"
          >
            <span class="slot-time">{{ formatTime(slot.starts_at) }}</span>
            <span class="slot-staff text-secondary">{{ slot.staff_name }}</span>
          </button>
        </div>
      </div>

      <div v-else-if="selectedDate && !slotsLoading" class="text-center text-secondary mb-3">
        {{ t('business.no_slots') }}
      </div>

      <div v-if="selectedSlot" class="action-bar">
        <button @click="proceedToBook" class="btn btn-primary btn-lg" style="width: 100%">
          {{ t('business.book') }} - {{ selectedService?.price }} TMT
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useBusinessStore } from '@/stores/business.js';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const businessStore = useBusinessStore();

const business = computed(() => businessStore.currentBusiness);
const loading = computed(() => businessStore.loading);
const slots = computed(() => businessStore.slots);
const slotsLoading = ref(false);

const selectedService = ref(null);
const selectedDate = ref('');
const selectedSlot = ref(null);

const today = new Date().toISOString().split('T')[0];

function formatTime(datetime) {
  return new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function fetchSlots() {
  if (!selectedDate.value || !selectedService.value) return;

  slotsLoading.value = true;
  selectedSlot.value = null;

  await businessStore.fetchSlots(route.params.id, {
    date: selectedDate.value,
    service_id: selectedService.value.id,
  });

  slotsLoading.value = false;
}

function selectSlot(slot) {
  selectedSlot.value = slot;
}

function proceedToBook() {
  if (selectedSlot.value && selectedService.value) {
    router.push(`/customer/book/${selectedSlot.value.id}`);
  }
}

onMounted(async () => {
  await businessStore.fetchBusiness(route.params.id);
  selectedDate.value = today;
});
</script>

<style scoped>
.business-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.business-title h1 {
  margin: 0;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.service-item:hover {
  border-color: var(--primary);
}

.service-item.selected {
  border-color: var(--primary);
  background: rgba(30, 64, 175, 0.05);
}

.service-info {
  display: flex;
  flex-direction: column;
}

.service-name {
  font-weight: 500;
}

.service-duration {
  font-size: 0.875rem;
}

.service-price {
  font-weight: 600;
  color: var(--primary);
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.slot-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  cursor: pointer;
  transition: all 0.2s;
}

.slot-btn:hover:not(:disabled) {
  border-color: var(--primary);
}

.slot-btn.selected {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.slot-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slot-time {
  font-weight: 600;
}

.slot-staff {
  font-size: 0.75rem;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.btn-lg {
  padding: 1rem;
  font-size: 1.125rem;
}
</style>
