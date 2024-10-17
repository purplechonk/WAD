<template>
  <div class="timetable-container">
    <div class="timetable-header">
      <h3 class="timetable-title">Weekly Timetable</h3>
      <button v-if="!editMode" @click="toggleEditMode" class="edit-btn">Edit</button>
      <div v-else class="edit-actions">
        <button @click="saveTimetable" class="save-btn">Save Timetable</button>
        <button @click="clearTimetable" class="clear-btn">Clear Timetable</button>
      </div>
    </div>

    <table class="timetable">
      <thead>
        <tr>
          <th class="time-header"></th> <!-- Empty top-left cell -->
          <th v-for="day in days" :key="day">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(time, index) in times" 
          :key="time"
        >
          <!-- Show hour heading only for the first row of each hour -->
          <td class="time-label" v-if="index % 4 === 0">{{ time }}</td>
          <td v-else></td>

          <td
            v-for="day in days"
            :key="`${day}-${time}`"
            :class="['time-block', { active: isSelected(day, time) }]"
            @mousedown="startSelection(day, time)"
            @mouseover="continueSelection(day, time)"
            @mouseup="endSelection"
          ></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

---

### **Script Setup**

No changes are needed for the script setup logic since it works perfectly with the requested change.

```javascript
<script setup>
import { ref, onMounted } from 'vue';
import { getUserTimetable, saveUserTimetable } from '../../composables/timetable';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const times = Array.from({ length: 64 }, (_, i) => {
  const hour = Math.floor(i / 4) + 8;
  const minute = (i % 4) * 15;
  const formattedHour = hour % 12 || 12;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${String(formattedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
});

const selectedBlocks = ref([]);
const isSelecting = ref(false);
const editMode = ref(false);

const isSelected = (day, time) =>
  selectedBlocks.value.some((block) => block.day === day && block.time === time);

const startSelection = (day, time) => {
  if (!editMode.value) return;
  isSelecting.value = true;
  toggleBlock(day, time);
};

const continueSelection = (day, time) => {
  if (isSelecting.value) toggleBlock(day, time);
};

const endSelection = () => {
  isSelecting.value = false;
};

const toggleBlock = (day, time) => {
  const index = selectedBlocks.value.findIndex(
    (block) => block.day === day && block.time === time
  );
  if (index === -1) selectedBlocks.value.push({ day, time });
  else selectedBlocks.value.splice(index, 1);
};

const clearTimetable = () => {
  selectedBlocks.value = [];
};

const loadUserTimetable = async () => {
  const timetable = await getUserTimetable();
  if (timetable) selectedBlocks.value = timetable;
};

const saveTimetable = async () => {
  await saveUserTimetable(selectedBlocks.value);
  editMode.value = false;
};

const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

onMounted(loadUserTimetable);
</script>

<style scoped>
.timetable-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f9f9f9;
  padding: 20px;
}

.timetable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 10px;
}

.timetable-title {
  font-size: 2rem;
}

.edit-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-btn:hover {
  background-color: #0056b3;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.save-btn,
.clear-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.clear-btn {
  background-color: #f44336;
}

.save-btn:hover {
  background-color: #388e3c;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

.timetable {
  border-collapse: collapse;
  width: 100%;
  max-width: 1200px;
  user-select: none;
}

th {
  background-color: #007bff;
  color: white;
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

.time-label {
  background-color: #f0f0f0;
  text-align: center;
  padding: 5px;
  border: 1px solid #ddd;
  width: 70px;
}

.time-block {
  border: 1px solid #ddd;
  height: 30px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.time-block.active {
  background-color: #4caf50;
}

.time-block:hover {
  background-color: #e0e0e0;
}
</style>
