<template>
  <div class="event-card" @click="openEventDetails">
    <h3>{{ event.event_name }}</h3>
    <p><strong>Categories:</strong> {{ event.category.join(', ') }}</p>
    <p><strong>Start:</strong> {{ event.start_date_time }}</p>
    <p><strong>End:</strong> {{ event.end_date_time }}</p>
    <p><strong>Venue:</strong> {{ event.venue }}</p>
    <p><strong>Participants:</strong> {{ event.no_of_signups }} / {{ event.max_participants }}</p>

    <!-- Progress Bar -->
    <div class="progress">
      <div class="progress-bar" role="progressbar" :style="{width: progressPercentage + '%'}" :aria-valuenow="progressPercentage" aria-valuemin="0" aria-valuemax="100">
        {{ progressPercentage }}% filled
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});

const progressPercentage = Math.floor((props.event.no_of_signups / props.event.max_participants) * 100);

const emit = defineEmits(['show-details']);

const openEventDetails = () => {
  emit('show-details', props.event); // Emit the event to show the modal with event details
};
</script>

<style scoped>
.event-card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.event-card:hover {
  transform: scale(1.02);
}

.progress {
  height: 20px;
  background-color: #f0f0f0;
}

.progress-bar {
  background-color: #007bff;
  transition: width 0.3s ease-in-out;
}
</style>
