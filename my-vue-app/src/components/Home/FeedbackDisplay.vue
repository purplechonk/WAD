<template>
    <div class="feedback-carousel-container my-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <!-- Title Section -->
            <div class="text-center mb-4">
              <h2 class="display-4 text-primary">What Our Users Say</h2>
              <div class="divider"></div>
            </div>
            
            <!-- Carousel Section -->
            <div id="feedbackCarousel" class="carousel slide" data-bs-ride="carousel">
              <div class="carousel-inner">
                <div v-for="(chunk, index) in feedbackChunks" 
                     :key="index" 
                     :class="['carousel-item', index === 0 ? 'active' : '']">
                  <div class="feedback-cards">
                    <div v-for="feedback in chunk" 
                         :key="feedback.id" 
                         class="feedback-card">
                      <div class="card shadow-sm">
                        <div class="card-body">
                          <div class="quote-icon mb-3">
                            <i class="fas fa-quote-left text-primary"></i>
                          </div>
                          <p class="card-text feedback-text">{{ feedback.comment }}</p>
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
                <button v-for="(_, index) in feedbackChunks" 
                        :key="index"
                        type="button"
                        data-bs-target="#feedbackCarousel"
                        :data-bs-slide-to="index"
                        :class="{ active: index === 0 }"
                        :aria-current="index === 0"
                        :aria-label="'Slide ' + (index + 1)">
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { onMounted, ref, computed } from 'vue'
  import { fetchFeedback } from '../../composables/footer'
  
  export default {
    name: 'FeedbackDisplay',
    setup() {
      const feedbackList = ref([])
      const itemsPerSlide = 2 // Number of feedback cards per slide
  
      // Fetch feedback on component mount
      onMounted(async () => {
        try {
          feedbackList.value = await fetchFeedback()
        } catch (error) {
          console.error('Error loading feedback:', error)
        }
      })
  
      // Split feedback into chunks for carousel slides
      const feedbackChunks = computed(() => {
        const chunks = []
        for (let i = 0; i < feedbackList.value.length; i += itemsPerSlide) {
          chunks.push(feedbackList.value.slice(i, i + itemsPerSlide))
        }
        return chunks
      })
  
      // Get initials from name for avatar
      const getInitials = (name) => {
        return name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      }
  
      return {
        feedbackChunks,
        getInitials
      }
    }
  }
  </script>
  
  <style scoped>
  .feedback-carousel-container {
    background-color: #f8f9fa;
    padding: 3rem 0;
  }
  
  .divider {
    height: 3px;
    width: 60px;
    background-color: #0d6efd;
    margin: 1rem auto;
  }
  
  .feedback-cards {
    display: flex;
    gap: 2rem;
    padding: 1.5rem;
  }
  
  .feedback-card {
    flex: 1;
  }
  
  .card {
    border: none;
    border-radius: 1rem;
    background: white;
    transition: transform 0.3s;
  }
  
  .card:hover {
    transform: translateY(-5px);
  }
  
  .quote-icon {
    font-size: 1.5rem;
    color: #0d6efd;
  }
  
  .feedback-text {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #495057;
    margin-bottom: 1.5rem;
  }
  
  .feedback-author {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #0d6efd;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
  
  .author-name {
    margin: 0;
    font-weight: 600;
    color: #212529;
  }
  
  /* Custom carousel controls */
  .carousel-control-prev,
  .carousel-control-next {
    width: 3rem;
    height: 3rem;
    background-color: #0d6efd;
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.7;
  }
  
  .carousel-control-prev {
    left: -1.5rem;
  }
  
  .carousel-control-next {
    right: -1.5rem;
  }
  
  .carousel-control-prev:hover,
  .carousel-control-next:hover {
    opacity: 1;
  }
  
  .carousel-indicators {
    bottom: -3rem;
  }
  
  .carousel-indicators button {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #0d6efd;
    opacity: 0.5;
    margin: 0 5px;
  }
  
  .carousel-indicators button.active {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    .feedback-cards {
      flex-direction: column;
    }
    
    .carousel-control-prev,
    .carousel-control-next {
      display: none;
    }
  }
  </style>