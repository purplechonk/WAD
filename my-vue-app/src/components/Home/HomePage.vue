<template>
  <div>
    <section class="hero">
      <header class="header position-relative">
      <img
      src="../../assets/images/sloop-vertical-decoration-left.svg"
      alt=""
      class="vertical-decoration position-absolute d-none d-md-block"
      />
      <div class="container header-content position-relative ">
        <div class="row align-items-center">
          <!-- Text Content -->
          <div class="col-md-6">
            <div class="header-content">
              <h1 class="xl-text">Never miss an event for <span class="special-text text-primary fw-bold replace-me">Networking, Workshops, Entertainment</span></h1>
              <p class="lead">Stay in the loop with sLoop — never miss an SMU event again!</p>
              <a href="#" class="btn btn-primary text-white">Learn More</a>
            </div>
          </div>

          
          <!-- Image Carousel -->
          <div class="col-md-6">
            <div id="carouselHeader" class="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
              <div class="carousel-inner">
                <div class="carousel-item active">
                  <img src="../../assets/images/event_1.jpg" class="d-block w-100 header-img" alt="Header Image 1">
                </div>
                <div class="carousel-item">
                  <img src="../../assets/images/event_2.jpg" class="d-block w-100 header-img" alt="Header Image 2">
                </div>
                <div class="carousel-item">
                  <img src="../../assets/images/event_3.jpg" class="d-block w-100 header-img" alt="Header Image 3">
                </div>
              </div>
              <button class="carousel-control-prev" type="button" data-bs-target="#carouselHeader" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#carouselHeader" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </header>
    </section>

    <section class="event-cards">
      <h2>For You</h2>
      <div class="card-area" v-if="recommendedEvents.length > 0">
        <EventCard
          v-for="event in recommendedEvents"
          :key="event.id"
          :event="event"
          @show-details="openEventDetails"
        />
      </div>
      <p v-else>No recommended events available.</p>
    </section>

    <section class="event-cards">
      <h2>Featured Events</h2>
      <div class="card-area">
        <EventCard
          v-for="event in featuredEvents"
          :key="event.id"
          :event="event"
          @show-details="openEventDetails"
        />
        <EventDetailModal 
          v-if="showModal" 
          :event="selectedEvent" 
          @close="handleModalClose" 
          @login-success="handleLoginSuccess"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase'; // Firebase Auth instance
import { fetchRecommendedEvents, fetchFeaturedEvents } from '../../composables/fetchEvents';
import Carousel from './Carousel.vue';
import EventCard from '../General/EventCard.vue';
import EventDetailModal from '../General/EventDetailModal.vue';
import ReplaceMe from '../../utils/replaceMe';

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
});

</script>

<!-- <style scoped>
/* Navbar styling */
.navbar img {
  height: 40px;
}

/* Event Cards */
.event-cards {
  margin-top: 20px;
}

.card-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 equal-width columns */
  gap: 20px; /* Space between cards */
}
</style> -->
