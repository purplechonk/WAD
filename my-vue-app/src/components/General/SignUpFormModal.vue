<template>
  <div>
    <!-- Sign-Up Form Modal -->
    <div class="signup-modal-overlay" v-if="!showSuccessModal" @click.self="closeForm" >
      <div class="signup-modal-dialog">
        <div class="signup-modal-content">

          <h3>Sign Up Form</h3>
          <p>All input fields are optional. Click "Confirm Sign Up" to skip filling them out.</p>

          <!-- Input fields for sign-up questions -->
          <div class="form-group">
            <label for="friendsNames">Did you sign up with any friends? If yes, list down their full names.</label>
            <!-- <p class="form-hint">If yes, list down their full names.</p> -->
            <input 
              type="text" 
              v-model="friendsNames" 
              class="form-input" 
              placeholder="Enter friends' names"
            />
          </div>

          <div class="form-group">
            <label for="availability">If you will not be staying for the whole duration of the event, list the timing that you are available.</label>
            <!-- <p class="form-hint">If you will not be staying for the whole duration of the event, list the timing that you are available.</p> -->
            <input 
              type="text" 
              v-model="availability" 
              class="form-input" 
              placeholder="Enter availability timing"
            />
          </div>

          <!-- Buttons -->
          <div class="form-actions">
            <button class="btn btn-secondary" @click="closeForm">
              Cancel
            </button>
            <button class="btn btn-primary" @click="confirmSignup">
              Confirm Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="signup-modal-overlay" v-if="showSuccessModal" @click.self="closeSuccessModal">
      <div class="signup-modal-dialog success">
        <div class="signup-modal-content">
          <button class="close-button" @click="closeSuccessModal">&times;</button>

          <div class="success-content">
            <h3>Sign Up Successful!</h3>
            <p>You have successfully signed up for the event.</p>
            
            <button class="btn btn-primary" @click="viewMyEvents">
              View My Events
            </button>
          </div>
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
.signup-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.399);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
  z-index: 1029;
}

.signup-modal-dialog {
  background: linear-gradient(145deg, #DEDCF4, #f0f0f8);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 10px 30px rgba(140, 82, 255, 0.2);
  border: 1px solid rgba(140, 82, 255, 0.1);
  animation: modalAppear 0.3s ease-out;
}

.signup-modal-dialog.success {
  max-width: 400px;
}

.signup-modal-content {
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.signup-modal-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #8c52ff, #5E17EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.signup-modal-content p {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

/* Form Styles */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #333;
  font-size: 0.95rem;
  font-weight: 600;
}

.form-hint {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(140, 82, 255, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.form-input:focus {
  outline: none;
  border-color: #8c52ff;
  box-shadow: 0 0 0 3px rgba(140, 82, 255, 0.1);
}

.form-input::placeholder {
  color: #999;
}

/* Success Content */
.success-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  flex: 1;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

/* Close button */
.close-button {
  position: absolute;
  top: -15px;
  right: -15px;
  font-size: 28px;
  background: white;
  border: none;
  color: #8c52ff;
  cursor: pointer;
  width: 35px;
  height: 35px;
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

@keyframes modalAppear {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive styles */
@media screen and (max-width: 576px) {
  .signup-modal-dialog {
    width: 95%;
    margin: 1rem;
  }

  .signup-modal-content {
    padding: 2rem 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

@media screen and (max-width: 375px) {
  .signup-modal-content {
    padding: 1.5rem 1rem;
  }

  .signup-modal-content h3 {
    font-size: 1.25rem;
  }

  .form-input {
    padding: 0.625rem 0.875rem;
    font-size: 0.95rem;
  }

  .form-hint {
    font-size: 0.8rem;
  }
}
</style>