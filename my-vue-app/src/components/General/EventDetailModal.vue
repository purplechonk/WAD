<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <!-- Close Button (X) -->
      <button class="close-button" @click="closeModal">&times;</button>

      <div class="modal-body">
        <h2>{{ event.event_name }}</h2>
        <p><strong>Categories:</strong> {{ event.category.join(', ') }}</p>
        <p><strong>Start:</strong> {{ event.start_date_time }}</p>
        <p><strong>End:</strong> {{ event.end_date_time }}</p>
        <p><strong>Venue:</strong> {{ event.venue }}</p>
        <p><strong>Description:</strong> {{ event.description }}</p>
        <p><strong>Participants:</strong> {{ event.no_of_signups }} / {{ event.max_participants }}</p>

        <!-- SAVE BUTTON -->
        <SaveButton :eventId="event.id" :eventName="event.event_name" />

        <!-- Loading state to prevent jitter -->
        <div v-if="loading" class="loading-placeholder"></div>

        <!-- Prevent content shift by setting fixed height for the sign-up area -->
        <div v-if="!loading" style="min-height: 50px;">
          <!-- Show "You Have Signed Up" message if user has signed up -->
          <p v-if="hasSignedUp" class="signed-up-message">You Have Signed Up</p>
          
          <!-- Cancel RSVP button or Event Ended badge -->
          <div v-if="hasSignedUp">
            <button v-if="!isEventEnded" class="btn btn-danger mt-2" @click="openCancelRSVPModal">
              Cancel RSVP
            </button>
            <span v-else class="badge bg-secondary mt-2" style="font-size: 1rem;">
              Event Ended
            </span>
          </div>

          <!-- If user is authenticated and not signed up, show Sign Up button -->
          <div v-if="isAuthenticated && !hasSignedUp">
            <button class="btn btn-primary mt-3" @click="openSignUpForm">Sign Up</button>
          </div>

          <!-- If user is not authenticated, show Login to Proceed button -->
          <div v-else-if="!isAuthenticated">
            <button class="btn btn-secondary mt-3" @click="openLoginModal">Login to Proceed</button>
          </div>
        </div>

        <Map :location="event.Geocode"/>

        <!-- Sign-Up Form Modal -->
        <SignUpFormModal
          v-if="showSignUpForm"
          @close="closeSignUpForm"
          @submitted="onSignUpSubmitted"
          @view-my-events="handleViewMyEvents"
          :eventId="event.id"
          :userId="userId"
        />

        <!-- Login Modal -->
        <Login v-if="showLoginModal" @close="closeLoginModal" @login-success="handleLoginSuccess" />

        <!-- Cancel RSVP Confirmation Modal -->
        <div v-if="showCancelRSVPModal" class="small-modal-overlay" @click.self="closeCancelRSVPModal">
          <div class="small-modal-dialog">
            <div class="small-modal-content p-4 text-center">
              <!-- Close Button (X) -->
              <button class="close-button" @click="closeCancelRSVPModal">&times;</button>

              <h3>Are you sure you want to cancel your RSVP?</h3>
              <button class="btn btn-danger mt-3" @click="confirmCancelRSVP">Confirm Cancel</button>
              <button class="btn btn-secondary mt-3" @click="closeCancelRSVPModal">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Successfully Cancelled Modal -->
        <div v-if="showSuccessModal" class="small-modal-overlay">
          <div class="small-modal-dialog">
            <div class="small-modal-content p-4 text-center">
              <!-- Close Button (X) -->
              <button class="close-button" @click="closeSuccessModal">&times;</button>
              <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
              <h3>RSVP Cancelled Successfully!</h3>
              <p>Your RSVP has been cancelled.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import SignUpFormModal from './SignUpFormModal.vue';
import Login from '../Login/Login.vue';
import SaveButton from './SaveButton.vue';
import { hasUserSignedUpForEvent } from '../../composables/fetchEvents';
import { cancelRSVPInDatabase } from '../../composables/eventActions';
import { useRouter } from 'vue-router'; // Import Vue Router for navigation
import Map from './Map.vue';

// Helper function to parse date string
const parseDateTime = (dateTimeStr) => {
  // Expected format: "13/01/2024 16:30:00"
  const [datePart, timePart] = dateTimeStr.split(' ');
  
  if (!datePart || !timePart) {
    console.error('Invalid dateTimeStr format:', dateTimeStr);
    return null;
  }
  
  const [day, month, year] = datePart.split('/');
  const [hours, minutes, seconds] = timePart.split(':');
  
  // Convert all parts to integers
  const dayInt = parseInt(day, 10);
  const monthInt = parseInt(month, 10) - 1; // Months are 0-indexed in JS
  const yearInt = parseInt(year, 10);
  const hoursInt = parseInt(hours, 10);
  const minutesInt = parseInt(minutes, 10);
  const secondsInt = parseInt(seconds, 10);
  
  // Validate all parts
  if (
    isNaN(dayInt) || isNaN(monthInt) || isNaN(yearInt) ||
    isNaN(hoursInt) || isNaN(minutesInt) || isNaN(secondsInt)
  ) {
    console.error('Invalid numerical values in dateTimeStr:', dateTimeStr);
    return null;
  }
  
  return new Date(yearInt, monthInt, dayInt, hoursInt, minutesInt, secondsInt);
};

// Props and Emits
const props = defineProps({
  event: Object,
});

const emit = defineEmits(['close', 'rsvp-cancelled']);

// Initialize router
const router = useRouter();

// State
const showSignUpForm = ref(false);
const showLoginModal = ref(false);
const showCancelRSVPModal = ref(false);
const showSuccessModal = ref(false);
const hasSignedUp = ref(false);
const isAuthenticated = ref(false);
const userId = ref(null);
const loading = ref(true);
const progress = ref(100);

// Computed Property to Check if the Event has Ended
const isEventEnded = computed(() => {
  // Ensure window.CURRENT_DATE is defined
  if (!window.CURRENT_DATE) {
    console.warn('window.CURRENT_DATE is not defined. Using current system date.');
    window.CURRENT_DATE = new Date().toISOString();
  }

  // Parse the current date and event end date
  const currentDate = new Date(window.CURRENT_DATE);
  const eventEndDate = parseDateTime(props.event.end_date_time);
  
  if (!eventEndDate) {
    // If parsing failed, assume the event has not ended
    return false;
  }

  // Return true if the event has ended
  return eventEndDate < currentDate;
});

// Cancel RSVP process
const cancelRSVP = async () => {
  try {
    await cancelRSVPInDatabase(props.event.id, userId.value);
    props.event.no_of_signups -= 1;
    hasSignedUp.value = false;
    emit('rsvp-cancelled', props.event.id);
  } catch (error) {
    console.error('Error canceling RSVP:', error);
    // Optionally, notify the user of the error
  }
};

// Modal handlers
const closeModal = () => {
  emit('close');
};

const openSignUpForm = () => {
  showSignUpForm.value = true;
};

const closeSignUpForm = () => {
  showSignUpForm.value = false;
};

const openLoginModal = () => {
  showLoginModal.value = true;
};

const closeLoginModal = () => {
  showLoginModal.value = false;
};

const openCancelRSVPModal = () => {
  showCancelRSVPModal.value = true;
};

const closeCancelRSVPModal = () => {
  showCancelRSVPModal.value = false;
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  emit('rsvp-cancelled', props.event.id);
  closeModal();
};

const onSignUpSubmitted = () => {
  hasSignedUp.value = true;
  props.event.no_of_signups += 1;
};

// Confirm Cancel RSVP
const confirmCancelRSVP = async () => {
  await cancelRSVP();
  closeCancelRSVPModal();
  showSuccessModal.value = true;
  startCountdown();
};

// Countdown timer
const startCountdown = () => {
  progress.value = 100;
  const interval = setInterval(() => {
    progress.value -= 10;
    if (progress.value <= 0) {
      clearInterval(interval);
      closeSuccessModal();
    }
  }, 300);
};

// Scroll to Upcoming Events Section
const scrollToUpcomingEventsSection = async () => {
  const maxAttempts = 5;
  const attemptScroll = async (attempt = 0) => {
    if (attempt >= maxAttempts) return;

    await nextTick();
    const upcomingEventsSection = document.getElementById('upcoming_events');

    if (upcomingEventsSection) {
      setTimeout(() => {
        upcomingEventsSection.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setTimeout(() => attemptScroll(attempt + 1), 200 * (attempt + 1));
    }
  };

  await attemptScroll();
};

// Handle the 'view-my-events' event from SignUpFormModal
const handleViewMyEvents = async () => {
  // Close the EventDetailModal
  emit('close');

  if (router.currentRoute.value.path !== '/my-events') {
    await router.push('/my-events');
    await scrollToUpcomingEventsSection();
  } else {
    await scrollToUpcomingEventsSection();
  }
};

// Initialize
onMounted(async () => {
  hasSignedUp.value = await hasUserSignedUpForEvent(props.event.id);
  loading.value = false;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      isAuthenticated.value = true;
      userId.value = user.uid;
      showLoginModal.value = false;
      hasSignedUp.value = await hasUserSignedUpForEvent(props.event.id);
    } else {
      isAuthenticated.value = false;
      userId.value = null;
      hasSignedUp.value = false;
    }
  });
});
</script>

<style scoped>
/* Main Event Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: blueviolet;
  border-radius: 10px;
  width: 90%;
  height: 80vh;
  max-width: 900px;
  padding: 30px;
  position: fixed;
  bottom: 0;
  max-height: 90vh;
  overflow-y: auto;
}

/* Small modals for Cancel and Success */
.small-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's above the main modal */
}

.small-modal-dialog {
  background-color: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  padding: 20px;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
}

.close-button:hover {
  color: #ff0000;
}

.signed-up-message {
  color: red;
  font-weight: bold;
  margin-top: 20px;
}

/* Loading placeholder */
.loading-placeholder {
  height: 50px;
}

/* Progress bar for countdown */
.progress-bar {
  height: 5px;
  background-color: #28a745;
  transition: width 0.3s linear;
}

/* Style for the "Event Ended" badge */
.badge {
  display: inline-block;
  padding: 0.5em 1em;
  font-weight: 600;
  border-radius: 0.25rem;
  color: #fff;
  background-color: #6c757d; /* Bootstrap's secondary color */
}

/* If using a custom class */
.event-ended-badge {
  background-color: #6c757d;
  color: #fff;
  padding: 0.5em 1em;
  border-radius: 0.25rem;
  font-size: 1rem;
}
</style>
