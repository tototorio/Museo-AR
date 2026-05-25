<script setup>
import { useGreeting } from '@/composables/userGreeting'
import { useAuthStore } from '@/api/auth' // or however you access the user

const auth = useAuthStore()
const { greeting } = useGreeting(auth.username)
</script>

<template>
  <v-container>
    <h1>{{ greeting }}</h1>
  </v-container>
</template>