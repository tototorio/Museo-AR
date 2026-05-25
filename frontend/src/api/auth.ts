import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<{ id: string, email: string } | null>(null)
    const isLoggedIn = computed(() => user.value !== null)

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/me')
            if (res.ok) {
                const data = await res.json()
                user.value = data.user
            } else {
                user.value = null
            }
        } catch {
            user.value = null
        }
    }

    function logout() {
        user.value = null
        fetch('/api/auth/logout', { method: 'POST' })
    }

    async function login(email: string, password: string) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body.error ?? 'Credenciales inválidas')
        }

        await checkAuth() // populate user from /me after successful login
    }

    async function register(email: string, password: string) {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body.error ?? 'Error al registrarse')
        }
    }

    return { user, isLoggedIn, checkAuth, login, register, logout }
})