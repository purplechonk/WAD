// composables/useToast.js
import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  const addToast = (message) => {
    const id = Date.now()
    toasts.value.push({ id, message })
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  return {
    toasts,
    addToast,
    removeToast
  }
}