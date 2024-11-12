<template>
  <div class="modal-overlay" @click.self="closeModal">

    <div class="forms-modals">
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
            <div class="small-modal-content">
              <h3>Cancel Registration</h3>
              <p>Are you sure you want to cancel your registration for this event?</p>
              <div class="modal-buttons">
                <button class="btn btn-danger" @click="confirmCancelRSVP">
                  Confirm Cancel
                </button>
                <button class="btn btn-secondary" @click="closeCancelRSVPModal">
                  Keep Registration
                </button>
              </div>
            </div>
          </div>
        </div>


        <!-- Successfully Cancelled Modal -->
        <div v-if="showSuccessModal" class="small-modal-overlay">
          <div class="small-modal-dialog success">
            <div class="small-modal-content">
              <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
              <h3>Registration Cancelled</h3>
              <p>Your event registration has been successfully cancelled.</p>
            </div>
          </div>
        </div>
    </div>
    
    <img 
      :src="event.image_url" 
      alt="image" 
      class="card__img_info"
    >
    <div class="modal-content">
      <!-- Sticky Header -->
      <div class="modal-header">
          <div class="header-content">
            <button class="close-button" @click="closeModal">&times;</button>
            <div class="title-row">
              <h2>{{ event.event_name }}</h2>
              <SaveButton :eventId="event.id" :eventName="event.event_name" />
            </div>
            
            <!-- Loading state -->
            <div v-if="loading" class="loading-placeholder"></div>

             <!-- Sign up area - Only render if has content -->
            <div v-else-if="hasSignedUp" class="sign-up-container">
              <span class="signed-up-message">You signed up for this event!</span>
              
            </div>
          </div>
      </div>

      <!-- Scrollable Content -->
      <div class="modal-scroll-content">
        <div class="modal-body">
          <!-- Left Column -->
          <div class="left-column">
            <span v-if="isEventEnded" class="badge bg-secondary" style="opacity: 1;">
              Event Ended
            </span>
            <!-- Time + Venue Section -->
            <div class="event-details-section">
                <div class="timeline-container">
                  <div class="timeline-entry">
                    <div class="timeline-date">
                      <p class="date-label">Start</p>
                      <p class="date-value">{{ event.start_date_time }}</p>
                    </div>
                  </div>
                  <div class="timeline-entry">
                    <div class="timeline-date">
                      <p class="date-label">End</p>
                      <p class="date-value">{{ event.end_date_time }}</p>
                    </div>
                  </div>
                </div>
                <p class="venue-value">
                  <img src="../../assets/images/location-pin.svg" alt="Logo" />
                  {{ event.venue }}
                </p>      
            </div>
            <div v-if="!loading" style="min-height: 50px;">
                  <div v-if="hasSignedUp">
                    <button v-if="!isEventEnded" class="btn btn-danger mt-2" @click="openCancelRSVPModal">
                      Cancel Registration
                    </button>
                  </div>

                  <div v-if="isAuthenticated && !hasSignedUp">
                    <button class="btn btn-primary mt-3" @click="openSignUpForm">Sign Up</button>
                  </div>

                  <div v-else-if="!isAuthenticated">
                    <button class="btn btn-secondary mt-3" @click="openLoginModal">Login to Proceed</button>
                  </div>    
            </div>    
          </div>

          <!-- Right Column -->
          <div class="right-column">
            <!-- Description Box -->
            <div class="description-box">
                <!-- Categories Section -->
                <div class="categories-row">
                    <div 
                      v-for="(category, index) in event.category" 
                      :key="index" 
                      class="category-badge"
                    >
                      {{ category }}
                    </div>
                </div>
                <p>{{ event.description }}</p>
                <br>
                <Map :location="event.Geocode"/>
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
/* Base styles */
.modal-overlay {
  position: fixed;
  top: 0px;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.504);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2001;
  backdrop-filter: blur(8px);
}

.forms-modals {
  z-index: 2005;
}

.card__img_info {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  max-height: 80vh;
  object-fit: contain;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

/* Left column styles */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;  /* Vertical spacing between categories and time+venue */
  position: sticky; /* Add this */
  top: 0; /* Add this */
  height: fit-content; /* Add this */
  padding-right: 1rem; /* Add some padding */
}

/* Right column for description */
.right-column {
  margin-bottom: 1rem;
  padding-left: 1rem;  /* Add some space from the left column */
  overflow-y: auto; /* Add scroll to right column only */
  max-height: calc(80vh - 18rem); /* Adjust based on your header height */
  scrollbar-width: thin;
  scrollbar-color: #8c52ff #DEDCF4;
  padding-bottom: 1rem; /* Add padding at bottom */

}

/* Add scrollbar styles for right column */
.right-column::-webkit-scrollbar {
  width: 8px;
}

.right-column::-webkit-scrollbar-track {
  background: #DEDCF4;
  border-radius: 4px;
}

.right-column::-webkit-scrollbar-thumb {
  background: #8c52ff;
  border-radius: 4px;
}

.modal-content {
  background: linear-gradient(145deg, #DEDCF4, #f0f0f8);
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  height: 80vh;
  max-width: 850px;
  position: relative;
  z-index: 2002;
  box-shadow: 5px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* .modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #DEDCF4;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #8c52ff;
  border-radius: 4px;
} */

.modal-body {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: 35% 65%;
  gap: -1rem;
  height: 100%; /* Add this */
  position: relative; /* Add this */
}

.modal-body h2 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #8c52ff, #5E17EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.modal-body p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0.5rem 0;
  color: #333;
}

.modal-body p strong {
  color: #8c52ff;
  font-weight: 600;
  margin-right: 0.5rem;
}

/* Header styles */
.modal-header {
  position: sticky;
  top: 0;
  background: linear-gradient(145deg, #DEDCF4, #f0f0f8);
  padding: 20px 40px 5px;
  z-index: 2003;
  border-bottom: 1px solid rgba(140, 82, 255, 0.1);
}

.header-content {
  display: flex;
  flex-direction: column;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-right: 6rem;
  margin-bottom: 0; /* Remove margin */
}

.title-row h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #8c52ff, #5E17EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  flex: 1;
}

/* section for time & venue */
.event-details-section {
  width: 100%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(140, 82, 255, 0.1);
  border: 1px solid rgba(140, 82, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
}  

.end-event-container {
  width: 100%;
  position: relative;
  transition: all 0.3s ease;
}

/* Timeline section */
.timeline-container {
  padding: 1.5rem 1rem 0.05rem 0.1rem ;
  position: relative;
}

/* connecting line */
.timeline-container::before {
  content: "";
  position: absolute;
  left: 2.57rem;
  top: 2rem;
  bottom: 3rem;
  width: 2.5px;
  background: linear-gradient(to bottom, #8c52ff 0%, #DEDCF4 100%);
  transform: translateX(-50%);
}

.timeline-entry {
  position: relative;
  margin-bottom: 1rem;
  padding-left: 15px;
}

/* circle */
.timeline-entry::before {
  content: "";
  position: absolute;
  left: -15px;
  margin-left: 3rem;
  top: 50%;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background-color: #DEDCF4;
  border: 2px solid #8c52ff;
  transform: translateY(-50%);
  box-shadow: 0 0 0 4px rgba(140, 82, 255, 0.1);
  z-index: 2; /* just to put the circle above the connecting line*/
}

.timeline-date .date-label {
  font-size: 0.95rem !important; /* Using !important to override */
  font-weight: 550;
  color: #8c52ff;
  text-transform: uppercase;
  margin: 0;
  padding-left: 3rem;
}

.timeline-date .date-value {
  font-size: 1rem !important; /* Using !important to override */
  color: #333;
  padding-left: 3rem;
}

.venue-value img {
  width: 1.2rem;
}

p.venue-value {
  padding: 0 1rem 0.8rem 1.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 1rem;
  color: #333;
  font-weight: 600;
} 


/* Description Box */
.description-box {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 10rem;
  box-shadow: 0 4px 15px rgba(140, 82, 255, 0.1);
  border: 1px solid rgba(140, 82, 255, 0.1);
  transition: all 0.3s ease;
}

.description-box p {
  margin: 0;
  font-size: 1rem;
}

/* Categories */
.categories-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
}

.category-badge {
  display: inline-flex;
  background-color: #8c52ff20;
  color: #8c52ff;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  border: 1px solid #8c52ff40;
}

.categories-row,
.event-details-section,
.description-box {
  width: 100%;
}

/* Scrollable Content */
.modal-scroll-content {
  /* overflow-y: auto; */
  padding: 0 40px 40px;
  /* scrollbar-width: thin;
  scrollbar-color: #8c52ff #DEDCF4; */
}

.modal-scroll-content::-webkit-scrollbar {
  width: 8px;
}

.modal-scroll-content::-webkit-scrollbar-track {
  background: #DEDCF4;
  border-radius: 4px;
}

.modal-scroll-content::-webkit-scrollbar-thumb {
  background: #8c52ff;
  border-radius: 4px;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  margin-bottom: 2rem;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.163);
}

.btn-primary {
  background: linear-gradient(45deg, #8c52ff, #5E17EB);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(45deg, #8c52ff9a, #5e17ebdb);
  transition: all 0.5s slow;
  color: white;
}

.btn-secondary {
  background: rgba(140, 82, 255, 0.1);
  color: #8c52ff;
}

.btn-secondary:hover {
  background: rgba(124, 61, 251, 0.188);
  color: #8c52ff;
}

.btn-danger {
  background: rgba(255, 82, 82, 0.1);
  color: #ff5252;
}

/* Close button */
.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 28px;
  background: white;
  border: none;
  color: #8c52ff;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(140, 82, 255, 0.2);
}

.close-button:hover {
  background: #8c52ff;
  color: white;
  transform: rotate(90deg);
}

/* Button container */
.modal-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.sign-up-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Status Messages */
.signed-up-message {
  color: #8c52ff;
  font-weight: bold;
  padding: 10px;
  background: rgba(140, 82, 255, 0.1);
  border-radius: 10px;
  text-align: center;
  margin: 0 0 1.5rem 0;
}

/* Loading State */
.loading-placeholder {
  height: 50px;
  background: linear-gradient(90deg, #DEDCF4, #f0f0f8, #DEDCF4);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Progress Bar */
/* Progress bar container */
.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(140, 82, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  margin-top: 0.5rem;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--progress, 100%);
  background: linear-gradient(45deg, #8c52ff, #5E17EB);
  transition: width 0.3s linear;
}

/* Badge */
.badge {
  display: inline-block;
  padding: 0.75em 1.5em;
  font-weight: 600;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(108, 117, 125, 0.2);
}

.bg-secondary {
  background: linear-gradient(45deg, #6c757d, #495057);
  opacity: 1; /* Ensure opacity is 1 */
}

.small-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.399);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2005;
}

/* Small Modal */
.small-modal-dialog {
  background: linear-gradient(145deg, #DEDCF4, #f0f0f8);
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  padding: 2.5rem 2rem;
  position: relative;
  box-shadow: 0 10px 30px rgba(140, 82, 255, 0.2);
  border: 1px solid rgba(140, 82, 255, 0.1);
  animation: modalAppear 0.3s ease-out;
  z-index: 2005;
}

/* Success modal specific styles */
.modal-dialog.success {
  padding: 2rem;
}

.small-modal-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.small-modal-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #8c52ff, #5E17EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.small-modal-content p {
  color: #333;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

/* Large screens (1201px - 1400px) */
@media screen and (min-width: 1201px) and (max-width: 1400px) {
  .modal-content {
    width: 55vw;
    height: 70vh;
  }

  .card__img_info {
    height: 70vh;
  }

  .modal-body {
    grid-template-columns: 40% 60%;
  }
}

/* Medium-large screens (993px - 1200px) */
@media screen and (min-width: 993px) and (max-width: 1200px) {
  .modal-content {
    width: 50vw;
    height: 65vh;
  }

  .card__img_info {
    width: auto;
    height: 65vh;
  }

  .modal-body {
    grid-template-columns: 45% 55%;
  }

  .timeline-container {
  padding: 1.5rem 0.5rem 0.05rem 0rem ;
  position: relative;
}

/* connecting line */
.timeline-container::before {
  content: "";
  position: absolute;
  left: 2rem;
  top: 2rem;
  bottom: 2.5rem;
  width: 2.5px;
  background: linear-gradient(to bottom, #8c52ff 0%, #DEDCF4 100%);
  transform: translateX(-50%);
}

.timeline-entry {
  position: relative;
  margin-bottom: 0.5rem;
  padding-left: 13px;
}

/* circle */
.timeline-entry::before {
  content: "";
  position: absolute;
  left: -15px;
  margin-left: 2.55rem;
  top: 50%;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background-color: #DEDCF4;
  border: 2px solid #8c52ff;
  transform: translateY(-50%);
  box-shadow: 0 0 0 4px rgba(140, 82, 255, 0.1);
  z-index: 2; /* just to put the circle above the connecting line*/
}

.timeline-date .date-label {
  font-size: 0.8rem !important; /* Using !important to override */
  font-weight: 550;
  color: #8c52ff;
  text-transform: uppercase;
  margin: 0;
  padding-left: 2.45rem;
}

.timeline-date .date-value {
  font-size: 0.8rem !important; /* Using !important to override */
  color: #333;
  padding-left: 2.45rem;
}

.venue-value img {
  width: 1rem;
}

p.venue-value {
  padding: 0 1rem 0.8rem 1.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
} 

.title-row h2 {
  font-size: 1.75rem;
}

/* Description Box */
.description-box {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(140, 82, 255, 0.1);
  border: 1px solid rgba(140, 82, 255, 0.1);
  transition: all 0.3s ease;
}

.description-box p {
  margin: 0;
}

.description-box strong {
  display: block;
  margin-bottom: 1rem;
  color: #8c52ff;
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Categories */
.categories-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
}

.category-badge {
  display: inline-flex;
  background-color: #8c52ff20;
  color: #8c52ff;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  border: 1px solid #8c52ff40;
}

.btn {
  font-size: 0.8rem;
}

.signed-up-message {
  font-size: 0.8rem;
}


}

/* Medium screens (769px - 992px) */
@media screen and (min-width: 769px) and (max-width: 992px) {
  .modal-content {
    width: 50vw;
    height: 50vh;
  }

  .modal-scroll-content {
  /* overflow-y: auto; */
  padding: 0 20px 20px;
}

.modal-header {
  position: sticky;
  top: 0;
  background: linear-gradient(145deg, #DEDCF4, #f0f0f8);
  padding: 10px 30px 10px;
  z-index: 2003;
  border-bottom: 1px solid rgba(140, 82, 255, 0.1);
}

  .card__img_info {
    background: #DEDCF4;
    width: 35vw;
    height: 50vh;
  }

  .modal-body {
    grid-template-columns: 45% 55%;
  }

  .left-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;  /* Vertical spacing between categories and time+venue */
  position: sticky; /* Add this */
  top: 0; /* Add this */
  height: fit-content; /* Add this */
  padding-right: 0.2rem; /* Add some padding */
}

  .timeline-container {
  padding: 1.5rem 0.4rem 0.05rem 0rem ;
  position: relative;
}

/* connecting line */
.timeline-container::before {
  content: "";
  position: absolute;
  left: 1.4rem;
  top: 2rem;
  bottom: 2.5rem;
  width: 2px;
  background: linear-gradient(to bottom, #8c52ff 0%, #DEDCF4 100%);
  transform: translateX(-50%);
}

.timeline-entry {
  position: relative;
  margin-bottom: 0.5rem;
  padding-left: 0.4rem;
}

/* circle */
.timeline-entry::before {
  content: "";
  position: absolute;
  left: -1.55rem;
  margin-left: 2.55rem;
  top: 50%;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background-color: #DEDCF4;
  border: 2px solid #8c52ff;
  transform: translateY(-50%);
  box-shadow: 0 0 0 4px rgba(140, 82, 255, 0.1);
  z-index: 2; /* just to put the circle above the connecting line*/
}

.timeline-date .date-label {
  font-size: 0.8rem !important; /* Using !important to override */
  font-weight: 550;
  color: #8c52ff;
  text-transform: uppercase;
  margin: 0;
  padding-left: 2rem;
}

.timeline-date .date-value {
  font-size: 0.8rem !important; /* Using !important to override */
  color: #333;
  padding-left: 2rem;
}

.venue-value img {
  width: 0.9rem;
}

p.venue-value {
  padding: 0 1rem 0.8rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
} 

.title-row h2 {
  font-size: 1.5rem;
}

/* Description Box */
.description-box {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 1.2rem;
  box-shadow: 0 4px 15px rgba(140, 82, 255, 0.1);
  border: 1px solid rgba(140, 82, 255, 0.1);
  transition: all 0.3s ease;
}

.description-box p {
  margin: 0;
  font-size: 0.85rem;
}

.description-box strong {
  display: block;
  margin-bottom: 1rem;
  color: #8c52ff;
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Categories */
.categories-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
}

.category-badge {
  display: inline-flex;
  background-color: #8c52ff20;
  color: #8c52ff;
  padding: 0.2rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  border: 1px solid #8c52ff40;
}

.btn {
  font-size: 0.65rem;
  padding: 8px 18px;
}

.signed-up-message {
  font-size: 0.7rem;
}

.close-button {
  top: 10px;
  right: 10px;
  font-size: 28px;
  width: 30px;
  height: 30px;
}
}

/* Small screens (577px - 768px) */
@media screen and (min-width: 577px) and (max-width: 768px) {
  .modal-content {
    width: 50vw;
    height: 60vh;
  }

  .modal-scroll-content {
  /* overflow-y: auto; */
  padding: 0 30px 30px;
}

.modal-header {
  position: sticky;
  top: 0;
  background: linear-gradient(145deg, #DEDCF4, #f0f0f8);
  padding: 10px 30px 10px;
  z-index: 2003;
  border-bottom: 1px solid rgba(140, 82, 255, 0.1);
}

  .card__img_info {
    background: #DEDCF4;
    width: 35vw;
    height: 60vh;
  }

  .modal-body {
    grid-template-columns: 45% 55%;
  }

  .left-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;  /* Vertical spacing between categories and time+venue */
  position: sticky; /* Add this */
  top: 0; /* Add this */
  height: fit-content; /* Add this */
  padding-right: 0.1rem; /* Add some padding */
}

.badge {
  font-size: 0.7rem;
}

  .timeline-container {
  padding: 1rem 1rem 0rem 0rem ;
  position: relative;
}

/* connecting line */
.timeline-container::before {
  content: "";
  position: absolute;
  left: 1.2rem;
  top: 2rem;
  bottom: 2.5rem;
  width: 2px;
  background: linear-gradient(to bottom, #8c52ff 0%, #DEDCF4 100%);
  transform: translateX(-50%);
}

.timeline-entry {
  position: relative;
  margin-bottom: 0.2rem;
  padding-left: 0.1rem;
}

/* circle */
.timeline-entry::before {
  content: "";
  position: absolute;
  left: -1.5rem;
  margin-left: 2.4rem;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #DEDCF4;
  border: 2px solid #8c52ff;
  transform: translateY(-50%);
  box-shadow: 0 0 0 4px rgba(140, 82, 255, 0.1);
  z-index: 2; /* just to put the circle above the connecting line*/
}

.timeline-date .date-label {
  font-size: 0.65rem !important; /* Using !important to override */
  font-weight: 550;
  color: #8c52ff;
  text-transform: uppercase;
  margin: 0;
  padding-left: 1.8rem;
}

.timeline-date .date-value {
  font-size: 0.8rem !important; /* Using !important to override */
  color: #333;
  padding-left: 1.8rem;
}

.venue-value img {
  width: 0.9rem;
}

p.venue-value {
  padding: 0 1rem 0.2rem 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.8rem;
  color: #333;
  font-weight: 600;
} 

.title-row h2 {
  font-size: 1.25rem;
}

/* Description Box */
.description-box {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 1.2rem;
  box-shadow: 0 4px 15px rgba(140, 82, 255, 0.1);
  border: 1px solid rgba(140, 82, 255, 0.1);
  transition: all 0.3s ease;
}

.description-box p {
  margin: 0;
  font-size: 0.8rem;
}

.description-box strong {
  display: block;
  margin-bottom: 1rem;
  color: #8c52ff;
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Categories */
.categories-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin: 0 0 1rem 0;
}

.category-badge {
  display: inline-flex;
  background-color: #8c52ff20;
  color: #8c52ff;
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.5rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  border: 1px solid #8c52ff40;
}

.btn {
  font-size: 0.6rem;
  padding: 6px 15px;
}

.signed-up-message {
  font-size: 0.7rem;
}

.close-button {
  top: 5px;
  right: 0;
  font-size: 25px;
  width: 25px;
  height: 25px;
}

}

/* Extra small screens (375px - 576px) */
@media screen and (min-width: 375px) and (max-width: 576px) {
  /* Modal overlay modifications */
  .modal-overlay {
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 1rem;
    flex-direction: column;
    max-height: 100vh;
    overflow: hidden;
  }

  .card__img_info {
    display: block;
    width: 95vw;
    height: 40vh; /* Fixed height for image */
    object-fit: cover;
    border-radius: 15px 15px 0 0;
    margin: 0 auto;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .modal-content {
    width: 95vw;
    height: 55vh; /* Remaining height for content */
    border-radius: 0 0 15px 15px;
    margin: 0;
    overflow: hidden;
  }

  /* Make the content area scrollable */
  .modal-scroll-content {
    height: calc(55vh - 80px); /* Subtract header height */
    overflow-y: auto;
    padding: 0 15px 15px;
  }

  /* Header adjustments */
  .modal-header {
    display: flex;
    height: 100px;
    padding: 20px 20px;
    position: sticky;
    top: 0;
    z-index: 10;
    background: linear-gradient(145deg, #DEDCF4, #f0f0f8);
  }

  .header-content {
    width: 100%;
    position: relative; /* For absolute positioning of close button */
  }

  .title-row {
    padding-right: 3rem; /* Remove right padding */
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0rem;
    font-size: 0.8rem;
  }

  .title-row h2 {
    font-size: 1rem;
    margin-right: 0rem;
  }

  /* Body layout */
  .modal-body {
    grid-template-columns: 100%;
    gap: 1rem;
    margin-top: 1rem;
    padding: 0;
  }

  /* Column adjustments */
  .left-column {
    gap: 0rem;
    padding-right: 0;
    position: relative;
    height: auto;
  }

  .badge {
  margin-bottom: 1rem;
  }

  .right-column {
    padding-left: 0;
    margin-bottom: 1rem;
    max-height: none;
    overflow-y: visible;
  }

  /* Event details styling */
  .event-details-section {
    margin-bottom: 0.5rem;
  }

  .description-box {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .description-box p {
    font-size: 0.9rem;
  }

  .timeline-container {
  padding: 1.5rem 0.4rem 0.05rem 0rem ;
  position: relative;
}

/* connecting line */
.timeline-container::before {
  content: "";
  position: absolute;
  left: 5rem;
  top: 1.3rem;
  bottom: 2.5rem;
  width: 2.5px;
  background: linear-gradient(to bottom, #8c52ff 0%, #DEDCF4 100%);
  transform: translateX(-50%);
}

.timeline-entry {
  position: relative;
  margin-bottom: 0.5rem;
  padding-left: 5rem;
}

/* circle */
.timeline-entry::before {
  content: "";
  position: absolute;
  left: 2.05rem;
  margin-left: 2.55rem;
  top: 50%;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background-color: #DEDCF4;
  border: 2px solid #8c52ff;
  transform: translateY(-50%);
  box-shadow: 0 0 0 4px rgba(140, 82, 255, 0.1);
  z-index: 2; /* just to put the circle above the connecting line*/
}

.timeline-date .date-label {
  font-size: 0.8rem !important; /* Using !important to override */
  font-weight: 550;
  color: #8c52ff;
  text-transform: uppercase;
  margin: 0;
  padding-left: 2rem;
}

.timeline-date .date-value {
  font-size: 0.8rem !important; /* Using !important to override */
  color: #333;
  padding-left: 2rem;
}

  /* Venue styling */
  .venue-value img {
    width: 0.9rem;
  }

  p.venue-value {
    font-size: 0.8rem;
    padding: 0 1rem 0.8rem 4.5rem;
  }

  /* Button styling */
  .btn {
    font-size: 0.9rem;
    padding: 5px 10px;
    margin-bottom: 0.5rem;
  }

  /* Close button */
  .close-button {
    position: sticky;
    top: 0.5rem;
    left: 50rem;
    width: 25px;
    height: 25px;
    font-size: 20px;
  }

  /* Categories */
  .category-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.6rem;
  }

  /* Status message */
  .signed-up-message {
    font-size: 0.8rem;
    padding: 10px;
  }

  /* Scrollbar styling for modal content */
  .modal-scroll-content::-webkit-scrollbar {
    width: 4px;
  }

  .modal-scroll-content::-webkit-scrollbar-track {
    background: #DEDCF4;
    border-radius: 2px;
  }

  .modal-scroll-content::-webkit-scrollbar-thumb {
    background: #8c52ff;
    border-radius: 2px;
  }

  .btn {
  font-size: 1rem;
  padding: 4px 10px;
}

.signed-up-message {
  font-size: 0.7rem;
}

.save-button {
    margin-top: 0.6rem;
  }
}



/* High DPI screens */
@media screen and (-webkit-min-device-pixel-ratio: 2), 
       screen and (min-resolution: 192dpi) {
  .card__img_info {
    image-rendering: -webkit-optimize-contrast;
    object-fit: contain;
  }
}

/* Print media adjustments */
@media print {
  .card__img_info {
    max-height: 300px;
    width: auto;
    page-break-inside: avoid;
    object-fit: contain;
  }
}
</style>
  