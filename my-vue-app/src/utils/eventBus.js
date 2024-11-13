import { ref } from 'vue'

const isNavbarExpanded = ref(false)
const initialState = ref(false)
const listeners = new Set()

export const navbarEventBus = {
  isExpanded: isNavbarExpanded,
  initialState: initialState,

  setExpanded(value) {
    isNavbarExpanded.value = value
    initialState.value = value
    listeners.forEach(callback => callback(value))
  },

  onExpanded(callback) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  }
}