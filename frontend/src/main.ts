import '@mdi/font/css/materialdesignicons.css'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import App from './App.vue'
import { useAuthStore } from '@/api/auth'
import router from './router/index.js'
import { createPinia } from 'pinia'

const app = createApp(App)

const vuetify = createVuetify({ 
    components, 
    directives, 
    theme: {
        defaultTheme: 'dark',
        themes: {
            dark: {
                dark: true,
                colors: {
                primary:    '#3949AB',  // indigo
                secondary:  '#7986CB',  // lighter indigo
                accent:     '#80DEEA',  // cyan pop
                background: '#121212',
                surface:    '#1E1E2E',
                error:      '#EF5350',
                success:    '#66BB6A',
                warning:    '#FFA726',
                info:       '#42A5F5',
                }
            },
            light: {
                dark: false,
                colors: {
                primary:    '#3949AB',
                secondary:  '#5C6BC0',
                accent:     '#00ACC1',
                background: '#F0F2FF',
                surface:    '#FFFFFF',
                error:      '#C62828',
                success:    '#2E7D32',
                warning:    '#EF6C00',
                info:       '#1565C0',
                }
            }
        } 
    },
    icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
            mdi,
            },
    },

})
const pinia = createPinia()

app.use(vuetify).use(router).use(pinia)

const auth = useAuthStore()
await auth.checkAuth()
app.mount('#app')
