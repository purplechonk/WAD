<template>
  <div class="event-list">
    <div class="card-container">
      <div class="card__container card-base">
        <EventCard v-for="event in events" :key="event.id" :event="event" @show-details="openEventDetails"/>
      </div>
    </div>
    
    <!-- Modal for showing event details -->
    <EventDetailModal v-if="showModal" :event="selectedEvent" :showModal="showModal" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import EventCard from './EventCard.vue';
import EventDetailModal from './EventDetailModal.vue';

const props = defineProps({
  events: {
    type: Array,
    required: true,
  },
});

const selectedEvent = ref(null);
const showModal = ref(false);

const openEventDetails = (event) => {
  selectedEvent.value = event;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedEvent.value = null;
};
</script>

<style scoped>
.event-list {
  margin-top: 0;
  width: 100%;
}

.card-base {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.card-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.card__container {
  display: grid;
  gap: 3rem;
  justify-content: center;
  width: 100%;
  max-width: 1400px; /* Increased to accommodate wider cards */
}

/* Mobile devices */
@media screen and (max-width: 520px) {
  .card__container {
    grid-template-columns: 1fr; /* Full width on mobile */
    gap: 2rem;
  }
  
  .card-container {
    padding: 0 1rem;
  }
}

/* Tablet - Single column */
@media screen and (min-width: 521px) and (max-width: 999px) {
  .card__container {
    grid-template-columns: 420px; /* Single column of cards */
    gap: 3rem;
  }
}

/* Tablet - Two columns */
@media screen and (min-width: 1000px) and (max-width: 1349px) {
  .card__container {
    grid-template-columns: repeat(2, 420px); /* Two columns of cards */
    gap: 3rem 5rem;
  }
}

/* Desktop - Three columns */
@media screen and (min-width: 1350px) {
  .card__container {
    grid-template-columns: repeat(3, 400px); /* Three columns of cards */
    gap: 4rem 2rem;
  }
}

/* Large Desktop */
@media screen and (min-width: 1400px) {
  .card__container {
    gap: 4rem 4rem; /* Slightly increased gap for larger screens */
  }
}
</style>