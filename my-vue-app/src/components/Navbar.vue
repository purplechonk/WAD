<!-- src/components/Navbar.vue -->
<template>
    <nav>
      <ul class="navbar">
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/explore">Explore</router-link></li>
        <li><router-link to="/my-events">My Events</router-link></li>
        <li><router-link to="/profile">Profile</router-link></li>
      </ul>
    </nav>
  </template>
  
  <script setup>
  // No additional JavaScript is needed for basic routing
  </script>
  
  <style scoped>
  .navbar {
    list-style-type: none;
    display: flex;
    justify-content: space-around;
    padding: 10px;
    background-color: #f8f9fa; /* Light background for the navbar */
    border-bottom: 1px solid #dee2e6; /* Border for separation */
  }
  
  .navbar li {
    display: inline;
  }
  
  .navbar a {
    text-decoration: none;
    color: #007bff; /* Bootstrap primary color */
    font-weight: bold;
  }
  
  .navbar a:hover {
    text-decoration: underline; /* Underline on hover */
  }
  </style>
  