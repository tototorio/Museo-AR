<!-- components/layout/BottomNav.vue -->
 <!-- for mobile view -->
<script setup>
import { useNavigation } from '@/composables/useNavigation'

const { navItems } = useNavigation()
</script>

<template>
  <v-bottom-navigation grow>
    <v-btn
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      :value="item.to"
    >
      <v-icon>{{ item.icon }}</v-icon>
      <span>{{ item.title }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

