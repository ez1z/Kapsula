import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  const token = ref(localStorage.getItem('token') || null);

  const isAuthenticated = computed(() => !!token.value);
  const isCustomer = computed(() => user.value?.role === 'customer');
  const isBusiness = computed(() => user.value?.role === 'business');
  const isAdmin = computed(() => user.value?.role === 'admin');

  async function login(phone, password) {
    const response = await api.post('/auth/login', { phone, password });
    const { user: userData, token: authToken } = response.data.data;

    user.value = userData;
    token.value = authToken;

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);

    return userData;
  }

  async function register(phone, password, name, role = 'customer') {
    const response = await api.post('/auth/register', { phone, password, name, role });
    const { user: userData, token: authToken } = response.data.data;

    user.value = userData;
    token.value = authToken;

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);

    return userData;
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }

  async function fetchUser() {
    if (!token.value) return null;
    try {
      const response = await api.get('/auth/me');
      user.value = response.data.data;
      localStorage.setItem('user', JSON.stringify(user.value));
      return user.value;
    } catch {
      logout();
      return null;
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isCustomer,
    isBusiness,
    isAdmin,
    login,
    register,
    logout,
    fetchUser,
    api,
  };
});