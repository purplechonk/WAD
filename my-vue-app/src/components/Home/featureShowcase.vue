<!-- components/ViewportFeatures.vue -->
<template>
  <div class="features-wrapper">
    <div class="background-effects">
      <div class="gradient-circle circle-1"></div>
      <div class="gradient-circle circle-2"></div>
    </div>

    <div class="content-container">
      <div class="header-section">
        <h1 class="main-title text-dark">SMU Events</h1>
        <p class="subtitle">Stay in the LOOP with sLOOP</p>
      </div>

      <div class="features-grid">
        <div v-for="(feature, index) in features" :key="feature.id" class="feature-card"
          :ref="el => featureRefs[index] = el" @click="handleFeatureClick(feature)"
          @mouseenter="onHover($event.currentTarget)" @mouseleave="onLeave($event.currentTarget)">
          <div class="icon-wrapper">
            <i :class="feature.icon"></i>
          </div>
          <span class="feature-title">{{ feature.title }}</span>
        </div>
      </div>
    </div>

    <!-- Login Modal -->

    <LoginForm v-if="showLoginModal" @login-success="handleLoginSuccess" @close="closeModal" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { animate, stagger, spring } from 'motion'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import LoginForm from '../Login/Login.vue'

export default {
  name: 'ViewportFeatures',
  components: {
    LoginForm
  },
  setup() {
    const router = useRouter()
    const featureRefs = ref([])
    const ctaButton = ref(null)
    const showLoginModal = ref(false)
    const isAuthenticated = ref(false)
    const pendingRoute = ref(null)

    const features = [
      {
        id: 'browse',
        title: 'Browse',
        icon: 'fas fa-compass',
        route: '/explore',
        requiresAuth: false
      },
      {
        id: 'myevents',
        title: 'My Events',
        icon: 'fas fa-calendar-alt',
        route: '/my-events',
        requiresAuth: true
      },
      {
        id: 'analytics',
        title: 'Analytics',
        icon: 'fas fa-chart-bar',
        route: '/analytics',
        requiresAuth: true
      },
      {
        id: 'profile',
        title: 'Profile',
        icon: 'fas fa-user',
        route: '/profile',
        requiresAuth: true
      }
    ]

    // Set up authentication listener
    onMounted(() => {
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
        isAuthenticated.value = !!user
        if (user && pendingRoute.value) {
          router.push(pendingRoute.value)
          pendingRoute.value = null
          showLoginModal.value = false
        }
      })
    })

    const handleFeatureClick = (feature) => {
      if (feature.requiresAuth && !isAuthenticated.value) {
        pendingRoute.value = feature.route
        showLoginModal.value = true
      } else {
        navigateTo(feature.route)
      }
    }

    const navigateTo = async (route) => {
      try {
        await router.push(route)
      } catch (error) {
        console.error('Navigation failed:', error)
      }
    }

    const handleLoginSuccess = () => {
      showLoginModal.value = false
      if (pendingRoute.value) {
        navigateTo(pendingRoute.value)
        pendingRoute.value = null
      }
    }

    const closeModal = () => {
      showLoginModal.value = false
      pendingRoute.value = null
    }

    const onHover = (element) => {
      animate(element, {
        scale: 1.05,
        y: -5
      }, {
        duration: 0.2,
        easing: spring({ stiffness: 400, damping: 17 })
      })
    }

    const onLeave = (element) => {
      animate(element, {
        scale: 1,
        y: 0
      }, {
        duration: 0.2,
        easing: spring({ stiffness: 400, damping: 17 })
      })
    }

    onMounted(() => {
      // Initial state - hide everything
      featureRefs.value.forEach(card => {
        card.style.opacity = '0'
        card.style.transform = 'scale(0.8) translateY(40px)'
      })

      if (ctaButton.value) {
        ctaButton.value.style.opacity = '0'
        ctaButton.value.style.transform = 'translateY(20px)'
      }

      // Create intersection observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Animate cards
            animate(featureRefs.value,
              {
                opacity: [0, 1],
                scale: [0.8, 1],
                y: [40, 0]
              },
              {
                duration: 0.7,
                delay: stagger(0.15),
                easing: spring({ stiffness: 100, damping: 15 })
              }
            )

            // Animate CTA button
            if (ctaButton.value) {
              animate(ctaButton.value,
                {
                  opacity: [0, 1],
                  y: [20, 0]
                },
                {
                  duration: 0.5,
                  delay: 0.8,
                  easing: 'ease-out'
                }
              )
            }

            observer.disconnect()
          }
        })
      }, {
        threshold: 0.2
      })

      observer.observe(document.querySelector('.features-wrapper'))
    })

    return {
      features,
      featureRefs,
      ctaButton,
      onHover,
      onLeave,
      handleFeatureClick,
      showLoginModal,
      closeModal,
      handleLoginSuccess,
      isAuthenticated
    }
  }
}
</script>

<style scoped>
/* Previous styles remain the same */
/* ... (keep all the previous styles) ... */

/* Add Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
}

/* Keep all previous styles as well */
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
  padding: 1rem;
}

.main-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  will-change: transform;
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
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

@media (max-width: 480px) {
  .features-grid {
    gap: 1rem;
  }

  .feature-card {
    padding: 1rem;
  }
}
</style>