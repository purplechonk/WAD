<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar navbar-expand-lg sticky-top navbar-dark">
      <div class="container">
        <a class="navbar-brand" href="#">
          <img src="./assets/logo.png" alt="Logo" class="logo" />
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNavDropdown">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/explore" class="nav-link">Explore</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/my-events" class="nav-link">My Events</router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#details">
                <router-link to="/profile" class="nav-link">Profile</router-link>
              </a>
            </li>
          </ul>
          <span class="nav-item">
            <span class="fa-stack">
              <a href="https://facebook.com" target="_blank">
                <i class="fas fa-circle fa-stack-2x"></i>
                <i class="fa-solid fa-user fa-stack-1x text-white"></i>
              </a>
            </span>
          </span>


          
          
          
        </div>
      </div>
      

    </nav>
  </template>
  
  <script setup>
  // No additional JavaScript is needed for basic routing
  </script>
  
  <!-- <style scoped>
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
  </style> -->
  