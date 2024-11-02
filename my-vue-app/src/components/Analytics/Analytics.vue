<template>
    <div class="container mt-5">
      <div class="row gy-4 row-cols-1 row-cols-md-3 mb-5">
        <!-- Total Events -->
        <div class="col">
          <div class="bento-card animate__animated animate__zoomIn">
            <div class="bento-content text-center">
              <i class="fas fa-calendar-check icon-primary mb-3"></i>
              <h4>Total Events</h4>
              <h2 class="display-5 fw-bold">{{ userStats.totalEvents }}</h2>
            </div>
          </div>
        </div>

        <!-- Total Hours -->
        <div class="col">
          <div class="bento-card animate__animated animate__zoomIn animate__delay-1s">
            <div class="bento-content text-center">
              <i class="fas fa-clock icon-accent mb-3"></i>
              <h4>Total Hours Participated</h4>
              <h2 class="display-5 fw-bold">{{ userStats.totalHours }} hrs</h2>
            </div>
          </div>
        </div>

        <!-- Most Active CCA -->
        <div class="col">
          <div class="bento-card animate__animated animate__zoomIn animate__delay-2s">
            <div class="bento-content text-center">
              <i class="fas fa-trophy icon-green mb-3"></i>
              <h4>Most Active CCA</h4>
              <h3>{{ userStats.topCCA.name }}</h3>
              <span class="badge bg-primary mt-2">{{ userStats.topCCA.count }} events</span>
            </div>
          </div>
        </div>

        <!-- User CCA Chart -->
        <div class="col-12">
          <div class="bento-card animate__animated animate__fadeInUp animate__delay-3s">
            <h4 class="text-center">Your Top CCAs</h4>
            <div ref="userCCAChart" style="width: 100%; height: 300px;"></div>
          </div>
        </div>

        <!-- User Category Chart -->
        <div class="col-12">
          <div class="bento-card animate__animated animate__fadeInUp animate__delay-4s">
            <h4 class="text-center">Your Favorite Categories</h4>
            <div ref="userCategoryChart" style="width: 100%; height: 300px;"></div>
          </div>
        </div>
      </div>

      <!-- Original Analytics Content -->
      <div class="row">
        <div class="col-md-8">
          <h2>Overall Event Analytics</h2>

          <!-- Category Filter Dropdown -->
          <label for="category" class="form-label">Filter by Category:</label>
          <select id="category" class="form-select mb-4" v-model="selectedCategory" @change="filterEventsByCategory">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>

          <!-- Time Series Bar Chart -->
          <h3>Events per Month</h3>
          <div ref="eventChart" style="width: 100%; height: 400px;"></div>
        </div>

        <!-- Leaderboard: Top 5 CCAs -->
        <div class="col-md-4">
          <h2>Top 5 CCAs with Most Events</h2>
          <ul class="list-group">
            <li v-for="(cca, index) in topCCAs" :key="cca.name" class="list-group-item">
              <div class="d-flex justify-content-between align-items-center" @click="toggleCCA(index)"
                style="cursor: pointer;" data-bs-toggle="collapse" :data-bs-target="'#collapse-' + index">
                <span>{{ index + 1 }}. {{ cca.name }}</span>
                <span class="badge bg-primary rounded-pill">{{ cca.count }} events</span>
              </div>

              <!-- Collapsible List of Events -->
              <div :id="'collapse-' + index" class="collapse mt-2">
                <ul class="list-group">
                  <li v-for="event in getEventsByCCA(cca.name)" :key="event.id" class="list-group-item">
                    {{ event.event_name }}
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

</template>

<script>
import { auth } from '../../firebase';
import {
  categories,
  selectedCategory,
  topCCAs,
  eventChart,
  initializeAnalytics,
  filterEventsByCategory,
  toggleCCA,
  getEventsByCCA,
} from '../../composables/analytics';
import {
  userStats,
  userCCAChart,
  userCategoryChart,
  initializeUserAnalytics,
} from '../../composables/analytics';
import { onMounted } from 'vue';

export default {
  name: 'Analytics',
  setup() {
    onMounted(() => {
      initializeAnalytics();
      if (auth.currentUser) {
        initializeUserAnalytics();
      }
    });

    return {
      auth,
      categories,
      selectedCategory,
      topCCAs,
      eventChart,
      userStats,
      userCCAChart,
      userCategoryChart,
      filterEventsByCategory,
      toggleCCA,
      getEventsByCCA,
    };
  },
};
</script>

<style scoped lang="scss">
.container {
  max-width: 1200px;
  padding: 2rem;
  background: linear-gradient(45deg, #0c0c0e, #1a1a1a);
}

.bento-card {
  background-color: #1f1f1f;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }
}

.bento-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  h4 {
    margin-top: 0.5rem;
    color: #fff;
  }

  h2,
  h3 {
    color: #fff;
    margin-top: 0.5rem;
  }
}

.icon-primary {
  color: #0d6efd;
  font-size: 3rem;
}

.icon-accent {
  color: #e83e8c;
  font-size: 3rem;
}

.icon-green {
  color: #28a745;
  font-size: 3rem;
}

/* Custom Animations */
.animate__fadeInUp {
  animation: fadeInUp 1.5s ease-out;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.badge {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

/* Responsive Layout */
@media (max-width: 768px) {
  .bento-card {
    padding: 1rem;
  }

  h4 {
    font-size: 1.25rem;
  }

  .icon-primary,
  .icon-accent,
  .icon-green {
    font-size: 2.5rem;
  }
}
</style>
