
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
