<template>
  <div class="explore-container">
    <h1>Explore Events</h1>
    <p>Discover the latest events happening around you!</p>

    <!-- Category Filter Section -->
    <div class="filter-area">
      <h3>Filter by Categories</h3>
      <div class="button-list">
        <!-- 'All' Filter -->
        <button
          @click="selectAll"
          :class="{ selected: selectedCategories.length === 0 }"
          aria-pressed="selectedCategories.length === 0"
          aria-label="Filter by All"
        >
          All
        </button>

        <!-- Other Category Filters -->
        <button
          v-for="category in availableCategories"
          :key="category"
          @click="toggleCategory(category)"
          :class="{ selected: selectedCategories.includes(category) }"
          :aria-pressed="selectedCategories.includes(category)"
          aria-label="Filter by {{ category }}"
        >
          {{ category }}
        </button>
      </div>

      <!-- Clear Filters Button -->
      <button
        v-if="selectedCategories.length > 0"
        class="clear-filters"
        @click="clearFilters"
      >
        Clear Filters
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading">
      Loading events...
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Display Filtered Events -->
    <EventList v-if="!loading && !error && filteredEvents.length > 0" :events="filteredEvents" />

    <!-- No Events Found Message -->
    <div v-if="!loading && !error && filteredEvents.length === 0" class="no-events">
      No events found for the selected categories.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import EventList from '../General/EventList.vue';
import { fetchAllEvents } from '../../composables/fetchEvents';

const events = ref([]); // All events
const loading = ref(false); // Loading state
const error = ref(null); // Error state
const selectedCategories = ref([]); // Selected categories for filtering
const availableCategories = ref([]); // All available categories from events

/**
 * Fetch all events and extract available categories.
 */
const fetchEvents = async () => {
  loading.value = true;
  try {
    const fetchedEvents = await fetchAllEvents();
    events.value = fetchedEvents;

    // Extract unique categories from events
    const categoriesSet = new Set();
    fetchedEvents.forEach(event => {
      event.category.forEach(cat => categoriesSet.add(cat));
    });
    availableCategories.value = Array.from(categoriesSet).sort();
  } catch (err) {
    console.error('Error fetching events:', err);
    error.value = 'Failed to fetch events. Please try again later.';
  } finally {
    loading.value = false;
  }
};

/**
 * Toggle category selection for filtering.
 */
const toggleCategory = (category) => {
  const index = selectedCategories.value.indexOf(category);
  if (index === -1) {
    selectedCategories.value.push(category);
  } else {
    selectedCategories.value.splice(index, 1);
  }
};

/**
 * Clear all selected categories (i.e., show all events).
 */
const clearFilters = () => {
  selectedCategories.value = [];
};

/**
 * Select 'All' categories (show all events).
 */
const selectAll = () => {
  selectedCategories.value = [];
};

/**
 * Filter events based on selected categories.
 */
const filteredEvents = computed(() => {
  if (selectedCategories.value.length === 0) {
    return events.value; // If no category selected, show all events
  }

  return events.value.filter(event =>
    event.category.some(cat => selectedCategories.value.includes(cat))
  );
});

/**
 * Fetch events on component mount.
 */
onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.explore-container {
  padding: 20px;
}

.filter-area {
  margin-bottom: 20px;
}

.button-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.button-list button {
  padding: 8px 16px;
  border: none;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.button-list button.selected {
  background-color: #007bff;
  color: #fff;
}

.button-list button:hover {
  background-color: #e0e0e0;
}

.clear-filters {
  padding: 8px 16px;
  border: none;
  background-color: #dc3545;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.clear-filters:hover {
  background-color: #c82333;
}

.loading,
.error,
.no-events {
  text-align: center;
  margin-top: 20px;
  font-size: 1.2em;
}

.loading {
  color: #007bff;
}

.error {
  color: #dc3545;
}

.no-events {
  color: #6c757d;
}
</style>
