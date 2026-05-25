<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/api/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/admin/home')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-container fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="6" md="4">
          <v-card class="pa-6" elevation="3" rounded="lg" color="surface">
            <v-card-title class="text-h5 text-center mb-4">Museo AR</v-card-title>
            <v-card-text>
              <v-alert v-if="error" type="error" class="mb-4" density="compact">
                {{ error }}
              </v-alert>
              <v-text-field v-model="email" label="Correo electrónico" type="email" variant="outlined" class="mb-3" />
              <v-text-field v-model="password" label="Contraseña" type="password" variant="outlined" class="mb-3" @keyup.enter="handleLogin" />
              <v-btn color="primary" block :loading="loading" @click="handleLogin">
                Iniciar sesión
              </v-btn>
            </v-card-text>
            <v-card-actions class="justify-center">
              <small>¿No tienes una cuenta? <router-link to="/register">Regístrate</router-link></small>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>