<!-- src/components/Carousel.vue -->
<template>
    <div class="carousel">
      <!-- You can replace this section with an actual carousel implementation -->
      <div class="carousel-item" v-for="(item, index) in items" :key="index">
        <img :src="item.image" :alt="item.altText" />
      </div>
    </div>
  </template>
  
  <script setup>
  const items = [
    { image: '../../assets/AnimalAssistedTherapy.png', altText: 'Image 1' },
    { image: '../../assets/AnimalAssistedTherapy.png', altText: 'Image 2' },
    { image: '../../assets/AnimalAssistedTherapy.png', altText: 'Image 3' },
  ];
  </script>
  
  <style scoped>
  .carousel {
    display: flex;
    overflow: hidden;
  }
  .carousel-item {
    min-width: 100%; /* Adjust as necessary */
  }
  </style>
  