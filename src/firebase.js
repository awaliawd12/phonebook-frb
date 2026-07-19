// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Tempel konfigurasi Firebase Anda di bawah ini
const firebaseConfig = {
  apiKey: "AIzaSyDoLIC0AhPl-koL1yfnpVbV72-RO2n4NSs",
  authDomain: "phonebook-app-74e8a.firebaseapp.com",
  projectId: "phonebook-app-74e8a",
  storageBucket: "phonebook-app-74e8a.firebasestorage.app",
  messagingSenderId: "55129132623",
  appId: "1:55129132623:web:c9396958cc099755d3a43a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Database)
export const db = getFirestore(app);
export const auth = getAuth(app); // 2. Ekspor fungsi auth