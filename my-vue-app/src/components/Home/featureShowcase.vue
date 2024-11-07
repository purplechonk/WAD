<!-- components/ViewportFeatures.vue -->
<template>
  <div class="features-wrapper">
    <!-- Background gradient circles -->
    <div class="background-effects">
      <div class="gradient-circle circle-1"></div>
      <div class="gradient-circle circle-2"></div>
    </div>

    <!-- Main content container -->
    <div class="content-container">
      <!-- Header -->
      <div class="header-section">
        <h1 class="main-title">SMU Events</h1>
        <p class="subtitle">Stay in the LOOP with sLOOP</p>
      </div>

      <!-- Features Grid -->
      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="feature.id"
          :ref="el => featureRefs[index] = el"
          class="feature-card"
          @click="navigateTo(feature.route)"
          @mouseenter="onHover(index)"
          @mouseleave="onLeave(index)"
        >
          <div class="icon-wrapper">
            <i :class="feature.icon"></i>
          </div>
          <span class="feature-title">{{ feature.title }}</span>
        </div>
      </div>

      <!-- CTA Button -->
      <button class="get-started-btn" @click="navigateTo('/signup')">
        Get Started
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

export default {
  name: 'ViewportFeatures',
  setup() {
    const featureRefs = ref([])
    const hoveredIndex = ref(null)

    const features = [
      {
        id: 'browse',
        title: 'Browse Events',
        icon: 'fas fa-compass',
        route: '/browse'
      },
      {
        id: 'notifications',
        title: 'Notifications',
        icon: 'fas fa-bell',
        route: '/notifications'
      },
      {
        id: 'timeline',
        title: 'My Timeline',
        icon: 'fas fa-calendar',
        route: '/timeline'
      },
      {
        id: 'interests',
        title: 'Interests',
        icon: 'fas fa-star',
        route: '/interests'
      },
      {
        id: 'analytics',
        title: 'Analytics',
        icon: 'fas fa-chart-line',
        route: '/analytics'
      }
    ]

    const onHover = (index) => {
      hoveredIndex.value = index
      gsap.to(featureRefs.value[index], {
        scale: 1.1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    const onLeave = (index) => {
      hoveredIndex.value = null
      gsap.to(featureRefs.value[index], {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    onMounted(() => {
      // Animate cards in
      gsap.from(featureRefs.value, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      })
    })

    return {
      features,
      featureRefs,
      hoveredIndex,
      onHover,
      onLeave,
      navigateTo: (route) => {
        // Your router navigation logic here
      }
    }
  }
}
</script>

<style scoped>
.features-wrapper {
  height: 100vh;
  width: 100%;
  position: relative;
  background: #f5f3ff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background-effects {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.gradient-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.2;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: #8c52ff;
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 250px;
  height: 250px;
  background: #8c52ff;
  bottom: -50px;
  right: -50px;
}

.content-container {
  width: 90%;
  max-width: 1000px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.main-title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: #6b7280;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  width: 100%;
  padding: 0 1rem;
}

.feature-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.feature-card:hover .icon-wrapper {
  background: #4338ca;
}

.icon-wrapper i {
  font-size: 1.5rem;
  color: #4338ca;
  transition: color 0.3s ease;
}

.feature-card:hover .icon-wrapper i {
  color: white;
}

.feature-title {
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

.get-started-btn {
  background: #4338ca;
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(67, 56, 202, 0.25);
  margin-top: 2rem;
}

.get-started-btn:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(67, 56, 202, 0.3);
}

@media (max-width: 768px) {
  .content-container {
    height: 95vh;
    padding: 1rem 0;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .feature-card {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>