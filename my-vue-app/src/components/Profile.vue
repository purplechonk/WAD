<!-- src/components/Profile.vue -->
<template>
  <div class="profile-page" v-if="userData">
    <h1>Profile Page</h1>

    <div class="profile-info">
      <p><strong>Name:</strong> {{ userData.name }}</p>
      <p><strong>Email:</strong> {{ userData.email }}</p>
      <p><strong>Gender:</strong> {{ userData.gender || 'Not Set' }}</p>
      <p><strong>Faculty:</strong> {{ userData.faculty || 'Not Set' }}</p>
      <p><strong>Matriculation Year:</strong> {{ userData.matriculation_year }}</p>
      <p><strong>Signed Up Events:</strong> {{ userData.signed_up_events.length }}</p>
      <p><strong>Number of Events Attended:</strong> {{ userData.num_events_attended }}</p>
      <p><strong>Category Interests:</strong> 
        <span v-if="userData.category_interests.length > 0">
          {{ userData.category_interests.join(', ') }}
        </span>
        <span v-else>Not Set</span>
      </p>
    </div>

    <!-- Place the logout button at the bottom of the page -->
    <div class="logout-section">
      <LogoutButton />
    </div>
  </div>

  <div v-else>
    <p>Loading profile data...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserDataFromFirestore } from '../composables/auth';
import LogoutButton from './LogoutButton.vue'; // Import the LogoutButton component

const userData = ref(null);

onMounted(async () => {
  userData.value = await getUserDataFromFirestore(); // Fetch the user data from Firestore
});
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
  text-align: left;
}

.logout-section {
  margin-top: auto; /* Push the button to the bottom */
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
