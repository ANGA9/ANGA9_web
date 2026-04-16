import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCCOJsyjBzGlnUQc2xbmeRSZuXoyI5ZjzU",
  authDomain: "angacustomerside-64f68ece.firebaseapp.com",
  databaseURL: "https://angacustomerside-64f68ece-default-rtdb.firebaseio.com",
  projectId: "angacustomerside-64f68ece",
  storageBucket: "angacustomerside-64f68ece.firebasestorage.app",
  messagingSenderId: "250606811651",
  appId: "1:250606811651:web:cab3e29020a8cbbb382c36"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);

// Disable reCAPTCHA verification for localhost/127.0.0.1 development
// This allows phone auth to work with test phone numbers on localhost
if (typeof window !== "undefined") {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    auth.settings.appVerificationDisabledForTesting = true;
  }
}

export { app, auth };
