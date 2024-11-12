<template>
  <div class="event-list mb-1">
    <div class="card-container">
      <div class="card__container card-base">
        <EventCard v-for="event in events" :key="event.id" :event="event" @show-details="openEventDetails"/>
      </div>
    </div>
    
    <!-- Modal for showing event details -->
    <EventDetailModal v-if="showModal" :event="selectedEvent" :showModal="showModal" @close="closeModal" />
    <p>Congrats! You're completely in the Loop!</p>
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

p {
  text-align: center;
  font-size: 1.2rem;
  color: #6c757d;
  margin-top: 3rem;
  font-weight: 600;
  animation: fadeInUp 0.6s ease;
  opacity: 0.8;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 0.8;
    transform: translateY(0);
  }
}

p::before {
  content: "";
  display: block;
  width: 50px;
  height: 2px;
  background-color: #8c52ff;
  margin: 0 auto 1rem;
  animation: expandWidth 0.6s ease;
}

@keyframes expandWidth {
  0% {
    width: 0;
  }
  100% {
    width: 50px;
  }
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