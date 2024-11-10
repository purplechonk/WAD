<template>
  <div class="min-vh-100 mb-4">
    <!-- Section 1: Overall Event Analytics -->
    <section class="mt-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center flex-wrap">
              <div class="col-lg-8 col-12 mb-2">
                <h1 class="display-4 fw-bold text-primary">Event Analytics</h1>
                <p class="text-muted lead mb-0">Gain insights into SMU events, track your participation, and celebrate
                  your achievements with detailed analytics.</p>
              </div>
              <!-- Category Filter Dropdown -->
              <div class="bg-white rounded shadow-sm p-3 col-lg-3 col-12" style="min-width: 250px;">
                <label for="category" class="form-label text-muted small mb-1">Filter by Category:</label>
                <select id="category" class="form-select" v-model="selectedCategory" @change="filterEventsByCategory"
                  aria-label="Filter events by category">
                  <option value="">All Categories</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="col-12 col-lg-7 order-2 order-lg-1">
            <div class="card border-0 rounded shadow bg-white h-100">
              <div class="card-body p-4">
                <h3 class="h4 fw-bold mb-4">Number of Events Monthly</h3>
                <div class="row">
                  <div class="col-12">
                    <div ref="eventChart" class="w-100" style="height: 400px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top 5 CCAs Column -->
          <div class="col-12 col-lg-5 order-1 order-lg-2">
            <div class="card border-0 rounded shadow bg-white h-100">
              <div class="card-body p-4">
                <h3 class="h4 fw-bold mb-4">Top 5 CCAs</h3>
                <div class="accordion accordian-flush" id="ccaAccordion">
                  <div v-for="(cca, index) in topCCAs" :key="cca.name" class="accordion-item">
                    <h2 class="accordion-header" :id="'heading-' + index">
                      <button class="accordion-button d-flex align-items-center"
                        :class="{ 'collapsed': !isOpen(index) }" type="button" data-bs-toggle="collapse"
                        :data-bs-target="'#collapse-' + index" :aria-expanded="isOpen(index)"
                        :aria-controls="'collapse-' + index" @click="toggleCCA(index)">
                        <div class="d-flex align-items-center justify-content-between flex-grow-1">
                          <div class="d-flex align-items-center">
                            <span
                              class="badge bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                              style="min-width: 1.5rem; min-height: 1.5rem;">
                              <small class="fw-bold">{{ index + 1 }}</small>
                            </span>
                            {{ cca.name }}
                          </div>
                          <span class="badge bg-primary rounded-pill me-3">{{ cca.count }} events</span>
                        </div>
                      </button>
                    </h2>
                    <div :id="'collapse-' + index" class="accordion-collapse collapse"
                      :class="{ 'show': isOpen(index) }" :aria-labelledby="'heading-' + index"
                      data-bs-parent="#ccaAccordion">
                      <div class="accordion-body">
                        <ul class="list-group list-group-flush">
                          <li v-for="event in getEventsByCCA(cca.name)" :key="event.id" class="list-group-item">
                            {{ event.event_name }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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
        <div class="row g-4 mb-4">

          <h1 class="display-6 fw-bold mb-2 text-primary">Personal Insights</h1>

          <div class="col-12 col-md-4">
            <div class="card border-0 rounded shadow bg-white h-100">
              <div class="card-body p-4 d-flex flex-column h-100">
                <div class="d-flex align-items-center gap-2">
                  <i class="fas fa-calendar-check fs-4" style="color: #8257ff;"></i>
                  <span class="text-muted">Total events attended</span>
                </div>

                <div class="d-flex flex-column align-items-start justify-content-center flex-grow-1 my-4">
                  <h2 class="display-3 fw-bold mb-0 text-dark">
                    <animated-counter :value="userStats.totalEvents" :duration="3000" />
                  </h2>
                </div>

                <p class="text-muted small mb-0">since Jan 2024</p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card border-0 rounded shadow bg-white h-100">
              <div class="card-body p-4 d-flex flex-column h-100">
                <div class="d-flex align-items-center gap-2">
                  <i class="fas fa-clock fs-4" style="color: #8257ff;"></i>
                  <span class="text-muted">Total hours clocked</span>
                </div>

                <div class="d-flex flex-column align-items-start justify-content-center flex-grow-1 my-4">
                  <h2 class="display-3 fw-bold mb-0 text-dark">
                    <animated-counter :value="userStats.totalHours" :duration="3000" />
                    <span class="fs-6 fw-normal ms-1">hrs</span>
                  </h2>
                </div>

                <p class="text-muted small mb-0">since Jan 2024</p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card border-0 rounded shadow bg-white h-100">
              <div class="card-body p-4 d-flex flex-column h-100">
                <div class="d-flex align-items-center gap-2">
                  <i class="fas fa-trophy fs-4" style="color: #8257ff;"></i>
                  <span class="text-muted">Most participated CCA</span>
                </div>

                <div class="d-flex flex-column align-items-start justify-content-center flex-grow-1 my-4">
                  <h2 class="display-6 fw-bold mb-1 lh-sm text-dark">{{ userStats.topCCA.name }}</h2>
                </div>

                <div class="text-muted small mb-0">{{ userStats.topCCA.count }} events attended since Jan 2024</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Charts Row -->
        <div class="row g-4">
          <!-- Top CCAs Chart -->
          <div class="col-12 col-lg-6">
            <div class="card border-0 rounded shadow bg-white h-100">
              <div class="card-body p-4">
                <h4 class="fw-bold mb-4">My Top CCAs</h4>
                <div class="ratio ratio-16x9">
                  <div ref="userCCAChart" class="w-100 h-100"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Favorite Categories Chart -->
          <div class="col-12 col-lg-6">
            <div class="card border-0 rounded shadow bg-white h-100">
              <div class="card-body p-4">
                <h4 class="fw-bold mb-4">My Top Categories</h4>
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
import AnimatedCounter from './AnimatedCounter.vue';

export default {
  name: 'Analytics',
  components: {
    AnimatedCounter
  },
  setup() {
    const eventChartDiv = ref(null);
    const userCCAChartDiv = ref(null);
    const userCategoryChartDiv = ref(null);
    const openIndex = ref(0);

    const toggleCCA = (index) => {
      openIndex.value = openIndex.value === index ? null : index;
    };

    const isOpen = (index) => openIndex.value === index;

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

    onMounted(async () => {
      await initializeAnalytics();
      if (auth.currentUser) {
        await initializeUserAnalytics();
      }
      window.addEventListener('resize', handleResize);
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
      isOpen,
    };
  },
};
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-3px);
}

.list-group-item {
  cursor: pointer;
}
</style>