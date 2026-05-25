<!-- layouts/AdminLayout.vue -->
<!-- Admin view -->

<script setup>
import { useNavigation } from '@/composables/useNavigation'
import AppBar from '@/components/AppBar.vue'
import BottomNav from '@/components/BottomNav.vue'

const { isMobile } = useNavigation()
</script>

<template>
  <v-app>
    <AppBar v-if="!isMobile" />

    <v-main>
      <router-view />
    </v-main>

    <BottomNav v-if="isMobile" />
  </v-app>
</template>
