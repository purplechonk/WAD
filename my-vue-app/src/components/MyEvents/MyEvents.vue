<template>
  <div>
    <!-- Title -->
    <h1 class="text-blue-400 text-4xl">Your Events</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8 text-gray-300">
      Loading your events...
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center py-8 text-red-500">
      {{ error }}
    </div> 

    <!-- Content when loaded -->
    <div v-if="!loading && !error">
      <!-- Upcoming Events Section -->
      <div class="upcoming-events mb-12">
        <h2 class="text-blue-400 text-3xl mb-6">Upcoming Events</h2>
        <div v-if="upcomingEvents.length > 0" class="event-grid">
          <EventCard
            v-for="event in upcomingEvents"
            :key="event.id"
            :event="event"
            @show-details="showEventDetails"
          />
        </div>
        <div v-else class="bg-gray-800 rounded-lg p-6 text-center text-gray-300">
          You have no upcoming events.
        </div>
      </div>

      <!-- Past Events Section -->
      <div class="past-events mb-12">
        <h2 class="text-blue-400 text-3xl mb-6">Past Events</h2>
        <div v-if="pastEvents.length > 0" class="event-grid">
          <EventCard
            v-for="event in pastEvents"
            :key="event.id"
            :event="event"
            @show-details="showEventDetails"
          />
        </div>
        <div v-else class="bg-gray-800 rounded-lg p-6 text-center text-gray-300">
          You have no past events.
        </div>
      </div>

      <!-- Saved Events Section -->
      <div class="saved-events mb-12" id="saved_events">
        <h2 class="text-blue-400 text-3xl mb-6">Saved Events</h2>
        <div v-if="savedEvents.length > 0" class="event-grid">
          <EventCard
            v-for="event in savedEvents"
            :key="event.id"
            :event="event"
            @show-details="showEventDetails"
          />
        </div>
        <div v-else class="bg-gray-800 rounded-lg p-6 text-center text-gray-300">
          You have no saved events.
        </div>
      </div>
    </div>

    <!-- Event Detail Modal -->
    <EventDetailModal
      v-if="selectedEvent"
      :event="selectedEvent"
      @close="closeEventDetails"
      @rsvp-cancelled="handleRSVPCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { db, auth } from '../../firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import EventCard from '../General/EventCard.vue';
import EventDetailModal from '../General/EventDetailModal.vue';

// Reactive state variables
const upcomingEvents = ref([]);
const pastEvents = ref([]);
const savedEvents = ref([]);
const selectedEvent = ref(null);
const loading = ref(true);
const error = ref(null);

// Firestore Real-Time Listener
let unsubscribe = null;

/**
 * Helper function to parse date strings from DD/MM/YYYY format
 * Converts to JavaScript Date objects
 */
const parseDate = (dateStr) => {
  try {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month}-${day}T${timePart}`);
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return new Date(dateStr); // Fallback to direct parsing
  }
};

/**
 * Sets up a real-time listener on the user's document to fetch events dynamically
 */
const fetchUserEvents = () => {
  const user = auth.currentUser;
  if (!user) {
    console.log('No user signed in for MyEvents');
    error.value = 'Please sign in to view your events';
    loading.value = false;
    return;
  }

  console.log('Current user:', user.uid);

  // Get user document reference
  const userDocRef = doc(db, 'user_records', user.uid);

  // Set up real-time listener
  unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log('User data:', userData);

      const signedUpEventIds = Object.values(userData.signed_up_events || {});
      const savedEventIds = Object.values(userData.saved_events || {});

      console.log('Signed up event IDs:', signedUpEventIds);
      console.log('Saved event IDs:', savedEventIds);

      // Function to fetch event details using Promise.all for efficiency
      const fetchEvents = async (eventIds) => {
        if (eventIds.length === 0) return [];
        const eventPromises = eventIds.map(eventId => getDoc(doc(db, 'events', eventId)));
        const eventDocs = await Promise.all(eventPromises);
        const events = eventDocs
          .filter(doc => doc.exists())
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            parsed_end_date: parseDate(doc.data().end_date_time),
            parsed_start_date: parseDate(doc.data().start_date_time)
          }));
        return events;
      };

      // Fetch signed up events
      let events = [];
      if (signedUpEventIds.length > 0) {
        events = await fetchEvents(signedUpEventIds);
      }

      // Split events into upcoming and past
      upcomingEvents.value = events
        .filter(event => event.parsed_end_date >= window.CURRENT_DATE)
        .sort((a, b) => a.parsed_start_date - b.parsed_start_date);

      pastEvents.value = events
        .filter(event => event.parsed_end_date < window.CURRENT_DATE)
        .sort((a, b) => b.parsed_end_date - a.parsed_end_date);

      console.log('Upcoming events:', upcomingEvents.value);
      console.log('Past events:', pastEvents.value);

      // Fetch saved events
      let savedEventsList = [];
      if (savedEventIds.length > 0) {
        savedEventsList = await fetchEvents(savedEventIds);
      }

      // Sort saved events by start date
      savedEvents.value = savedEventsList
        .sort((a, b) => a.parsed_start_date - b.parsed_start_date);

      console.log('Saved events:', savedEvents.value);
    } else {
      console.log('No user document found');
      error.value = 'User record not found';
      upcomingEvents.value = [];
      pastEvents.value = [];
      savedEvents.value = [];
    }

    loading.value = false;
  }, (err) => {
    console.error('Error fetching user events:', err);
    error.value = 'Failed to load events. Please try again later.';
    loading.value = false;
  });
};

/**
 * Handler for RSVP cancellation
 * Refreshes the events by relying on the real-time listener
 */
const handleRSVPCancel = async () => {
  console.log('RSVP cancelled, refreshing events...');
  // No need to manually fetch events since onSnapshot handles it
};

/**
 * Event detail handlers
 */
const showEventDetails = (event) => {
  selectedEvent.value = event;
};

const closeEventDetails = () => {
  selectedEvent.value = null;
};

/**
 * Cleanup function to unsubscribe from Firestore listener when component unmounts
 */
onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

/**
 * Initialize component by setting up the real-time listener
 */
onMounted(() => {
  fetchUserEvents();
});
</script>

<style scoped>

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.upcoming-events,
.past-events,
.saved-events { /* Added saved-events */
  margin-bottom: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #2D3748;
}
</style>
