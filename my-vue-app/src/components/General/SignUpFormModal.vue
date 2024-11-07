<template>
  <div>
    <!-- Sign-Up Form Modal -->
    <div class="modal-overlay" v-if="!showSuccessModal" @click.self="closeForm">
      <div class="modal-dialog">
        <div class="modal-content p-4">
          <!-- Close Button (X) -->
          <button class="close-button" @click="closeForm">&times;</button>

          <h3>Sign-Up Form</h3>

          <!-- Input fields for sign-up questions -->
          <div class="form-group">
            <label for="friendsNames">Did you sign up with any friends? If yes, list down their full names.</label>
            <input type="text" v-model="friendsNames" class="form-control" placeholder="Enter friends' names" />
          </div>
          <div class="form-group mt-2">
            <label for="availability">If you will not be staying for the whole duration of the event, list the timing that you are available.</label>
            <input type="text" v-model="availability" class="form-control" placeholder="Enter availability timing" />
          </div>

          <!-- Confirm Signup Button -->
          <button class="btn btn-primary mt-3 text-light" @click="confirmSignup">Confirm Signup</button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal-overlay" v-if="showSuccessModal" @click.self="closeSuccessModal">
      <div class="modal-dialog">
        <div class="modal-content p-4 text-center">
          <!-- Close Button (X) -->
          <button class="close-button" @click="closeSuccessModal">&times;</button>

          <h3>Signed Up Successfully!</h3>
          <p>You have successfully signed up for the event.</p>
          <!-- View My Events Button -->
          <button class="btn btn-success mt-3" @click="viewMyEvents">View My Events</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Import Vue Router for navigation
import { updateEventSignups, updateUserSignedUpEvents } from '../../composables/onSignUp'; // Firestore update

const props = defineProps({
  eventId: String, // The event ID
});

const emit = defineEmits(['close', 'submitted', 'view-my-events']);

// Form data
const friendsNames = ref('');
const availability = ref('');
const showSuccessModal = ref(false); // State for success modal visibility

// Function to close the sign-up form
const closeForm = () => {
  emit('close');
};

// Function to close the success modal and the sign-up form
const closeSuccessModal = () => {
  showSuccessModal.value = false;
  emit('close'); // Emit the close event to close the sign-up form modal as well
};

// Function to handle sign-up confirmation
const confirmSignup = async () => {
  try {
    // Update signups in Firestore
    await updateEventSignups(props.eventId);

    // Add the event to the user's signed_up_events array
    await updateUserSignedUpEvents(props.eventId);

    emit('submitted'); // Notify parent that sign-up is confirmed
    showSuccessModal.value = true; // Show success modal after sign-up
  } catch (error) {
    console.error('Error during signup:', error);
    // Handle error (e.g., show an error message to the user)
  }
};

// Function to emit 'view-my-events' event
const viewMyEvents = () => {
  emit('view-my-events');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-dialog {
  background-color: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-content {
  border-radius: 8px;
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
  color: #ff0000; /* Red on hover */
}
</style>
