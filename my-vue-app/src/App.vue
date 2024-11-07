<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <Navbar /> <!-- The navbar for navigating between pages -->
    <main class="flex-grow-1">
      <router-view /> <!-- The content of the active route is rendered here -->
    </main>
    <Notifications />
    <Toast />
    <Footer />
  </div>
</template>

<script setup>
// Import components
import Navbar from './components/General/Navbar.vue';
import Notifications from './components/General/Notifications.vue';
import Toast from './components/General/Toast.vue';
import Footer from './components/General/Footer.vue';
</script>

<style scoped>
/* Optional: additional styles if needed */
</style>
