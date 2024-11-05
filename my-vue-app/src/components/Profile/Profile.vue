<template>
  <div class="scroll-container pb-6">
  <div class="container mt-4 p-3 justify-content-between">
    <div class="jumbotron jumbotron-fluid">
      <div class="container">
        <h1 class="display-4">Welcome, {{ userData.name }}✨</h1>
        <p class="lead">View and customize your weekly timetable and event preferences.</p>
      </div>
    </div>
    
    <!-- First Row: Student Card and Timetable Placeholder -->
    <div class="row justify-content-center">
      <div class="col-xs-10 col-sm-8 col-md-5 col-lg-4 col-xl-4 p-3 d-flex">
        <div class="w-100 d-flex align-items-center justify-content-center">
          <ProfileCard />
        </div>
      </div>

      <!-- Timetable Placeholder -->
      <div class="col-xs-10 col-sm-10 col-md-6 col-lg-8 col-xl-8 p-3">
        <Timetable/>
      </div>
    </div>

    <!-- Second Row: Additional Bento Box -->
    <div class="row justify-content-center mh-25">
        <Preference/>
    </div>

    <!-- Logout Button Row -->
    <div class="row mt-4">
      <div class="col-12 d-flex justify-content-center">
        <div class="p-2">
          <LogoutButton/>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import Preference from './Preference.vue';
import ProfileCard from './ProfileCard.vue';
import Timetable from './Timetable.vue';
import LogoutButton from './LogoutButton.vue'; 
import { getUserDataFromFirestore } from '../../composables/profile';

const userData = ref({});

onMounted(async () => {
  userData.value = await getUserDataFromFirestore();
});
</script>