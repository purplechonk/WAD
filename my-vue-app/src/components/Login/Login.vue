<template>
  <div class="modal">
    <div class="modal-content">
      <!-- Close button -->
      <button class="close-modal" @click="handleClose">&times;</button>
      <h2>Sign In to Proceed</h2>
      <button @click="login">Login with Google</button>
    </div>
  </div>
</template>

<script setup>
import { loginWithGoogle } from '../../composables/auth';
import { useRouter, useRoute } from 'vue-router';

// Define emits
const emit = defineEmits(['close', 'login-success']); // Define emits for the 'close' and 'login-success' events

const router = useRouter();
const route = useRoute(); // Get the current route

const login = async () => {
  try {
    await loginWithGoogle();

    // After successful login, redirect to the current page (or another page if needed)
    const redirectTo = route.query.redirect || route.fullPath; // Use redirect query or current route
    router.push(redirectTo);

    emit('login-success'); // Emit 'login-success' to inform the parent component
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Handle close button logic
const handleClose = () => {
  // Check if the redirect query exists and if it's pointing to a restricted page
  const redirectTarget = route.query.redirect;
  const previousPage = route.query.previousPath

  if (redirectTarget === '/profile' || redirectTarget === '/my-events' || redirectTarget === '/analytics' ) {
    // If the redirect target is restricted, route back to it or default to home
    router.push("/"); // Redirect to home
  } else {
    // Emit the 'close' event to close the modal for non-restricted pages
    emit('close');
  }
};
</script>

<style scoped>
/* Fullscreen modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
  color: #000;
  padding: 0;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
