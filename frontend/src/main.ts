import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const routes = [ 
    {path: '/login', component: () => import('./views/Login.vue')},
    {path: '/register', component: () => import('./views/Register.vue')},
    {path: '/', redirect: '/login'}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

createApp(App).use(router).mount('#app')
