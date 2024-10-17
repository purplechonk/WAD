<!-- src/App.vue -->
<template>
  <div id="app">
    <Navbar /> <!-- The navbar for navigating between pages -->
    <router-view /> <!-- The content of the active route is rendered here -->
  </div>
</template>

<script setup>
// Import the Navbar component
import Navbar from './components/General/Navbar.vue';
</script>
