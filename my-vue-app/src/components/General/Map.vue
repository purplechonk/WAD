<template>
  <div ref="map" class="map-container"></div>
</template>

<script>
import { loadGoogleMapsScript, geocodeLocation, create3DMapWithMarker } from '../../composables/googleMapHelper';

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
      marker: null,
    };
  },
  async mounted() {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        throw new Error('Google Maps API key is missing');
      }

      // Load the Google Maps script
      await loadGoogleMapsScript(apiKey);

      // Geocode the location to get latitude and longitude
      const center = await geocodeLocation(this.location);

      // Initialize the 3D map with a marker
      const mapContainer = this.$refs.map;
      const { map, marker } = await create3DMapWithMarker(mapContainer, center);

      // Store references to the map and marker
      this.map = map;
      this.marker = marker;
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  },
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 18rem;
  /* Adjust the height as needed */
}
</style>
