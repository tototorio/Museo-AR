// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/api/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', meta: { guestOnly: true },    component: () => import('@/views/LoginView.vue') },
    { path: '/register', meta: { guestOnly: true }, component: () => import('@/views/RegisterView.vue') },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '',        redirect: 'home' },
        { path: 'home',    meta: { requiresAuth: true }, component: () => import('@/views/admin/HomeView.vue') },
        { path: 'scenes',  meta: { requiresAuth: true }, component: () => import('@/views/admin/ScenesView.vue') },
        { path: 'assets',  meta: { requiresAuth: true }, component: () => import('@/views/admin/AssetsView.vue') },
        { path: 'account', meta: { requiresAuth: true }, component: () => import('@/views/admin/AccountView.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly    = to.matched.some(record => record.meta.guestOnly)

  if (requiresAuth && !auth.isLoggedIn) {
    return { path: '/login' }
  }

  if (guestOnly && auth.isLoggedIn) {
    return { path: '/admin/home' }
  }
})

export default router