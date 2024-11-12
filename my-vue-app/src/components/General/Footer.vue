<template>
  <footer class="bg-dark text-light" :class="{ 'snap-footer': isHomepage }">
    <div class="container pt-4 pb-2">
      <!-- Main Row: Logo & Nav and Feedback Form -->
      <div class="row align-items-start justify-content-between">
        <!-- Column 1: Logo and Navigation Links -->
        <div class="col-12 col-md-6 mb-3 mb-md-0">
          <!-- Nested Row for Logo and Navigation -->
          <div class="row mt-2">
            <!-- Logo -->
            <div class="col-12 mb-3">
              <router-link to="/" class="text-decoration-none">
                <img src="../../assets/images/sLoop-white.svg" alt="Logo" class="logo" width="100" />
              </router-link>
            </div>

            <!-- Navigation Links -->
            <div class="col-12">
              <ul class="navbar-nav flex-row gap-4 gap-md-3 gap-xs-2 ps-2">
                <li class="nav-item">
                  <router-link to="/explore" class="nav-link p-0">Explore</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/my-events" class="nav-link p-0">My Events</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/analytics" class="nav-link p-0">Analytics</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/profile" class="nav-link p-0">Profile</router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Column 2: Feedback Form -->
        <div class="col-12 col-md-5">
          <form @submit.prevent="submitFeedback">
            <div class="mb-2">
              <label for="commentTextarea" class="form-label d-flex justify-content-between align-items-center">
                <span>Share with us your feedback!</span>
                <span class="small" :class="{ 'text-danger': characterCount >= maxCharacters }">
                  {{ characterCount }}/{{ maxCharacters }}
                </span>
              </label>
              <textarea 
                class="form-control" 
                id="commentTextarea" 
                rows="2" 
                v-model="feedbackText"
                @input="handleInput"
                placeholder="Leave a comment here" 
                required
                :maxlength="maxCharacters"
              ></textarea>
            </div>
            <div class="d-flex justify-content-between align-items-start">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="consent" id="consentCheck" required>
                <label class="form-check-label small pe-3" for="consentCheck">
                  By checking this box, you consent to sharing your contact with us.
                </label>
              </div>
              <button 
                type="submit" 
                class="btn btn-sm btn-light"
              >Send</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Copyright -->
      <div class="row my-2">
        <div class="col-12">
          <hr>
          <p class="text-light small mb-0">
            &copy; {{ currentYear }} sLoop. All rights reserved.
          </p>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast align-items-center text-bg-success border-0 position-fixed bottom-0 end-0 m-3" role="alert"
      aria-live="assertive" aria-atomic="true" ref="feedbackToast" data-bs-delay="3000">
      <div class="d-flex">
        <div class="toast-body">
          Thank you for your feedback!
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
          aria-label="Close"></button>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Toast } from 'bootstrap'
import { storeFeedback } from "../../composables/footer";

export default {
  name: 'Footer',
  data() {
    return {
      feedbackText: '',
      consent: false,
      currentYear: new Date().getFullYear(),
      toastInstance: null,
      maxCharacters: 150,
      characterCount: 0
    }
  },
  computed: {
    isHomepage() {
      return this.$route.name === 'Home';
    }
  },
  methods: {
    handleInput(event) {
      const text = event.target.value;
      this.characterCount = text.length;
      
      if (text.length > this.maxCharacters) {
        this.feedbackText = text.slice(0, this.maxCharacters);
      }
    },
    async submitFeedback() {
      try {
        await storeFeedback(this.feedbackText);

        if (this.toastInstance) {
          this.toastInstance.show();
        }

        // Clear the form fields
        this.feedbackText = "";
        this.consent = false;
        this.characterCount = 0;
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    },
  },
  mounted() {
    const toastEl = this.$refs.feedbackToast;
    this.toastInstance = new Toast(toastEl);
  },
}
</script>

<style scoped>
.snap-footer {
  scroll-snap-align: end;
}

.toast {
  z-index: 1055;
}

textarea {
  resize: none;
}
</style>