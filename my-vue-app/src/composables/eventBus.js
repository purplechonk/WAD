import { reactive } from 'vue';

export const eventBus = reactive({
  events: {},
  emit(event, payload) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(payload));
    }
  },
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }
  },
});
