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
        <EventCard v-for="event in featuredEvents" :key="event.id" :event="event" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchFeaturedEvents } from '../composables/fetchEvents'; // Import function to fetch featured events
import Carousel from './Carousel.vue'; // Import the Carousel component
import EventCard from './EventCard.vue'; // Assuming you have an EventCard component

const featuredEvents = ref([]); // Reactive variable to store featured events

const loadFeaturedEvents = async () => {
  featuredEvents.value = await fetchFeaturedEvents(); // Fetch only featured events
  console.log('Fetched featured events:', featuredEvents.value); // Check what is fetched
};

onMounted(loadFeaturedEvents); // Call the load function when component is mounted
</script>

<style scoped>
/* Your styles here */
</style>
