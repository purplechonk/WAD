<template>
  <div class="event-list">
    <h1>Events</h1>
    <div class="cards-container">
      <EventCard v-for="event in events" :key="event.id" :event="event" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { fetchAllEvents } from '../composables/fetchEvents'; // Import the function
import EventCard from './EventCard.vue'; // Import the EventCard component

export default {
  components: {
    EventCard
  },
  setup() {
    const events = ref([]); // Reactive reference to hold the events

    const loadEvents = async () => {
      events.value = await fetchAllEvents(); // Fetch events on load
    };

    onMounted(loadEvents); // Call loadEvents when the component is mounted

    return {
      events
    };
  }
}
</script>

<style scoped>
.cards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
</style>
