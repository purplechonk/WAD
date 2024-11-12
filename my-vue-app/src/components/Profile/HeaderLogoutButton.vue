<!-- src/components/HeaderLogoutButton.vue -->
<template>
    <button 
      class="header-logout-btn" 
      @click="handleLogout" 
      title="Logout"
      aria-label="Logout"
    >
    <span class="logout-text me-2">Logout</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="logout-icon"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  </template>
  
  <script setup>
  import { logoutUser } from '../../composables/auth';
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  
  const router = useRouter();
  const error = ref(null);
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/');
    } catch (err) {
      console.error('Error during logout:', err);
      error.value = 'Failed to log out. Please try again.';
    }
  };
  </script>
  
  <style scoped>
  .header-logout-btn {
    background: none;
    border: none;
    padding: 8px 12px; /* Adjust padding for a rectangular shape */
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    border-radius: 8px; /* Add rounded corners */
    transition: all 0.2s ease;
  }
  
  .header-logout-btn:hover {
    background-color: rgba(220, 53, 69, 0.1); /* Red shading */
    color: #dc3545; /* Change icon and text color to red */
  }
  
  .logout-icon {
    width: 20px;
    height: 20px;
  }
  
  .logout-text {
    font-size: 16px; /* Adjust text size to align with the icon */
    font-weight: 500;
  }
  </style>
  