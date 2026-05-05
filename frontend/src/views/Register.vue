<script setup lang="ts">

let email = '';
let password = '';

async function register(email: string, password: string) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

</script>

<template>
  <body class="registration-page">
    <h1> ¡Bienvenido! </h1>
    <div class="registration-form">
      <input type="text" placeholder="Nombre completo"/>
      <input type="text" placeholder="Correo electrónico" v-model="email"/>
      <input type="password" placeholder="Contraseña" v-model="password"/>
      <input type="text" placeholder="Confirmar contraseña"/>
      <button @click="register(email, password)"> Regístrate </button>
      <small>¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión</router-link></small>
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

.registration-page {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;
  background-color: #f0f0f0;
  height: 100vh;
  margin: 0;
  padding: 0;
}


.registration-form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
}

</style>