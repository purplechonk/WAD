<!-- src/components/MyEvents.vue -->
<template>
    <div class="my-events-container">
      <h1>Your Events</h1>
      
      <div class="upcoming-events">
        <h2>Upcoming Events</h2>
        <div v-if="upcomingEvents.length > 0">
          <ul>
            <li v-for="event in upcomingEvents" :key="event.id">
              <h3>{{ event.event_name }}</h3>
              <p>{{ event.start_date_time }}</p>
              <p>{{ event.venue }}</p>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>You have no upcoming events.</p>
        </div>
      </div>
  
      <div class="past-events">
        <h2>Past Events</h2>
        <div v-if="pastEvents.length > 0">
          <ul>
            <li v-for="event in pastEvents" :key="event.id">
              <h3>{{ event.event_name }}</h3>
              <p>{{ event.end_date_time }}</p>
              <p>{{ event.venue }}</p>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>You have no past events.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // Placeholder data for upcoming and past events
  const upcomingEvents = [
    {
      id: 'event_1',
      event_name: 'Java Workshop 2024',
      start_date_time: '13/01/2024 11:30:00',
      venue: 'SCIS 1 (T.B.A)',
    },
    {
      id: 'event_2',
      event_name: 'AI & Machine Learning Seminar',
      start_date_time: '20/01/2024 14:00:00',
      venue: 'Auditorium 3',
    },
    // Add more upcoming events as necessary
  ];
  
  const pastEvents = [
    {
      id: 'event_3',
      event_name: 'Python Programming Bootcamp',
      end_date_time: '15/12/2023',
      venue: 'Lab 101',
    },
    {
      id: 'event_4',
      event_name: 'Web Development Workshop',
      end_date_time: '10/12/2023',
      venue: 'Room 202',
    },
    // Add more past events as necessary
  ];
  </script>
  
  <style scoped>
  .my-events-container {
    padding: 20px;
  }
  
  .upcoming-events,
  .past-events {
    margin-bottom: 20px;
  }
  
  h2 {
    margin-top: 20px;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
  }
  </style>
  