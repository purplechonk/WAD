// src/googleMapHelper.js

export function loadGoogleMapsScript(apiKey) {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve();
        return;
      }
  
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=alpha&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Google Maps JavaScript API failed to load.'));
      document.head.appendChild(script);
    });
  }
  
  export function geocodeLocation(address) {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          reject(new Error(`Geocode was not successful: ${status}`));
        }
      });
    });
  }
  
  export async function create3DMapWithMarker(mapContainer, center) {
    const { Map3DElement, Marker3DElement } = await google.maps.importLibrary('maps3d');
  
    // Create the 3D map element
    const map = new Map3DElement({
      center: { ...center, altitude: 0 },
      tilt: 67.5,
      range: 900,
      defaultLabelsDisabled: false,
    });
  
    // Append the map to the container
    mapContainer.appendChild(map);
  
    // Create the 3D marker element
    const marker = new Marker3DElement({
      position: { ...center, altitude: 60 },
      altitudeMode: 'RELATIVE_TO_GROUND',
      extruded: true,
    });
  
    // Append the marker to the map
    map.append(marker);
  
    // Define the target camera position
    const flyToCamera = {
      center: { ...center, altitude: 0 },
      tilt: 55,
      range: 300,
    };
  
    // Animate the camera to fly to the desired position
    map.flyCameraTo({
      endCamera: flyToCamera,
      durationMillis: 5000,
    });
  
    // Add animation event listener for continuous camera rotation
    map.addEventListener('gmp-animationend', () => {
      map.flyCameraAround({
        camera: flyToCamera,
        durationMillis: 60000,
        rounds: 1,
      });
    }, { once: true });
  
    return { map, marker };
  }
  