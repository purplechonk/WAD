// src/composables/fetchEvents.js
import { db } from '../firebase'; // Import your Firestore setup
import { collection, getDocs } from 'firebase/firestore';

// Function to fetch all events from Firestore
export const fetchAllEvents = async () => {
  try {
    const eventsCollection = collection(db, 'events'); // Reference to the events collection
    const eventsSnapshot = await getDocs(eventsCollection); // Fetch documents
    const eventsList = eventsSnapshot.docs.map(doc => ({
      id: doc.id, // Get the document ID
      ...doc.data(), // Spread operator to get event data
    }));
    return eventsList; // Return the list of events
  } catch (error) {
    console.error('Error fetching events:', error);
    return []; // Return an empty array in case of error
  }
};

// Function to fetch featured events (already in the file)
export const fetchFeaturedEvents = async () => {
  try {
    const eventsCollection = collection(db, 'events'); // Reference to your 'events' collection
    const snapshot = await getDocs(eventsCollection);
    const eventsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort events by start_date_time in descending order
    const sortedEvents = eventsList.sort((a, b) => {
      // Convert the date strings to timestamps for comparison
      const dateA = new Date(a.start_date_time).getTime();
      const dateB = new Date(b.start_date_time).getTime();
      return dateB - dateA; // Sort in descending order
    });

    // Grab the first 6 most recent events
    const featuredEvents = sortedEvents.slice(0, 6); // Get only the first 6

    return featuredEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Function to fetch unique categories from Firestore (from the events collection)
export const fetchCategoriesFromEvents = async () => {
  try {
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const categoriesSet = new Set();

    // Loop through all event documents and collect unique categories
    eventsSnapshot.forEach(doc => {
      const eventData = doc.data();
      if (eventData.category && Array.isArray(eventData.category)) {
        eventData.category.forEach(cat => categoriesSet.add(cat)); // Add each category to the Set
      }
    });

    return Array.from(categoriesSet); // Return as an array of unique categories
  } catch (error) {
    console.error('Error fetching categories from events:', error);
    return [];
  }
};

// Function to fetch unique CCAs from Firestore (from the events collection)
export const fetchCCAsFromEvents = async () => {
  try {
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const ccasSet = new Set();

    // Loop through all event documents and collect unique CCAs
    eventsSnapshot.forEach(doc => {
      const eventData = doc.data();
      if (eventData.cca) {
        ccasSet.add(eventData.cca); // Add each CCA to the Set
      }
    });

    return Array.from(ccasSet); // Return as an array of unique CCAs
  } catch (error) {
    console.error('Error fetching CCAs from events:', error);
    return [];
  }
};
