<!-- SaveButton.vue -->
<template>
  <div>
    <!-- Save Button -->
    <button
      @click.stop="toggleSave"
      class="btn p-0 border-0 bg-transparent"
      :disabled="loading"
      aria-label="Toggle Save"
    >
      <i
        :class="`bi ${isSaved ? 'bi-heart-fill' : 'bi-heart'} text-danger fs-3`"
      ></i>
    </button>

    <!-- Login Modal -->
    <LoginModal
      v-if="showLoginModal"
      @close="closeLoginModal"
      @login-success="handleLoginSuccess"
    />

    <!-- Toast Notifications -->
    <teleport to="body">
      <div
        class="toast-container position-fixed bottom-0 end-0 p-3"
        style="z-index: 1100;"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="`toast align-items-center border-0 mb-2 ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div class="toast-header">
            <!-- Optional: Add an image or icon here -->
            <strong class="me-auto">sLoop</strong>
            <small class="text-body-secondary">{{ toast.timeAgo }}</small>
            <button
              type="button"
              class="btn-close btn-close-white ms-2 mb-1"
              aria-label="Close"
              @click="removeToast(toast.id)"
            ></button>
          </div>
          <div class="toast-body">
            {{ toast.message }}
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { ref, onUnmounted } from 'vue';
import { auth } from '../../firebase';
import { updateSaveEvents } from '../../composables/eventActions';
import LoginModal from '../Login/Login.vue';
import { useSavedEventListener } from '../../composables/saveEvents';
import { useToast } from '../../composables/useToast';

export default {
  props: {
    eventId: {
      type: String,
      required: true,
    },
    eventName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    // Reactive state variables
    const showLoginModal = ref(false);
    const loading = ref(false);
    const pendingSave = ref(false);
    const pendingSaveAction = ref(null); // Stores the intended action ('add' or 'remove')
    const { isSaved, unsubscribe } = useSavedEventListener(props.eventId);
    const { addToast, toasts, removeToast } = useToast();

    /**
     * Toggles the save state of the event.
     * If the user is not authenticated, it prompts the login modal.
     * After successful login, it performs the initially intended action.
     */
    const toggleSave = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        // User is not authenticated; prompt login and store intended action
        pendingSave.value = true;
        pendingSaveAction.value = isSaved.value ? 'remove' : 'add';
        showLoginModal.value = true;
        return;
      }

      try {
        loading.value = true;
        const userId = currentUser.uid;
        const action = isSaved.value ? 'remove' : 'add';

        await updateSaveEvents('saved_events', userId, props.eventId, action);

        // Determine toast message and type based on action
        const toastMessage = `${props.eventName} has been ${
          action === 'add' ? 'saved to' : 'removed from'
        } your favorites.`;

        const toastType = action === 'add' ? 'success' : 'danger';

        // Show toast notification
        addToast(toastMessage, toastType);
      } catch (error) {
        console.error('Error updating save status:', error);
        // Show error toast
        addToast(
          `Failed to ${
            isSaved.value ? 'remove from' : 'save to'
          } favorites. Please try again.`,
          'danger'
        );
      } finally {
        loading.value = false;
      }
    };

    /**
     * Closes the login modal.
     */
    const closeLoginModal = () => {
      showLoginModal.value = false;
    };

    /**
     * Handles successful login by performing the pending save action.
     */
    const handleLoginSuccess = async () => {
      closeLoginModal();
      if (pendingSave.value && pendingSaveAction.value) {
        pendingSave.value = false;
        const action = pendingSaveAction.value;
        pendingSaveAction.value = null;

        try {
          loading.value = true;
          const userId = auth.currentUser.uid;

          await updateSaveEvents('saved_events', userId, props.eventId, action);

          // Determine toast message and type based on action
          const toastMessage = `${props.eventName} has been ${
            action === 'add' ? 'saved to' : 'removed from'
          } your favorites.`;

          const toastType = action === 'add' ? 'success' : 'danger';

          // Show toast notification
          addToast(toastMessage, toastType);
        } catch (error) {
          console.error('Error updating save status after login:', error);
          // Show error toast
          addToast(
            `Failed to ${
              action === 'add' ? 'save to' : 'remove from'
            } favorites. Please try again.`,
            'danger'
          );
        } finally {
          loading.value = false;
        }
      }
    };

    // Cleanup on component unmount
    onUnmounted(() => {
      unsubscribe();
    });

    return {
      isSaved,
      toggleSave,
      loading,
      showLoginModal,
      closeLoginModal,
      handleLoginSuccess,
      toasts,
      removeToast,
    };
  },
  components: {
    LoginModal,
  },
};
</script>

<style scoped>
/* Optional: Customize the toast opacity */
.toast {
  opacity: 0.95;
}
</style>
