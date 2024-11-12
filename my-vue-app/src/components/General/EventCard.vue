<template>
  <article 
    class="card__article_info"
    @click="openEventDetails"
    role="button"
    tabindex="0"
    @keyup.enter="openEventDetails"
  >
  <!-- card__article_info ==> no height, individual card size, position: relative 
      left_overlay ==> height: 400px, purple block on left, changing height will only move purple part, position: relative
      card__image_info ==> height: 400px, position: relative -->
  
    <div class="left_overlay">
      <saveButton 
        :eventId="event.id" 
        :eventName="event.event_name"
        @click.stop
      />
      <!-- Added ref and dynamic class binding -->
      <h2 
        ref="titleRef"
        :class="['card__title_info', titleSizeClass]"
        class="text-break fs-0.0001"
        lang="en" 
      >
        {{ event.event_name }}
      </h2>
      <!-- Rest of the template remains the same -->
      <span 
        v-for="(category, index) in event.category" 
        :key="index" 
        class="category-badge"
      >
        {{ category }}
      </span>
      
      <div class="event-details">
        {{ formatDate(event.start_date_time) }}
      </div>

      <div class="right_overlay_info">
        <div class="timeline-container">
          <div class="timeline-entry">
            <div class="timeline-date">
              <p class="date-label">Start</p>
              <p class="date-value">{{ event.start_date_time }}</p>
            </div>
          </div>
          
          <div class="timeline-entry">
            <div class="timeline-date">
              <p class="date-label">End</p>
              <p class="date-value">{{ event.end_date_time }}</p>
            </div>
          </div>
        </div>

        <p class="venue-value">
              <img src="../../assets/images/location-pin.svg" alt="Logo" class="logo" width="20" style="color: white;"/>
              {{ event.venue }}</p>
      </div>
    </div>
    
    <div class="card__content">
      <img 
        :src="event.image_url" 
        alt="image" 
        class="card__img_info"
      >
    </div>
  </article>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import SaveButton from './SaveButton.vue';

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['show-details']);
const titleRef = ref(null);
const titleLength = ref(0);

const formatDate = (dateString) => {
  return dateString.slice(0, 10); // Will return "23/02/2024"
};

// Computed property for dynamic class
const titleSizeClass = computed(() => {
  if (titleLength.value > 50) return 'title-xs';
  if (titleLength.value > 35) return 'title-sm';
  if (titleLength.value > 25) return 'title-md';
  return 'title-lg';
});

// Check title length and adjust size
const checkTitleFit = () => {
  if (titleRef.value) {
    titleLength.value = props.event.event_name.length;
  }
};

// Watch for changes in event name
watch(() => props.event.event_name, checkTitleFit);

onMounted(() => {
  checkTitleFit();
});

const openEventDetails = () => {
    emit('show-details', props.event);
  };
</script>

<style scoped>
.card__article_info {
  width: 100%;
  max-width: 420px;
  min-width: 280px;
  position: relative;
  cursor: pointer;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 8px 24px hsla(0, 0%, 0%, .15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin: 0 auto; /* Center the card */
  display: flex; /* Added for better content alignment */
  overflow: hidden; /* Keep content within rounded corners */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card__article_info:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px hsla(0, 0%, 0%, .2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card__article_info:focus {
  outline: 2px solid #8c52ff;
  outline-offset: 2px;
}

.card__title_info {
  margin: 0px;
  line-height: 1.3;
  text-wrap: balance;
  background: linear-gradient(45deg, #8c52ff, #5E17EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: font-size 0.2s ease;
  
  /* Add hyphenation properties */
  hyphens: auto;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
  hyphenate-limit-chars: 6 3 2;
  hyphenate-limit-lines: 2;
  hyphenate-limit-last: always;
  hyphenate-limit-zone: 8%;
}

/* Dynamic title sizes */
.title-lg {
  font-size: 1.25rem;
  font-weight: 600;
}

.title-md {
  font-size: 1.1rem;
  font-weight: 600;
}

.title-sm {
  font-size: 1rem;
  font-weight: 600;
}

.title-xs {
  font-size: 0.9rem;
  font-weight: 600;
}

.left_overlay {
  background-color: #DEDCF4;
  position: relative;
  width: 145px;
  height: 400px;
  border-radius: 15px 0 0 15px;
  display: flex;
  align-items: left;
  flex-direction: column;
  padding: 1rem;
  gap: 0.5rem;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.right_overlay_info {
  color: black;
  display: none;
  opacity: 0;
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 2rem;
}

.right_overlay_info {
  color: black;
  display: none;
  opacity: 0;
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 2rem;
}

.card__article_info:hover .right_overlay_info {
  display: block;
  opacity: 1;
}

.timeline-container {
  position: relative;
  padding-left: 25px;
  margin-bottom: 1.5rem;
}

.timeline-container::before {
  content: "";
  position: absolute;
  left: 15px;
  top: 10px; /* Adjusted to align with first circle */
  bottom: 10px; /* Adjusted to align with last circle */
  width: 2px;
  background: linear-gradient(to bottom, #8c52ff 0%, #DEDCF4 100%);
  transform: translateX(-50%);
}

.timeline-entry {
  position: relative;
  margin-bottom: 1rem;
  padding-left: 15px;
}

/* Enhanced circle styling */
.timeline-entry::before {
  content: "";
  position: absolute;
  left: -15px;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #DEDCF4; /*  center */
  border: 2px solid #8c52ff; /* Purple border */
  transform: translateY(-50%);
  box-shadow: 0 0 0 4px rgba(140, 82, 255, 0.1); /* Soft glow effect */
  z-index: 2;
}

/* Connecting line */
.timeline-date::before {
  content: "";
  position: absolute;
  left: -15px;
  top: 50%;
  width: 12px;
  height: 2px;
  background: linear-gradient(to right, #8c52ff 0%, #DEDCF4 100%);
  transform: translateY(-50%);
}

.date-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #8c52ff;
  margin: 0;
  text-transform: uppercase;
}

.date-value {
  font-size: 0.85rem;
  color: #333;
  margin: 0.1rem 0 0 0;
}

.venue-value {
  font-size: 0.85rem;
  color: #333;
  line-height: 1.4;
  position: absolute;
  display: inline;
  flex-direction: row;
  padding-right: 8px;
  bottom: 0rem;
  top: auto;
  transition: 0.5s;
}

.card__article_info:hover .left_overlay {
  width: 420px;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
}

.card__article_info:hover .right_overlay_info {
  display: inline;
  opacity: 1;
}

.card__article_info:hover .category-badge {
  margin: 5px 10px 3px 0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.card__content {
  display: flex;
  align-items: center;
  justify-content: center;
  /* padding: 1rem; */
}

.card__img_info {
  box-shadow: 0 8px 24px hsla(0, 0%, 0%, .15);
  border-radius: 0 15px 15px 0;
  display: block;
  height: 400px;
  width: 100%; /* Fill the remaining space */
  max-width: 348px; /* Maximum width for larger screens */
  margin: 0; /* Remove margin */
  object-fit: cover; /* Maintain aspect ratio */
  position: relative;
}

.category-badge {
  display: inline-block;
  background-color: #8c52ff20;
  color: #8c52ff;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
  border: 1px solid #8c52ff40;
}

.event-details {
  color: #9646FF;
  margin-top: auto; /* This pushes the element to the bottom */
  margin-bottom: 0rem; /* Add some bottom spacing */
  margin-left: 5px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  opacity: 1;
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hide event-details on hover */
.card__article_info:hover .event-details {
  opacity: 0;
  visibility: hidden;
}

.detail-item {
  font-size: 0.75rem;
  color: #4a4a4a;
  margin: 0;
  line-height: 1.4;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item strong {
  color: #2a2a2a;
  font-weight: 600;
  margin-right: 0.25rem;
}

@media screen and (max-width: 520px) {
  .card__article_info {
    width: 320px;
  }

  .left_overlay {
    width: 110px;
    padding: 0.75rem;
    height: 320px;
  }

  .card__img_info {
    max-width: 320px;
    height: 320px;
  }

  .card__title_info {
    font-size: 0.9rem;
  }

  .category-badge {
    font-size: 0.59rem;
    padding: 0.1rem 0.3rem;
  }

  .event-details {
    font-size: 0.65rem;
  }

  .timeline-container {
    padding-left: 20px;
  }

  .timeline-entry::before {
    left: -10px;
  }
  
  .timeline-date::before {
    top: 50%;
    left: -10px;
  }

  .date-label {
    font-size: 0.65rem;
  }

  .date-value {
    font-size: 0.65rem;
  }

  .venue-value {
    font-size: 0.75rem;
  }

  .logo {
    width: 16px;
  }

  .card__article_info:hover .left_overlay {
    width: 280px;
  }
}


@media screen and (max-width: 375px) {
  .card__article_info {
    width: 250px;
  }

  .left_overlay {
    width: 100px;
    padding: 0.75rem;
    height: 270px;
  }

  .card__img_info {
    max-width: 250px;
    height: 270px;
  }

  .card__title_info {
    font-size: 0.7rem;
  }

  .category-badge {
    text-align: text-wrap;
    font-size: 0.5rem;
    padding: 0.1rem 0.3rem;
  }

  .event-details {
    font-size: 0.5rem;
  }

  .timeline-container {
    padding-left: 20px;
  }

  .timeline-entry::before {
    left: -10px;
  }
  
  .timeline-date::before {
    left: -10px;
    top: 50%;
  }

  .date-label {
    font-size: 0.5rem;
  }

  .date-value {
    font-size: 0.6rem;
  }

  .venue-value {
    font-size: 0.6rem;
    padding-left: 0.1rem;
    padding-right: 1rem;
    bottom: -0.5rem;
  }

  .logo {
    width: 16px;
  }

  .card__article_info:hover .left_overlay {
    width: 280px;
  }
}

</style>
