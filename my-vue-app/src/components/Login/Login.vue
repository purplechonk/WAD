<template>
  <teleport to="body">
    <div
      class="modal fade show"
      tabindex="-1"
      style="display: block;"
      aria-modal="true"
      role="dialog"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-light border-0 shadow-lg rounded-4 overflow-hidden">
          <!-- Modal Header -->
          <div class="modal-header border-0 justify-content-end p-4">
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="handleClose"
            ></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body px-5 pb-5 pt-0">
            <div class="text-center mb-4">
              <!-- Logo Section -->
              <img
                src="../../assets/images/sLoop-dark.svg"
                alt="Logo"
                class="img-fluid col-4 mb-4 animate__animated animate__fadeIn"
              />
              <h3 class="fw-bold ps-4 mb-3 animate__animated animate__fadeIn">
              Welcome Back <span class="wave">👋</span>
              </h3>
              <p class="text-muted mb-4 mx-auto animate__animated animate__fadeIn">
                Log in to access your account, explore events, and personalize your experience. Join our community and enhance your university life today!
              </p>
            </div>

            <!-- Google Login Button -->
            <div class="d-grid gap-3 px-lg-4 mb-4">
              <button
                class="btn btn-white border-2 d-flex align-items-center justify-content-center gap-3 py-3 shadow rounded-pill hover-scale animate__animated animate__fadeIn"
                @click="login"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 48 48"
                  class="flex-shrink-0"
                >
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span class="fw-semibold">Continue with Google</span>
              </button>
            </div>
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
import 'animate.css'

// Emitting events for closing and successful login
const emit = defineEmits(['close', 'login-success']);

const router = useRouter();
const route = useRoute();

const login = async () => {
  try {
    await loginWithGoogle();
    const redirectTo = route.query.redirect || route.fullPath;
    router.push(redirectTo);
    emit('login-success'); // Emitting login success
  } catch (error) {
    console.error('Login failed:', error);
  }
};

const handleClose = () => {
  const redirectTarget = route.query.redirect;
  if (['/profile', '/my-events', '/analytics'].includes(redirectTarget)) {
    router.push('/'); // Redirect to home if on certain routes
  } else {
    emit('close'); // Emit close event to parent component
  }
};
</script>
<style scoped>
.hover-scale {
  transition: transform 0.2s ease, background-color 0.4s ease;
}

.hover-scale:hover {
  background-color: var(--bs-dark);
  color: white;
}

.wave {
  display: inline-block;
  animation: wave 1.8s infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}
</style>
