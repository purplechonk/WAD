<!-- src/components/Navbar.vue -->
<template>

  <section class="banner-section">
    <div class="banner-scroll">
      <div class="banner-track">
        <img src="../../assets/images/banner-home.png" alt="Scrolling Banner">
        <img src="../../assets/images/banner-home.png" alt="Scrolling Banner">
      </div>
    </div>
  </section>

  <nav class="navbar navbar-expand-lg sticky-top navbar-dark py-2">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <img src="../../assets/images/sLoop.svg" alt="Logo" class="logo" width="100"/>
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

        <div class="collapse navbar-collapse" id="navbarNavDropdown">
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

<style scoped>
  .banner-section {
    width: 100%;
    height: 30px;
    position: relative;
    z-index: 1;
    background: #000;
  }

.banner-scroll {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.banner-track {
  display: flex;
  width: fit-content;
  height: 100%;
  animation: scroll 60s linear infinite;
  
  img {
    width: 1600px;
    height: 30px;
    object-fit: cover;
    display: block;
  }
}
</style>
  
  <script >
    import "../../assets/js/replaceme.min.js"
    import "../../assets/js/script.js"
</script>
  