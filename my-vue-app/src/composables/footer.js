import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const db = getFirestore();
const auth = getAuth();

/**
 * Stores user feedback into Firestore.
 * 
 * @param {string} feedbackText - The feedback provided by the user.
 */
export const storeFeedback = async (feedbackText) => {
    try {
      const user = auth.currentUser;
      const userName = user ? user.displayName || user.email || "Anonymous" : "Anonymous";
  
      const docRef = await addDoc(collection(db, "feedback"), {
        name: userName,
        comment: feedbackText,
      });
  
      console.log("Feedback stored with ID:", docRef.id);
    } catch (error) {
      console.error("Error storing feedback:", error.message);
    }
  };

/**
 * Fetch all feedback from Firestore.
 * @returns {Promise<Array>} List of feedback objects.
 */
export const fetchFeedback = async () => {
    try {
      const feedbackCollection = collection(db, "feedback");
      const feedbackSnapshot = await getDocs(feedbackCollection);
  
      const feedbackList = feedbackSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return feedbackList;
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw error;
    }
  };
  