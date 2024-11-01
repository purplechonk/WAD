<template>
    <div class="parallax-wrapper">
      <div class="parallax__group">
        <div class="parallax__layer sky"></div>
        <div class="parallax__layer bushes"></div>
        <div class="parallax__layer water"></div>
        <div class="parallax__layer people1"></div>
        <div class="parallax__layer people2"></div>
        <div class="parallax__layer people3"></div>
        <div class="parallax__layer hero-text">

          <div class="year-container">
            <h1>sLoop</h1>
            <h1>Wrapped</h1>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { defineComponent, onMounted, onUnmounted } from 'vue'
  
  export default defineComponent({
  name: 'Parallax',
  setup() {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const layers = document.querySelectorAll('.parallax__layer');
          
          layers.forEach((layer) => {
            const speed = layer.classList.contains('sky') ? 0.2 :
                         layer.classList.contains('bushes') ? 0.3 :
                         layer.classList.contains('water') ? 0.4 :
                         layer.classList.contains('people1') ? 0.5 :
                         layer.classList.contains('people2') ? 0.6 :
                         layer.classList.contains('people3') ? 0.7 : 0;
                         
            const yPos = -(scrolled * speed);
            const scale = layer.style.transform.match(/scale\((.*?)\)/)?.[1] || 1;
            layer.style.transform = `translate3d(0, ${yPos}px, 0) scale(${scale})`;
          });
          
          ticking = false;
        });
        
        ticking = true;
      }
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      // Initial position setup
      handleScroll();
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });
  }
})
  </script>
  
  <style scoped>
.parallax-wrapper {
  height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  perspective: 1000px;
  transform-style: preserve-3d;
  background-color: #1a1a1a;
  pointer-events: none; /* Allow scrolling through the fixed element */
  overflow: hidden;
}
  
  .parallax__group {
    position: relative;
    height: 100vh;
    transform-style: preserve-3d;
    width: 100%;
  }
  
  .parallax__layer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 100% 120%;
    will-change: transform;
    background-size: cover;
  }
  
  .sky {
    background-image: url('../../assets/sky.png');
    transform: translateZ(-1000px) scale(3.0); /* Increased depth and scale */
    z-index: 1;
}
  
.bushes {
    background-image: url('../../assets/bushes.png');
    transform: translateZ(-800px) scale(2.6); /* Increased depth and scale */
    z-index: 2;
}
  
.water {
    background-image: url('../../assets/water.png');
    transform: translateZ(-600px) scale(2.2); /* Increased depth and scale */
    z-index: 3;
}
  
.people1 {
    background-image: url('../../assets/people1.png');
    transform: translateZ(-400px) scale(1.8); /* Increased depth and scale */
    z-index: 4;
}
  
.people2 {
    background-image: url('../../assets/people2.png');
    transform: translateZ(-200px) scale(1.4); /* Same as before */
    z-index: 5;
}
  
.people3 {
    background-image: url('../../assets/people3.png');
    transform: translateZ(-100px) scale(1.2); /* Same as before */
    z-index: 6;
}
  
  .hero-text {
    transform: translateZ(0);
    z-index: 7;
    background: linear-gradient(
      rgba(105, 211, 252, 0.15) 0%,
      rgba(255, 116, 161, 0.15) 86%,
      rgba(1, 0, 0, 0.15) 100%
    );
  }
  
  .hero-text h2 {
    position: absolute;
    left: 2.5rem;
    top: 2.5rem;
    color: white;
    font-size: 1.25rem;
    margin: 0;
  }
  
  .hero-text ul {
    position: absolute;
    right: 2.5rem;
    top: 2.5rem;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 2.5rem;
    list-style: none;
  }
  
  .hero-text ul li a {
    color: white;
    text-decoration: none;
    font-size: 0.875rem;
  }
  
  .btn {
    border: 1.5px solid white;
    border-radius: 0.75rem;
    padding: 0.75rem 1.25rem;
    transition: all 0.3s ease;
  }
  
  .btn:hover {
    background: white;
    color: black;
  }
  
  .year-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white;
    width: 100%;
  }
  
  .year-container h1 {
    font-size: 5rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 1024px) {
  .parallax-wrapper {
    perspective: 800px; /* Reduce perspective for better mobile view */
  }

  .sky { transform: translateZ(-800px) scale(2.6); }
  .bushes { transform: translateZ(-650px) scale(2.3); }
  .water { transform: translateZ(-500px) scale(2.0); }
  .people1 { transform: translateZ(-350px) scale(1.7); }
  .people2 { transform: translateZ(-200px) scale(1.4); }
  .people3 { transform: translateZ(-100px) scale(1.2); }
}

/* Small screens (mobile devices) */
@media (max-width: 768px) {
  .parallax-wrapper {
    perspective: 600px;
  }

  .parallax__layer {
    background-size: cover;
  }

  .sky { transform: translateZ(-600px) scale(2.2); }
  .bushes { transform: translateZ(-500px) scale(2.0); }
  .water { transform: translateZ(-400px) scale(1.8); }
  .people1 { transform: translateZ(-300px) scale(1.6); }
  .people2 { transform: translateZ(-200px) scale(1.4); }
  .people3 { transform: translateZ(-100px) scale(1.2); }
}

/* Extra small screens */
@media (max-width: 480px) {
  .parallax-wrapper {
    perspective: 400px;
  }

  .sky { transform: translateZ(-400px) scale(1.8); }
  .bushes { transform: translateZ(-350px) scale(1.7); }
  .water { transform: translateZ(-300px) scale(1.6); }
  .people1 { transform: translateZ(-250px) scale(1.5); }
  .people2 { transform: translateZ(-150px) scale(1.3); }
  .people3 { transform: translateZ(-50px) scale(1.1); }
}

/* Adjust text size for different screens */
.year-container h1 {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
  </style>