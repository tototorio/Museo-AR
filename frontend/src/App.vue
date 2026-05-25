
<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useAuthStore } from '@/api/auth'

  const auth = useAuthStore()
  onMounted(() => auth.checkAuth())
</script>

<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>