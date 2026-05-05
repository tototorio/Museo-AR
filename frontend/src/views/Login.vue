<script setup lang="ts">

let email = '';
let password = '';

async function login(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ← critical, explained below
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
  <body class="login-page">
    <h1> Museo AR </h1>
    <div class="login-form">
      <input type="text" placeholder="Correo electrónico" v-model="email"/>
      <input type="password" placeholder="Contraseña" v-model="password"/>
      <button @click="login(email, password)"> Iniciar sesión </button>
      <small>¿No tienes una cuenta? <router-link to="/register">Regístrate</router-link></small>
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