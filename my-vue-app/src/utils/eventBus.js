// src/services/eventBus.js
import { ref } from 'vue'

const isNavbarExpanded = ref(false)
const listeners = new Set()

export const navbarEventBus = {
  isExpanded: isNavbarExpanded,
  
  setExpanded(value) {
    isNavbarExpanded.value = value
    listeners.forEach(callback => callback(value))
  },
  
  onExpanded(callback) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  }
}