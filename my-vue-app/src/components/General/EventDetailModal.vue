<template>
  <div class="modal-overlay" @click.self="closeModal">
    <img 
      src="../../assets/images/event_1.jpg" 
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
          <div class="categories-row">
            <div 
              v-for="(category, index) in event.category" 
              :key="index" 
              class="category-badge"
            >
              {{ category }}
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="modal-scroll-content">
        <div class="modal-body">
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
                <img src="../../assets/images/location-pin.svg" alt="Logo" class="logo" width="20" style="color: white;"/>
                {{ event.venue }}</p>
            <div class="description-box">
              <strong>Description</strong>
              <p>{{ event.description }}</p>
            </div>

          <!-- Loading state -->
          <div v-if="loading" class="loading-placeholder"></div>

          <!-- Sign up area -->
          <div v-if="!loading" style="min-height: 50px;">
            <p v-if="hasSignedUp" class="signed-up-message">You Have Signed Up</p>
            
            <div v-if="hasSignedUp">
              <button v-if="!isEventEnded" class="btn btn-danger mt-2" @click="openCancelRSVPModal">
                Cancel RSVP
              </button>
              <span v-else class="badge bg-secondary mt-2" style="font-size: 1rem;">
                Event Ended
              </span>
            </div>

            <div v-if="isAuthenticated && !hasSignedUp">
              <button class="btn btn-primary mt-3" @click="openSignUpForm">Sign Up</button>
            </div>

            <div v-else-if="!isAuthenticated">
              <button class="btn btn-secondary mt-3" @click="openLoginModal">Login to Proceed</button>
            </div>
          </div>
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
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
}

.card__img_info {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  max-width: auto;
  height: 80vh;
  object-fit: cover;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.modal-content {
  background: linear-gradient(145deg, #DEDCF4, #f0f0f8);
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  height: 80vh;
  max-width: 850px;
  position: relative;
  z-index: 2001;
  box-shadow: 5px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #DEDCF4;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #8c52ff;
  border-radius: 4px;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-body h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
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
  padding: 20px 40px 20px;
  z-index: 10;
  border-bottom: 1px solid rgba(140, 82, 255, 0.1);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-right: 6rem;
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

/* Categories */
.categories-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: 100%;
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

/* Timeline */
.timeline-container {
  margin-top: 1rem;
  position: relative;
  padding-left: 25px;
}

.timeline-container::before {
  content: "";
  position: absolute;
  left: 17px;
  top: 10px;
  bottom: 45px;
  width: 2.5px;
  background: linear-gradient(to bottom, #8c52ff 0%, #DEDCF4 100%);
  transform: translateX(-50%);
}

.timeline-entry {
  position: relative;
  margin-bottom: 1rem;
  padding-left: 15px;
}

.timeline-entry::before {
  content: "";
  position: absolute;
  left: -15px;
  top: 50%;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background-color: #DEDCF4;
  border: 2px solid #8c52ff;
  transform: translateY(-50%);
  box-shadow: 0 0 0 4px rgba(140, 82, 255, 0.1);
  z-index: 2;
}

.timeline-date::before {
  content: "";
  position: absolute;
  left: -15px;
  top: 50%;
  width: 11px;
  height: 3px;
  background: linear-gradient(to right, #8c52ff 0%, #DEDCF4 100%);
  transform: translateY(-50%);
}

.date-label {
  font-size: 0.7rem;
  font-weight: 550;
  color: #8c52ff;
  margin: 0;
  text-transform: uppercase;
}

.date-value {
  font-size: 0.85rem;
  color: #333;
}

/* Description Box */
.description-box {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(140, 82, 255, 0.1);
  border: 1px solid rgba(140, 82, 255, 0.1);
  margin: 1rem 0;
  transition: all 0.3s ease;
}

.description-box p {
  margin: 0;
}

.description-box strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #8c52ff;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Scrollable Content */
.modal-scroll-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 40px 40px;
  scrollbar-width: thin;
  scrollbar-color: #8c52ff #DEDCF4;
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
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(45deg, #8c52ff, #5E17EB);
  color: white;
}

.btn-secondary {
  background: rgba(140, 82, 255, 0.1);
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

/* Status Messages */
.signed-up-message {
  color: #8c52ff;
  font-weight: bold;
  margin-top: 20px;
  padding: 12px;
  background: rgba(140, 82, 255, 0.1);
  border-radius: 10px;
  text-align: center;
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
.progress-bar {
  height: 6px;
  background: #DEDCF4;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
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
  font-size: 0.875rem;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(108, 117, 125, 0.2);
}

.bg-secondary {
  background: linear-gradient(45deg, #6c757d, #495057);
}

/* Small Modal */
.small-modal-dialog {
  background-color: white;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  padding: 30px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.small-modal-content {
  text-align: center;
}

.small-modal-content h3 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Responsive Styles */
@media screen and (min-width: 1201px) and (max-width: 1400px) {
  .modal-content {
    max-width: 600px;
  }

  .card__img_info {
    max-width: 600px;
  }

  .modal-body h2 {
    font-size: 2.8rem;
  }
}

@media screen and (max-width: 1200px) {
  .modal-content {
    max-width: 450px;
    height: 70vh;
  }

  .card__img_info {
    height: 70vh;
    width: auto;
  }
}

@media screen and (max-width: 992px) {
  .modal-content {
    max-width: 400px;
    height: 60vh;
  }

  .card__img_info { 
    height: 60vh;
    width: auto;
  }

  .modal-body h2 {
    font-size: 2rem;
  }

  .modal-header {
    padding: 15px 30px;
  }

  .modal-scroll-content {
    padding: 0 30px 30px;
  }
}

@media screen and (max-width: 768px) {
  .card__img_info {
    display: none;
  }

  .modal-content {
    width: 90%;
    max-width: 600px;
    border-radius: 20px;
    margin: 20px;
    height: 85vh;
  }

  .modal-header {
    padding: 15px 20px;
  }

  .modal-scroll-content {
    padding: 0 20px 20px;
  }

  .title-row {
    padding-right: 3rem;
  }

  .close-button {
    top: 15px;
    right: 15px;
    width: 35px;
    height: 35px;
    font-size: 24px;
  }
}

@media screen and (max-width: 576px) {
  .modal-content {
    width: 95%;
    height: 90vh;
    margin: 10px;
  }

  .modal-header {
    padding: 12px 15px;
  }

  .modal-scroll-content {
    padding: 0 15px 15px;
  }

  .title-row h2 {
    font-size: 1.5rem;
  }

  .modal-body p {
    font-size: 1rem;
  }

  .btn {
    padding: 10px 20px;
    font-size: 0.875rem;
  }

  .description-box {
    padding: 1rem;
  }

  .category-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.6rem;
  }
}

@media screen and (max-width: 375px) {
    .close-button {
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      font-size: 20px;
    }

    .timeline-container {
      padding-left: 20px;
    }

    .timeline-entry {
      padding-left: 10px;
    }

    .date-label {
      font-size: 0.65rem;
    }

    .date-value {
      font-size: 0.75rem;
    }

    .description-box {
      padding: 0.75rem;
      margin: 0.5rem 0;
    }

    .description-box strong {
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .signed-up-message {
      padding: 8px;
      font-size: 0.875rem;
      margin-top: 15px;
    }

    .small-modal-dialog {
      width: 95%;
      padding: 20px;
    }

    .small-modal-content h3 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }
  }

  /* Handle very tall screens */
  @media screen and (min-height: 1000px) {
    .modal-content {
      height: 85vh;
      max-height: 900px;
    }

    .card__img_info {
      height: 85vh;
      max-height: 900px;
    }
  }

  /* Handle very short screens */
  @media screen and (max-height: 600px) {
    .modal-content {
      height: 95vh;
    }

    .card__img_info {
      height: 95vh;
    }

    .modal-header {
      padding-top: 10px;
      padding-bottom: 10px;
    }

    .categories-row {
      margin-top: 0.25rem;
    }
  }

  /* Handle landscape orientation on mobile */
  @media screen and (max-height: 500px) and (orientation: landscape) {
    .modal-content {
      height: 98vh;
    }

    .card__img_info {
      display: none;
    }

    .modal-header {
      padding: 8px 15px;
    }

    .title-row h2 {
      font-size: 1.25rem;
    }

    .categories-row {
      margin-top: 0.2rem;
    }

    .category-badge {
      padding: 0.15rem 0.5rem;
      font-size: 0.6rem;
    }

    .modal-scroll-content {
      padding: 0 15px 10px;
    }

    .description-box {
      margin: 0.5rem 0;
      padding: 0.75rem;
    }

    .btn {
      padding: 8px 16px;
      font-size: 0.8rem;
    }
  }

  /* Handle high DPI screens */
  @media screen and (-webkit-min-device-pixel-ratio: 2), 
         screen and (min-resolution: 192dpi) {
    .card__img_info {
      object-fit: cover;
      image-rendering: -webkit-optimize-contrast;
    }
  }

  /* Handle reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .btn:hover {
      transform: none;
    }

    .close-button:hover {
      transform: none;
    }

    .loading-placeholder {
      animation: none;
      background: #DEDCF4;
    }

    .progress-bar::before {
      transition: none;
    }
  }

  /* Handle print media */
  @media print {
    .modal-overlay {
      background: none;
      height: auto;
      position: relative;
    }

    .modal-content {
      box-shadow: none;
      height: auto;
    }

    .card__img_info {
      max-height: 300px;
      page-break-inside: avoid;
    }

    .btn,
    .close-button,
    .loading-placeholder {
      display: none;
    }

    .modal-scroll-content {
      overflow: visible;
    }
  }
</style>
  