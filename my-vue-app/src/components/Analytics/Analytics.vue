```vue
<template>
  <div class="min-vh-100">
    <!-- Section 1: Overall Event Analytics -->
    <section class="py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center flex-wrap mb-4">
              <h1 class="text-dark mb-0 animate-header">Overall Event Analytics</h1>
              <!-- Category Filter Dropdown -->
              <div class="bg-white rounded shadow-sm p-3 animate-header" style="min-width: 250px;">
                <label for="category" class="form-label text-muted small mb-1">Filter by Category:</label>
                <select
                  id="category"
                  class="form-select"
                  v-model="selectedCategory"
                  @change="filterEventsByCategory"
                  aria-label="Filter events by category"
                >
                  <option value="">All Categories</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="col-12 col-lg-8 order-2 order-lg-1">
            <div class="card border-0 rounded shadow bg-white h-100 animate-card">
              <div class="card-body p-4">
                <h3 class="h4 fw-bold mb-4">Monthly Event Distribution</h3>
                <div class="row">
                  <div class="col-12">
                    <div ref="eventChart" class="w-100" style="height: 400px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top 5 CCAs Column -->
          <div class="col-12 col-lg-4 order-1 order-lg-2">
            <div class="card border-0 rounded shadow bg-white h-100 animate-card">
              <div class="card-body p-4">
                <h3 class="h4 fw-bold mb-4">Top 5 CCAs</h3>
                <ul class="list-group list-group-flush">
                  <li
                    v-for="(cca, index) in topCCAs"
                    :key="cca.name"
                    class="list-group-item px-0 py-3 animate-list-item"
                  >
                    <div
                      class="d-flex justify-content-between align-items-center"
                      @click="toggleCCA(index)"
                      role="button"
                      tabindex="0"
                      @keydown.enter="toggleCCA(index)"
                      @keydown.space.prevent="toggleCCA(index)"
                      aria-expanded="false"
                      :aria-controls="'collapse-' + index"
                    >
                      <div class="d-flex align-items-center">
                        <span class="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                              style="width: 24px; height: 24px;">
                          <small class="fw-bold text-white">{{ index + 1 }}</small>
                        </span>
                        <span>{{ cca.name }}</span>
                      </div>
                      <span class="badge bg-primary rounded-pill px-3">{{ cca.count }} events</span>
                    </div>

                    <div :id="'collapse-' + index" class="collapse mt-3">
                      <ul class="list-group list-group-flush ps-4">
                        <li
                          v-for="event in getEventsByCCA(cca.name)"
                          :key="event.id"
                          class="list-group-item border-0 px-0 py-2"
                        >
                          {{ event.event_name }}
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Combined User Statistics & Analytics -->
    <section class="py-5">
      <div class="container">
        <!-- Stats Cards Row -->
        <div class="row g-4 mb-5 stats-section">
          <div class="col-12 mb-4">
            <h2 class="fw-bold text-dark animate-header">User Statistics</h2>
          </div>
          <div class="col-12 col-md-4">
            <div class="card border-0 rounded shadow bg-white h-100 animate-card">
              <div class="card-body text-center p-4">
                <div class="mb-3">
                  <i class="fas fa-calendar-check text-primary display-4"></i>
                </div>
                <h4 class="h5 text-muted mb-3">Total Events</h4>
                <h2 class="display-5 fw-bold mb-0">{{ userStats.totalEvents }}</h2>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card border-0 rounded shadow bg-white h-100 animate-card">
              <div class="card-body text-center p-4">
                <div class="mb-3">
                  <i class="fas fa-clock text-danger display-4"></i>
                </div>
                <h4 class="h5 text-muted mb-3">Total Hours</h4>
                <h2 class="display-5 fw-bold mb-0">{{ userStats.totalHours }} <span class="fs-6">hrs</span></h2>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card border-0 rounded shadow bg-white h-100 animate-card">
              <div class="card-body text-center p-4">
                <div class="mb-3">
                  <i class="fas fa-trophy text-success display-4"></i>
                </div>
                <h4 class="h5 text-muted mb-3">Most Active CCA</h4>
                <h3 class="h4 mb-2">{{ userStats.topCCA.name }}</h3>
                <span class="badge bg-primary px-3">{{ userStats.topCCA.count }} events</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Charts Row -->
        <div class="row g-4 charts-section">
          <!-- Top CCAs Chart -->
          <div class="col-12 col-lg-6">
            <div class="card border-0 rounded shadow bg-white h-100 animate-card">
              <div class="card-body p-4">
                <h4 class="fw-bold mb-4">Your Top CCAs</h4>
                <div class="ratio ratio-16x9">
                  <div ref="userCCAChart" class="w-100 h-100"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Favorite Categories Chart -->
          <div class="col-12 col-lg-6">
            <div class="card border-0 rounded shadow bg-white h-100 animate-card">
              <div class="card-body p-4">
                <h4 class="fw-bold mb-4">Category Distribution</h4>
                <div class="ratio ratio-16x9">
                  <div ref="userCategoryChart" class="w-100 h-100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { animate, stagger, spring, ScrollOffset } from 'motion';
import {
  categories,
  selectedCategory,
  topCCAs,
  eventChart,
  initializeAnalytics,
  filterEventsByCategory,
  toggleCCA,
  getEventsByCCA,
  userStats,
  userCCAChart,
  userCategoryChart,
  initializeUserAnalytics,
  eventChartInstance,
  userCCAChartInstance,
  userCategoryChartInstance
} from '../../composables/analytics';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { auth } from '../../firebase';

export default {
  name: 'Analytics',
  setup() {
    const eventChartDiv = ref(null);
    const userCCAChartDiv = ref(null);
    const userCategoryChartDiv = ref(null);

    // Handle Window Resize with debounce
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (eventChartInstance.value) {
          eventChartInstance.value.resize();
        }
        if (userCCAChartInstance.value) {
          userCCAChartInstance.value.resize();
        }
        if (userCategoryChartInstance.value) {
          userCategoryChartInstance.value.resize();
        }
      }, 250);
    };

    // Animation functions
    const initializeAnimations = () => {
      // Headers animation
      animate(
        '.animate-header',
        { 
          opacity: [0, 1], 
          x: [-20, 0] 
        },
        { 
          duration: 0.6,
          delay: stagger(0.2),
          easing: spring({ damping: 15 })
        }
      );

      // Cards animation
      animate(
        '.animate-card',
        { 
          opacity: [0, 1], 
          y: [20, 0] 
        },
        { 
          duration: 0.7,
          delay: stagger(0.15),
          easing: spring({ damping: 12 })
        }
      );

      // List items animation
      animate(
        '.animate-list-item',
        { 
          opacity: [0, 1], 
          x: [-20, 0] 
        },
        { 
          duration: 0.5,
          delay: stagger(0.1),
          easing: spring({ damping: 15 })
        }
      );

      // Setup scroll animations for stats and charts sections
      document.querySelectorAll('.stats-section .card, .charts-section .card').forEach((element, index) => {
        animate(
          element,
          { 
            opacity: [0, 1], 
            y: [30, 0],
            scale: [0.95, 1] 
          },
          { 
            duration: 0.6,
            delay: 0.1 * index,
            easing: spring({ damping: 15 }),
            offset: ScrollOffset.Once
          }
        );
      });
    };

    onMounted(async () => {
      await initializeAnalytics();
      if (auth.currentUser) {
        await initializeUserAnalytics();
      }
      window.addEventListener('resize', handleResize);
      
      // Initialize animations after a small delay to ensure DOM is ready
      setTimeout(initializeAnimations, 100);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    });

    // Watchers for dynamic data updates
    watch(
      () => eventChart.data,
      (newData) => {
        if (eventChartInstance.value) {
          eventChartInstance.value.setOption(getEventChartOptions(newData));
        }
      }
    );

    watch(
      () => userCCAChart.data,
      (newData) => {
        if (userCCAChartInstance.value) {
          userCCAChartInstance.value.setOption(getUserCCAChartOptions(newData));
        }
      }
    );

    watch(
      () => userCategoryChart.data,
      (newData) => {
        if (userCategoryChartInstance.value) {
          userCategoryChartInstance.value.setOption(getUserCategoryChartOptions(newData));
        }
      }
    );

    return {
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
      eventChartDiv,
      userCCAChartDiv,
      userCategoryChartDiv,
    };
  },
};
</script>

<style scoped>
.animate-header,
.animate-card,
.animate-list-item {
  opacity: 0;
}

.card {
  will-change: transform;
}

.card:hover {
  transform: translateY(-3px);
  transition: transform 0.2s ease-in-out;
}

.list-group-item {
  cursor: pointer;
}
</style>
```