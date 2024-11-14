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
        aria-label="Toggle navigation"
        @click="toggleNavbar">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div 
        class="collapse navbar-collapse bg-light" 
        id="navbarNavDropdown"
        :class="{ 'show': isNavbarExpanded }">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/explore" class="nav-link" @click="closeNavbar">Explore</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/my-events" class="nav-link" @click="closeNavbar">My Events</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/analytics" class="nav-link" @click="closeNavbar">Analytics</router-link>
          </li>
        </ul>
        <span class="nav-item">
          <span class="fa-stack">
            <router-link to="/profile" @click="closeNavbar">
              <i class="fas fa-circle fa-stack-2x"></i>
              <i class="fa-solid fa-user fa-stack-1x text-white"></i>
            </router-link>
          </span>
        </span>
      </div>
    </div>
  </nav>
</template>
  
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { navbarEventBus } from '../../utils/eventBus';

const route = useRoute();
const isNavbarExpanded = ref(false);

// Close navbar function
const closeNavbar = () => {
  isNavbarExpanded.value = false;
  navbarEventBus.setExpanded(false);
};

// Toggle function
const toggleNavbar = () => {
  isNavbarExpanded.value = !isNavbarExpanded.value;
  navbarEventBus.setExpanded(isNavbarExpanded.value);
};

// Watch for route changes
watch(() => route.path, () => {
  closeNavbar();
});

onMounted(() => {
  const handleClickOutside = (event) => {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const toggleButton = document.querySelector('.navbar-toggler');
    if (isNavbarExpanded.value && 
        !navbarCollapse.contains(event.target) && 
        !toggleButton.contains(event.target)) {
      closeNavbar();
    }
  };

  document.addEventListener('click', handleClickOutside);

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
});
</script>
  
<style scoped>
.navbar-collapse {
  padding-left: 2rem;
}

@media (max-width: 991px) {
  .navbar-collapse {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    padding: 1rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
}
</style>