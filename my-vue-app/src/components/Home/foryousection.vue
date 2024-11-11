<template>


    <div class="events-viewport" ref="containerRef">
        <div class="header-section">
            <h1 class="main-title text-dark">Featured Events</h1>
            <p class="subtitle">We guessed you may like these</p>
        </div>

        <div class="card-area" ref="cardAreaRef" @mouseenter="enableHorizontalScroll"
            @mouseleave="disableHorizontalScroll">
            <div v-for="(event, index) in featuredEvents" :key="event.id" class="card-wrapper"
                :ref="el => cardRefs[index] = el" :class="{ 'visible': visibleCards[index] }">
                <EventCard :event="event" @show-details="openEventDetails" />
            </div>
        </div>

        <EventDetailModal v-if="showModal" :event="selectedEvent" @close="handleModalClose"
            @login-success="handleLoginSuccess" />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { fetchRecommendedEvents } from '../../composables/fetchEvents';
import EventCard from '../General/EventCard.vue';
import EventDetailModal from '../General/EventDetailModal.vue';
import anime from 'animejs';

// State
const featuredEvents = ref([]);
const isAuthenticated = ref(false);
const showModal = ref(false);
const selectedEvent = ref(null);

// Refs
const containerRef = ref(null);
const cardAreaRef = ref(null);
const cardRefs = ref([]);
const visibleCards = ref([]);

// Scroll state
const isHoveringCards = ref(false);
let scrollDistance = 0;
let scrollInterval = null;

// Load events
const loadRecommendedEvents = async () => {
    featuredEvents.value = await fetchRecommendedEvents();
    visibleCards.value = Array(featuredEvents.value.length).fill(false);
    cardRefs.value = [];
};

// Vertical scroll handler for initial animation
const handleScroll = () => {
    if (!cardAreaRef.value) return;

    const rect = cardAreaRef.value.getBoundingClientRect();
    const isVisible = rect.top <= window.innerHeight * 0.8;

    if (isVisible) {
        cardRefs.value.forEach((card, index) => {
            if (!card || visibleCards.value[index]) return;

            // Simple timeout for staggered fade-in
            setTimeout(() => {
                visibleCards.value[index] = true;
            }, index * 100); // 100ms delay between each card
        });

        // Remove scroll listener once animated
        window.removeEventListener('scroll', handleScroll);
    }
};

// Horizontal scroll on hover
const enableHorizontalScroll = () => {
    isHoveringCards.value = true;
};

const disableHorizontalScroll = () => {
    isHoveringCards.value = false;
    scrollDistance = 0;
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
};

// Handle wheel event for horizontal scrolling
const handleWheel = (e) => {
    if (!isHoveringCards.value) return;

    e.preventDefault();
    const container = cardAreaRef.value;
    if (!container) return;

    // Increased multiplier for more sensitive scrolling
    anime({
        targets: container,
        scrollLeft: container.scrollLeft + (e.deltaY * 5), // Increased from 2 to 3.5
        duration: 250, // Reduced duration for snappier response
        easing: 'easeOutCubic'
    });
};

// Modal handlers
const openEventDetails = (event) => {
    selectedEvent.value = event;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    selectedEvent.value = null;
};

const handleModalClose = () => {
    closeModal();
};

const handleLoginSuccess = async () => {
    isAuthenticated.value = true;
    await loadRecommendedEvents();
    closeModal();
};

// Lifecycle hooks
onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    cardAreaRef.value?.addEventListener('wheel', handleWheel, { passive: false });

    loadRecommendedEvents();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            isAuthenticated.value = true;
            loadRecommendedEvents();
        } else {
            isAuthenticated.value = false;
            featuredEvents.value = [];
            visibleCards.value = [];
        }
    });
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
    cardAreaRef.value?.removeEventListener('wheel', handleWheel);
    disableHorizontalScroll();
});
</script>

<style scoped>
.events-viewport {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column; /* Stack children vertically */
  justify-content: center; /* Center everything vertically */
  padding: 2rem 0;
}

.header-section {
  text-align: center;
  padding: 1rem;
}

.main-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
}

.card-area {
    display: flex;
    padding:0 1rem;
    margin-bottom: 1.5rem;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    align-items: center;
    gap: 1rem;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-top: 1rem;
    padding-bottom: 1rem;
}

.card-area::-webkit-scrollbar {
    display: none;
}

.card-wrapper {
    flex: 0 0 auto;
    width: 100%;
    max-width: 350px;
    opacity: 0;
    will-change: opacity;
    scroll-snap-align: start;
    margin: 0 auto;
}

.card-wrapper.visible {
    opacity: 1;
    transition: opacity 0.5s ease;
}

/* Preserve card hover effects */
:deep(.event-card) {
    transition: transform 0.2s;
}

:deep(.event-card:hover) {
    transform: translateY(-5px);
}

/* Optional scroll indicator */
.card-area::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 50px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.9));
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
}

.card-area:hover::after {
    opacity: 1;
}

/* Tablet view: 2 cards per row */
@media (min-width: 768px) {
  .card-area {
    padding: 0 2rem;
    gap: 1.5rem;
  }
  
  .card-wrapper {
    width: calc((100% - 1.5rem) / 2);
  }
}

/* Desktop view: 3 cards per row */
@media (min-width: 1024px) {
  .card-area {
    padding: 0 max(2rem, calc((100vw - (350px * 3) - 4rem) / 2));
    gap: 2rem;
  }
  
  .card-wrapper {
    width: calc((100% - 4rem) / 3);
  }
}

/* Optional: Large Desktop view: 4 cards per row */
@media (min-width: 1440px) {
  .card-wrapper {
    width: calc((100% - 6rem) / 4);
  }
}
</style>