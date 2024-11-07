<template>
  <div class="scroll-sections">
    <!-- First section with special class -->
    <section ref="sections" class="first-section">
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
            <div class="bento-box span-2-cols image-box bg-secondary">
              <h3>
                Never Miss An Event For
              </h3>
              <h1 class="text-primary fw-bold">
                <span class="" ref="typedElement"></span>
              </h1>
              <span>Stay in the LOOP with sLOOP</span>
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
            <!-- <div class="bento-box span-2-cols bg-dark">
              <h1>Reveal Animation Example</h1>
              <button @click="triggerReveal">Reveal Animation</button>
            </div> -->

            <div class="bento-box span-2-cols bg-dark quote-box" ref="quoteElement">
              <div class="block-revealer__content">
                {{ currentQuote }}
              </div>
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

    <!-- 
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
     -->

     <!--  
    <section>
      <featurepage/>
    </section>
    -->

    <section>
      <div class="card-container" ref="containerRef">
        <div class="card-deck" ref="deckRef">
          <div v-for="(event, index) in events" :key="event.id" class="event-card" :ref="el => cardRefs[index] = el"
            :class="{ 'visible': visibleCards[index] }">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-primary">{{ event.title }}</h5>
                <p class="card-text text-dark">{{ event.date }}</p>
                <p class="card-description text-dark">{{ event.description }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <button class="btn btn-primary">
                    <i class="fas fa-info-circle me-2"></i>Details
                  </button>
                  <span class="badge bg-secondary">{{ event.category }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- <section class="event-cards">
      <h2>Featured Events</h2>
      <div class="card-area">
        <EventCard v-for="event in featuredEvents" :key="event.id" :event="event" @show-details="openEventDetails" />
        <EventDetailModal v-if="showModal" :event="selectedEvent" @close="handleModalClose"
          @login-success="handleLoginSuccess" />
      </div>
    </section> -->

    <section ref="sections">
      testing testing
    </section>

    <div class="progress"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { fetchRecommendedEvents } from '../../composables/fetchEvents';
import { animate, spring, stagger } from "motion";
import EventCard from '../General/EventCard.vue';
import EventDetailModal from '../General/EventDetailModal.vue';
import ReplaceMe from '../../utils/replaceMe';
import Typed from 'typed.js';
import { RevealFx } from '../../utils/revealFx';
import anime from 'animejs/lib/anime.es.js';
import featurepage from '../Home/featureShowcase.vue'

const recommendedEvents = ref([]);
const isAuthenticated = ref(false);

const loadRecommendedEvents = async () => {
  recommendedEvents.value = await fetchRecommendedEvents();
  console.log('Recommended Events:', recommendedEvents.value);
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

const handleLoginSuccess = async () => {
  isAuthenticated.value = true;
  await loadRecommendedEvents();
  closeModal();
};

const typedElement = ref(null);
let typed = null;

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const sections = ref([]);

const quoteElement = ref(null);
const currentQuote = ref("Don't miss our upcoming workshops and networking events!");
const quoteCounter = ref(0);
let quoteRevealEffect = null;
const quoteClass = ref('default-quote-style');

const quotes = [
  "Stay tuned for the latest SMU events: Music festivals, seminars, and more!",
  "Be part of something big — exclusive SMU events just for you",
  "Don't miss our upcoming workshops and networking events!"
];


const changeQuote = () => {
  if (!quoteRevealEffect) return;

  const revealSettings = {
    bgColors: ['#2C0066', '#3E008F', '#5000B8', '#6100E0', '#9646FF', '#AE70FF', '#D1ADFF'],
    duration: 400,
    delay: 100,
    direction: 'lr',
    onStart: function (contentEl) {
      if (contentEl) {
        contentEl.style.opacity = '0';
        contentEl.style.transform = 'scale(0.95)';
      }
    },
    onHalfway: function (contentEl) {
      quoteCounter.value = (quoteCounter.value + 1) % quotes.length;
      currentQuote.value = quotes[quoteCounter.value];
      if (contentEl) {
        contentEl.textContent = currentQuote.value;
        contentEl.style.fontSize = '1.3rem';
        contentEl.style.fontWeight = 'bold';
      }
    },
    onComplete: function (contentEl) {
      if (contentEl) {
        contentEl.style.opacity = '1';
        contentEl.style.transform = 'scale(1)';
        contentEl.style.textAlign = 'center';

        // Reset to normal style after animation
        // setTimeout(() => {
        //   contentEl.style.fontSize = '1.5rem';
        //   contentEl.style.fontWeight = 'normal';
        // }, 1000);
      }
    }
  };

  quoteRevealEffect.reveal(revealSettings);
};

const events = ref([
  {
    id: 1,
    title: 'Tech Conference 2024',
    date: '2024-04-15',
    description: 'Annual technology conference featuring industry leaders',
    category: 'Conference'
  },
  {
    id: 2,
    title: 'Workshop: Vue 3',
    date: '2024-04-20',
    description: 'Hands-on workshop about Vue 3 fundamentals',
    category: 'Workshop'
  },
  {
    id: 3,
    title: 'Networking Mixer',
    date: '2024-04-25',
    description: 'Evening networking event for tech professionals',
    category: 'Networking'
  },
  // Add more events as needed
]);

const containerRef = ref(null);
const deckRef = ref(null);
const cardRefs = ref([]);
const visibleCards = ref(Array(events.value.length).fill(false));

const handleScroll = () => {
  const cards = cardRefs.value;
  cards.forEach((card, index) => {
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const isVisible = rect.top <= window.innerHeight * 0.8;
    
    if (isVisible && !visibleCards.value[index]) {
      visibleCards.value[index] = true;
      animateCard(card, index);
    }
  });
};

const animateCard = (card, index) => {
  anime({
    targets: card,
    translateX: [-300, 0],
    translateY: [50, 0],
    rotate: [-15, 0],
    opacity: [0, 1],
    duration: 800,
    easing: 'easeOutElastic(1, .8)',
    delay: index * 100
  });
};


onMounted(() => {
  console.log("Component mounted!");

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

  onAuthStateChanged(auth, (user) => {
    if (user) {
      isAuthenticated.value = true;
      loadRecommendedEvents();
    } else {
      isAuthenticated.value = false;
      recommendedEvents.value = [];
    }
  });

  typed = new Typed(typedElement.value, {
    strings: ['Networking', 'Workshops', 'Entertainment'],
    typeSpeed: 40,
    backSpeed: 50,
    loop: true
  });

  const bentoBoxes = document.querySelectorAll('.bento-box');
  const indices = shuffleArray([...Array(bentoBoxes.length).keys()]);

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
  );

  // Progress bar with window scroll
  const progress = document.querySelector('.progress');

  const updateProgress = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = window.scrollY;
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

  updateProgress();
  window.addEventListener('scroll', updateProgress);

  console.log('Initial quotes array:', quotes);
  console.log('Checking quoteElement:', quoteElement.value);

  // Wait for next tick to ensure DOM is ready
  setTimeout(() => {
    if (quoteElement.value) {
      quoteRevealEffect = new RevealFx(quoteElement.value, {
        layers: 7,
        isContentHidden: false,
        revealSettings: {
          bgColors: ['#2C0066', '#3E008F', '#5000B8', '#6100E0', '#9646FF', '#AE70FF', '#D1ADFF'],
          direction: 'lr',
          duration: 400,
          delay: 100
        }
      });

      currentQuote.value = quotes[0];

      const intervalId = setInterval(changeQuote, 4000);

      onBeforeUnmount(() => {
        clearInterval(intervalId);
      });
    }
  }, 100);

  window.addEventListener('scroll', handleScroll);
  // Initial check for visible cards
  handleScroll();

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', updateProgress);
  });
});

onBeforeUnmount(() => {
  if (typed) {
    typed.destroy();
  }

  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Global styles for snap scrolling */
html {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
}

.quote-box {
  position: relative;
  overflow: hidden;
  padding: 2rem;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.block-revealer__content {
  position: relative;
  z-index: 1;
  text-align: center;
  width: 100%;
  font-size: 1.3rem;
  font-weight: bold;
  opacity: 1;
  transition: all 0.4s ease-in-out;
}

.scroll-sections {
  width: 100%;
  position: relative;
}

/* Section styles with navbar adjustment */
section {
  height: 100vh;
  scroll-snap-align: start;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding-top: 108px;
  /* navbar (78px) + banner (30px) */
}

/* Special style for first section */
.first-section {
  margin-top: -108px;
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
  top: 65px;
  transform: scaleX(0);
  z-index: 0;
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

.card-container {
  padding: 2rem;
  overflow: hidden;
}

.card-deck {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.event-card {
  flex: 0 0 300px;
  opacity: 0;
  transform: translateX(-300px) translateY(50px) rotate(-15deg);
}

.event-card.visible {
  opacity: 1;
  transform: none;
}

.card {
  height: 100%;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-title {
  margin: 0;
  font-weight: bold;
}

.card-description {
  flex-grow: 1;
  margin: 0;
}
</style>