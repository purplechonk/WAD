<template>
  <div class="notifications-wrapper" v-if="user">
    <!-- Trigger Button -->
    <button 
      @click="togglePanel"
      class="btn btn-primary rounded-circle position-fixed end-0 bottom-0 m-4 shadow d-flex align-items-center justify-content-center text-secondary"
      style="width: 55px; height: 55px; padding: 0;"
      aria-label="Toggle notifications"
    >
      <i class="bi bi-bell fs-6"></i>
      <!-- Updated badge markup -->
      <span 
        v-if="notificationCount > 0" 
        :class="[
          showDot 
            ? 'position-absolute top-0 start-100 translate-middle p-2 my-2 bg-danger border border-light rounded-circle'
            : 'badge bg-danger position-absolute top-0 start-100 translate-middle'
        ]"
      >
        <span v-if="!showDot">{{ notificationCount }}</span>
        <span v-else class="visually-hidden">New alerts</span>
      </span>
    </button>

    <!-- Overlay -->
    <div 
      v-if="isPanelOpen"
      @click="togglePanel"
      class="overlay position-fixed top-0 start-0 w-100 h-100"
    ></div>

    <!-- Off-canvas Panel -->
    <div 
      class="notifications-panel position-fixed top-0 start-0 h-100 bg-secondary shadow"
      :class="{ 'panel-open': isPanelOpen }"
      @click.stop
    >
      <!-- Header -->
      <div class="p-3 bg-dark text-white d-flex justify-content-between align-items-center">
        <h2 class="h5 mb-0">Notifications</h2>
        <button 
          @click="togglePanel"
          class="btn btn-link text-white p-1 border-0"
          aria-label="Close notifications"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Notifications List -->
      <div class="overflow-auto notification-list pb-3">
        <div 
  v-for="notification in sortedNotifications" 
  :key="notification.id"
  class="notification-item p-3 border-bottom border-primary cursor-pointer"
  @click="handleNotificationClick(notification.id)"
>
  <div class="d-flex gap-3">
    <div class="notification-content flex-grow-1">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h3 class="h6 mb-0 text-dark fw-bold">{{ notification.title }}</h3>
        <span 
          class="badge rounded-pill ms-2"
          :class="getUrgencyBadgeClass(notification.daysUntilEvent)"
        >
          {{ notification.daysUntilEvent }} days left!
        </span>
      </div>
      <p class="mb-2 text-dark small">{{ notification.message }}</p>
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-6">
          <small class="text-dark text-decoration-underline">Closes {{ formatDate(notification.time) }}</small>
          <div class="arrow-icon ms-6 ps-4">
            <i class="bi bi-arrow-right-circle"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      </div>

      <!-- Footer with View Saved Events button -->
      <div class="position-absolute bottom-0 start-0 w-100 p-3 bg-secondary border-top border-primary">
        <button 
          @click="handleViewSavedEvents"
          class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 text-light"
        >
          <i class="bi bi-bookmark-fill"></i>
          View Saved Events
        </button>
      </div>
    </div>
  </div>

  <!-- Event Detail Modal -->
  <EventDetailModal
    v-if="selectedEventId"
    :event="selectedEvent"
    @close="closeEventModal"
  />
</template>

<script>
import { db, auth } from '../../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { nextTick } from 'vue';
import EventDetailModal from './EventDetailModal.vue';

export default {
  name: 'NotificationsPanel',
  components: {
    EventDetailModal
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      isPanelOpen: false,
      notifications: [],
      error: null,
      user: null,
      unsubscribeUserRecord: null,
      scrollToSavedEvents: false,
      selectedEventId: null,
      selectedEvent: null,
      lastNotificationCount: 0,
      showDot: false,
    };
  },
  computed: {
    notificationCount() {
      return this.notifications.length;
    },
    sortedNotifications() {
      return [...this.notifications].sort((a, b) => 
        new Date(a.parsed_start_date) - new Date(b.parsed_start_date)
      );
    }
  },
  watch: {
    '$route': {
      async handler(to, from) {
        if (this.scrollToSavedEvents && to.path === '/my-events') {
          this.scrollToSavedEvents = false;
          await this.scrollToSavedEventsSection();
        }
      },
      immediate: true
    },
    notificationCount: {
      handler(newCount, oldCount) {
        if (newCount > this.lastNotificationCount) {
          this.showDot = false;
        }
        this.lastNotificationCount = newCount;
      },
      immediate: true
    }
  },
  methods: {
    async handleNotificationClick(eventId) {
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          this.selectedEvent = {
            id: eventDoc.id,
            ...eventDoc.data()
          };
          this.selectedEventId = eventId;
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    },

    closeEventModal() {
      this.selectedEventId = null;
      this.selectedEvent = null;
    },

    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen;
      if (!this.isPanelOpen) {
        this.showDot = true;
      }
    },

    async scrollToSavedEventsSection() {
      const maxAttempts = 5;
      const attemptScroll = async (attempt = 0) => {
        if (attempt >= maxAttempts) return;
        
        await nextTick();
        const savedEventsSection = document.getElementById('saved_events');
        
        if (savedEventsSection) {
          setTimeout(() => {
            savedEventsSection.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        } else {
          setTimeout(() => attemptScroll(attempt + 1), 200 * (attempt + 1));
        }
      };

      await attemptScroll();
    },

    async handleViewSavedEvents() {
      this.togglePanel();
      this.scrollToSavedEvents = true;
      
      if (this.$route.path !== '/my-events') {
        await this.router.push('/my-events');
      } else {
        await this.scrollToSavedEventsSection();
      }
    },

    getUrgencyBadgeClass(days) {
      if (days <= 7) return 'bg-danger fw-normal';
      if (days <= 21) return 'bg-warning fw-normal';
      return 'bg-primary fw-normal';
    },

    calculateDaysUntilEvent(date) {
      const now = window.CURRENT_DATE
      const eventDate = new Date(date);
      const diffTime = eventDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-SG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    async fetchUserData() {
      if (!this.user) return;
      const userDocRef = doc(db, 'user_records', this.user.uid);

      this.unsubscribeUserRecord = onSnapshot(userDocRef, async (docSnapshot) => {
        if (!docSnapshot.exists()) {
          console.log('No user document found');
          this.error = 'User record not found';
          return;
        }

        const userData = docSnapshot.data();
        const signedUpEventIds = Object.values(userData.signed_up_events || {});
        const savedEventIds = Object.values(userData.saved_events || {});

        await this.fetchEvents(signedUpEventIds, savedEventIds);
      });
    },

    async fetchEvents(signedUpEventIds, savedEventIds) {
      const currentDate = window.CURRENT_DATE;

      const fetchEventDetails = async (eventIds) => {
        const events = [];
        for (const eventId of eventIds) {
          const eventDoc = await getDoc(doc(db, 'events', eventId));
          if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            const parsedStartDate = this.parseDate(eventData.start_date_time);
            events.push({
              id: eventDoc.id,
              ...eventData,
              parsed_start_date: parsedStartDate,
              daysUntilEvent: this.calculateDaysUntilEvent(parsedStartDate)
            });
          }
        }
        return events;
      };

      const savedEvents = await fetchEventDetails(savedEventIds);

      this.notifications = savedEvents
  .filter(event => 
    !signedUpEventIds.includes(event.id) && 
    event.parsed_start_date >= currentDate
  )
  .map((event, index) => {
    const phrases = [
      `Last chance to register for ${event.event_name}!`,
      `Don't let ${event.event_name} pass you by!`,
      `Secure your spot for ${event.event_name}!`,
      `${event.event_name} is filling up quickly!`,
      `Join the excitement at ${event.event_name}!`,
      `Be part of ${event.event_name} - register now!`,
      `${event.event_name} awaits - don't miss out!`,
      `Time's ticking for ${event.event_name}!`,
      `Your chance to join ${event.event_name} is ending soon!`,
      `Quick! ${event.event_name} registration is closing!`,
      `Grab your spot at ${event.event_name}!`,
      `${event.event_name} registration window closing soon!`,
      `The countdown is on for ${event.event_name}!`,
      `Last call to join ${event.event_name}!`,
      `Don't let this opportunity slip away - join ${event.event_name}!`
    ];

    const messageIndex = index % phrases.length;
    const rotatedMessage = phrases[messageIndex];

    return {
      id: event.id,
      title: event.event_name,
      message: rotatedMessage,
      time: event.parsed_start_date,
      parsed_start_date: event.parsed_start_date,
      daysUntilEvent: event.daysUntilEvent
    };
  });
    },

    parseDate(dateStr) {
      try {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
      } catch (error) {
        console.error('Error parsing date:', dateStr, error);
        return null;
      }
    }
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
        this.fetchUserData();
      } else {
        this.user = null;
        if (this.unsubscribeUserRecord) {
          this.unsubscribeUserRecord();
        }
        this.notifications = [];
        this.error = 'Please sign in to view notifications';
      }
    });
  },
  beforeDestroy() {
    if (this.unsubscribeUserRecord) {
      this.unsubscribeUserRecord();
    }
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
  }
};
</script>
<style scoped>
.notifications-wrapper {
  position: relative;
  z-index: 1022;
}

.notifications-panel {
  width: 450px;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  z-index: 1023;
}

.panel-open {
  transform: translateX(0);
}

.overlay {
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
  z-index: 1022;
}

.notification-list {
  height: calc(100% - 130px);
  overflow-y: auto;
}

.notification-item {
  transition: background-color 0.2s ease;
  position: relative;
  overflow: hidden;
}

.notification-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.notification-content {
  position: relative;
}

.arrow-icon {
  opacity: 0;
  transform: translateX(-70px);
  transition: all 0.3s ease;
  color: #2b0f62;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

.notification-item:hover .arrow-icon {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 576px) {
  .notifications-panel {
    width: 100%;
  }

  .arrow-icon {
    font-size: 1rem; /* Slightly smaller for mobile */
  }
}

/* Optional: Add smooth scroll behavior */
.notification-list {
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #8c52ff transparent;
}

.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: transparent;
}

.notification-list::-webkit-scrollbar-thumb {
  background-color: #8c52ff;
  border-radius: 3px;
}

/* Improve hover state transitions */
.notification-item {
  transition: all 0.4s ease;
}

.notification-item:hover {
  transform: translateX(5px);
  background-color: rgba(255, 255, 255, 0.5);
}

/* Improve accessibility - focus states */
.notification-item:focus-visible {
  outline: 2px solid #8c52ff;
  outline-offset: -2px;
}

/* Optional: Add a subtle shadow to notification items */
.notification-item {
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

/* Optional: Add loading state animation */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.notification-item.loading {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
</style>