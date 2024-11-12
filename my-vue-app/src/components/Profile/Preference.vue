<template>
  <div class="d-flex justify-content-between align-items-center my-3">
    <h2 class="m-0">My Event Preferences
      <i class="bi bi-info-circle text-primary fs-5 align-text-top" data-bs-toggle="tooltip" data-bs-placement="right"
          title="Select your favourite categories and CCA interests to help us personalize event recommendations for you!">
        </i>
    </h2>

    <button class="btn btn-outline-primary" @click="openModal">
      <i class="bi bi-gear-fill me-2"></i>Edit
    </button>
  </div>
    <PreferencesSandbox/>
  <!-- Single Edit Button -->

  <!-- Extra Large Modal -->
  <div class="modal fade" id="preferencesModal" tabindex="-1" ref="modal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content bg-secondary">
        <div class="modal-header">
          <h5 class="modal-title">Edit Your Preferences</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div v-else class="container-fluid">
            <!-- Categories Section -->
            <div class="mb-4">
              <h6 class="mb-3">Event Categories</h6>
              <div class="preferences-pills">
                <span v-for="category in availableCategories" :key="category"
                  @click="toggleSelection('categories', category)" class="preference-pill border border-dark categories"
                  :class="{ 'selected': isSelected('categories', category) }">
                  <i class="bi" :class="isSelected('categories', category) ? 'bi-check' : 'bi-plus'">
                  </i>
                  {{ category }}
                </span>
              </div>
            </div>

            <!-- CCAs Section -->
            <div>
              <h6 class="mb-3">CCAs & Organisations</h6>
              <div class="preferences-pills">
                <span v-for="cca in availableCCAs" :key="cca" @click="toggleSelection('ccas', cca)"
                  class="preference-pill cca border border-dark" :class="{ 'selected': isSelected('ccas', cca) }">
                  <i class="bi" :class="isSelected('ccas', cca) ? 'bi-check' : 'bi-plus'">
                  </i>
                  {{ cca }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="saving">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="saveAndClose" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PreferencesSandbox from './preferencesSandbox.vue';
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { getUserDataFromFirestore, saveUserPreferencesToFirestore } from '../../composables/profile';
import { fetchCategoriesFromEvents, fetchCCAsFromEvents } from '../../composables/fetchEvents';
import { Tooltip } from 'bootstrap';


// Refs for component state
const modal = ref(null);
const bootstrapModal = ref(null);
const loading = ref(false);
const saving = ref(false);
const userData = ref(null);
const availableCategories = ref([]);
const availableCCAs = ref([]);

// Initialize data
onMounted(async () => {
  loading.value = true;
  try {
    userData.value = await getUserDataFromFirestore();
    availableCategories.value = await fetchCategoriesFromEvents();
    availableCCAs.value = await fetchCCAsFromEvents();
  } catch (error) {
    console.error('Error initializing preferences:', error);
  } finally {
    loading.value = false;
  }
});

// Check if an item is selected
const isSelected = (section, item) => {
  if (!userData.value) return false;

  if (section === 'categories') {
    return userData.value.category_interests?.includes(item);
  } else if (section === 'ccas') {
    return userData.value.cca_interest?.includes(item);
  }
  return false;
};

// Toggle selection of categories or CCAs
const toggleSelection = (section, item) => {
  if (!userData.value) return;

  if (section === 'categories') {
    if (!userData.value.category_interests) {
      userData.value.category_interests = [];
    }
    const index = userData.value.category_interests.indexOf(item);
    if (index === -1) {
      userData.value.category_interests.push(item);
    } else {
      userData.value.category_interests.splice(index, 1);
    }
  } else if (section === 'ccas') {
    if (!userData.value.cca_interest) {
      userData.value.cca_interest = [];
    }
    const index = userData.value.cca_interest.indexOf(item);
    if (index === -1) {
      userData.value.cca_interest.push(item);
    } else {
      userData.value.cca_interest.splice(index, 1);
    }
  }
};

// Modal control functions
const openModal = () => {
  if (!bootstrapModal.value) {
    bootstrapModal.value = new Modal(modal.value);
  }
  bootstrapModal.value.show();
};

const closeModal = () => {
  if (saving.value) return;
  bootstrapModal.value?.hide();
};

const saveAndClose = async () => {
  if (!userData.value) return;

  saving.value = true;
  try {
    // Save both categories and CCAs at once
    await Promise.all([
      saveUserPreferencesToFirestore('category_interests', userData.value.category_interests),
      saveUserPreferencesToFirestore('cca_interest', userData.value.cca_interest)
    ]);

    // Explicitly hide the modal using Bootstrap's hide method
    if (bootstrapModal.value) {
      bootstrapModal.value.hide();
    }

  } catch (error) {
    console.error('Error saving preferences:', error);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.preferences-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preference-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.preference-pill.categories:hover {
  background-color: rgba(254, 62, 115, 0.7); 
}

.preference-pill.cca:hover {
  background-color: #8c52ff;
}

.preference-pill.categories.selected {
  background-color: #FE3E73;
  border-color: #FE3E73;
  color: white;
}

.preference-pill.cca.selected {
  background-color: #8c52ff;
  border-color: #8c52ff;
  color: white;
}

.preference-pill i {
  font-size: 1rem;
}

.modal-body {
  padding: 1.5rem;
}
</style>