// src/composables/auth.js
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref } from 'vue';

const user = ref(null); // Store the logged-in user

const provider = new GoogleAuthProvider();

// Monitor authentication state changes
onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    user.value = currentUser; // Set the current user if authenticated
  } else {
    user.value = null; // Set to null if the user is logged out
  }
});

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    user.value = result.user; // Update the user with the signed-in user
    return result.user;
  } catch (error) {
    console.error('Error logging in with Google:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    user.value = null; // Clear the user on logout
    console.log('User logged out');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

export const isAuthenticated = () => {
  return user.value !== null; // Return true if a user is authenticated
};

export const getUser = () => {
  return user.value; // Return the current user
};
