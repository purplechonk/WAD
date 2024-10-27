<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2>My Weekly Timetable</h2>
      <i @click="openAddModal" 
         class="bi bi-calendar-plus text-primary ms-4"
         style="cursor: pointer; font-size: 24px;">
      </i>
    </div>

    <div class="rounded shadow-sm">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasClasses" class="text-center py-5">
        <i class="bi bi-calendar3 fs-1 text-muted"></i>
        <p class="mt-3 text-muted">No classes at the moment</p>
        <button @click="openAddModal" class="btn btn-primary text-light mt-2">
          Add Class
        </button>
      </div>

      <!-- Timetable Content -->
      <template v-else>
        <!-- Day Selection Tabs -->
        <ul class="nav nav-pills nav-fill mb-4 gap-1" role="tablist">
          <li class="nav-item" v-for="day in days" :key="day">
            <button class="nav-link px-4" :class="{ active: selectedDay === day }" @click="selectDay(day)"
              type="button">
              {{ day }}
            </button>
          </li>
        </ul>
        <!-- Classes List -->
        <div class="list-group list-group-flush">
          <template v-if="paginatedClasses.length">
            <div v-for="(classItem, index) in paginatedClasses" :key="index" class="list-group-item">
              <div class="d-flex flex-wrap justify-content-between align-items-start mb-2">
                <div class="badges-wrapper d-flex flex-wrap gap-2 flex-grow-1">
                  <span class="badge time-badge text-dark">
                    {{ classItem.start_time }} - {{ classItem.end_time }}
                  </span>
                  <span class="badge duration-badge">
                    {{ calculateDuration(classItem.start_time, classItem.end_time) }} minutes
                  </span>
                </div>
                <i @click="openEditModal(classItem)" 
                   class="bi bi-pencil ms-3 text-primary"
                   style="cursor: pointer; font-size: 16px;">
                </i>
              </div>
              <div class="module-name"><u>{{ classItem.class_name }}</u></div>
              <div class="room-number">{{ classItem.location }}</div>
            </div>

            <!-- Pagination Controls -->
            <div v-if="totalPages > 1"
              class="pagination-controls d-flex justify-content-center align-items-center gap-3 mt-4 mb-3">
              <button class="btn btn-outline-primary btn-sm" @click="previousPage" :disabled="currentPage === 1">
                Previous
              </button>
              <span class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button class="btn btn-outline-primary btn-sm" @click="nextPage" :disabled="currentPage === totalPages">
                Next
              </button>
            </div>
          </template>
          <div v-else class="text-center py-4 text-muted">
            No classes scheduled for {{ selectedDay }}
          </div>
        </div>
      </template>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" id="classModal" tabindex="-1" ref="classModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Class' : 'Add New Class' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveClass">
              <div class="mb-3">
                <label class="form-label">Class Name</label>
                <input v-model="currentClass.class_name" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Day</label>
                <select v-model="currentClass.day" class="form-select" required>
                  <option value="" disabled>Select Day</option>
                  <option v-for="day in days" :key="day" :value="day">
                    {{ day }}
                  </option>
                </select>
              </div>
              <div class="row mb-3">
                <div class="col">
                  <label class="form-label">Start Time</label>
                  <input v-model="currentClass.start_time" type="time" class="form-control" required>
                </div>
                <div class="col">
                  <label class="form-label">End Time</label>
                  <input v-model="currentClass.end_time" type="time" class="form-control" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Location</label>
                <input v-model="currentClass.location" type="text" class="form-control" required>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <!-- Delete button (only shows in edit mode) -->
                <button v-if="isEditing" type="button" @click="deleteClass" class="btn btn-outline-danger">
                  Delete
                </button>
                <div class="ms-auto">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary">
                    {{ isEditing ? 'Save Changes' : 'Add Class' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { getUserDataFromFirestore, saveScheduleToFirestore } from '../../composables/profile';

export default {
  name: 'Timetable',
  setup() {
    // State
    const loading = ref(true);
    const userData = ref(null);
    const schedule = ref([]);
    const selectedDay = ref('Monday');
    const modal = ref(null);
    const classModal = ref(null);
    const isEditing = ref(false);
    const currentClass = ref({
      class_name: '',
      day: '',
      start_time: '',
      end_time: '',
      location: '',
      id: null
    });

    // Pagination state
    const currentPage = ref(1);
    const itemsPerPage = 2;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Computed Properties
    const hasClasses = computed(() => schedule.value.length > 0);

    const filteredClasses = computed(() => {
      return schedule.value
        .filter(classItem => classItem.day === selectedDay.value)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredClasses.value.length / itemsPerPage);
    });

    const paginatedClasses = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredClasses.value.slice(startIndex, endIndex);
    });

    // Methods
    const initializeSchedule = async () => {
      try {
        loading.value = true;
        userData.value = await getUserDataFromFirestore();

        if (userData.value?.weekly_timetable) {
          schedule.value = userData.value.weekly_timetable.map(classItem => ({
            ...classItem,
            id: classItem.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
          }));
        } else {
          schedule.value = [];
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        loading.value = false;
      }
    };

    const resetCurrentClass = () => {
      currentClass.value = {
        class_name: '',
        day: '',
        start_time: '',
        end_time: '',
        location: '',
        id: null
      };
    };

    const openAddModal = () => {
      isEditing.value = false;
      resetCurrentClass();
      modal.value.show();
    };

    const openEditModal = (classItem) => {
      isEditing.value = true;
      currentClass.value = { ...classItem };
      modal.value.show();
    };

    const deleteClass = async () => {
      if (confirm('Are you sure you want to delete this class?')) {
        try {
          const updatedSchedule = schedule.value.filter(item => item.id !== currentClass.value.id);
          await saveScheduleToFirestore(updatedSchedule);
          schedule.value = updatedSchedule;
          modal.value.hide();

          // Reset to page 1 if current page becomes empty
          if (paginatedClasses.value.length === 0 && currentPage.value > 1) {
            currentPage.value = 1;
          }
        } catch (error) {
          console.error('Error deleting class:', error);
          alert('Failed to delete class. Please try again.');
        }
      }
    };

    const saveClass = async () => {
      try {
        let updatedSchedule;
        if (isEditing.value) {
          // Update existing class
          updatedSchedule = schedule.value.map(item =>
            item.id === currentClass.value.id ? currentClass.value : item
          );
        } else {
          // Add new class with unique ID
          const newClass = {
            ...currentClass.value,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
          };
          updatedSchedule = [...schedule.value, newClass];
        }

        await saveScheduleToFirestore(updatedSchedule);
        schedule.value = updatedSchedule;
        modal.value.hide();
        resetCurrentClass();
      } catch (error) {
        console.error('Error saving class:', error);
        alert('Failed to save changes. Please try again.');
      }
    };

    const calculateDuration = (start, end) => {
      const [startHours, startMinutes] = start.split(':').map(Number);
      const [endHours, endMinutes] = end.split(':').map(Number);

      const totalStartMinutes = startHours * 60 + startMinutes;
      const totalEndMinutes = endHours * 60 + endMinutes;

      return totalEndMinutes - totalStartMinutes;
    };

    // Pagination Methods
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const selectDay = (day) => {
      selectedDay.value = day;
      currentPage.value = 1;
    };

    // Lifecycle Hooks
    onMounted(() => {
      modal.value = new Modal(classModal.value);
      initializeSchedule();
    });

    return {
      loading,
      schedule,
      selectedDay,
      days,
      hasClasses,
      filteredClasses,
      paginatedClasses,
      currentPage,
      totalPages,
      classModal,
      currentClass,
      isEditing,
      openAddModal,
      openEditModal,
      saveClass,
      deleteClass,
      calculateDuration,
      nextPage,
      previousPage,
      selectDay
    };
  }
}
</script>

<style scoped>
.time-badge {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  background-color: #3EFEC9;
}

.list-group-item {
  transition: background-color 0.2s;
  padding: 1.25rem;
  border-left: 4px solid transparent;
  border-radius: 6px;
}

.list-group-item:hover {
  background-color: #35353a;
  border-radius: 6px;
}

.module-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.35rem 0;
  line-height: 1.2;
}

.room-number {
  font-size: 0.85rem;
  font-weight: 500;
}

.duration-badge {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: solid 1px;
  border-color: #3EFEC9;
  color: #3EFEC9;
}

.time-badge, .duration-badge {
  white-space: nowrap;  /* Prevents breaking within badges */
}

.badges-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0; 
}

/* Pagination styles */
.pagination-controls {
  padding: 1rem 0;
}

.page-info {
  font-size: 0.9rem;
  color: #6c757d;
}

.nav-link {
  color: #6c757d;
}

.nav-link.active {
  background-color: #3EFEC9;
  color: #000;
}
</style>