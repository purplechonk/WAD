import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

const db = getFirestore();
const auth = getAuth();

/**
 * Stores user feedback into Firestore with datetime as a Firestore timestamp.
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
            datetime: serverTimestamp(), // Store datetime as Firestore timestamp
        });

        console.log("Feedback stored with ID:", docRef.id);
    } catch (error) {
        console.error("Error storing feedback:", error.message);
    }
};



/**
 * Fetch the most recent 6 feedback entries from Firestore.
 * @returns {Promise<Array>} List of the latest feedback objects.
 */
export const fetchFeedback = async () => {
    try {
        const feedbackCollection = collection(db, "feedback");
        const feedbackQuery = query(
            feedbackCollection,
            orderBy("datetime", "desc"), // Order feedback by timestamp in descending order
            limit(6) // Limit results to the most recent 6 entries
        );
        const feedbackSnapshot = await getDocs(feedbackQuery);

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

  