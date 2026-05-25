<!-- src/views/admin/AccountView.vue -->
<script setup lang="ts">
import { useAuthStore } from '@/api/auth'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <v-container max-width="600">

    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold">Cuenta</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">
        {{ auth.user?.email }}
      </p>
    </div>

    <v-card rounded="lg" elevation="2">
      <v-list lines="two">

        <!-- Each item is a placeholder for a future feature -->

        <v-list-item
          prepend-icon="mdi-account-outline"
          title="Perfil"
          subtitle="Cambiar nombre y foto de perfil"
          append-icon="mdi-chevron-right"
          disabled
        />

        <v-divider />

        <v-list-item
          prepend-icon="mdi-lock-outline"
          title="Contraseña"
          subtitle="Actualizar tu contraseña"
          append-icon="mdi-chevron-right"
          disabled
        />

        <v-divider />

        <v-list-item
          prepend-icon="mdi-bell-outline"
          title="Notificaciones"
          subtitle="Preferencias de notificación"
          append-icon="mdi-chevron-right"
          disabled
        />

        <v-divider />

        <v-list-item
          prepend-icon="mdi-palette-outline"
          title="Apariencia"
          subtitle="Tema claro u oscuro"
          append-icon="mdi-chevron-right"
          disabled
        />

        <v-divider />

        <v-list-item
          prepend-icon="mdi-shield-account-outline"
          title="Privacidad y datos"
          subtitle="Gestionar tus datos personales"
          append-icon="mdi-chevron-right"
          disabled
        />

        <v-divider />

        <!-- Logout is the only active item for now -->
        <v-list-item
          prepend-icon="mdi-logout"
          title="Cerrar sesión"
          subtitle="Salir de tu cuenta"
          class="text-error"
          @click="logout"
        />

      </v-list>
    </v-card>

  </v-container>
</template>