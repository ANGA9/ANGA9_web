// Firebase is retained for potential Realtime Database use.
// Authentication has moved to Supabase Auth.

import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCCOJsyjBzGlnUQc2xbmeRSZuXoyI5ZjzU",
  authDomain: "angacustomerside-64f68ece.firebaseapp.com",
  databaseURL: "https://angacustomerside-64f68ece-default-rtdb.firebaseio.com",
  projectId: "angacustomerside-64f68ece",
  storageBucket: "angacustomerside-64f68ece.firebasestorage.app",
  messagingSenderId: "250606811651",
  appId: "1:250606811651:web:cab3e29020a8cbbb382c36"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export { app };
