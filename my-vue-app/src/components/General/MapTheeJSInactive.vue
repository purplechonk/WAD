<!-- Map.vue -->
<template>
    <div ref="map" class="map-container"></div>
  </template>
  
  <script>
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import { ThreeJSOverlayView } from '@googlemaps/three';
  
  export default {
    name: 'Map',
    props: {
      location: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        map: null,
        mapOptions: {
          tilt: 0,
          heading: 0,
          zoom: 18,
          center: null, // Will be set after geocoding
          mapId: '15431d2b469f209e',
          // Disable interactions due to animation loop and moveCamera
          disableDefaultUI: true,
          gestureHandling: 'none',
          keyboardShortcuts: false,
        },
      };
    },
    methods: {
      async initMap() {
        const mapDiv = this.$refs.map;
        if (!mapDiv) {
          console.error('mapDiv is null');
          return;
        }
  
        // Create the map
        this.map = new google.maps.Map(mapDiv, this.mapOptions);
  
        //Add a marker at the center with the location name
        const marker = new google.maps.Marker({
          position: this.mapOptions.center,
          map: this.map,
          zIndex: 9999, // Bring marker to the front if necessary
          title: this.location,
        });
  
        // Create the Three.js scene
        const scene = new THREE.Scene();
  
        // Add lights to the scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);
  
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
        directionalLight.position.set(0, 10, 50);
        scene.add(directionalLight);
  
        // Load the 3D model
        const loader = new GLTFLoader();
        const url = 'https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf';
  
        loader.load(
          url,
          (gltf) => {
            gltf.scene.scale.set(10, 10, 10);
            gltf.scene.rotation.x = Math.PI / 2;
            scene.add(gltf.scene);
  
            // Start the animation loop
            let { tilt, heading, zoom } = this.mapOptions;
  
            const animate = () => {
              if (tilt < 67.5) {
                tilt += 0.5;
              } else if (heading <= 360) {
                heading += 0.2;
                zoom -= 0.0005;
              } else {
                // Exit animation loop
                return;
              }
  
              this.map.moveCamera({ tilt, heading, zoom });
              requestAnimationFrame(animate);
            };
  
            requestAnimationFrame(animate);
          },
          undefined,
          (error) => {
            console.error('An error occurred while loading the model:', error);
          }
        );
  
        // Create the overlay
        new ThreeJSOverlayView({
          map: this.map,
          scene,
          anchor: { ...this.mapOptions.center, altitude: 400 },
          THREE,
        });
        
      },
      loadGoogleMapsScript() {
        return new Promise((resolve, reject) => {
          if (typeof google !== 'undefined' && google.maps) {
            resolve();
            return;
          }
  
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
          if (!apiKey) {
            reject(new Error('Google Maps API key is missing'));
            return;
          }
  
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = () => {
            reject(new Error('Google Maps JavaScript API failed to load.'));
          };
          document.head.appendChild(script);
        });
      },
      geocodeLocation() {
        return new Promise((resolve, reject) => {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: this.location }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const location = results[0].geometry.location;
              resolve({ lat: location.lat(), lng: location.lng() });
            } else {
              reject(new Error('Geocode was not successful: ' + status));
            }
          });
        });
      },
    },
    async mounted() {
      try {
        // Load the Google Maps script
        await this.loadGoogleMapsScript();
  
        // Geocode the location to get latitude and longitude
        const center = await this.geocodeLocation();
        this.mapOptions.center = center;
  
        // Initialize the map and overlay
        await this.initMap();
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    },
  };
  </script>
  
  <style scoped>
  .map-container {
    width: 100%;
    height: 400px; /* Adjust the height as needed */
  }
  </style>
  