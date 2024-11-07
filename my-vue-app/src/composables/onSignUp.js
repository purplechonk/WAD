// src/composables/fetchEvents.js
import { db } from '../firebase'; // Import your Firestore setup
import { collection, getDocs, doc, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';
import { auth } from '../firebase'; // Firebase authentication

  /**
 * Function to add event to user's signed_up_events array.
 * @param {string} eventId - The event ID to add.
 */
export const updateUserSignedUpEvents = async (eventId) => {
    try {
      // Get the currently authenticated user
      const currentUser = auth.currentUser;
  
      if (!currentUser) {
        throw new Error('User is not authenticated');
      }
  
      const userId = currentUser.uid; // Get the user ID from the authenticated user
      const userRef = doc(db, 'user_records', userId); // Reference to user's Firestore document
  
      // Add the eventId to the signed_up_events array if not already present
      await updateDoc(userRef, {
        signed_up_events: arrayUnion(eventId),
      });
  
      console.log('Successfully signed up for event:', eventId);
    } catch (error) {
      console.error('Error updating user signed up events:', error);
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