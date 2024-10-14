<template>
  <div>
    <h2>Login Page</h2>
    <button @click="handleLogin">Login with Google</button>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginWithGoogle } from '../../composables/auth';

const error = ref(null);
const router = useRouter();
const route = useRoute();

const handleLogin = async () => {
  try {
    await loginWithGoogle();
    // After login, redirect to the page the user was trying to access, or default to home
    const redirectTo = route.query.redirect || '/';
    router.push(redirectTo);
  } catch (err) {
    error.value = 'Login failed. Please try again.';
    console.error(err);
  }
};
</script>
