<template>
  <!-- Combined Filter Section -->
  <div class="multisearchbar" :class="{ scrolled: isScrolled }">
    <!-- Expanded Filter -->
    <div 
      id="filter-expanded"  
      class="filter-expanded" 
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
                <span class="remove-tag" v-if="selectedCategories.size === 0">×</span>
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
            placeholder="Search events..."
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
      </div>
    </div>

    <!-- Collapsed Filter -->
    <div 
      id="filter-collapsed"
      class="filter-collapsed"
      :class="{ scrolled: isScrolled }"
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import EventList from '../General/EventList.vue';
import EventDetailModal from '../General/EventDetailModal.vue';
import { fetchLiveEvents } from '../../composables/fetchEvents';

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

// Visibility states for filters
const expandedFilterStyle = computed(() => ({
visibility: isScrolled.value ? 'hidden' : 'visible',
opacity: isScrolled.value ? '0' : '1',
transform: isScrolled.value ? 'translate(-50%, -120%)' : 'translate(-50%, 0)',
}));

const collapsedFilterStyle = computed(() => ({
visibility: isScrolled.value ? 'visible' : 'hidden',
opacity: isScrolled.value ? '1' : '0',
transform: isScrolled.value ? 'translate(-50%, 0)' : 'translate(-50%, -120%)',
top: '14px'
}));

// Display text computeds
const categoryDisplayText = computed(() => {
if (selectedCategories.value.size === 0) return 'All categories';
return `${selectedCategories.value.size} ${
  selectedCategories.value.size === 1 ? 'category' : 'categories'
}`;
});

const collapsedCategoryText = computed(() => {
if (selectedCategories.value.size === 0) return 'All Categories';
return `${selectedCategories.value.size} Categories`;
});

const collapsedEventText = computed(() => {
return searchQuery.value.trim() || 'All Events';
});

// Computed for filtered events
const filteredEvents = computed(() => {
let eventsToFilter = events.value;

const hasSelectedCategories = selectedCategories.value.size > 0;
if (hasSelectedCategories) {
  eventsToFilter = eventsToFilter.filter(event => 
    event.category.some(cat => selectedCategories.value.has(cat))
  );
}

const query = searchQuery.value.toLowerCase().trim();
if (query !== '') {
  eventsToFilter = eventsToFilter.filter(event => {
    const eventString = JSON.stringify(event).toLowerCase();
    const matchesSearch = eventString.includes(query);
    
    if (hasSelectedCategories) {
      return matchesSearch && event.category.some(cat => 
        selectedCategories.value.has(cat)
      );
    }
    
    return matchesSearch;
  });
}

return eventsToFilter;
});

// Methods
const fetchEvents = async () => {
loading.value = true;
try {
  const fetchedEvents = await fetchLiveEvents();
  events.value = fetchedEvents;

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

// Updated scroll handler for window
const handleScroll = () => {
const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

// Update scroll state based on scroll position
if (currentScroll > 20) {
  isScrolled.value = true;
} else {
  isScrolled.value = false;
}

// Update scroll direction
isScrollingUp.value = currentScroll < lastScrollTop.value;
lastScrollTop.value = currentScroll;
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

const handleSearchInput = () => {
isTyping.value = true;
setTimeout(() => {
  isTyping.value = false;
}, 1000);
};

const handleAllCategoriesClick = (event) => {
event.stopPropagation();
selectedCategories.value.clear();
isCategoryDropdownOpen.value = false;
};

const handleCategoryClick = (category, event) => {
event.stopPropagation();
if (selectedCategories.value.has(category)) {
  selectedCategories.value.delete(category);
} else {
  selectedCategories.value.add(category);
}

if (selectedCategories.value.size === availableCategories.value.length) {
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

// Updated showExpanded to use window scroll
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

const openEventDetails = (event) => {
selectedEvent.value = event;
showEventModal.value = true;
};

const closeEventDetails = () => {
showEventModal.value = false;
selectedEvent.value = null;
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

const clearFilters = () => {
selectedCategories.value.clear();
isCategoryDropdownOpen.value = false;
};

const clearSearch = () => {
searchQuery.value = '';
isTyping.value = false;
};

// Updated lifecycle hooks to use window
onMounted(() => {
fetchEvents();
window.addEventListener('scroll', handleScroll);
document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
window.removeEventListener('scroll', handleScroll);
document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Base Container Styles */
.scroll-container {
  /* padding: 20px; */
  scroll-snap-type: y mandatory;
  height: 100vh;
  overflow-y: scroll;
  width: 100%;
  position: relative;
  max-height: 100vh;
}

/* MultiSearchBar Styles */
.multisearchbar {
  background: none;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  height: 80px;
  transition: height 0.3s ease;
  z-index: 1000000000001;
}

.multisearchbar.scrolled {
  height: 60px;
}

.filter-expanded {
  background-color: black;
  width: 342px;
  height: 66px;
  border: 0.5px solid #d4cfcf;
  border-radius: 40px;
  box-shadow: 0px 0px 13px 1px #e3dada;
  display: flex;
  align-items: center;
  position: fixed;
  left: 50%;
  /* top: 80px; */
  transform: translate(-50%, 0);
  transition: all 0.3s ease;
  will-change: transform, opacity, visibility;
  backface-visibility: hidden;
  z-index: 1000000000000;
}

.filter-collapsed {
  background-color: black;
  width: 280px;
  height: 35px;
  border: 0.5px solid #d4cfcf;
  border-radius: 40px;
  box-shadow: 0px 0px 13px 1px #e3dada;
  display: flex;
  align-items: center;
  position: fixed;
  left: 50%;
  transform: translate(-50%, 0);
  transition: all 0.3s ease;
  will-change: transform, opacity, visibility;
  backface-visibility: hidden;
  z-index: 1000000000000;
  cursor: pointer;
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

.filter-expanded {
  /* top: 80px; */
  z-index: 1000000000000;
  transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
}

.filter-collapsed {
  z-index: 1000000000000;
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;

}

/* Add this class for when collapsed is active */
.filter-collapsed.scrolled {
  pointer-events: auto; /* Enable pointer events when visible */
}

.sbdivider1, .sbdivider2 {
  background-color: #d4cfcf;
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
  padding: 10px 20px 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.sbpart0:hover, .sbpart1:hover {
  box-shadow: 0px 0px 3px 1px #e3dada;
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
  margin: 0;
  padding-left: 2px;
  height: 20px;
  font-size: 16px;
  line-height: 20px;
}

.category-display {
  color: #757575;
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
  background-color: black;
  color: white;
  padding-right: 24px; /* Make room for clear button */
}

.sbpart1 input:focus {
  border: none;
  outline: none;
}

/* Search Buttons */
.search-button1 {
  width: 48px;
  height: 48px;
  background-color: #8c52ff;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease-in;
  position: absolute;
  margin: 140px;
}

.search-button2 {
  width: 20px;
  height: 20px;
  background-color: #8c52ff;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease-in;
  margin-left: auto;
  margin-right: 10px;
  position: absolute;
  margin: 240px;
}

.search-button1:hover, .search-button2:hover {
  background-color: rgb(112, 65.6, 204);
  cursor: pointer;
  transform: rotate(90deg);
}

/* Collapsed Filter Parts */
.sbpart3, .sbpart4 {
  padding: 6px 15px;
  display: flex;
  align-items: center;
  height: 35px;
}

.sbpart3:hover, .sbpart4:hover {
  box-shadow: 0px 0px 3px 1px #e3dada;
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
  color: white;
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
  background-color: black;
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
  scrollbar-color: #8c52ff #1a1a1a;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
  padding-bottom: 12px;
}

/* New category section label */
.category-section-label {
  grid-column: 1 / -1;
  color: #757575;
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
  color: white;
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
  background-color: rgba(140, 82, 255, 0.15);
  color: #8c52ff;
  font-weight: 500;
}

.category-option[data-value="all"] {
  grid-column: 1 / -1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
  padding-bottom: 12px;
}

.remove-tag {
  display: none;
  color: #8c52ff;
  font-size: 14px;
  padding: 2px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 8px;
}

.category-option.selected .remove-tag {
  display: inline-block;
}

.remove-tag:hover {
  background-color: rgba(140, 82, 255, 0.2);
}

/* Loading and Error States */
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
  }
  
  .filter-collapsed {
    width: 320px;
    height: 40px;
  }

  .sbpart0, .sbpart1 {
    width: 190px; 
  }

  .sbpart3, .sbpart4 {
    width: 160px;
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
    width: 280px;
    height: 35px;
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
  }
  
  .filter-collapsed {
    width: 260px;
    height: 35px;
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
    font-size: 10px;
  }

  .category-display {
    font-size: 10px;
  }
}

/* Small Mobile */
@media (max-width: 479px) {
  .filter-expanded {
    width: calc(100% - 32px);
    max-width: 280px;
    height: 56px;
  }
  
  .filter-collapsed {
    width: calc(100% - 48px);
    max-width: 230px;
    height: 30px;
  }

  .sbpart0, .sbpart1 {
    width: 45%;
    min-width: 100px;
    padding: 6px 10px;
  }

  .sbdivider1 {
    height: 24px;
  }

  .sbdivider2 {
    height: 16px;
  }

  .sbpart3, .sbpart4 {
    width: 45%;
    min-width: 80px;
    padding: 4px 8px;
  }

  .categories, .events {
    font-size: 12px;
  }

  .category-display {
    font-size: 11px;
  }

  .categories-dropdown {
    width: calc(100vw - 40px);
    max-width: 250px;
    left: 50%;
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
    width: 100%;
    min-width: 70px;
    font-size: 12px;
  }
}

/* Height-based adjustments */
@media (max-height: 700px) {
  .categories-dropdown {
    max-height: 70vh;
  }

  .category-options {
    max-height: 250px;
  }
}

/* Landscape mode adjustments */
@media (max-height: 500px) and (orientation: landscape) {
  .filter-expanded {
    top: 60px;
  }

  .filter-collapsed {
    top: 20px;
  }

  .categories-dropdown {
    max-height: 60vh;
  }

  .category-options {
    max-height: 180px;
  }
}

/* Update some base styles to be more responsive */
.sbdivider {
  flex-shrink: 0; /* Prevent divider from shrinking */
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


/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!CARD BASE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
.card-base {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}
/* a .card-base {
  text-decoration: none;
} */

.card-container {
  display: grid;
  place-items: center;
  margin-inline: 1.5rem;
}

.card__container, .card__article {
  display: grid;
  gap: 4rem;
}

.card__container {
  padding-block: 4rem;
}

.card__article {
  --hue-1: 210;
  --hue-2: 238;
  position: relative;
  justify-items: center;
  color: white;
  text-align: center;
  /* padding: rem 3rem; */
  border: solid 4px transparent;
  background: linear-gradient(
              var(--container-color-first),
              var(--container-color-first)) padding-box,

              linear-gradient(135deg, 
              hsl(var(--hue-1), 85%, 70%) 0%,
              var(--container-color-first),
              var(--container-color-first),
              hsl(var(--hue-2), 70%, 55%) 100%) border-box;
  border-radius: 1.25rem;
  overflow: hidden;
}



/* SHAPING CARD */

.card__shape-1 {
  position: relative;
  width: 330px;
  height: 510px;
  background: linear-gradient(140deg,
              hsl(var(--hue-1), 75%, 25%) 3%,
              hsl(var(--hue-2), 65%, 45%) 100%);
  border-radius: 2rem;
  z-index: 2;
}

.card__shape-2 {
  width: 310px;
  height: 475px;
  background: linear-gradient(140deg,
              hsl(var(--hue-1), 70%, 50%) 3%,
              hsl(var(--hue-2), 95%, 45%) 100%);
  border-radius: 1.5rem;
}

.card__shape-3 {
  width: 290px;
  height: 440px;
  background: linear-gradient(140deg,
              hsl(var(--hue-1), 85%, 60%) 3%,
              hsl(var(--hue-2), 85%, 60%) 100%);
  border-radius: 1rem;
  display: grid;
  place-items: center;
}

.card__shape-2, .card__shape-3 {
  position: absolute;
  inset: 0;
  margin: auto;
}

.card__icon {
  font-size: 3rem;
}

.card__data {
  z-index: 3;
}

.card__title {
  font-size: 35px;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.card__description {
  margin-bottom: 1.5rem;
}

.card__button {
  display: inline-block;
  background-color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  color: black;
  font-weight: 500;
  text-decoration: none;
}

/* COLOUR CHANGE */
.card__orange {
  --hue-1: 300;
  --hue-2: 30;
}

.card__green {
  --hue-1: 180;
  --hue-2: 50;
}

/* SHAPES SCALE - creates glowy effect for card__shape */
.card__scale-1 {
  width: 1000px;
  height: 500px;
  background: linear-gradient(140deg,
              hsl(var(--hue-1), 75%, 25%) 3%,
              hsl(var(--hue-2), 65%, 45%) 100%);
  border-radius: 2rem;
  top: 2rem;
}

.card__scale-2 {
  width: 116px;
  height: 116px;
  background-color: var(--container-color-first);
  border-radius: 1.5rem;
  top: 5rem;
}

.card__scale-1, .card__scale-2 {
  position: absolute;
  /* z-index: 10; */
  filter: blur(24px);
  transition: transform .3s ease-in;
}

/* SHAPES SCALE ANIMATION */
.card__article:hover .card__scale-1 {
  transform: scale(2);
}

.card__article:hover .card__scale-2 {
  transform: scale(3);
  transition-delay: .1s;
}

@media screen and (max-width: 320px) {
  .card-container {
    margin-inline: 1rem;
  }
  .card__article {
    padding: 2rem 1rem;
  }
  .card__scale-1 {
    top: 2rem;
  }
  .card__scale-2 {
    top: 3rem;
  }
}

@media screen and (min-width: 576px) {
  .card__container {
    grid-template-columns: 328px;
  }
}

@media screen and (min-width: 768px) {
  .card__container {
    grid-template-columns: repeat(2, 328px);
  }
}

@media screen and (min-width: 1120px) {
  .card-container {
    height: 100vh;
  }
  .card__container {
    grid-template-columns: repeat(3, 400px);
  } 
  .card__article {
    padding: 1rem 1rem;
  }
}


/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!! CARD POPUP INFO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
.card-base-info {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

/*=============== CARD ===============*/
.card-container-info {
  display: grid;
  place-items: center;
  margin-inline: 1.5rem;
  padding-block: 5rem;
}

.card__container_info {
  display: grid;
  row-gap: 3.5rem;
}

.card__article_info {
  position: relative;
  overflow: hidden;
}

.card__img_info {
  display: block;
  max-width: 100%;
  height: auto;
  width: 328px;
  border-radius: 1.5rem;
}

.card__data_info {
  width: 250px;
  background-color: var(--container-color-second);
  padding: 0.5rem 0.5rem;
  box-shadow: 0 8px 24px hsla(0, 0%, 0%, .15);
  border-radius: 1rem;
  position: absolute;
  bottom: -9rem;
  left: 0;
  right: 0;
  margin-inline: auto;
  opacity: 0;
  transition: opacity 1s 1s;
}

.card__description_info {
  display: block;
  font-size: 10px;
  margin-bottom: .25rem;
}

.card__title_info {
  font-size: 20px;
  font-weight: 500;
  color: var(--card-info-title-color);
  margin-bottom: .75rem;
}

.card__button_info {
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--card-info-first-color);
}

.card__button:hover_info {
  text-decoration: underline;
}

/* Naming animations in hover */
.card__article_info:hover .card__data_info {
  animation: show-data 1s forwards;
  opacity: 1;
  transition: opacity .3s;
}

.card__article_info:hover {
  animation: remove-overflow 2s forwards;
}

.card__article_info:not(:hover) {
  animation: show-overflow 2s forwards;
}

.card__article_info:not(:hover) .card__data_info {
  animation: remove-data 1s forwards;
}

/* Card animation */
@keyframes show-data {
  50% {
    transform: translateY(-10rem);
  }
  100% {
    transform: translateY(-7rem);
  }
}

@keyframes remove-overflow {
  to {
    overflow: initial;
  }
}

@keyframes remove-data {
  0% {
    transform: translateY(-7rem);
  }
  50% {
    transform: translateY(-10rem);
  }
  100% {
    transform: translateY(.5rem);
  }
}

@keyframes show-overflow {
  0% {
    overflow: initial;
    pointer-events: none;
  }
  50% {
    overflow: hidden;
  }
}

/*=============== BREAKPOINTS ===============*/
/* For small devices */
@media screen and (max-width: 340px) {
  .card-container-info {
    margin-inline: 1rem;
  }

  .card__data_info {
    width: 250px;
    padding: 1rem;
  }
}

/* For medium devices */
@media screen and (min-width: 768px) {
  .card__container_info {
    grid-template-columns: repeat(2, 1fr);
    column-gap: 1.5rem;
  }
}

/* For large devices */
@media screen and (min-width: 1120px) {
  .card-container-info {
    height: 100vh;
  }

  .card__container_info {
    grid-template-columns: repeat(3, 1fr);
  }
  .card__img_info {
    width: 348px;
  }
  .card__data_info {
    width: 260px;
    padding-inline: 2.5rem;
  }
}

</style>
