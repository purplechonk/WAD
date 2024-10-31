<template>
  <div>

    <section class="hero">
      <div class="hero-text">
        <h1>Welcome to the Events App</h1>
        <p>Discover and join exciting events happening near you!</p>
      </div>
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
import { fetchRecommendedEvents } from '../../composables/fetchEvents';
import EventCard from '../General/EventCard.vue';
import EventDetailModal from '../General/EventDetailModal.vue';

const recommendedEvents = ref([]);
const featuredEvents = ref([]);
const isAuthenticated = ref(false); // Track user authentication state

const loadRecommendedEvents = async () => {
  recommendedEvents.value = await fetchRecommendedEvents();
  console.log('Recommended Events:', recommendedEvents.value);
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
  loadRecommendedEvents();

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
