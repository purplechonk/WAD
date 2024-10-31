<template>
  <div class="gallery-container" ref="galleryContainer">
    <section ref="sections">
      <div class="page-wrapper">
        <div class="container-fluid py-1 bento-section-1">
          <div class="bento-grid">
            <!-- Tall box spanning 2 rows -->
            <div class="bento-box span-2-rows image-box flip-card">
              <div class="flip-card-inner">
                <div class="flip-card-front">
                  <img src="../../assets/images/homepage-1.jpg" alt="">
                </div>
                <div class="flip-card-back">
                  Hello Hello Test
                </div>
              </div>
            </div>

            <!-- Regular box -->
            <div class="bento-box span-2-cols image-box bg-primary">
              <h3>
                Never Miss An Event For
              </h3>
              <h1 class="text-dark fw-bold">
                <span class="" ref="typedElement"></span>
              </h1>
              Stay in the LOOP with sLOOP
            </div>

            <!-- Regular box -->
            <div class="bento-box image-box">
              <img src="../../assets/images/homepage-3.jpg" alt="">
            </div>

            <!-- Regular box -->
            <div class="bento-box image-box">
              <img src="../../assets/images/homepage-4.jpg" alt="">
            </div>

            <!-- Wide box spanning 2 columns -->
            <div class="bento-box span-2-cols bg-secondary">
              <h3>Project Overview</h3>
              <p>Another wide box that spans multiple columns.</p>
            </div>

            <!-- Regular box -->
            <div class="bento-box image-box">
              <h1>Hi</h1>
            </div>

            <!-- Full width box -->
            <div class="bento-box span-3-cols image-box">
              <img src="../../assets/images/homepage-5.jpg" alt="">
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="scroll-section event-cards" ref="sections">
      <ul class="gallery-track">
        <li>
          <img src="../../assets/images/test_img.jpg" />
          <h2>#001</h2>
        </li>
        <li>
          <img src="../../assets/images/test_img.jpg" />
          <h2>#002</h2>
        </li>
        <li>
          <img src="../../assets/images/test_img.jpg" />
          <h2>#003</h2>
        </li>
        <li>
          <img src="../../assets/images/test_img.jpg" />
          <h2>#004</h2>
        </li>
        <li>
          <img src="../../assets/images/test_img.jpg" />
          <h2>#005</h2>
        </li>
      </ul>

    </section>

    <section ref="sections">
      testing testing
    </section>

    <div class="progress"></div>

  </div>

</template>

<!-- <section class="event-cards">
    <h2>Featured Events</h2>
    <div class="card-area">
      <EventCard v-for="event in featuredEvents" :key="event.id" :event="event" @show-details="openEventDetails" />
      <EventDetailModal v-if="showModal" :event="selectedEvent" @close="handleModalClose"
        @login-success="handleLoginSuccess" />
    </div>
  </section> -->


<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase'; // Firebase Auth instance
import { fetchRecommendedEvents, fetchFeaturedEvents } from '../../composables/fetchEvents';
import { animate, spring, stagger, scroll } from "motion";
import Carousel from './Carousel.vue';
import EventCard from '../General/EventCard.vue';
import EventDetailModal from '../General/EventDetailModal.vue';
import ReplaceMe from '../../utils/replaceMe';
import Typed from 'typed.js';


const recommendedEvents = ref([]);
const featuredEvents = ref([]);
const isAuthenticated = ref(false); // Track user authentication state

const loadRecommendedEvents = async () => {
  recommendedEvents.value = await fetchRecommendedEvents();
  console.log('Recommended Events:', recommendedEvents.value);
};

const loadFeaturedEvents = async () => {
  featuredEvents.value = await fetchFeaturedEvents();
};

const showModal = ref(false);
const selectedEvent = ref(null);

const openEventDetails = (event) => {
  selectedEvent.value = event;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedEvent.value = null;
};

const handleModalClose = () => {
  closeModal();
};

// After login success from modal
const handleLoginSuccess = async () => {
  isAuthenticated.value = true; // User logged in, update state
  await loadRecommendedEvents(); // Re-fetch recommended events after login
  closeModal(); // Close the event detail modal after login
};

const typedElement = ref(null)
let typed = null

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

//snap scrolling
const sections = ref([])
const galleryContainer = ref(null);


onMounted(() => {
  console.log("Component mounted!");
  // Initialize ReplaceMe on the "replace-me" element
  const replaceElement = document.querySelector('.replace-me');
  if (replaceElement) {
    new ReplaceMe(replaceElement, {
      animation: 'animated fadeIn',
      speed: 2000,
      separator: ',',
      loopCount: 'infinite',
      autoRun: true,
    });
  }

  loadRecommendedEvents();
  loadFeaturedEvents();

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isAuthenticated.value = true;
      loadRecommendedEvents(); // Re-fetch recommended events on login
    } else {
      isAuthenticated.value = false;
      recommendedEvents.value = []; // Clear recommended events if user logs out
    }
  });

  typed = new Typed(typedElement.value, {
    strings: ['Networking', 'Workshops', 'Entertainment'],
    typeSpeed: 40,
    backSpeed: 50,
    loop: true
  })

  const bentoBoxes = document.querySelectorAll('.bento-box')
  const indices = shuffleArray([...Array(bentoBoxes.length).keys()])

  animate(
    '.bento-box',
    {
      scale: [0, 1],
      opacity: [0, 1]
    },
    {
      delay: stagger(0.2, { from: indices }),
      duration: 0.2,
      easing: spring({
        stiffness: 200,
        damping: 15,
        mass: 1.5
      }),
    }
  )

  //progress bar
  const container = document.querySelector('.gallery-container');
  const progress = document.querySelector('.progress');

  const updateProgress = () => {
    const totalHeight = container.scrollHeight - container.clientHeight;
    const currentScroll = container.scrollTop;
    const scrollPercent = currentScroll / totalHeight;

    animate(
      progress,
      {
        scaleX: scrollPercent
      },
      {
        duration: 0.1,
        easing: 'ease-out'
      }
    );
  };

  // Initialize progress
  updateProgress();

  // Update on scroll
  container.addEventListener('scroll', updateProgress);

  // Cleanup
  onBeforeUnmount(() => {
    container.removeEventListener('scroll', updateProgress);
  });

  scroll(
    animate(".gallery-track", {
      transform: ["none", `translateX(-${items.length - 1}00vw)`]
    }),
    {
      target: document.querySelector(".scroll-section")
    }
  );

});

onBeforeUnmount(() => {
  if (typed) {
    typed.destroy()
  }
})

</script>

<style scoped>
.gallery-container {
  scroll-snap-type: y mandatory;
  height: 100vh;
  overflow-y: scroll;
  width: 100%;
  position: relative;
  max-height: 100vh;
}

section {
  height: 100vh;
  scroll-snap-align: start;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.bento-section-1 {
  height: 100%;
}

.flip-card {
  background-color: transparent;
  padding: 0px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  padding: 0px;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.flip-card-front {
  background-color: #bbb;
  color: black;
}

.flip-card-back {
  background-color: #2980b9;
  color: white;
  transform: rotateY(180deg);
}

.progress {
  position: fixed;
  left: 0;
  right: 0;
  height: 5px;
  background: #8c52ff;
  top: 78px;
  transform: scaleX(0);
  z-index: 9999;
}

ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
}

ul {
  display: flex;
  position: sticky;
  top: 0;
}

li {
  display: flex;
  width: 100vw;
  height: 100vh;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
}
</style>