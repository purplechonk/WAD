<!-- src/App.vue -->
<template>
  <div id="app">
    <Navbar /> <!-- The navbar for navigating between pages -->
    <router-view /> <!-- The content of the active route is rendered here -->
  </div>
</template>

<script setup>
// Import the Navbar component
import Navbar from './components/Navbar.vue';
</script>

<style scoped>
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
