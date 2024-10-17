<template>
  <div class="profile-page" v-if="userData">
    <h1>Profile Page</h1>

    <!-- Basic User Info Section (Uneditable) -->
    <div class="profile-section">
      <h3>Basic Information</h3>
      <div class="user-info">
        <p><strong>Name:</strong> {{ userData.name }}</p>
        <p><strong>Email:</strong> {{ userData.email }}</p>
        <p><strong>Gender:</strong> {{ userData.gender || 'Not Set' }}</p>
        <p><strong>Matriculation Year:</strong> {{ userData.matriculation_year }}</p>
      </div>
    </div>

    <!-- Category Interests Section -->
    <div class="profile-section">
      <div class="section-header">
        <h3>Category Interests</h3>
        <button v-if="!editingCategories" @click="startEdit('categories')">Edit</button>
        <button v-if="editingCategories" @click="savePreferences('categories')">Save</button>
      </div>

      <div class="interests-list">
        <span v-if="!editingCategories">
          <span v-for="category in userData.category_interests" :key="category" class="pill selected">
            {{ category }} <i class="fas fa-check"></i>
          </span>
          <span v-if="userData.category_interests.length === 0">No categories followed</span>
        </span>

        <div v-if="editingCategories">
          <span
            v-for="category in availableCategories"
            :key="category"
            @click="toggleSelection('categories', category)"
            class="pill"
            :class="{ selected: isSelected('categories', category), unselected: !isSelected('categories', category) }"
          >
            {{ category }} <i :class="isSelected('categories', category) ? 'fas fa-check' : 'fas fa-plus'"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- CCA Interests Section -->
    <div class="profile-section">
      <div class="section-header">
        <h3>CCA Interests</h3>
        <button v-if="!editingCCAs" @click="startEdit('ccas')">Edit</button>
        <button v-if="editingCCAs" @click="savePreferences('ccas')">Save</button>
      </div>

      <div class="interests-list">
        <span v-if="!editingCCAs">
          <span v-for="cca in userData.cca_interest" :key="cca" class="pill selected">
            {{ cca }} <i class="fas fa-check"></i>
          </span>
          <span v-if="userData.cca_interest.length === 0">No CCAs followed</span>
        </span>

        <div v-if="editingCCAs">
          <span
            v-for="cca in availableCCAs"
            :key="cca"
            @click="toggleSelection('ccas', cca)"
            class="pill"
            :class="{ selected: isSelected('ccas', cca), unselected: !isSelected('ccas', cca) }"
          >
            {{ cca }} <i :class="isSelected('ccas', cca) ? 'fas fa-check' : 'fas fa-plus'"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Timetable Section -->
    <div class="profile-section">
      <h3>Weekly Timetable</h3>
      <Timetable /> <!-- Embed Timetable Component -->
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
import { getUserDataFromFirestore, saveUserPreferencesToFirestore } from '../../composables/profile';
import { fetchCategoriesFromEvents, fetchCCAsFromEvents } from '../../composables/fetchEvents';
import Timetable from './Timetable.vue'; // Import Timetable component
import LogoutButton from './LogoutButton.vue'; // Import LogoutButton

const userData = ref(null);
const editingCategories = ref(false);
const editingCCAs = ref(false);
const availableCategories = ref([]);
const availableCCAs = ref([]);

// Fetch user data and categories/CCAs on mount
onMounted(async () => {
  userData.value = await getUserDataFromFirestore();
  availableCategories.value = await fetchCategoriesFromEvents();
  availableCCAs.value = await fetchCCAsFromEvents();
});

// Start editing section
const startEdit = (section) => {
  if (section === 'categories') {
    editingCategories.value = true;
  } else if (section === 'ccas') {
    editingCCAs.value = true;
  }
};

// Save user preferences to Firestore
const savePreferences = async (section) => {
  const key = section === 'categories' ? 'category_interests' : 'cca_interest';
  await saveUserPreferencesToFirestore(key, userData.value[key]);
  section === 'categories' ? (editingCategories.value = false) : (editingCCAs.value = false);
};

// Toggle selection for categories or CCAs
const toggleSelection = (section, item) => {
  const array = userData.value[section === 'categories' ? 'category_interests' : 'cca_interest'];
  const index = array.indexOf(item);
  index === -1 ? array.push(item) : array.splice(index, 1);
};

// Check if an item is selected
const isSelected = (section, item) => {
  return userData.value[section === 'categories' ? 'category_interests' : 'cca_interest'].includes(item);
};
</script>

<style scoped>
.profile-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
