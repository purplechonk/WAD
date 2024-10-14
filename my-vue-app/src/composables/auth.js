// src/composables/auth.js
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref } from 'vue';
import { checkAndCreateUserRecord } from './profile'; // Moved to profile.js

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
