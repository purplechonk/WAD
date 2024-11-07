import { ref } from 'vue';
import { db, auth } from '../firebase'; // Import your Firestore setup
import {
    onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';

  // useSavedEventListener.js
export function useSavedEventListener(eventId) {
  const isSaved = ref(false);
  const unsubscribe = ref(null);

  const setupListener = () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      isSaved.value = false;
      return;
    }

    const userId = currentUser.uid;
    const userRef = doc(db, 'user_records', userId);

    // Unsubscribe from any previous listener
    if (unsubscribe.value) {
      unsubscribe.value();
    }

    unsubscribe.value = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        isSaved.value =
          userData.saved_events &&
          userData.saved_events.includes(eventId);
      } else {
        isSaved.value = false;
      }
    }, (error) => {
      console.error('Error listening to saved events:', error);
      isSaved.value = false;
    });
  };

  // Watch for authentication changes
  auth.onAuthStateChanged((user) => {
    setupListener();
  });

  // Initial setup
  setupListener();

  return {
    isSaved,
    unsubscribe: () => {
      if (unsubscribe.value) {
        unsubscribe.value();
      }
    },
  };
}
