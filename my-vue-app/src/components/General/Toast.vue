<!-- components/General/Toast.vue -->
<template>
    <teleport to="body">
      <div class="toast-container position-fixed bottom-0 start-0 p-3" style="z-index: 2006;">
        <TransitionGroup name="fade" class="toast-group">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast show text-white bg-primary"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style="min-width: 250px"
          >
            <div class="toast-header text-white bg-dark">
              <img src="../../assets/favicon-16x16.png" class="rounded me-2" alt="...">
              <strong class="me-auto">sLoop</strong>
              <small class="text-white-50">just now</small>
              <button 
                type="button" 
                class="btn-close btn-close-white" 
                @click="removeToast(toast.id)"
                aria-label="Close"
              ></button>
            </div>
            <div class="toast-body">
              {{ toast.message }}
            </div>
          </div>
        </TransitionGroup>
      </div>
    </teleport>
  </template>
  
  <script>
  import { useToast } from '../../composables/useToast'
  
  export default {
    setup() {
      const { toasts, removeToast } = useToast()
      return { toasts, removeToast }
    }
  }
  </script>
  
  <style>
  .toast-container {
    display: flex;
    flex-direction: column-reverse;
    gap: 0.5rem;
    z-index: 1024;
  }
  
  .toast-group {
    display: flex;
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
  
  .toast {
    margin: 0 !important; 
  }
  
  .fade-enter-active {
    animation: toast-in-right 0.7s ease-in-out;
  }
  
  .fade-leave-active {
    animation: toast-out 0.7s ease-in-out both;
  }
  
  @keyframes toast-in-right {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    50% {
      transform: translateX(5%);
      opacity: 0.8;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes toast-out {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    20% {
      transform: translateX(5%);
      opacity: 0.8;
    }
    100% {
      transform: translateX(-110%);
      opacity: 0;
    }
  }
  
  .fade-move {
    transition: all 0.4s ease-in-out;
  }
  </style>