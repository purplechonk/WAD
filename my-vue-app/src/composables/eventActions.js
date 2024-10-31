import { doc, updateDoc, arrayRemove, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

// Function to cancel RSVP
export const cancelRSVPInDatabase = async (eventId, userId) => {
  try {
    // Reference to the event document
    const eventRef = doc(db, 'events', eventId);
    
    // Reference to the user document
    const userRef = doc(db, 'user_records', userId);

    // Remove event from user's signed_up_events and decrement no_of_signups
    await updateDoc(eventRef, {
      no_of_signups: increment(-1),
    });

    await updateDoc(userRef, {
      signed_up_events: arrayRemove(eventId),
    });

  } catch (error) {
    console.error('Error canceling RSVP:', error);
  }
};

export async function updateSaveEvents(field, userId, value, action) {
  const userDoc = doc(db, 'user_records', userId);

  try {
    if (action === 'add') {
      await updateDoc(userDoc, {
        [field]: arrayUnion(value),
      });
    } else if (action === 'remove') {
      await updateDoc(userDoc, {
        [field]: arrayRemove(value),
      });
    }
  } catch (error) {
    console.error('Error updating user field:', error);
  }
}
