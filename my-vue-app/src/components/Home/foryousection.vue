<template>
    <section class="featured-events py-5">
      <div class="container-fluid px-4">
        <!-- Header Section -->
        <div class="row mb-5 text-center" ref="titleRef">
          <div class="col-12">
            <h2 class="display-4 fw-bold mb-2">Featured Events</h2>
            <p class="lead text-muted">We guessed you may like these</p>
          </div>
        </div>
  
        <!-- Events Carousel -->
        <div class="row">
          <div class="col-12 position-relative">
            <!-- Navigation Buttons -->
            <button 
              class="btn btn-outline-primary carousel-nav-btn start-0" 
              @click="scroll('left')"
              :class="{ 'opacity-0': isScrollStart }"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <button 
              class="btn btn-outline-primary carousel-nav-btn end-0" 
              @click="scroll('right')"
              :class="{ 'opacity-0': isScrollEnd }"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
  
            <!-- Events Container -->
            <div 
              class="events-container" 
              ref="cardAreaRef"
              @scroll="checkScrollPosition"
            >
              <div class="events-track d-flex">
                <div 
                  v-for="(event, index) in featuredEvents" 
                  :key="event.id"
                  class="event-card-wrapper"
                  :ref="el => cardRefs[index] = el"
                  :class="{ 'fade-in': visibleCards[index] }"
                >
                  <EventCard 
                    :event="event" 
                    @show-details="openEventDetails"
                    class="h-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Event Details Modal -->
      <EventDetailModal 
        v-if="showModal" 
        :event="selectedEvent" 
        @close="handleModalClose"
        @login-success="handleLoginSuccess" 
      />
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
  import { onAuthStateChanged } from 'firebase/auth';
  import { auth } from '../../firebase';
  import { fetchRecommendedEvents } from '../../composables/fetchEvents';
  import EventCard from '../General/EventCard.vue';
  import EventDetailModal from '../General/EventDetailModal.vue';
  
  // State
  const featuredEvents = ref([]);
  const isAuthenticated = ref(false);
  const showModal = ref(false);
  const selectedEvent = ref(null);
  const cardAreaRef = ref(null);
  const titleRef = ref(null);
  const cardRefs = ref([]);
  const visibleCards = ref([]);
  const isScrollStart = ref(true);
  const isScrollEnd = ref(false);
  
  // Scroll position tracking
  const checkScrollPosition = () => {
    if (!cardAreaRef.value) return;
    
    const container = cardAreaRef.value;
    isScrollStart.value = container.scrollLeft <= 10;
    isScrollEnd.value = 
      Math.ceil(container.scrollLeft + container.clientWidth) >= 
      container.scrollWidth - 10;
  };
  
// Scroll handling
const scroll = (direction) => {
  if (!cardAreaRef.value) return;
  
  const container = cardAreaRef.value;
  const cardWidth = container.querySelector('.event-card-wrapper')?.offsetWidth || 500;
  
  container.scrollTo({
    left: container.scrollLeft + (direction === 'left' ? -cardWidth : cardWidth),
    behavior: 'smooth'
  });
};
  
  // Card visibility handling
  const handleScroll = () => {
    if (!cardAreaRef.value) return;
  
    const rect = cardAreaRef.value.getBoundingClientRect();
    const isVisible = rect.top <= window.innerHeight * 0.8;
  
    if (isVisible) {
      cardRefs.value.forEach((card, index) => {
        if (!card || visibleCards.value[index]) return;
        
        setTimeout(() => {
          visibleCards.value[index] = true;
        }, index * 100);
      });
  
      window.removeEventListener('scroll', handleScroll);
    }
  };
  
  // Event loading
  const loadRecommendedEvents = async () => {
    featuredEvents.value = await fetchRecommendedEvents();
    visibleCards.value = Array(featuredEvents.value.length).fill(false);
    cardRefs.value = [];
    
    // Check scroll position after events load
    nextTick(() => checkScrollPosition());
  };
  
  // Modal handlers
  const openEventDetails = (event) => {
    selectedEvent.value = event;
    showModal.value = true;
  };
  
  const handleModalClose = () => {
    showModal.value = false;
    selectedEvent.value = null;
  };
  
  const handleLoginSuccess = async () => {
    isAuthenticated.value = true;
    await loadRecommendedEvents();
    handleModalClose();
  };
  
  // Lifecycle hooks
  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    loadRecommendedEvents();
    
    onAuthStateChanged(auth, (user) => {
      isAuthenticated.value = !!user;
      if (user) {
        loadRecommendedEvents();
      } else {
        featuredEvents.value = [];
        visibleCards.value = [];
      }
    });
  });
  
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
  });
  </script>
  
  <style scoped>
  .container-fluid {
  padding: 0 !important;
  margin: 0 !important;
}

.row {
  margin: 0 !important;
  padding: 0 !important;
}

.col-12 {
  padding: 0 !important;
}

  .featured-events {
    background-color: #fbfbfe;
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
  
  .events-container {
    width: 100%;
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  .events-container::-webkit-scrollbar {
    display: none;
  }
  
  .events-track {
    display: inline-flex;
    gap: 0rem; /* Increased gap between cards */
    padding: 0 !important; /* Added horizontal padding */
    margin: 0 !important;
  }
  
  .event-card-wrapper {
    flex: 0 0 auto;
    width: 100vw; /* Full viewport width minus padding */
    max-width: 500px; /* Maximum width for larger screens */
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.5s ease-out;
  }
  
  .event-card-wrapper.fade-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  .carousel-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 48px;
    height: 48px;
    padding: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    background-color: var(--bs-white);
    border-color: var(--bs-primary);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .carousel-nav-btn:hover {
    background-color: var(--bs-primary);
    color: var(--bs-white);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  /* Responsive margin adjustments */
  @media (max-width: 768px) {
    .events-track {
      padding: 0;
    }
    
    .event-card-wrapper {
      width: 100vw; /* Adjusted for smaller screens */
    }
    
    .carousel-nav-btn {
      width: 40px;
      height: 40px;
    }
  }
  
  /* Enhanced card hover effect */
  :deep(.event-card) {
    transition: all 0.3s ease;
    height: 100%;
    aspect-ratio: 2/3; /* Maintain consistent card proportions */
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    margin: 0.5rem 0;
  }
  
  :deep(.event-card:hover) {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }
  
  /* Smooth scroll behavior */
  .events-container {
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    width: 100%;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding: 2rem 0 !important; /* Increased vertical padding */
  margin: 0 !important;
  min-height: calc(100% + 4rem);
  }
  
  .event-card-wrapper {
    scroll-snap-align: center;
    flex: 0 0 auto;
  width: 100vw;
  max-width: 500px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease-out;
  padding: 1rem 0;
  }
  
  /* Animation classes */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>