<template>
  <div class="profile-page" v-if="userData">
    <h1>Profile Page</h1>

    <!-- Category Interests Section -->
    <div class="profile-section">
      <h3>Category Interests</h3>
      <div class="interests-list">
        <!-- Show pills for selected categories -->
        <span v-if="userData.category_interests.length > 0">
          <span v-for="category in userData.category_interests" :key="category" class="pill selected">
            {{ category }} <i class="fas fa-check"></i>
          </span>
        </span>
        <span v-else>No categories followed</span>
      </div>

      <!-- Edit button and interests list -->
      <button @click="toggleEdit('categories')">
        {{ editingCategories ? 'Save interests' : 'Edit interests' }}
      </button>

      <!-- Show unselected categories in edit mode -->
      <div v-if="editingCategories">
        <span v-for="category in availableCategories" :key="category" @click="toggleSelection('categories', category)" class="pill" :class="{ unselected: !isSelected('categories', category) }">
          {{ category }} <i :class="isSelected('categories', category) ? 'fas fa-check' : 'fas fa-plus'"></i>
        </span>
      </div>
    </div>

    <!-- CCA Interests Section -->
    <div class="profile-section">
      <h3>CCA Interests</h3>
      <div class="interests-list">
        <!-- Show pills for selected CCAs -->
        <span v-if="userData.cca_interest.length > 0">
          <span v-for="cca in userData.cca_interest" :key="cca" class="pill selected">
            {{ cca }} <i class="fas fa-check"></i>
          </span>
        </span>
        <span v-else>No CCAs followed</span>
      </div>

      <!-- Edit button and CCAs list -->
      <button @click="toggleEdit('ccas')">
        {{ editingCCAs ? 'Save CCAs' : 'Edit CCA preferences' }}
      </button>

      <!-- Show unselected CCAs in edit mode -->
      <div v-if="editingCCAs">
        <span v-for="cca in availableCCAs" :key="cca" @click="toggleSelection('ccas', cca)" class="pill" :class="{ unselected: !isSelected('ccas', cca) }">
          {{ cca }} <i :class="isSelected('ccas', cca) ? 'fas fa-check' : 'fas fa-plus'"></i>
        </span>
      </div>
    </div>

    <!-- Logout Button -->
    <div class="logout-section">
      <LogoutButton />
    </div>
  </div>

  <div v-else>
    <p>Loading profile data...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserDataFromFirestore, saveUserPreferencesToFirestore } from '../composables/auth';
import { fetchCategoriesFromEvents, fetchCCAsFromEvents } from '../composables/fetchEvents'; // Import fetch functions
import LogoutButton from './LogoutButton.vue'; // Import the LogoutButton component

const userData = ref(null);
const editingCategories = ref(false);
const editingCCAs = ref(false);

// Dynamically fetched categories and CCAs
const availableCategories = ref([]);
const availableCCAs = ref([]);

// Fetch user data and available categories/CCAs from events collection on mount
onMounted(async () => {
  userData.value = await getUserDataFromFirestore(); // Fetch the user data from Firestore
  availableCategories.value = await fetchCategoriesFromEvents(); // Fetch categories from events collection
  availableCCAs.value = await fetchCCAsFromEvents(); // Fetch CCAs from events collection
});

// Toggle between edit/save modes
const toggleEdit = (section) => {
  if (section === 'categories') {
    if (editingCategories.value) {
      saveUserPreferencesToFirestore('category_interests', userData.value.category_interests);
    }
    editingCategories.value = !editingCategories.value;
  } else if (section === 'ccas') {
    if (editingCCAs.value) {
      saveUserPreferencesToFirestore('cca_interest', userData.value.cca_interest);
    }
    editingCCAs.value = !editingCCAs.value;
  }
};

// Toggle selection of categories or CCAs
const toggleSelection = (section, item) => {
  if (section === 'categories') {
    const index = userData.value.category_interests.indexOf(item);
    if (index === -1) {
      userData.value.category_interests.push(item); // Add if not selected
    } else {
      userData.value.category_interests.splice(index, 1); // Remove if selected
    }
  } else if (section === 'ccas') {
    const index = userData.value.cca_interest.indexOf(item);
    if (index === -1) {
      userData.value.cca_interest.push(item); // Add if not selected
    } else {
      userData.value.cca_interest.splice(index, 1); // Remove if selected
    }
  }
};

// Check if an item is selected
const isSelected = (section, item) => {
  if (section === 'categories') {
    return userData.value.category_interests.includes(item);
  } else if (section === 'ccas') {
    return userData.value.cca_interest.includes(item);
  }
};
</script>

<style scoped>
.profile-section {
  margin-bottom: 40px;
}

.pill {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 20px;
  background-color: #e0e0e0;
  margin-right: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pill.selected {
  background-color: #007bff;
  color: white;
}

.pill.unselected {
  background-color: #f0f0f0;
  color: #6c757d;
}

button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.logout-section {
  margin-top: 50px;
}
</style>
