<!-- src/components/Profile.vue -->
<template>
  <div class="profile-page">
    <h1>Profile Page</h1>

    <div class="profile-info">
      <!-- Add other profile-related content here -->
      <p>Welcome to your profile!</p>
    </div>

    <!-- Place the logout button at the bottom of the page -->
    <div class="logout-section">
      <LogoutButton />
    </div>
  </div>
</template>

<script setup>
import LogoutButton from './LogoutButton.vue'; // Import the LogoutButton component
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.profile-info {
  margin-bottom: 40px;
}

.logout-section {
  margin-top: auto; /* Push the button to the bottom */
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
