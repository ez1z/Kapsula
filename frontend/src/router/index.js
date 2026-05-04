import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/customer',
  },
  {
    path: '/customer',
    component: () => import('@/views/customer/Layout.vue'),
    children: [
      { path: '', name: 'customer-home', component: () => import('@/views/customer/Home.vue') },
      { path: 'business/:id', name: 'customer-business', component: () => import('@/views/customer/Business.vue') },
      { path: 'book/:slotId', name: 'customer-book', component: () => import('@/views/customer/Booking.vue') },
      { path: 'bookings', name: 'customer-bookings', component: () => import('@/views/customer/Bookings.vue') },
    ],
  },
  {
    path: '/business',
    component: () => import('@/views/business/Layout.vue'),
    meta: { requiresAuth: true, role: 'business' },
    children: [
      { path: '', name: 'business-dashboard', component: () => import('@/views/business/Dashboard.vue') },
      { path: 'slots', name: 'business-slots', component: () => import('@/views/business/Slots.vue') },
      { path: 'bookings', name: 'business-bookings', component: () => import('@/views/business/Bookings.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/Layout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'businesses', name: 'admin-businesses', component: () => import('@/views/admin/Businesses.vue') },
    ],
  },
  { path: '/login', name: 'login', component: () => import('@/views/Login.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/Register.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (to.meta.requiresAuth && !token) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta.role && userRole !== to.meta.role) {
    next({ name: 'customer-home' });
    return;
  }

  next();
});

export default router;