<template>
  <div class="event-card">
    <h3>{{ event.event_name }}</h3>
    <p><strong>Categories:</strong> {{ event.category.join(', ') }}</p>
    <p><strong>Start:</strong> {{ event.start_date_time }}</p>
    <p><strong>End:</strong> {{ event.end_date_time }}</p>
    <p><strong>Venue:</strong> {{ event.venue }}</p>
    <p><strong>Participants:</strong> {{ event.no_of_signups }} / {{ event.max_participants }}</p>
  </div>
</template>

<script setup>
defineProps({
  event: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.event-card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
