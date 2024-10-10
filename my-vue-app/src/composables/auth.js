// src/composables/auth.js
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Firestore setup
import { ref } from 'vue';

const user = ref(null); // Store the logged-in user
const isAuthChecked = ref(false); // Track if auth state has been checked

const provider = new GoogleAuthProvider();

// Monitor authentication state changes
onAuthStateChanged(auth, async (currentUser) => {
  if (currentUser) {
    user.value = currentUser; // Set the current user if authenticated
    await checkAndCreateUserRecord(currentUser); // Check or create the Firestore record
  } else {
    user.value = null; // Set to null if the user is logged out
  }
  isAuthChecked.value = true; // Auth state has been checked
});

// Function to fetch user data from Firestore
export const getUserDataFromFirestore = async () => {
  if (!user.value) return null;

  const userDocRef = doc(db, 'user_records', user.value.uid); // Reference to the user document
  const userDoc = await getDoc(userDocRef); // Fetch the user document

  if (userDoc.exists()) {
    return userDoc.data(); // Return the user's data if it exists
  } else {
    console.error('No such user document!');
    return null;
  }
};

// Function to check Firestore for existing user and create record if it doesn't exist
const checkAndCreateUserRecord = async (user) => {
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
      category_interests: [], // New field: Empty list of category interests
    });

    console.log('User record created successfully.');
  } else {
    console.log('User already exists in Firestore.');
  }
};

// Helper function to extract matriculation year from email
const extractMatriculationYear = (email) => {
  const yearMatch = email.match(/(\d{4})@/); // Matches the year part, e.g. "2023"
  return yearMatch ? yearMatch[1] : 'UNKNOWN';
};

// Function to log in using Google Auth
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    user.value = result.user; // Set the logged-in user
    await checkAndCreateUserRecord(result.user); // Check or create user record
    return result.user;
  } catch (error) {
    console.error('Error logging in with Google:', error);
    throw error;
  }
};

// Function to log out the user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    user.value = null; // Clear the user on logout
    console.log('User logged out');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

// Helper to check if a user is authenticated
export const isAuthenticated = () => {
  return user.value !== null;
};

// Helper to get the current logged-in user
export const getUser = () => {
  return user.value;
};

// Helper to check if authentication state has been checked
export const isAuthStateChecked = () => {
  return isAuthChecked.value;
};
