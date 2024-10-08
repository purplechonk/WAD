<template>
    <div class="event-card">
      <img v-if="event.photo_url" :src="event.photo_url" alt="Event Photo" class="event-image" />
      <h2>{{ event.event_name }}</h2>
      <p><strong>Category:</strong> {{ event.category.join(', ') }}</p>
      <p><strong>CCA:</strong> {{ event.cca }}</p>
      <p><strong>Date:</strong> {{ formatDate(event.start_date_time) }}</p>
      <p><strong>Venue:</strong> {{ event.venue }}</p>
      <p>{{ event.description }}</p>
      <p><strong>Participants:</strong> {{ event.no_of_signups }} / {{ event.max_participants }}</p>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      event: {
        type: Object,
        required: true
      }
    },
    methods: {
      formatDate(dateString) {
        // Format the date string to a more readable format
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');
        return `${month}/${day}/${year} ${timePart}`;
      }
    }
  }
  </script>
  
  <style scoped>
  .event-card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    margin: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s;
  }
  
  .event-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .event-image {
    max-width: 100%;
    border-radius: 8px;
  }
  </style>
  