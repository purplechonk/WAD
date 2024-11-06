<!-- src/components/Navbar.vue -->
<template>

  <nav class="navbar navbar-expand-lg sticky-top navbar-light bg-light py-2">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <img src="../../assets/images/sLoop-dark.svg" alt="Logo" class="logo" width="100"/>
        </router-link>
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

        <div class="collapse navbar-collapse z-7" id="navbarNavDropdown">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/explore" class="nav-link">Explore</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/my-events" class="nav-link">My Events</router-link>
            </li>
            <li>
              <router-link to="/analytics" class="nav-link">Analytics</router-link>
            </li>

          </ul>
          <span class="nav-item">
            <span class="fa-stack">
              <router-link to="/profile">
                <i class="fas fa-circle fa-stack-2x"></i>
                <i class="fa-solid fa-user fa-stack-1x text-white"></i>
              </router-link>
            </span>
          </span>
        </div>
      </div>
    </nav>
  </template>
  
  <script >
    import "../../assets/js/replaceme.min.js"
    import "../../assets/js/script.js"
</script>
  