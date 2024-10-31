<template>
  <teleport to="body">
    <!-- Bootstrap Modal -->
    <div
      class="modal fade show"
      tabindex="-1"
      style="display: block;"
      aria-modal="true"
      role="dialog"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header">
            <h5 class="modal-title">Sign In to Proceed</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="handleClose"
            ></button>
          </div>
          <!-- Modal Body -->
          <div class="modal-body text-center">
            <button class="btn btn-primary" @click="login">
              Login with Google
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show"></div>
  </teleport>
</template>

<script setup>
import { loginWithGoogle } from '../../composables/auth';
import { useRouter, useRoute } from 'vue-router';

// Define emits
const emit = defineEmits(['close', 'login-success']);

const router = useRouter();
const route = useRoute();

const login = async () => {
  try {
    await loginWithGoogle();

    // After successful login, redirect to the current page (or another page if needed)
    const redirectTo = route.query.redirect || route.fullPath;
    router.push(redirectTo);

    emit('login-success');
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Handle close button logic
const handleClose = () => {
  const redirectTarget = route.query.redirect;

  if (['/profile', '/my-events', '/analytics'].includes(redirectTarget)) {
    // If the redirect target is restricted, route back to home
    router.push('/');
  } else {
    // Emit the 'close' event to close the modal for non-restricted pages
    emit('close');
  }
};
</script>
