// src/composables/timetable.js
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

// Fetch user's timetable from Firestore
export const getUserTimetable = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const userDocRef = doc(db, 'user_records', currentUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists() && userDoc.data().weekly_timetable) {
    return userDoc.data().weekly_timetable;
  } else {
    console.log('No timetable found.');
    return [];
  }
};

// Save user's timetable to Firestore
export const saveUserTimetable = async (timetable) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const userDocRef = doc(db, 'user_records', currentUser.uid);
  try {
    await updateDoc(userDocRef, { weekly_timetable: timetable });
    console.log('Timetable saved successfully.');
  } catch (error) {
    console.error('Error saving timetable:', error);
  }
};
