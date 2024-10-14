// src/composables/profile.js
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase'; // For accessing the current user

// Helper function to check Firestore for existing user and create record if it doesn't exist
export const checkAndCreateUserRecord = async (user) => {
  const userDocRef = doc(db, 'user_records', user.uid); // Reference to the user document
  const userDoc = await getDoc(userDocRef); // Try to fetch the user document

  if (!userDoc.exists()) {
    console.log('User does not exist, creating new record.');

    // Create a new user record in Firestore
    await setDoc(userDocRef, {
      name: user.displayName || '', // Name from Google Auth
      email: user.email, // Email from Google Auth
      gender: '', // Empty on first login
      faculty: '', // Empty string on first login, to be set by user
      weekly_timetable: [], // Empty list
      matriculation_year: extractMatriculationYear(user.email), // Extracted from email
      signed_up_events: [], // Empty list of events initially
      num_events_attended: 0, // Initially 0 events attended
      cca_interest: [], // Empty list of CCAs
      category_interests: [], // Empty list of category interests
    });

    console.log('User record created successfully.');
  } else {
    console.log('User already exists in Firestore.');
  }
};

// Function to fetch user data from Firestore
export const getUserDataFromFirestore = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userDocRef = doc(db, 'user_records', currentUser.uid); // Reference to the user document
  const userDoc = await getDoc(userDocRef); // Fetch the user document

  if (userDoc.exists()) {
    return userDoc.data(); // Return the user's data if it exists
  } else {
    console.error('No such user document!');
    return null;
  }
};

// Function to extract matriculation year from email
const extractMatriculationYear = (email) => {
  const yearMatch = email.match(/(\d{4})@/); // Matches the year part, e.g. "2023"
  return yearMatch ? yearMatch[1] : 'UNKNOWN';
};

// Function to save user preferences to Firestore (e.g., category_interests and cca_interest)
export const saveUserPreferencesToFirestore = async (field, value) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const userDocRef = doc(db, 'user_records', currentUser.uid);
  try {
    await updateDoc(userDocRef, {
      [field]: value,
    });
    console.log(`${field} updated successfully.`);
  } catch (error) {
    console.error('Error updating preferences:', error);
  }
};
