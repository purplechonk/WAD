<template>
  <div class="page-wrapper">
    <div class="container-fluid py-1">
      <div class="bento-grid">
        <!-- Tall box spanning 2 rows -->
        <div class="bento-box span-2-rows image-box">
          <img src="../../assets/images/homepage-1.jpg" alt="">
        </div>

        <!-- Regular box -->
        <div class="bento-box span-2-cols image-box bg-primary">
          <h3>
            Never Miss An Event For
          </h3>
          <h1 class="text-dark fw-bold">
            <span class="" ref="typedElement"></span>
          </h1>
          Stay in the LOOP with sLOOP
        </div>

        <!-- Regular box -->
        <div class="bento-box image-box">
          <img src="../../assets/images/homepage-3.jpg" alt="">
        </div>

        <!-- Regular box -->
        <div class="bento-box image-box">
          <img src="../../assets/images/homepage-4.jpg" alt="">
        </div>

        <!-- Wide box spanning 2 columns -->
        <div class="bento-box span-2-cols bg-secondary">
          <h3>Project Overview</h3>
          <p>Another wide box that spans multiple columns.</p>
        </div>

        <!-- Regular box -->
        <div class="bento-box image-box">
          <h1>Hi</h1>
        </div>

        <!-- Full width box -->
        <div class="bento-box span-3-cols image-box">
          <img src="../../assets/images/homepage-5.jpg" alt="">
        </div>
      </div>
    </div>

    <!-- Rest of your sections... -->
    <section class="event-cards">
      <h2>For You</h2>
      <div class="card-area" v-if="recommendedEvents.length > 0">
        <EventCard v-for="event in recommendedEvents" :key="event.id" :event="event" @show-details="openEventDetails" />
      </div>
      <p v-else>No recommended events available.</p>
    </section>

    <section class="event-cards">
      <h2>Featured Events</h2>
      <div class="card-area">
        <EventCard v-for="event in featuredEvents" :key="event.id" :event="event" @show-details="openEventDetails" />
        <EventDetailModal v-if="showModal" :event="selectedEvent" @close="handleModalClose"
          @login-success="handleLoginSuccess" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase'; // Firebase Auth instance
import { fetchRecommendedEvents, fetchFeaturedEvents } from '../../composables/fetchEvents';
import { animate } from "motion";
import Carousel from './Carousel.vue';
import EventCard from '../General/EventCard.vue';
import EventDetailModal from '../General/EventDetailModal.vue';
import ReplaceMe from '../../utils/replaceMe';
import Typed from 'typed.js';


const recommendedEvents = ref([]);
const featuredEvents = ref([]);
const isAuthenticated = ref(false); // Track user authentication state

const loadRecommendedEvents = async () => {
  recommendedEvents.value = await fetchRecommendedEvents();
  console.log('Recommended Events:', recommendedEvents.value);
};

const loadFeaturedEvents = async () => {
  featuredEvents.value = await fetchFeaturedEvents();
};

const showModal = ref(false);
const selectedEvent = ref(null);

const openEventDetails = (event) => {
  selectedEvent.value = event;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedEvent.value = null;
};

const handleModalClose = () => {
  closeModal();
};

// After login success from modal
const handleLoginSuccess = async () => {
  isAuthenticated.value = true; // User logged in, update state
  await loadRecommendedEvents(); // Re-fetch recommended events after login
  closeModal(); // Close the event detail modal after login
};

const typedElement = ref(null)
let typed = null

onMounted(() => {
  // Initialize ReplaceMe on the "replace-me" element
  const replaceElement = document.querySelector('.replace-me');
  if (replaceElement) {
    new ReplaceMe(replaceElement, {
      animation: 'animated fadeIn',
      speed: 2000,
      separator: ',',
      loopCount: 'infinite',
      autoRun: true,
    });
  }

  loadRecommendedEvents();
  loadFeaturedEvents();

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isAuthenticated.value = true;
      loadRecommendedEvents(); // Re-fetch recommended events on login
    } else {
      isAuthenticated.value = false;
      recommendedEvents.value = []; // Clear recommended events if user logs out
    }
  });

  typed = new Typed(typedElement.value, {
    strings: ['Networking', 'Workshops', 'Entertainment'],
    typeSpeed: 40,
    backSpeed: 50,
    loop: true
  })
});

onBeforeUnmount(() => {
  if (typed) {
    typed.destroy()
  }
})

</script>