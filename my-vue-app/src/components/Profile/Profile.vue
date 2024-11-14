<template>
  <div class="container my-4 p-3 justify-content-between">
    <div class="jumbotron jumbotron-fluid animate__animated animate__fadeInDown">
      <div class="container">
        <div class="d-flex">
          <h1 class="display-4 fw-bold text-primary mb-0">Welcome, {{ userData.name }}✨</h1>
          <div class="ms-auto">
            <HeaderLogoutButton />
          </div>
        </div>
        <p class="lead">View and customize your weekly timetable and event preferences.</p>
      </div>
    </div>
        
    <!-- First Row: Student Card and Timetable Placeholder -->
    <div class="row justify-content-center">
      <div class="col-xs-10 col-sm-8 col-md-5 col-lg-4 col-xl-4 p-3 d-flex enterLeft">
        <div class="w-100 d-flex align-items-center justify-content-center">
          <ProfileCard/>
        </div>
      </div>

      <!-- Timetable Placeholder -->
      <div class="col-xs-10 col-sm-10 col-md-6 col-lg-8 col-xl-8 p-3 enterRight">
        <Timetable/>
      </div>
    </div>

    <!-- Second Row: Additional Bento Box -->
    <div class="row justify-content-center mh-25">
        <Preference/>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import Preference from './Preference.vue';
import ProfileCard from './ProfileCard.vue';
import Timetable from './Timetable.vue';
import LogoutButton from './LogoutButton.vue'; 
import HeaderLogoutButton from './HeaderLogoutButton.vue';
import { getUserDataFromFirestore } from '../../composables/profile';

const userData = ref({});

onMounted(async () => {
  userData.value = await getUserDataFromFirestore();
});
</script>

<style>
@keyframes enterLeft {
  from {
    opacity: 0;
    transform: translate3d(-100%, 0, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes enterRight {
  from {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.enterLeft {
  animation: enterLeft 1.0s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.enterRight {
  animation: enterRight 1.0s cubic-bezier(0.215, 0.61, 0.355, 1);
}
</style>