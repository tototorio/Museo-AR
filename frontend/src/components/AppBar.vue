<!-- components/layout/AppBar.vue -->
<!-- for PC view -->
<script setup>
import { ref } from 'vue'
import { useNavigation } from '@/composables/useNavigation'

const { navItems } = useNavigation()
const currentTab = ref(null)
</script>

<template>
  <v-app-bar flat border="b">
    <v-app-bar-title>Museo AR</v-app-bar-title>

    <v-tabs v-model="currentTab" align-tabs="end">
      <v-tab
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
      >
        {{ item.title }}
      </v-tab>
    </v-tabs>
  </v-app-bar>
</template>

