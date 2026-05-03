<script setup lang="ts">
/*
import { ref, onMounted } from 'vue'

const scenes  = ref([])
const loading = ref(true)
const error   = ref(null as string | null)

// onMounted = runs once when the component appears in the DOM
// API setup

onMounted(async () => {
  try {
    const res  = await fetch('/api/scenes')  // proxied to Hono
    const data = await res.json()
    scenes.value = data.scenes
  } catch (e) {
    error.value = 'Failed to load scenes'
  } finally {
    loading.value = false
  }
})
  */

</script>

<template>
  <body class="login-page">
    <h1> Museo AR </h1>
    <div class="login-form">
      <input type="text" placeholder="Correo electrónico"/>
      <input type="password" placeholder="Contraseña"/>
      <button> Iniciar sesión </button>
      <small>¿No tienes una cuenta? <a href="#">Regístrate</a></small>
    </div>
    <h6>2026 - Museo AR. Todos los derechos reservados. </h6>
  </body>

</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.login-page {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;
  background-color: #f0f0f0;
  height: 100vh;
  margin: 0;
  padding: 0;
}


.login-form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
}

</style>