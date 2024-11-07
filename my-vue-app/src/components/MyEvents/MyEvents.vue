myevents.vue
<template>
  <div class="min-vh-100">
    <!-- Hero Section with Gradient Background -->
    <div class="mb-4">
      <div class="container">
        <div class="text-center">
          <h1 class="display-4 fw-bold" style="color: #8257ff;">Your Events</h1>
          <p class="text-muted lead">Manage your saved, upcoming, and past events effortlessly.</p>
        </div>
      </div>
    </div>


    <!-- Main Content -->
    <div class="container py-5">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-grow" style="color: #8257ff;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-3">Loading your events...</p>
      </div>


      <!-- Error State -->
      <div v-if="error" class="alert alert-danger rounded-4 text-center shadow-sm">
        {{ error }}
      </div>


      <!-- Events Content -->
      <div v-if="!loading && !error">
        <!-- Event Type Tabs -->
        <ul class="nav nav-tabs nav-fill mb-4 gap-2" role="tablist">
          <li class="nav-item">
            <button class="nav-link rounded-3 px-4" :class="{ active: openSection === 'saved' }"
              @click="toggleSection('saved')" style="color: #8257ff;">
              <i class="bi bi-bookmark-heart me-2"></i>
              Saved Events
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link rounded-3 px-4" :class="{ active: openSection === 'upcoming' }"
              @click="toggleSection('upcoming')" style="color: #8257ff;">
              <i class="bi bi-calendar-check me-2"></i>
              Upcoming Events
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link rounded-3 px-4" :class="{ active: openSection === 'past' }"
              @click="toggleSection('past')" style="color: #8257ff;">
              <i class="bi bi-calendar-x me-2"></i>
              Past Events
            </button>
          </li>
        </ul>


        <!-- Event Cards -->
        <div class="tab-content">
          <div v-for="(events, type) in { saved: savedEvents, upcoming: upcomingEvents, past: pastEvents }" :key="type"
            class="tab-pane fade" :class="{ 'show active': openSection === type }">
            <div v-if="events.length" class="row g-4">
              <div v-for="event in events" :key="event.id" class="col-md-6 col-lg-4">
                <div class="card h-100 border-0 shadow-sm hover-lift bg-secondary" @click="showEventDetails(event)"
                  style="cursor: pointer;">
                  <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="badge" :class="'text-white bg-primary'">
                        {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                      </span>
                    </div>
                    <div class="row justify-content-between">
                    <div class="col-8">
                      <h5 class="card-title fw-bold mb-3" style="color: #8257ff;">
                        {{ event.event_name }}
                      </h5>
                    </div>

                    <div class="col-1 me-4">
                      <SaveButton :eventId="event.id" :eventName="event.event_name" />
                    </div>

                  </div>
                  <div class="text-muted mb-2">
                    <i class="bi bi-calendar3 me-2"></i>
                    {{ event.start_date_time }}
                  </div>
                  <div class="text-muted">
                    <i class="bi bi-geo-alt me-2"></i>
                    {{ event.venue }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-5">
            <div class="mb-3">
              <i class="bi bi-calendar-x display-1 text-muted"></i>
            </div>
            <h4 class="text-muted">No {{ type }} events</h4>
            <p class="text-muted mb-0">Check back later for updates!</p>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- Event Detail Modal -->
  <EventDetailModal v-if="selectedEvent" :event="selectedEvent" @close="closeEventDetails"
    @rsvp-cancelled="handleRSVPCancel" />
  </div>
</template>






<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db, auth } from '../../firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import EventDetailModal from '../General/EventDetailModal.vue';
import SaveButton from '../General/SaveButton.vue';

const openSection = ref('saved'); // Keeps track of the currently open section


// Functions to handle toggling sections
const toggleSection = (section) => {
  openSection.value = openSection.value === section ? null : section;
};


// Helper function to parse date strings
const parseDateTime = (dateTimeStr) => {
  try {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month}-${day}T${timePart}`);
  } catch (error) {
    console.error('Invalid dateTimeStr format:', dateTimeStr);
    return null;
  }
};


// Reactive state variables
const upcomingEvents = ref([]);
const pastEvents = ref([]);
const savedEvents = ref([]);
const selectedEvent = ref(null);
const loading = ref(true);
const error = ref(null);


// Firestore Real-Time Listener
let unsubscribe = null;


// Constants
const CURRENT_DATE = new Date('2024-02-01T00:00:00');


// Format dates for display
const formatDate = (dateString) => {
  return dateString.slice(0, 10);
};


// Fetch user events function
const fetchUserEvents = () => {
  const user = auth.currentUser;
  if (!user) {
    console.log('No user signed in for MyEvents');
    error.value = 'Please sign in to view your events';
    loading.value = false;
    return;
  }


  console.log('Current user:', user.uid);
  const userDocRef = doc(db, 'user_records', user.uid);


  unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
    try {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log('User data:', userData);


        const signedUpEventIds = Object.values(userData.signed_up_events || {});
        const savedEventIds = Object.values(userData.saved_events || {});


        console.log('Signed up event IDs:', signedUpEventIds);
        console.log('Saved event IDs:', savedEventIds);


        // Function to fetch events using Promise.all
        const fetchEvents = async (eventIds) => {
          if (eventIds.length === 0) return [];
          const eventPromises = eventIds.map(eventId =>
            getDoc(doc(db, 'events', eventId))
          );
          const eventDocs = await Promise.all(eventPromises);
          return eventDocs
            .filter(doc => doc.exists())
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              parsed_end_date: parseDateTime(doc.data().end_date_time),
              parsed_start_date: parseDateTime(doc.data().start_date_time)
            }));
        };


        // Fetch signed up events
        let events = await fetchEvents(signedUpEventIds);


        // Split events into upcoming and past
        upcomingEvents.value = events
          .filter(event => event.parsed_end_date >= CURRENT_DATE)
          .sort((a, b) => a.parsed_start_date - b.parsed_start_date);


        pastEvents.value = events
          .filter(event => event.parsed_end_date < CURRENT_DATE)
          .sort((a, b) => b.parsed_end_date - a.parsed_end_date);

        // Fetch saved events
        let savedEventsList = await fetchEvents(savedEventIds);
        savedEvents.value = savedEventsList.filter(event => event.parsed_end_date > CURRENT_DATE).sort((a, b) =>
          a.parsed_start_date - b.parsed_start_date
        );


      } else {
        console.log('No user document found');
        error.value = 'User record not found';
        upcomingEvents.value = [];
        pastEvents.value = [];
        savedEvents.value = [];
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      error.value = 'Failed to load events. Please try again later.';
    } finally {
      loading.value = false;
    }
  }, (err) => {
    console.error('Error fetching user events:', err);
    error.value = 'Failed to load events. Please try again later.';
    loading.value = false;
  });
};


// Event handlers
const showEventDetails = (event) => {
  selectedEvent.value = event;
};


const closeEventDetails = () => {
  selectedEvent.value = null;
};


const handleRSVPCancel = async () => {
  console.log('RSVP cancelled, refreshing events...');
  // No need to manually fetch events since onSnapshot handles it
};


// Lifecycle hooks
onMounted(() => {
  fetchUserEvents();
});


onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
</script>


<style scoped>
.hover-lift {
  transition: transform 0.2s, box-shadow 0.2s;
}


.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(130, 87, 255, 0.1) !important;
}


.nav-link.active {
  background-color: #f3f0ff !important;
  color: #8257ff !important;
  border-color: #8257ff !important;
}


.nav-link:hover:not(.active) {
  border-color: transparent !important;
  background-color: #f8f6ff !important;
}


.badge {
  font-weight: 500;
  padding: 0.5em 1em;
}


:root {
  --purple-primary: #8c52ff;
  --purple-secondary: #5e17eb;
}


.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}


.accordion-button {
  color: var(--purple-primary);
  background-color: #f9f9f9;
  font-size: 1.25rem;
}






.accordion-button:not(.collapsed) {
  color: var(--purple-secondary);
  background-color: #f5f5ff;
}


.section-header {
  background: var(--purple-primary);
  color: white;

  padding: 1rem;
  border: none;
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 1.2rem;
  border-radius: 10px;
}


.section-header:hover {
  background: var(--purple-secondary);
}


.events-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


.event-row {
  display: flex;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  padding: 1rem;
}


.event-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
}


.event-middle {
  flex-grow: 1;
  padding: 1rem;
}


.event-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--purple-primary);
  margin-bottom: 0.75rem;
}


.event-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}


.category-badge {
  display: inline-block;
  background-color: rgba(140, 82, 255, 0.125);
  color: var(--purple-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid rgba(140, 82, 255, 0.25);
}


.timeline-container {
  margin-top: 1rem;
}


.timeline-entry {
  margin-bottom: 0.75rem;
}


.date-value {
  font-size: 0.85rem;
  color: #333;
  margin: 0.1rem 0 0;
}


.venue-value {
  font-size: 0.85rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}


.logo {
  width: 20px;
  height: 20px;
}


@media (max-width: 768px) {
  .event-row {
    flex-direction: column;
  }


  .event-middle {
    padding: 1rem 0;
  }
}
</style>