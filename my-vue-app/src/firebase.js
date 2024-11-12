// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration (replace with your Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyA4EU-Vt-16FhHO2VvPRGwhYpL5qtLv6as",
    authDomain: "sloop-76866.firebaseapp.com",
    projectId: "sloop-76866",
    storageBucket: "sloop-76866.appspot.com",
    messagingSenderId: "597402213435",
    appId: "1:597402213435:web:7deaf7e6849bc12411901e"
  };

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { db, auth };
