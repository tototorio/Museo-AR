// composables/useNavigation.js
// Both AppBar and BottomNav components read from here to build the admin view
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

export function useNavigation() {
  const { smAndDown } = useDisplay()

  const navItems = [
    { title: 'Home',     icon: 'mdi-view-dashboard',         to: '/admin' },
    { title: 'Escenas',  icon: 'mdi-account-group',          to: '/admin/scenes' },
    { title: 'Recursos', icon: 'mdi-cog',                    to: '/admin/assets' },
    { title: 'Cuenta',   icon: 'mdi-account-circle-outline', to: '/admin/account' },
  ]

  const isMobile = computed(() => smAndDown.value)

  return { navItems, isMobile }
}