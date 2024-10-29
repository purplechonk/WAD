/* eslint-disable */
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
import { ref, onMounted } from 'vue';
import { db, auth } from '../../firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import EventCard from '../General/EventCard.vue';
import EventDetailModal from '../General/EventDetailModal.vue';

// State
const upcomingEvents = ref([]);
const pastEvents = ref([]);
const selectedEvent = ref(null);
const loading = ref(true);
const error = ref(null);

// Helper function to parse date strings from DD/MM/YYYY format
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

// Fetch user's events
const fetchUserEvents = async () => {
  loading.value = true;
  error.value = null;

  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user signed in');
      error.value = 'Please sign in to view your events';
      return;
    }

    console.log('Current user:', user.uid);

    // Get user document
    const userDocRef = doc(db, 'user_records', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log('No user document found');
      error.value = 'User record not found';
      return;
    }

    const userData = userDoc.data();
    console.log('User data:', userData);

    const signedUpEventIds = Object.values(userData.signed_up_events || {});
    console.log('Signed up event IDs:', signedUpEventIds);

    if (signedUpEventIds.length === 0) {
      console.log('No signed up events');
      upcomingEvents.value = [];
      pastEvents.value = [];
      return;
    }

    // Fetch each event individually
    const events = [];
    for (const eventId of signedUpEventIds) {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        console.log(`Event ${eventId} data:`, eventData);
        events.push({
          id: eventDoc.id,
          ...eventData,
          parsed_end_date: parseDate(eventData.end_date_time),
          parsed_start_date: parseDate(eventData.start_date_time)
        });
      }
    }

    console.log('All fetched events:', events);

    // Split events into upcoming and past
    upcomingEvents.value = events
      .filter(event => event.parsed_end_date >= window.CURRENT_DATE)
      .sort((a, b) => a.parsed_start_date - b.parsed_start_date);

    pastEvents.value = events
      .filter(event => event.parsed_end_date < window.CURRENT_DATE)
      .sort((a, b) => b.parsed_end_date - a.parsed_end_date);

    console.log('Upcoming events:', upcomingEvents.value);
    console.log('Past events:', pastEvents.value);

  } catch (err) {
    console.error('Error fetching events:', err);
    error.value = 'Failed to load events. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Add the handler for RSVP cancellation
const handleRSVPCancel = async () => {
  console.log('RSVP cancelled, refreshing events...');
  await fetchUserEvents(); // Refresh the events list
};

// Event detail handlers
const showEventDetails = (event) => {
  selectedEvent.value = event;
};

const closeEventDetails = () => {
  selectedEvent.value = null;
};


// Initialize component
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
.past-events {
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