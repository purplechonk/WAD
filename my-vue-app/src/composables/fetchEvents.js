// src/composables/fetchEvents.js
import { db } from '../firebase'; // Import your Firestore setup
import { collection, getDocs, doc, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';

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

/**
 * Function to update the number of signups for a given event.
 * @param {string} eventId - The ID of the event to update.
 */
export const updateEventSignups = async (eventId) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    
    // Increment the no_of_signups by 1
    await updateDoc(eventRef, {
      no_of_signups: increment(1),
    });

 
  } catch (error) {
    console.error('Error updating sign-up count:', error);
  }
};

/**
 * Function to add event to user's signed_up_events array.
 * @param {string} userId - The user ID to update.
 * @param {string} eventId - The event ID to add.
 */
export const updateUserSignedUpEvents = async (userId, eventId) => {
  try {
    const userRef = doc(db, 'user_records', userId);
    
    // Add the eventId to the signed_up_events array
    await updateDoc(userRef, {
      signed_up_events: arrayUnion(eventId), // Add the eventId to the array if it's not already present
    });

 
  } catch (error) {
    console.error('Error updating user signed up events:', error);
  }
};

/**
 * Function to check if the user has already signed up for the event.
 * @param {string} userId - The user ID to check.
 * @param {string} eventId - The event ID to check.
 * @returns {Promise<boolean>} - True if the user has already signed up, otherwise false.
 */
export const hasUserSignedUpForEvent = async (userId, eventId) => {
  try {
    const userRef = doc(db, 'user_records', userId);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return userData.signed_up_events && userData.signed_up_events.includes(eventId); // Check if the eventId exists
    }
    
    return false; // User has not signed up if there's no record
  } catch (error) {
    console.error('Error checking user sign-up status:', error);
    return false;
  }
};
