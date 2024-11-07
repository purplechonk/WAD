<template>
  <div 
    class="card p-3 border rounded-3 shadow" 
    v-if="userData"
    ref="card"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    :style="cardStyle"
  >
    <!-- SMU Logo -->
    <div class="row justify-content-center mb-2 mt-2">
      <div class="col-6">
        <img class="img-fluid" src="../../assets/images/smuLogo.png" alt="SMU Logo">
      </div>
    </div>
    <hr style="color: #FE3E73; opacity: 1;">
    <!-- PFP + Student -->
    <div class="row mt-2 mb-2">
      <div class="col-6">
        <img class="img-fluid" src="../../assets/images/chonky.jpg" alt="Profile Picture">
      </div>
      <div class="col-6">
        <h4 class="text-primary font-monospace">STUDENT</h4>
      </div>
    </div>
    <!-- Name -->
    <div class="row mt-2 mb-2">
      <div class="col">
        <h5 class="userName text-primary">{{ userData.name }}</h5>
      </div>
    </div>
    <div class="row mt-2 mb-2">
      <div class="col">
        <span class="text-dark">DATE OF ADMISSION</span><br>
        <span class="text-dark">AUG {{ userData.matriculation_year }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getUserDataFromFirestore } from '../../composables/profile';

export default {
  name: "ProfileCard",
  setup() {
    const userData = ref(null);
    const cardStyle = ref({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.5s ease-out',
      transformStyle: 'preserve-3d'
    });
    const card = ref(null);

    const handleMouseMove = (e) => {
      if (!card.value) return;
      
      const rect = card.value.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation based on mouse position
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -((y - centerY) / centerY) * 10; // Max 10 degrees
      const rotateY = ((x - centerX) / centerX) * 10; // Max 10 degrees

      cardStyle.value = {
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d'
      };
    };

    const handleMouseLeave = () => {
      cardStyle.value = {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: 'transform 0.5s ease-out',
        transformStyle: 'preserve-3d'
      };
    };

    onMounted(async () => {
      userData.value = await getUserDataFromFirestore();
    });

    return { 
      userData,
      cardStyle,
      card,
      handleMouseMove,
      handleMouseLeave
    };
  },
};
</script>

<style scoped>
.card {
  background-color: white;
  transform-style: preserve-3d;
  will-change: transform;
}

/* Optional: Add a subtle shadow effect when hovering */
.card:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  cursor: all-scroll;
}

/* Optional: Make inner elements preserve 3D effect */
.row {
  transform-style: preserve-3d;
}


img {
  transform: translateZ(20px); /* Makes images appear slightly raised */
}
</style>