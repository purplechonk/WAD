// src/composables/fetchEvents.js
import { db } from '../firebase'; // Import your Firestore setup
import { auth } from '../firebase'; // Firebase authentication
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { getUserDataFromFirestore } from './profile';

// Helper function to parse date and time strings into Date objects
const parseDateTime = (dateTimeString) => {
  // Assuming the format is "DD/MM/YYYY HH:mm:ss"
  const [datePart, timePart] = dateTimeString.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes, seconds);
};

// Helper function to check if two time ranges overlap
const timeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// Helper function to check for time clashes
const doesEventClashWithTimetable = (event, timetable) => {
  // Parse event's start and end date times
  const eventStart = parseDateTime(event.start_date_time);
  const eventEnd = parseDateTime(event.end_date_time);

  // Get the day of the week for the event (e.g., "Tuesday")
  const eventDay = eventStart.toLocaleString('en-US', { weekday: 'long' });

  // For each class in the user's timetable
  for (const classSession of timetable) {
    if (classSession.day === eventDay) {
      // Parse class start and end times into Date objects on the event's date
      const classStart = new Date(eventStart);
      const classEnd = new Date(eventStart);

      const [classStartHours, classStartMinutes] = classSession.start_time
        .split(':')
        .map(Number);
      const [classEndHours, classEndMinutes] = classSession.end_time
        .split(':')
        .map(Number);

      classStart.setHours(classStartHours, classStartMinutes, 0, 0);
      classEnd.setHours(classEndHours, classEndMinutes, 0, 0);

      // Check for overlap between event and class times
      if (timeRangesOverlap(eventStart, eventEnd, classStart, classEnd)) {
        return true; // Clash found
      }
    }
  }
  return false; // No clash
};

// Function to fetch all events from Firestore and sort them by start date/time
export const fetchAllEvents = async () => {
  try {
    const eventsCollection = collection(db, 'events'); // Reference to the events collection
    const eventsSnapshot = await getDocs(eventsCollection); // Fetch documents
    const eventsList = eventsSnapshot.docs.map((doc) => ({
      id: doc.id, // Get the document ID
      ...doc.data(), // Spread operator to get event data
    }));

    // Sort the events by start date/time
    eventsList.sort((a, b) => {
      const dateA = parseDateTime(a.start_date_time);
      const dateB = parseDateTime(b.start_date_time);
      return dateA - dateB;
    });

    return eventsList; // Return the list of all events
  } catch (error) {
    console.error('Error fetching events:', error);
    return []; // Return an empty array in case of error
  }
};

// Function to fetch all upcoming events from Firestore and sort them by start date/time
export const fetchLiveEvents = async () => {
  try {
    const eventsCollection = collection(db, 'events'); // Reference to the events collection
    const eventsSnapshot = await getDocs(eventsCollection); // Fetch documents
    const eventsList = eventsSnapshot.docs.map((doc) => ({
      id: doc.id, // Get the document ID
      ...doc.data(), // Spread operator to get event data
    }));

    // Get the current date
    const currentDate = window.CURRENT_DATE
      ? new Date(window.CURRENT_DATE)
      : new Date();

    // Filter out past events
    let upcomingEvents = eventsList.filter((event) => {
      const eventEnd = parseDateTime(event.end_date_time);
      return eventEnd >= currentDate;
    });

    // Sort the upcoming events by start date/time
    upcomingEvents.sort((a, b) => {
      const dateA = parseDateTime(a.start_date_time);
      const dateB = parseDateTime(b.start_date_time);
      return dateA - dateB;
    });

    return upcomingEvents; // Return the list of upcoming events
  } catch (error) {
    console.error('Error fetching live events:', error);
    return []; // Return an empty array in case of error
  }
};

// Function to fetch unique categories from upcoming events in Firestore
export const fetchCategoriesFromEvents = async () => {
  try {
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const categoriesSet = new Set();

    // Get the current date
    const currentDate = window.CURRENT_DATE
      ? new Date(window.CURRENT_DATE)
      : new Date();

    // Loop through all event documents and collect unique categories from upcoming events
    eventsSnapshot.forEach((doc) => {
      const eventData = doc.data();
      const eventEnd = parseDateTime(eventData.end_date_time);

      if (eventEnd >= currentDate) {
        if (eventData.category && Array.isArray(eventData.category)) {
          eventData.category.forEach((cat) => categoriesSet.add(cat)); // Add each category to the Set
        }
      }
    });

    // Return sorted categories
    return Array.from(categoriesSet).sort();
  } catch (error) {
    console.error('Error fetching categories from events:', error);
    return [];
  }
};

// Function to fetch unique CCAs from upcoming events in Firestore
export const fetchCCAsFromEvents = async () => {
  try {
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const ccasSet = new Set();

    // Get the current date
    const currentDate = window.CURRENT_DATE
      ? new Date(window.CURRENT_DATE)
      : new Date();

    // Loop through all event documents and collect unique CCAs from upcoming events
    eventsSnapshot.forEach((doc) => {
      const eventData = doc.data();
      const eventEnd = parseDateTime(eventData.end_date_time);

      if (eventEnd >= currentDate) {
        if (eventData.cca) {
          ccasSet.add(eventData.cca); // Add each CCA to the Set
        }
      }
    });

    // Return sorted CCAs
    return Array.from(ccasSet).sort();
  } catch (error) {
    console.error('Error fetching CCAs from events:', error);
    return [];
  }
};

/**
 * Function to check if the user has already signed up for the event.
 * @param {string} eventId - The event ID to check.
 * @returns {Promise<boolean>} - True if the user has already signed up, otherwise false.
 */
export const hasUserSignedUpForEvent = async (eventId) => {
  try {
    // Get the currently authenticated user
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User is not authenticated');
    }

    const userId = currentUser.uid; // Get the user ID
    const userRef = doc(db, 'user_records', userId); // Reference to user's Firestore document
    const userSnapshot = await getDoc(userRef); // Fetch the user document

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return (
        userData.signed_up_events &&
        userData.signed_up_events.includes(eventId)
      ); // Check if eventId exists
    }

    return false; // User has not signed up if there's no document or field
  } catch (error) {
    console.error('Error checking user sign-up status:', error);
    return false;
  }
};

// Helper to fetch upcoming events by CCA interest and sort them by start date/time
export const fetchEventsByCCA = async (ccaInterest) => {
  try {
    console.log(`Fetching events for CCA: ${ccaInterest}`);
    const ccaQuery = query(
      collection(db, 'events'),
      where('cca', '==', ccaInterest)
    );
    const snapshot = await getDocs(ccaQuery);
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Get the current date
    const currentDate = window.CURRENT_DATE
      ? new Date(window.CURRENT_DATE)
      : new Date();

    // Filter out past events
    let upcomingEvents = events.filter((event) => {
      const eventEnd = parseDateTime(event.end_date_time);
      return eventEnd >= currentDate;
    });

    // Sort the upcoming events by start date/time
    upcomingEvents.sort((a, b) => {
      const dateA = parseDateTime(a.start_date_time);
      const dateB = parseDateTime(b.start_date_time);
      return dateA - dateB;
    });

    return upcomingEvents;
  } catch (error) {
    console.error(`Error fetching events for CCA: ${ccaInterest}`, error);
    return [];
  }
};

export const fetchRecommendedEvents = async () => {
  try {
    // Check if the user is authenticated
    const user = auth.currentUser;

    // Initialize an array to store recommended events
    let recommendedEvents = [];

    // Get the current date
    const currentDate = window.CURRENT_DATE
      ? new Date(window.CURRENT_DATE)
      : new Date();

    if (user) {
      // User is authenticated
      const userData = await getUserDataFromFirestore();
      if (!userData) throw new Error('No user data found.');

      const {
        category_interests = [],
        cca_interest = [],
        weekly_timetable = [],
      } = userData;

      // Check if user has preferences set
      const hasPreferences =
        (category_interests && category_interests.length > 0) ||
        (cca_interest && cca_interest.length > 0);

      if (hasPreferences) {
        // Initialize empty arrays to store results
        let categoryEvents = [];
        let ccaEvents = [];

        console.log('User Data:', userData);

        // Query for events based on category interests if they exist
        if (category_interests.length > 0) {
          const categoryQuery = query(
            collection(db, 'events'),
            where('category', 'array-contains-any', category_interests)
          );
          const categorySnapshot = await getDocs(categoryQuery);
          categoryEvents = categorySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('Category Events:', categoryEvents);
        }

        // Query for events based on CCA interests if they exist
        if (cca_interest.length > 0) {
          const ccaEventsPromises = cca_interest.map((cca) =>
            fetchEventsByCCA(cca)
          );
          const ccaEventsResults = await Promise.all(ccaEventsPromises);
          ccaEvents = ccaEventsResults.flat(); // Flatten the array of arrays
          console.log('CCA Events:', ccaEvents);
        }

        // Merge category and CCA events, avoiding duplicates using a Map
        const eventMap = new Map();
        categoryEvents.forEach((event) => eventMap.set(event.id, event));
        ccaEvents.forEach((event) => eventMap.set(event.id, event));

        let mergedEvents = Array.from(eventMap.values());

        // Filter out past events
        mergedEvents = mergedEvents.filter((event) => {
          const eventEnd = parseDateTime(event.end_date_time);
          return eventEnd >= currentDate;
        });

        // Filter out events that clash with the user's timetable
        mergedEvents = mergedEvents.filter(
          (event) => !doesEventClashWithTimetable(event, weekly_timetable)
        );

        // Sort the merged events by start date/time
        mergedEvents.sort((a, b) => {
          const dateA = parseDateTime(a.start_date_time);
          const dateB = parseDateTime(b.start_date_time);
          return dateA - dateB;
        });

        console.log('Filtered and Sorted Recommended Events:', mergedEvents);

        recommendedEvents = mergedEvents;
      } else {
        // User has no preferences set
        // Fetch top 10 events similar to unauthenticated users

        // Fetch all events
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        let events = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter out past events
        events = events.filter((event) => {
          const eventEnd = parseDateTime(event.end_date_time);
          return eventEnd >= currentDate;
        });

        // Calculate percentage of slots filled
        events.forEach((event) => {
          event.percentageFilled = event.max_participants
            ? (event.no_of_signups / event.max_participants) * 100
            : 0;
        });

        // Sort events by percentageFilled in descending order
        events.sort((a, b) => b.percentageFilled - a.percentageFilled);

        // Get top 10 events
        let topEvents = events.slice(0, 10);

        // Filter out events that clash with the user's timetable
        topEvents = topEvents.filter(
          (event) => !doesEventClashWithTimetable(event, weekly_timetable)
        );

        // Sort the top events by start date/time
        topEvents.sort((a, b) => {
          const dateA = parseDateTime(a.start_date_time);
          const dateB = parseDateTime(b.start_date_time);
          return dateA - dateB;
        });

        console.log(
          'Top 10 Events for User without Preferences:',
          topEvents
        );

        recommendedEvents = topEvents;
      }
    } else {
      // User is not authenticated
      // Fetch all events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      let events = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter out past events
      events = events.filter((event) => {
        const eventEnd = parseDateTime(event.end_date_time);
        return eventEnd >= currentDate;
      });

      // Calculate percentage of slots filled
      events.forEach((event) => {
        event.percentageFilled = event.max_participants
          ? (event.no_of_signups / event.max_participants) * 100
          : 0;
      });

      // Sort events by percentageFilled in descending order
      events.sort((a, b) => b.percentageFilled - a.percentageFilled);

      // Get top 10 events
      let topEvents = events.slice(0, 10);

      // Sort the top events by start date/time
      topEvents.sort((a, b) => {
        const dateA = parseDateTime(a.start_date_time);
        const dateB = parseDateTime(b.start_date_time);
        return dateA - dateB;
      });

      console.log('Top 10 Events for Unauthenticated User:', topEvents);

      recommendedEvents = topEvents;
    }

    return recommendedEvents;
  } catch (error) {
    console.error('Error fetching recommended events:', error);
    return [];
  }
};
export const fetchUserEvents = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User is not authenticated');
    }

    // Reference to the user's Firestore document
    const userDocRef = doc(db, 'user_records', currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User document does not exist');
    }

    const userData = userDoc.data();

    // Extract saved and signed-up events
    const savedEvents = userData.saved_events || [];     // Array of saved event IDs
    const signedUpEvents = userData.signed_up_events || []; // Array of signed-up event IDs

    return { savedEvents, signedUpEvents };
  } catch (error) {
    console.error('Error fetching user events:', error);
    return { savedEvents: [], signedUpEvents: [] };
  }
};