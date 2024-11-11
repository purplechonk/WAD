<template>
  <div class="feedback-carousel-container w-full py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Title Section -->
        <div class="header-section text-center" ref="titleRef">
          <h2 class="main-title text-dark">What Our Users Say</h2>
          <div class="divider"></div>
        </div>

        <!-- Carousel Section -->
        <div id="feedbackCarousel" class="carousel slide relative" data-bs-ride="carousel" ref="carouselRef">
          <div class="carousel-inner">
            <div v-for="(chunk, index) in feedbackChunks" :key="index"
              :class="['carousel-item', index === 0 ? 'active' : '']">
              <div class="feedback-grid">
                <div v-for="feedback in chunk" :key="feedback.id" class="feedback-card">
                  <div class="card">
                    <div class="card-inner">
                      <div class="quote-icon">
                        <i class="fas fa-quote-left text-primary"></i>
                      </div>
                      <div class="feedback-content">
                        <p class="feedback-text">{{ feedback.comment }}</p>
                      </div>
                      <div class="feedback-author">
                        <div class="avatar">
                          {{ getInitials(feedback.name) }}
                        </div>
                        <p class="author-name">{{ feedback.name }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carousel Controls -->
          <button class="carousel-control-prev" type="button" data-bs-target="#feedbackCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#feedbackCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>

          <!-- Carousel Indicators -->
          <div class="carousel-indicators">
            <button v-for="(_, index) in feedbackChunks" :key="index" type="button" data-bs-target="#feedbackCarousel"
              :data-bs-slide-to="index" :class="{ active: index === 0 }" :aria-current="index === 0"
              :aria-label="'Slide ' + (index + 1)">
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { fetchFeedback } from '../../composables/footer'
import { animate, inView, spring } from 'motion'

export default {
  name: 'FeedbackDisplay',
  setup() {
    const feedbackList = ref([])
    const itemsPerSlide = 2 // Enforcing 2 items per slide
    const containerRef = ref(null)
    const titleRef = ref(null)
    const carouselRef = ref(null)

    const initializeAnimations = () => {
      // Set initial states
      if (titleRef.value) {
        titleRef.value.style.opacity = '0'
        titleRef.value.style.transform = 'translateY(20px)'
      }

      if (carouselRef.value) {
        carouselRef.value.style.opacity = '0'
        carouselRef.value.style.transform = 'translateY(40px)'
      }

      // Initialize fade-in animation for title
      inView(titleRef.value, () => {
        animate(
          titleRef.value,
          {
            opacity: [0, 1],
            y: [20, 0]
          },
          {
            duration: 0.8,
            easing: spring({ damping: 15 })
          }
        )
      })

      // Initialize fade-in animation for carousel
      inView(carouselRef.value, () => {
        animate(
          carouselRef.value,
          {
            opacity: [0, 1],
            y: [40, 0]
          },
          {
            duration: 1,
            delay: 0.3,
            easing: spring({ damping: 15 })
          }
        )
      }, { margin: "-10%" })
    }
    onMounted(async () => {
      try {
        feedbackList.value = await fetchFeedback()
        initializeAnimations()
      } catch (error) {
        console.error('Error loading feedback:', error)
      }
    })

    const feedbackChunks = computed(() => {
      const chunks = []
      for (let i = 0; i < feedbackList.value.length; i += itemsPerSlide) {
        // Ensure exactly 2 items per chunk
        const chunk = feedbackList.value.slice(i, i + itemsPerSlide)
        // If chunk has less than 2 items, pad with empty feedback
        while (chunk.length < itemsPerSlide) {
          chunk.push({
            id: `empty-${chunk.length}`,
            comment: '',
            name: ''
          })
        }
        chunks.push(chunk)
      }
      return chunks
    })

    const getInitials = (name) => {
      return name
        ? name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
        : ''
    }

    return {
      feedbackChunks,
      getInitials,
      containerRef,
      titleRef,    
      carouselRef  
    }
  }
}
</script>

<style scoped>
.feedback-carousel-container {
  background-color: #f8f9fa;
  width: 100%;
  overflow: hidden;
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

.divider {
  height: 3px;
  width: 60px;
  background-color: #8c52ff;
  margin: 1rem auto;
}

.carousel {
  position: relative;
  height: 400px;
  /* Fixed height for consistency */
}

.carousel-inner {
  height: 100%;
}

.carousel-item {
  height: 100%;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  height: 100%;
  padding: 1rem;
}

.feedback-card {
  height: 100%;
  min-height: 300px;
}

.card {
  height: 100%;
  border: none;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.quote-icon {
  font-size: 1.5rem;
  color: #8c52ff;
  margin-bottom: 1rem;
}

.feedback-content {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.feedback-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #495057;
}

.feedback-author {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #8c52ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.author-name {
  margin: 0;
  font-weight: 600;
  color: #212529;
}

.carousel-control-prev,
.carousel-control-next {
  width: 3rem;
  height: 3rem;
  background-color: #8c52ff;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.7;
  position: absolute;
}

.carousel-control-prev {
  left: -1.5rem;
}

.carousel-control-next {
  right: -1.5rem;
}

.carousel-indicators {
  bottom: -3rem;
}

.carousel-indicators button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #8c52ff;
  opacity: 0.5;
  margin: 0 5px;
}

.carousel-indicators button.active {
  opacity: 1;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .carousel {
    height: auto;
    min-height: 500px;
  }

  .feedback-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .feedback-card {
    min-height: 200px;
  }

  .carousel-control-prev,
  .carousel-control-next {
    display: none;
  }
}

@media (max-width: 480px) {
  .carousel {
    min-height: 600px;
  }
}
</style>