// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/api/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login',    component: () => import('@/views/LoginView.vue') },
    { path: '/register', component: () => import('@/views/RegisterView.vue') },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true }, // guard checks this flag
      children: [
        { path: '',        redirect: 'home' },
        { path: 'home',    component: () => import('@/views/admin/HomeView.vue') },
        { path: 'scenes',  component: () => import('@/views/admin/ScenesView.vue') },
        { path: 'assets',  component: () => import('@/views/admin/AssetsView.vue') },
        { path: 'account', component: () => import('@/views/admin/AccountView.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login' }
  }

  // If already logged in and trying to hit /login or /register, send to admin
  if ((to.path === '/login' || to.path === '/register') && auth.isLoggedIn) {
    return { path: '/admin/home' }
  }
})

export default router