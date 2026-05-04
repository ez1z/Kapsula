import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth.js';

export const useBusinessStore = defineStore('business', () => {
  const businesses = ref([]);
  const currentBusiness = ref(null);
  const slots = ref([]);
  const loading = ref(false);

  const auth = useAuthStore();

  async function fetchBusinesses(filters = {}) {
    loading.value = true;
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);

      const response = await auth.api.get(`/businesses?${params}`);
      businesses.value = response.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchBusiness(id) {
    loading.value = true;
    try {
      const response = await auth.api.get(`/businesses/${id}`);
      currentBusiness.value = response.data.data;
      return currentBusiness.value;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSlots(businessId, filters = {}) {
    loading.value = true;
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.staff_id) params.append('staff_id', filters.staff_id);
      if (filters.service_id) params.append('service_id', filters.service_id);

      const response = await auth.api.get(`/businesses/${businessId}/slots?${params}`);
      slots.value = response.data.data;
      return slots.value;
    } finally {
      loading.value = false;
    }
  }

  async function lockSlot(slotId) {
    const response = await auth.api.post(`/slots/${slotId}/lock`);
    return response.data.data;
  }

  async function unlockSlot(slotId) {
    const response = await auth.api.post(`/slots/${slotId}/unlock`);
    return response.data.data;
  }

  async function createBooking(slotId, customerName, customerPhone, notes) {
    const response = await auth.api.post('/bookings', {
      slot_id: slotId,
      customer_name: customerName,
      customer_phone: customerPhone,
      notes,
    });
    return response.data.data;
  }

  async function generateSlots(businessId, data) {
    const response = await auth.api.post(`/businesses/${businessId}/slots/generate`, data);
    return response.data.data;
  }

  return {
    businesses,
    currentBusiness,
    slots,
    loading,
    fetchBusinesses,
    fetchBusiness,
    fetchSlots,
    lockSlot,
    unlockSlot,
    createBooking,
    generateSlots,
  };
});