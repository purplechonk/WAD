// src/seedEvents.js
import { db } from './firebase';  // Firestore setup from your firebase.js
import { collection, setDoc, doc } from 'firebase/firestore';

// Function to fetch and seed events data
const seedEventsToFirestore = async () => {
  try {
    // Fetch the JSON data
    const response = await fetch('/firestoreEvents.json');
    const eventsData = await response.json();

    // Reference to Firestore collection (for example, 'events')
    const eventsCollection = collection(db, 'events');

    // Loop through each event in the JSON and add to Firestore using event IDs
    for (const eventId in eventsData) {
      if (eventsData.hasOwnProperty(eventId)) {
        const event = eventsData[eventId];

        // Add each event to Firestore using setDoc and the event ID as document ID
        await setDoc(doc(eventsCollection, eventId), {
          event_name: event.event_name,
          category: event.category,
          cca: event.cca,
          start_date_time: event.start_date_time,
          end_date_time: event.end_date_time,
          venue: event.venue,
          description: event.description,
          no_of_signups: event.no_of_signups,
          max_participants: event.max_participants,
          photo_url: event.photo_url
        });
      }
    }
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding events:', error);
  }
};

export default seedEventsToFirestore;
