<template>
  <div class="analytics-container container-fluid">
    <!-- Header Section -->
    <div class="row mb-4 text-center">
      <div class="col-12">
        <h2 class="display-4 text-white animate__animated animate__fadeIn">
          Your Journey in Numbers
        </h2>
      </div>
    </div>

    <!-- Stats Cards Section -->
    <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
      <!-- Total Events Card -->
      <div class="col">
        <div class="stat-card" @click="flipCard('events')" :class="{ 'is-flipped': flippedCard === 'events' }">
          <div class="stat-card-inner">
            <div class="stat-card-front">
              <i class="fas fa-calendar-check stat-icon"></i>
              <h3>Total Events</h3>
              <div class="stat-value animate__animated animate__fadeInUp">
                {{ userStats.totalEvents }}
              </div>
            </div>
            <div class="stat-card-back text-center">
              <h4>Average Student Attended</h4>
              <div class="h2">???</div>
              <p>Events</p>
              
            </div>
          </div>
        </div>
      </div>

      <!-- Total Hours Card -->
      <div class="col">
        <div class="stat-card" @click="flipCard('hours')" :class="{ 'is-flipped': flippedCard === 'hours' }">
          <div class="stat-card-inner">
            <div class="stat-card-front">
              <i class="fas fa-clock stat-icon"></i>
              <h3>Total Hours</h3>
              <div class="stat-value animate__animated animate__fadeInUp">
                {{ userStats.totalHours }}
              </div>
            </div>
            <div class="stat-card-back text-center">
              <h4>Average Student Participated for</h4>
              <div class="h2">???</div>
              <p>Hours</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Top CCA Card -->
      <div class="col">
        <div class="stat-card" @click="flipCard('cca')" :class="{ 'is-flipped': flippedCard === 'cca' }">
          <div class="stat-card-inner">
            <div class="stat-card-front">
              <i class="fas fa-trophy stat-icon"></i>
              <div class="stat-name animate__animated animate__fadeInUp">
                <h3>{{ userStats.topCCA.name }}</h3>
              </div>
              <p>Is Your Top CCA</p>
            </div>
            <div class="stat-card-back">
              <h4>You Attended</h4>
              <div class="h2">{{ userStats.topCCA.count }}</div>
              <p>Of Their Events</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row mt-5 g-4">
      <div class="col-12 col-lg-6">
        <div class="chart-card animate__animated animate__fadeInUp">
          <h3 class="text-center mb-4">Your Top CCAs</h3>
          <div ref="userCCAChart" style="height: 300px"></div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="chart-card animate__animated animate__fadeInUp animate__delay-1s">
          <h3 class="text-center mb-4">Your Top Categories</h3>
          <div ref="userCategoryChart" style="height: 300px"></div>
        </div>
      </div>
    </div>

    <!-- Original Analytics Content -->
    <div class="row mt-5">
      <div class="text-center">
        <h2 class="display-4 text-white animate__animated animate__fadeIn">
            School-wide Insights
        </h2>
      </div>
      <div class="col-12 col-lg-8 mb-4 mb-lg-0">
        <h2>Number of Events per Month</h2>
        <label for="category" class="form-label">Filter by Category:</label>
        <select id="category" class="form-select mb-4" v-model="selectedCategory" @change="filterEventsByCategory">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
        <div style="overflow-x: auto; width:100%; display:block;">
          <div ref="eventChart" style="width: 100%; height: 400px;"></div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <h2>Top CCAs with Most Events</h2>
        <ul class="list-group">
          <li v-for="(cca, index) in topCCAs" :key="cca.name" class="list-group-item">
            <div class="d-flex justify-content-between align-items-center" @click="toggleCCA(index)" style="cursor: pointer;" data-bs-toggle="collapse" :data-bs-target="'#collapse-' + index">
              <span>{{ index + 1 }}. {{ cca.name }}</span>
              <span class="badge bg-primary rounded-pill">{{ cca.count }} events</span>
            </div>
            <div :id="'collapse-' + index" class="collapse mt-2">
              <ul class="list-group">
                <li v-for="event in getEventsByCCA(cca.name)" :key="event.id" class="list-group-item">{{ event.event_name }}</li>
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
import { onMounted, ref } from 'vue';
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
} from '../../composables/analytics';


export default {
  name: 'Analytics',
  setup() {
    const flippedCard = ref(null);

    const flipCard = (cardId) => {
      flippedCard.value = flippedCard.value === cardId ? null : cardId;
    };
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
      flippedCard,
      flipCard
    };
  },
};
</script>

<style scoped lang="scss">
.analytics-container {
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  min-height: 100vh;
}

.stat-card {
  perspective: 1000px;
  height: 220px;
  cursor: pointer;

  &-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  &.is-flipped .stat-card-inner {
    transform: rotateY(180deg);
  }

  &-front,
  &-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background: #1f1f1f;
    border-radius: 15px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  &-back {
    transform: rotateY(180deg);
    background: linear-gradient(135deg, #8c52ff 0%, #5c16c5 100%);
  }
}

.stat-icon {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: #8c52ff;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
}

.stat-name {
  font-size: 1.3rem;
  color: #fff;
  text-align: center;
}

.chart-card {
  background: #1f1f1f;
  border-radius: 15px;
  padding: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

@media (max-width: 992px) {
  .stat-card {
    height: 200px;
  }

  .stat-value {
    font-size: 1.7rem;
  }

  .stat-name {
    font-size: 1.1rem;
  }

  .chart-card {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .stat-card {
    height: 180px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-name {
    font-size: 1rem;
  }
}
</style>