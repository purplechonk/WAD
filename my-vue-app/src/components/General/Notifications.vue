<template>
  <div class="notifications-wrapper" v-if="user">
    <!-- Trigger Button -->
    <button 
  @click="togglePanel"
  class="btn btn-primary rounded-circle position-fixed start-0 bottom-0 m-4 shadow d-flex align-items-center justify-content-center"
  style="width: 48px; height: 48px; padding: 0;"
  aria-label="Toggle notifications"
>
  <i class="bi bi-bell fs-6"></i>
  <span v-if="notificationCount > 0" class="badge bg-danger position-absolute top-0 start-100 translate-middle">
    {{ notificationCount }}
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
      class="notifications-panel position-fixed top-0 end-0 h-100 bg-secondary shadow"
      :class="{ 'panel-open': isPanelOpen }"
      @click.stop
    >
      <!-- Header -->
      <div class="p-3 bg-primary text-white d-flex justify-content-between align-items-center">
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
      <div class="overflow-auto notification-list">
        <div v-if="sortedNotifications.length === 0" class="p-4 text-center text-white">
          No notifications
        </div>
        <div v-else>
          <div 
            v-for="notification in sortedNotifications" 
            :key="notification.id"
            class="notification-item p-3 border-bottom border-primary"
          >
            <div class="d-flex gap-3">
              <div class="notification-content flex-grow-1">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h3 class="h6 mb-0 text-light fw-bold">{{ notification.title }}</h3>
                  <span 
                    class="badge rounded-pill ms-2"
                    :class="getUrgencyBadgeClass(notification.daysUntilEvent)"
                  >
                    Closing in {{ notification.daysUntilEvent }} days!
                  </span>
                </div>
                <p class="mb-2 text-light small">{{ notification.message }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-light">{{ formatDate(notification.time) }}</small>
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
</template>

<script>
import { db, auth } from '../../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { nextTick } from 'vue';

export default {
  name: 'NotificationsPanel',
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
    }
  },
  methods: {
    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen;
      if (this.isPanelOpen) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';
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
          }, 100);
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
      return 'bg-light fw-normal';
    },
    calculateDaysUntilEvent(date) {
      const now = window.CURRENT_DATE
      const eventDate = new Date(date);
      const diffTime = eventDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
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
        .map(event => ({
          id: event.id,
          title: event.event_name,
          message: `Reminder: ${event.event_name} is coming up soon!`,
          time: event.parsed_start_date,
          parsed_start_date: event.parsed_start_date,
          daysUntilEvent: event.daysUntilEvent
        }));
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
  z-index: 1050;
}

.notifications-panel {
  width: 450px;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 1100;
}

.panel-open {
  transform: translateX(0);
}

.overlay {
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
  z-index: 1050;
}

.notification-list {
  height: calc(100% - 130px);
  overflow-y: auto;
}

.notification-item {
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 576px) {
  .notifications-panel {
    width: 100%;
  }
}
</style>