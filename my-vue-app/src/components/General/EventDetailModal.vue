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

        <!-- Loading state to prevent jitter -->
        <div v-if="loading" class="loading-placeholder"></div>

        <!-- Prevent content shift by setting fixed height for the sign-up area -->
        <div v-if="!loading" style="min-height: 50px;">
          <!-- Show "You Have Signed Up" message if user has signed up -->
          <p v-if="hasSignedUp" class="signed-up-message">You Have Signed Up</p>
          <!-- Cancel RSVP button -->
          <button v-if="hasSignedUp" class="btn btn-danger mt-2" @click="openCancelRSVPModal">Cancel RSVP</button>

          <!-- If user is authenticated and not signed up, show Sign Up button -->
          <div v-if="isAuthenticated && !hasSignedUp">
            <button class="btn btn-primary mt-3" @click="openSignUpForm">Sign Up</button>
          </div>

          <!-- If user is not authenticated, show Login to Proceed button -->
          <div v-else-if="!isAuthenticated">
            <button class="btn btn-secondary mt-3" @click="openLoginModal">Login to Proceed</button>
          </div>
        </div>

        <!-- Sign-Up Form Modal -->
        <SignUpFormModal 
          v-if="showSignUpForm" 
          @close="closeSignUpForm" 
          @submitted="onSignUpSubmitted" 
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
import { ref, onMounted } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase'; // Firebase Auth instance
import SignUpFormModal from './SignUpFormModal.vue';
import Login from '../Login/Login.vue';
import { hasUserSignedUpForEvent } from '../../composables/fetchEvents'; // Function to check sign-up status
import { cancelRSVPInDatabase } from '../../composables/eventActions'; // Function to cancel RSVP

// Props
const props = defineProps({
  event: Object,
});

// Emits
const emit = defineEmits(['close']);

// Local state
const showSignUpForm = ref(false);
const showLoginModal = ref(false);
const showCancelRSVPModal = ref(false); // Cancel RSVP modal state
const showSuccessModal = ref(false); // Success modal state
const hasSignedUp = ref(false);
const isAuthenticated = ref(false);
const userId = ref(null); // Keep track of authenticated user
const loading = ref(true); // Add loading state
const progress = ref(100); // Progress for the success modal countdown

// Close the modal
const closeModal = () => {
  emit('close');
};

// Open the sign-up form modal
const openSignUpForm = () => {
  showSignUpForm.value = true;
};

// Close the sign-up form modal
const closeSignUpForm = () => {
  showSignUpForm.value = false;
};

// Open the login modal
const openLoginModal = () => {
  showLoginModal.value = true;
};

// Close the login modal
const closeLoginModal = () => {
  showLoginModal.value = false;
};

// Open the cancel RSVP confirmation modal
const openCancelRSVPModal = () => {
  showCancelRSVPModal.value = true;
};

// Close the cancel RSVP modal
const closeCancelRSVPModal = () => {
  showCancelRSVPModal.value = false;
};

// After the sign-up form is submitted
const onSignUpSubmitted = () => {
  hasSignedUp.value = true; // Update the local state
  props.event.no_of_signups += 1; // Increment participants count in UI
};

// Confirm Cancel RSVP
const confirmCancelRSVP = async () => {
  await cancelRSVP(); // Call the cancel RSVP function
  closeCancelRSVPModal(); // Close the cancel modal
  showSuccessModal.value = true; // Show the success modal
  startCountdown(); // Start countdown to auto-close the success modal
};

// Cancel RSVP process
const cancelRSVP = async () => {
  try {
    await cancelRSVPInDatabase(props.event.id, userId.value); // Call the function to cancel RSVP in Firestore
    props.event.no_of_signups -= 1; // Decrease participants count in UI
    hasSignedUp.value = false; // Update local state to reflect cancellation
  } catch (error) {
    console.error("Error canceling RSVP:", error);
  }
};

// Close the success modal
const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

// Countdown timer to close the success modal
const startCountdown = () => {
  progress.value = 100;
  const interval = setInterval(() => {
    progress.value -= 10;
    if (progress.value <= 0) {
      clearInterval(interval);
      closeSuccessModal(); // Automatically close the modal after 3 seconds
    }
  }, 300); // Update the progress bar every 300ms
};

// Listen to auth state changes
onMounted(async () => {
  hasSignedUp.value = await hasUserSignedUpForEvent(props.event.id);
  loading.value = false; // Stop loading once the check is complete

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      isAuthenticated.value = true;
      userId.value = user.uid; // Set the user ID
      showLoginModal.value = false;
      // Check if the user has already signed up for this event
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
  background-color: #fff;
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
  z-index: 999;
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
</style>
