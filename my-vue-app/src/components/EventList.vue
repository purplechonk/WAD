<template>
  <div class="event-list">
    <EventCard v-for="event in events" :key="event.id" :event="event" />
  </div>
</template>

<script setup>
import EventCard from './EventCard.vue';

defineProps({
  events: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.event-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
</style>
