<!-- src/components/Login.vue -->
<template>
    <div>
      <h2>Login with Google</h2>
      <button @click="handleLogin">Log in with Google</button>
      <p v-if="error">{{ error }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { loginWithGoogle } from '../composables/auth';
  import { useRouter } from 'vue-router';
  
  const error = ref('');
  const router = useRouter();
  
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push('/'); // Redirect to home after login
    } catch (err) {
      error.value = 'Failed to log in. Please try again.';
    }
  };
  </script>
  
  <style scoped>
  button {
    padding: 10px 20px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  button:hover {
    background-color: #357ae8;
  }
  </style>
  