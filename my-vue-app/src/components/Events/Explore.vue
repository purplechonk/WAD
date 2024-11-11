<template>
  <div>
    <!-- Combined Filter Section -->
    <div class="multisearchbar" :class="{ scrolled: isScrolled }">
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

    <!-- Event Detail Modal -->
    <EventDetailModal
      v-if="showEventModal"
      :event="selectedEvent"
      @close="closeEventDetails"
    />
  </div>
  <!-- <div class="justaddmargin pb-6"></div> -->
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import EventList from '../General/EventList.vue';
import EventDetailModal from '../General/EventDetailModal.vue';
import { fetchLiveEvents } from '../../composables/fetchEvents';
import { navbarEventBus } from '../../utils/eventBus';

// State variables
const events = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedCategories = ref(new Set());
const availableCategories = ref([]);
const isScrolled = ref(false);
const isCategoryDropdownOpen = ref(false);
const searchQuery = ref('');
const isTyping = ref(false);
const showEventModal = ref(false);
const selectedEvent = ref(null);
const lastScrollTop = ref(0);
const isScrollingUp = ref(true);
const isNavbarExpanded = ref(false);
const lastScrollState = ref(false); // Track scroll state before navbar expansion

// Visibility states for filters
const expandedFilterStyle = computed(() => {
  if (window.innerWidth < 992 && isNavbarExpanded.value) {
    return {
      transform: 'translate(-50%, -100%)', // Hide it up
      opacity: '0',
      pointerEvents: 'none',
      position: 'fixed',
      zIndex: '1998',
      visibility: 'hidden'
    };
  }
  
  return {
    transform: isScrolled.value ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
    opacity: isScrolled.value ? '0' : '1',
    pointerEvents: isScrolled.value ? 'none' : 'auto',
    position: 'fixed',
    zIndex: '1999',
    visibility: 'visible'
  };
});

const collapsedFilterStyle = computed(() => {
  if (window.innerWidth < 992 && isNavbarExpanded.value) {
    return {
      transform: 'translate(-50%, -100%)', // Hide it up
      opacity: '0',
      pointerEvents: 'none',
      position: 'fixed',
      zIndex: '1998',
      visibility: 'hidden'
    };
  }

  else if (window.innerWidth < 992 && !isNavbarExpanded) {
    return {
      transform: 'translate(-50%, -100%)', // Hide it up
      opacity: '0',
      pointerEvents: 'none',
      position: 'fixed',
      zIndex: '1999',
      visibility: 'hidden'
    };
  }

  else {
    return {
      transform: isScrolled.value ? 'translate(-50%, 0)' : 'translate(-50%, 100%)',
      opacity: isScrolled.value ? '1' : '0',
      pointerEvents: isScrolled.value ? 'auto' : 'none',
      position: 'fixed',
      zIndex: '2000',
      visibility: 'visible'
    };
  }
  
});

const categoryDisplayText = computed(() => {
  if (selectedCategories.value.size === 0) return 'All categories';
  return `${selectedCategories.value.size} ${
    selectedCategories.value.size === 1 ? 'category' : 'categories'
  }`;
});

const collapsedCategoryText = computed(() => {
  if (selectedCategories.value.size === 0) return 'All Categories';
  return `${selectedCategories.value.size} ${
    selectedCategories.value.size === 1 ? 'Category' : 'Categories'
  }`;
});

const collapsedEventText = computed(() => {
  return searchQuery.value.trim() || 'All Events';
});

// Filter events based on categories and search query
const filteredEvents = computed(() => {
  // Start with all events
  let eventsToFilter = events.value;

  // Category filtering
  const hasSelectedCategories = selectedCategories.value.size > 0;
  if (hasSelectedCategories) {
    eventsToFilter = eventsToFilter.filter(event => 
      event.category.some(cat => selectedCategories.value.has(cat))
    );
  }

  // Search query filtering - both array and object methods
  const query = searchQuery.value.toLowerCase().trim();
  if (query !== '') {
    eventsToFilter = eventsToFilter.filter(event => {
      // Convert the event object to a string for full text search
      const eventString = JSON.stringify(event).toLowerCase();
      
      // Check if search query matches any part of the event
      const matchesSearch = eventString.includes(query);
      
      // If there are selected categories, ensure the event matches both conditions
      if (hasSelectedCategories) {
        return matchesSearch && event.category.some(cat => 
          selectedCategories.value.has(cat)
        );
      }
      
      // If no categories selected, just return search matches
      return matchesSearch;
    });
  }

  return eventsToFilter;
});

const handleSearchInput = () => {
  isTyping.value = true;
  // Reset typing animation after delay
  setTimeout(() => {
    isTyping.value = false;
  }, 1000);
};

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return selectedCategories.value.size > 0 || 
         searchQuery.value.trim().length > 0;
});

// Methods
const fetchEvents = async () => {
  loading.value = true;
  try {
    const fetchedEvents = await fetchLiveEvents();
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

// Event handlers
const handleExpandedClick = (event) => {
  event.stopPropagation();
};

const handleSbpart0Click = (event) => {
  if (!document.getElementById('categories-dropdown').contains(event.target)) {
    event.stopPropagation();
    isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
  }
};

const handleSbpart1Click = () => {
  isCategoryDropdownOpen.value = false;
  focusSearchInput();
};

const handleAllCategoriesClick = (event) => {
  event.stopPropagation();
  selectedCategories.value.clear();
  isCategoryDropdownOpen.value = false;
};

const handleCategoryClick = (category, event) => {
  event.stopPropagation();
  const totalOptions = availableCategories.value.length;

  if (selectedCategories.value.has(category)) {
    selectedCategories.value.delete(category);
  } else {
    selectedCategories.value.add(category);
  }

  // Check if all categories are selected
  if (selectedCategories.value.size === totalOptions) {
    selectedCategories.value.clear();
  }
};

const handleRemoveCategory = (category, event) => {
  event.stopPropagation();
  selectedCategories.value.delete(category);
};

const handleSearchButton1Click = (event) => {
  event?.stopPropagation();
  isCategoryDropdownOpen.value = false;
  
  if (searchQuery.value.trim() !== '') {
    isScrolled.value = true;
    if (window.scrollY === 0) {
      scrollPageDown();
    }
  }
};

const showExpanded = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  isScrolled.value = false;
  isCategoryDropdownOpen.value = false;
};

const focusSearchInput = () => {
  const searchInput = document.getElementById('search-events');
  if (searchInput) {
    searchInput.focus();
    isTyping.value = true;
    setTimeout(() => {
      isTyping.value = false;
    }, 1000);
  }
};

const handleInputFocus = () => {
  isTyping.value = true;
};

const handleInputBlur = () => {
  isTyping.value = false;
};

const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    if (searchQuery.value.trim() !== '') {
      isScrolled.value = true;
      if (window.scrollY === 0) {
        scrollPageDown();
      }
    }
  }
};

// Modal handlers
const openEventDetails = (event) => {
  selectedEvent.value = event;
  showEventModal.value = true;
};

const closeEventDetails = () => {
  showEventModal.value = false;
  selectedEvent.value = null;
};


// Scroll handlers
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
  console.log('Scroll state:', isScrolled.value); // Debug log
};

const handleClickOutside = (event) => {
  const dropdown = document.getElementById('categories-dropdown');
  const sbpart0 = document.querySelector('.sbpart0');
  
  if (dropdown && !dropdown.contains(event.target) && !sbpart0.contains(event.target)) {
    isCategoryDropdownOpen.value = false;
  }
};

const scrollPageDown = () => {
  window.scrollTo({
    top: 30,
    behavior: 'smooth'
  });
};

// Add clear filters method
const clearFilters = () => {
  selectedCategories.value.clear();
  isCategoryDropdownOpen.value = false;
};

// Add clear search method
const clearSearch = () => {
  searchQuery.value = '';
  isTyping.value = false;
};


// Lifecycle hooks
onMounted(() => {
  fetchEvents();
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('click', handleClickOutside);
  
  window.addEventListener('scroll', handleScroll);
  
  const unsubscribe = navbarEventBus.onExpanded((expanded) => {
    isNavbarExpanded.value = expanded;
    console.log('Navbar state in filter:', expanded); // Debug log
  });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    unsubscribe();
  });

  
});


</script>

<style scoped>
/* Base Container Styles */
.scroll-container {
  padding: 0px;
  scroll-snap-type: y mandatory;
  height: 100vh;
  overflow-y: scroll;
  width: 100%;
  position: relative;
  max-height: 100vh;
  padding-bottom: 150px;
}

/* MultiSearchBar Styles */
.multisearchbar {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  transition: height 0.3s ease;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  visibility: visible;
  opacity: 1;
  z-index: 2000;
  margin-bottom: 0;
  height: auto;
}

.multisearchbar.navbar-expanded {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.multisearchbar.scrolled {
  height: 60px;
}

.filter-transition {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  position: fixed;
  left: 50%;
}

.filter-expanded {
  top: 80px; /* Fixed initial position */
  color: black;
  background-color: #ffffff;
  width: 342px;
  height: 66px;
  border: 0.5px solid #ffffff;
  border-radius: 40px;
  box-shadow: 0px 0px 13px 1px #a889d1cb;
  display: flex;
  align-items: center;
  position: fixed;
  left: 50%;
  /* top: 80px; */
  transform: translate(-50%, 0);
  transition: all 0.3s ease;
  will-change: transform, opacity, visibility;
  backface-visibility: hidden;
  margin-bottom: 1rem; /* Add small margin only to filter */
  transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
}

.filter-expanded.filter-hidden {
  pointer-events: none;
}

.filter-collapsed {
  top: 34px; /* Fixed collapsed position */

  background-color: #ffffff;
  width: 280px;
  height: 35px;
  border: 0.5px solid #ffffff;
  border-radius: 40px;
  box-shadow: 0px 0px 13px 1px #a889d1cb;
  display: flex;
  align-items: center;
  position: fixed;
  left: 50%;
  transform: translate(-50%, 0);
  transition: all 0.3s ease;
  will-change: transform, opacity, visibility;
  backface-visibility: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
}

.filter-collapsed.filter-visible {
  pointer-events: auto;
}

/* Filter Positioning */
/* .filter-expanded, .filter-collapsed {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  transition: visibility 0.3s, opacity 0.3s, transform 0.3s;
  will-change: transform, opacity, visibility;
  backface-visibility: hidden;
  perspective: 1000px;
  transform-style: preserve-3d;
} */

/* Add this class for when collapsed is active */
.filter-collapsed.scrolled {
  pointer-events: auto; /* Enable pointer events when visible */
}

.sbdivider1, .sbdivider2 {
  background-color: #a889d1cb;
  width: 0.5px;
  align-self: center;
  margin: 0;
}

.sbdivider1 {
  height: 28px; /* Increased height */
}

.sbdivider2 {
  height: 20px;
}

/* Search Parts Styling */
.sbpart0, .sbpart1 {
  padding: 19px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.sbpart0 {
  width: 170px;
  position: relative;
  padding: 10px 0 10px 20px; /* Removed right padding */
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.sbpart1 {
  width: 170px; /* Adjusted width */
  position: relative;
  padding: 10px 20px 10px 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.sbpart0:hover, .sbpart1:hover {
  box-shadow: 0px 0px 15px 2px #9646FF;
  border-radius: 50px;
  height: 65px;
  cursor: pointer;
}

/* Category and Event Text Styles */
.sbpart0 p {
  width: 170px;
  margin: 0;
  padding-left: 10px;
  height: 20px;
  font-size: 16px;
  line-height: 20px;
}

.sbpart1 p {
  width: 160px;
  padding-left: 2px;
  height: 20px;
  font-size: 16px;
  line-height: 20px;
}

.category-display {
  color: #7b7b7b;
  font-size: 14px;
  font-weight: normal;
}

.categories, .events {
  font-size: 14px;
  font-weight: 500;
  height: 23px;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: inherit;
}

.categories {
  margin-left: 28;
  margin-right: 2px;
}

.events {
  margin-left: 10px;
}

/* Input Styling */
.sbpart1 input {
  width: 130px;
  font-weight: 500;
  border: none;
  height: 20px;
  border-radius: 10px;
  background-color: transparent;
  color: black;
  padding-right: 24px; /* Make room for clear button */
}

.sbpart1 input:focus {
  border: none;
  outline: none;
  color: black;
}

/* Collapsed Filter Parts */
.sbpart3, .sbpart4 {
  padding: 6px 15px;
  display: flex;
  align-items: center;
  height: 35px;
}

.sbpart3:hover, .sbpart4:hover {
  box-shadow: 0px 0px 3px 1px #9646FF;
  border-radius: 50px;
  cursor: pointer;
}

.sbpart3 {
  width: 140px;
}

.sbpart4 {
  width: 140px;
  position: relative;
}

.sbpart3 .btn, .sbpart4 .btn {
  background: none;
  border: none;
  color: black;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.sbpart3 .btn {
  width: 100%;
  height: 100%;
}

.sbpart4 .btn {
  width: 100%;
  height: 100%;
}



/* Categories Dropdown */
.categories-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background-color: white;
  border: 0.5px solid #d4cfcf;
  border-radius: 20px;
  margin-top: 12px;
  box-shadow: 0px 0px 13px 1px #e3dada;
  display: none;
  z-index: 1000;
}

.categories-dropdown.active {
  display: block;
  box-shadow: 0px 0px 25px 5px #e3dada;
}

.dropdown-content {
  padding: 15px;
}

.category-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #DEDCF4 ;
}

/* .category-options::before {
  content: 'Choose Categories';
  display: block;
  color: #757575;
  font-size: 10px;
  font-weight: 500;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
} */

/* Style for All Categories button */
.category-option.all-categories {
  grid-column: 1 / -1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 4px;
  padding-bottom: 12px;
}

/* New category section label */
.category-section-label {
  grid-column: 1 / -1;
  color: #383838;
  font-size: 10px;
  font-weight: 500;
  margin: 2px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-left: 12px;
}

.category-options::-webkit-scrollbar {
  width: 6px;
}

.category-options::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.category-options::-webkit-scrollbar-thumb {
  background-color: #8c52ff;
  border-radius: 3px;
}

.category-option {
  background: none;
  border: none;
  color: black;
  padding: 8px 12px;
  text-align: left;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 400;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-option:hover {
  background-color: rgba(134, 74, 255, 0.347);
}

.category-option.selected {
  background-color: #c0bcfc;
  color: black;
  font-weight: 500;
}

  .category-option[data-value="all"] {
    grid-column: 1 / -1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 4px;
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Loading and Error States */
.loading,
.error,
.no-events {
  text-align: center;
  margin-top: 200px;
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

/* Typing Animation */
.typing {
  animation: typing-animation 1s ease-in-out forwards;
}

@keyframes typing-animation {
  0% {
    border-bottom: 2px solid transparent;
  }
  50% {
    border-bottom: 2px solid #8c52ff;
  }
  100% {
    border-bottom: 2px solid transparent;
  }
}

/* Event List Styles */
.event-list {
  margin-top: 100px;
  padding: 20px;
}

/* Responsive Styles */
/* @media (max-width: 600px) {
  .filter-expanded {
    width: 90%;
  }
  
  .filter-collapsed {
    width: 80%;
  }
  
  .categories-dropdown {
    width: 90%;
    left: 5%;
  }
  
  .sbpart0, .sbpart1 {
    width: auto;
    flex: 1;
  }
} */


/* Clear Filters Button in Dropdown */
.clear-filters-container {
  padding: 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
}

.clear-filters-btn {
  background: none;
  border: 1px solid #8c52ff;
  color: #8c52ff;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: center;
}

.clear-filters-btn:hover {
  background-color: rgba(140, 82, 255, 0.1);
}

/* Search Input Container */
.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
} 

#search-events {
  color: black;
}

/* Clear Search Button */
.clear-search-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #8c52ff;
  font-size: 24px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background-color: rgba(140, 82, 255, 0.1);
}


/* Base styles for larger screens */
@media (min-width: 1400px) {
  .filter-expanded {
    width: 383px;
    height: 68px;
    top: 80px;
  }
  
  .filter-collapsed {
    width: 320px;
    height: 40px;
    top: 13px;
  }

  .events {
    margin: 0px;
  }

  .sbpart0, .sbpart1 {
    width: 190px; 
    height: 70px;
  }

  .sbpart3, .sbpart4 {
    width: 160px;
    height: 40px;
  }

  .categories-dropdown {
    width: 350px;
  }
}

/* Desktop */
@media (min-width: 1024px) and (max-width: 1399px) {
  .filter-expanded {
    width: 342px;
    height: 66px;
  }
  
  .filter-collapsed {
    width: 260px;
    height: 35px;
    top: 15px;
  }

  .events {
    margin: 0px;
  }

  .categories-dropdown {
    width: 300px;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .filter-expanded {
    width: 303px;
    height: 68px;
    top: 80px;
  }
  
  .filter-collapsed {
    width: 260px;
    height: 35px;
    top: 15px;
  }

  .sbpart0, .sbpart1 {
    width: 150px;
    padding: 10px 15px;
  }

  .sbpart3, .sbpart4 {
    width: 130px;
    padding: 6px 12px;
  }

  .categories-dropdown {
    width: 280px;
  }

  .events {
    margin: 0px;
  }
}

/* Large Mobile */
@media (min-width: 480px) and (max-width: 767px) {
  .filter-expanded {
    width: 300px;
    max-width: 300px;
    height: 68px;
  }
  
  .filter-collapsed {
    width: calc(100% - 60px);
    max-width: 250px;
    height: 32px;
    top: 16px;
  }

  .sbpart3 .btn, .sbpart4 .btn {
    font-size: 13px;
}

  .sbpart0, .sbpart1 {
    width: 50%;
    min-width: 100px;
    padding: 8px 12px;
  }

  .sbpart3, .sbpart4 {
    height: 30px;
    width: 50%;
    min-width: 90px;
    padding: 4px 5px;
  }

  .categories-dropdown {
    width: 260px;
    left: 50%;
    transform: translateX(-50%);
  }

  .categories, .events {
    font-size: 7px;
  }

  .events {
    margin: 0px;
  }

  .category-display {
    font-size: 10px;
  }
}

/* Small Mobile */
@media (max-width: 479px) {
  .filter-expanded {
    max-width: 250px;
    height: 50px;
    top: 80px;
  }
  
  .filter-collapsed {
    max-width: 140px;
    height: 25px;
    top: 20px;
  }

  .sbpart0, .sbpart1 {
    width: 50%;
    min-width: 110px;
    padding: 6px 8px;
    height: 100%;
  }

  .sbpart1 {
    padding-left: 12px;
  }

  .sbdivider1 {
    height: 24px;
  }

  .sbdivider2 {
    height: 14px;
  }

  .sbpart3 {
    height: auto;
    min-width: 80px;
    padding: 4px 4px;
  }

  .sbpart4 {
    height: auto;
    min-width: 50px;
    padding: 4px 8px;
  }

  .sbpart3 .btn, .sbpart4 .btn {
    font-size: 9px;
}

  .categories, .events {
    font-size: 10px;
    height: auto;
    margin: 0;
  }

  .events {
    margin-top: 3px;
    margin-bottom: -2px;
  }


  .category-display {
    font-size: 11px;
    height: auto;
    width: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sbpart0 p, .sbpart1 p {
    width: auto;
    height: auto;
    font-size: 12px;
    line-height: 1.2;
  }

  .categories-dropdown {
    width: calc(100vw - 40px);
    max-width: 250px;
    left: 100%;
    transform: translateX(-50%);
  }

  .category-options {
    grid-template-columns: 1fr;
  }

  .category-option {
    font-size: 11px;
    padding: 6px 10px;
  }

  .sbpart1 input {
    min-width: 105px;
    font-size: 12px;
  }

  .search-input-container {
    width: 100%;
  }

  /* Fix hover states for touch devices */
  .sbpart0:hover, .sbpart1:hover {
    height: auto;
  }
}

@media (max-width: 991px) {
  .multisearchbar {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .filter-expanded,
  .filter-collapsed {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform, opacity, visibility;
  }
}

/* Optional: Add transition for smoother visual change */
.filter-expanded, .filter-collapsed {
  backface-visibility: hidden;
  transform-style: preserve-3d;
}

/* Remove any visibility: hidden properties */
.filter-expanded.filter-hidden {
  pointer-events: none;
}

.filter-collapsed.filter-visible {
  pointer-events: auto;
}

.search-input-container {
  width: 100%; /* Make input container full width */
}

/* Improve dropdown positioning */
.categories-dropdown {
  max-height: 90vh; /* Prevent dropdown from going off screen */
  overflow-y: auto;
}

/* Update clear buttons to be more responsive */
.clear-search-btn {
  right: 2px;
  font-size: 20px;
}

.clear-filters-btn {
  font-size: 11px;
  padding: 5px 10px;
}

</style>
