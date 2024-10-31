<!-- src/App.vue -->
<template>
  <div id="app">
    <Navbar /> <!-- The navbar for navigating between pages -->
    <router-view /> <!-- The content of the active route is rendered here -->
    <Notifications/>
    <Toast/>
  </div>
</template>

<script setup>
// Import the Navbar component
import Navbar from './components/General/Navbar.vue';
import Notifications from './components/General/Notifications.vue';
import Toast from './components/General/Toast.vue';
</script>
