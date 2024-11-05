<template>
  <div class="scroll-container">
    <!-- Combined Filter Section -->
    <div class="multisearchbar z-4" :class="{ scrolled: isScrolled }">
      <!-- Expanded Filter -->
      <div 
        id="filter-expanded"  
        class="filter-expanded filter-transition" 
        :class="{ 'filter-hidden': isScrolled }"
        :style="expandedFilterStyle"
        @click="handleExpandedClick"
      >
        <div class="sbpart0" @click="handleSbpart0Click">
          <p class="categories">Categories</p>
          <p class="category-display">{{ categoryDisplayText }}</p>
          
          <!-- Categories Dropdown -->
          <div id="categories-dropdown" class="categories-dropdown" :class="{ active: isCategoryDropdownOpen }">
            <div class="dropdown-content">
              <!-- Add Clear Filters button -->
              <div class="clear-filters-container" v-if="selectedCategories.size > 0">
                <button class="clear-filters-btn" @click="clearFilters">
                  Clear Filters 
                </button>
              </div>
              <div class="category-options">
                <button 
                  class="category-option" 
                  :class="{ selected: selectedCategories.size === 0 }"
                  data-value="all"
                  @click="handleAllCategoriesClick"
                >
                  All Categories
                </button>

                <!-- Category section label -->
                <div class="category-section-label">CHOOSE CATEGORIES</div>
                
                <button
                  v-for="category in availableCategories"
                  :key="category"
                  class="category-option afterall"
                  :class="{ selected: selectedCategories.has(category) }"
                  :data-value="category"
                  @click="handleCategoryClick(category, $event)"
                >
                  {{ category }}
                  <span 
                    v-if="selectedCategories.has(category)" 
                    class="remove-tag"
                    @click.stop="handleRemoveCategory(category, $event)"
                  >×</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="sbdivider1"></div>

        <div class="sbpart1" @click="handleSbpart1Click">
          <p class="events">Events</p>
          <div class="search-input-container">
            <input
              id="search-events"
              type="text"
              v-model="searchQuery"
              placeholder="Search event"
              :class="{ typing: isTyping }"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
              @keypress="handleKeyPress"
              @input="handleSearchInput"
              aria-label="Search events"
            >
            <!-- Add clear search button -->
            <button 
              v-if="searchQuery.trim()"
              class="clear-search-btn"
              @click="clearSearch"
            >
              ×
            </button>
          </div>
          <!-- <div class="search-button1" @click="handleSearchButton1Click">
            <svg class="searchicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill:none; height: 16px; width: 16px; stroke:white; stroke-width: 4; overflow: visible;">
              <path fill="none" d="M13 24a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm8-3 9 9"></path>
            </svg>
          </div> -->
        </div>
      </div>

      <!-- Collapsed Filter -->
      <div 
        id="filter-collapsed"
        class="filter-collapsed filter-transition"
        :class="{ 'filter-visible': isScrolled }"
        :style="collapsedFilterStyle" 
        @click="showExpanded"
      >
        <div class="sbpart3">
          <button class="btn category-button">{{ collapsedCategoryText }}</button>
        </div>
        <div class="sbdivider2"></div>
        <div class="sbpart4">
          <button class="btn event-button">{{ collapsedEventText }}</button>
        </div>
        <!-- <div class="search-button2" @click.stop="handleSearchButton1Click">
          <svg class="searchicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill:none; height: 10px; width: 10px; stroke:white; stroke-width: 4; overflow: visible;"><path fill="none" d="M13 24a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm8-3 9 9"></path></svg>
        </div> -->
      </div>
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
    <EventList
      v-if="!loading && !error && filteredEvents.length > 0"
      :events="filteredEvents"
      @show-details="openEventDetails"
    />

    <!-- No Events Found Message -->
    <div v-if="!loading && !error && filteredEvents.length === 0" class="no-events">
      No events found for the selected categories.
    </div>
  </div>

  <!-- <div class="justaddmargin pb-6"></div> -->
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import EventList from '../General/EventList.vue';
import { fetchAllEvents } from '../../composables/fetchEvents';

const events = ref([]); // All events
const loading = ref(false); // Loading state
const error = ref(null); // Error state
const selectedCategories = ref([]); // Selected categories for filtering
const availableCategories = ref([]); // All available categories from events
const searchQuery = ref(''); // Reactive variable for search input

const showEventModal = ref(false); // Control the visibility of EventDetailModal
const selectedEvent = ref(null); // The event selected to display in the modal

/**
 * Fetch all events and extract available categories.
 */
const fetchEvents = async () => {
  loading.value = true;
  try {
    const fetchedEvents = await fetchAllEvents();
    events.value = fetchedEvents;

    // Extract unique categories
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
 * Filter events based on selected categories and search query.
 */
const filteredEvents = computed(() => {
  // Start with all events
  let eventsToFilter = events.value;

  // Filter by selected categories
  if (selectedCategories.value.length > 0) {
    eventsToFilter = eventsToFilter.filter(event =>
      event.category.some(cat => selectedCategories.value.includes(cat))
    );
  }

  // Filter by search query
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase().trim();
    eventsToFilter = eventsToFilter.filter(event => {
      // Convert the event object to a string
      const eventString = JSON.stringify(event).toLowerCase();
      return eventString.includes(query);
    });
  }

  return eventsToFilter;
});

/**
 * Open Event Details Modal
 */
const openEventDetails = (event) => {
  selectedEvent.value = event;
  showEventModal.value = true;
};

/**
 * Close Event Details Modal
 */
const closeEventDetails = () => {
  showEventModal.value = false;
  selectedEvent.value = null;
};

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
  scroll-snap-type: y mandatory;
  height: 100vh;
  overflow-y: scroll;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  max-height: 100vh;

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

.search-area {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading,
.error,
.no-events {
  text-align: center;
  /* margin-top: 30px; */
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