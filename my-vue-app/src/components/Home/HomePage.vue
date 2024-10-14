<!-- src/components/Home.vue -->
<template>
  <div>
    <nav>
      <img src="./assets/logo.png" alt="Logo" class="logo" />
      <div class="navbar">
        <router-link to="/explore">Explore</router-link>
        <router-link to="/my-events">My Events</router-link>
        <router-link to="/profile">Profile</router-link>
      </div>
    </nav>
    
    <section class="hero">
      <Carousel /> <!-- Carousel component -->
      <div class="hero-text">
        <h1>Welcome to the Events App</h1>
        <p>Discover and join exciting events happening near you!</p>
      </div>
    </section>
    
  <section class="event-cards">
    <h2>Featured Events</h2>
    <div class="card-area">
      <!-- Loop over featured events and display each one -->
      <EventCard v-for="event in featuredEvents" :key="event.id" :event="event" @show-details="openEventDetails" />

      <!-- Event detail modal, shown only when showModal is true -->
      <EventDetailModal v-if="showModal" :event="selectedEvent" @close="closeModal" />
    </div>
  </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchFeaturedEvents } from '../../composables/fetchEvents'; // Import function to fetch featured events
import Carousel from './Carousel.vue'; // Import the Carousel component
import EventCard from '../General/EventCard.vue'; // Assuming you have an EventCard component
import EventDetailModal from '../General/EventDetailModal.vue'

const featuredEvents = ref([]); // Reactive variable to store featured events

const loadFeaturedEvents = async () => {
  featuredEvents.value = await fetchFeaturedEvents(); // Fetch only featured events
  console.log('Fetched featured events:', featuredEvents.value); // Check what is fetched
};

// State for modal visibility and the selected event
const showModal = ref(false);
const selectedEvent = ref(null); // Store the event clicked on

// Open modal when an event is clicked
const openEventDetails = (event) => {
  selectedEvent.value = event;
  showModal.value = true;
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  selectedEvent.value = null;
};

onMounted(loadFeaturedEvents); // Call the load function when component is mounted
</script>

<style scoped>
/* Your styles here */
</style>
