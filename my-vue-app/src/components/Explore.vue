<!-- src/components/Explore.vue -->
<template>
    <div class="explore-container">
      <h1>Explore Events</h1>
      <p>Discover the latest events happening around you!</p>
      
      <!-- Add filters or search bar here in the future -->
      <div class="filter-area">
        <!-- Placeholder for filter components -->
        <p>Filters can be added here!</p>
      </div>
  
      <!-- EventList component to display the list of events -->
      <EventList />
    </div>
  </template>
  
  <script setup>
  import EventList from './EventList.vue'; // Ensure the path is correct
  </script>
  
  <style scoped>
  .explore-container {
    padding: 20px;
  }
  
  .filter-area {
    margin-bottom: 20px;
    /* Additional styles for the filter area */
  }
  </style>
  