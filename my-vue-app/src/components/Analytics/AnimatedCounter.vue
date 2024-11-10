<template>
  <span ref="element">{{ formatNumber(Math.round(current)) }}</span>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'AnimatedCounter',
  props: {
    value: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      default: 2000
    },
    // Add a prop to control minimum digits
    minDigits: {
      type: Number,
      default: 2
    }
  },
  setup(props) {
    const current = ref(0)
    const element = ref(null)
    let animationFrame = null
    let observer = null

    // Add number formatting function
    const formatNumber = (num) => {
      return num.toString().padStart(props.minDigits, '0').toLocaleString()
    }

    const startAnimation = () => {
      const startValue = 0
      const endValue = props.value
      const startTime = performance.now()

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / props.duration, 1)

        // Modified easing function (easeOutCubic) for faster end animation
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        current.value = startValue + (endValue - startValue) * easeProgress

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          current.value = endValue
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    watch(() => props.value, (newValue) => {
      if (newValue !== current.value) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame)
        }
        startAnimation()
      }
    })

    onMounted(() => {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          startAnimation()
          observer.disconnect()
        }
      })

      if (element.value) {
        observer.observe(element.value)
      }
    })

    onUnmounted(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      if (observer) {
        observer.disconnect()
      }
    })

    return {
      current,
      element,
      formatNumber
    }
  }
}
</script>