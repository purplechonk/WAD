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

        <!-- Show Sign Up button if not signed up -->
        <div v-if="!hasSignedUp">
          <button class="btn btn-primary mt-3" @click="openSignUpForm">Sign Up</button>
        </div>

        <!-- Show "You Have Signed Up" message if user has signed up -->
        <p v-if="hasSignedUp" class="signed-up-message">You Have Signed Up</p>

        <!-- Smaller Sign-Up Form Modal -->
        <SignUpFormModal 
          v-if="showSignUpForm" 
          @close="closeSignUpForm" 
          @submitted="onSignUpSubmitted" 
          :eventId="event.id"
          :userId="userId"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SignUpFormModal from './SignUpFormModal.vue';
import { hasUserSignedUpForEvent } from '../composables/fetchEvents'; // Check if user has already signed up

const props = defineProps({
  event: Object,
  userId: String
});

const emit = defineEmits(['close']);

const showSignUpForm = ref(false);
const hasSignedUp = ref(false);

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

// Once the sign-up form is submitted, mark the user as signed up and update Firestore
const onSignUpSubmitted = () => {
  hasSignedUp.value = true;
  props.event.no_of_signups += 1;
};

// On mounted, check if the user has already signed up for this event
onMounted(async () => {
  hasSignedUp.value = await hasUserSignedUpForEvent(props.userId, props.event.id);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999; /* Ensure it's on top */
}

.modal-content {
  background-color: #fff;
  border-radius: 10px;
  width: 90%;
  max-width: 900px;
  padding: 30px;
  position: relative;
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

.signed-up-message {
  color: red;
  font-weight: bold;
  margin-top: 20px;
}
</style>