<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/api/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const email           = ref('')
const password        = ref('')
const confirmPassword = ref('')
const error           = ref('')
const loading         = ref(false)

async function handleRegister() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  loading.value = true
  try {
    await auth.register(email.value, password.value)
    router.push('/login')
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
            <v-card-title class="text-h5 text-center mb-4">¡Bienvenido!</v-card-title>
            <v-card-text>
              <v-alert v-if="error" type="error" class="mb-4" density="compact">
                {{ error }}
              </v-alert>
              <v-text-field v-model="email" label="Correo electrónico" type="email" variant="outlined" class="mb-3" />
              <v-text-field v-model="password" label="Contraseña" type="password" variant="outlined" class="mb-3" />
              <v-text-field v-model="confirmPassword" label="Confirmar contraseña" type="password" variant="outlined" class="mb-3" @keyup.enter="handleRegister" />
              <v-btn color="primary" block :loading="loading" @click="handleRegister">
                Regístrate
              </v-btn>
            </v-card-text>
            <v-card-actions class="justify-center">
              <small>¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión</router-link></small>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>