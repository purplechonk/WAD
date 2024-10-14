<!-- src/components/LogoutButton.vue -->
<template>
    <button class="logout-button" @click="handleLogout">Logout</button>
  </template>
  
  <script setup>
  import { logoutUser } from '../../composables/auth';
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  
  const router = useRouter();
  const error = ref(null);
  
  const handleLogout = async () => {
    try {
      await logoutUser(); // Log the user out
      router.push('/'); // Redirect to home page after logging out
    } catch (err) {
      console.error('Error during logout:', err);
      error.value = 'Failed to log out. Please try again.';
    }
  };
  </script>
  
  <style scoped>
  .logout-button {
    background-color: #dc3545;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .logout-button:hover {
    background-color: #c82333;
  }
  </style>
  