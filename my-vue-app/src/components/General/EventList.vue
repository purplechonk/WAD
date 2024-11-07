<template>
  <div class="event-list">
    <EventCard v-for="event in events" :key="event.id" :event="event" @show-details="openEventDetails" />
    
    <!-- Modal for showing event details -->
    <EventDetailModal v-if="showModal" :event="selectedEvent" :showModal="showModal" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import EventCard from './EventCard.vue';
import EventDetailModal from './EventDetailModal.vue'; // Import the EventDetailModal component

const props = defineProps({
  events: {
    type: Array,
    required: true,
  },
});

const selectedEvent = ref(null); // Store the currently selected event
const showModal = ref(false); // Control modal visibility

// Function to open the event details modal
const openEventDetails = (event) => {
  selectedEvent.value = event;
  showModal.value = true;
};

// Function to close the event details modal
const closeModal = () => {
  showModal.value = false;
  selectedEvent.value = null;
};
</script>

<style scoped>
.event-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
</style>
