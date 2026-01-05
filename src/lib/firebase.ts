
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAqaAeUd_dJzMxyEp6kXVDtCF0W0OlmSd8",
  authDomain: "studio-3775393179-5c68b.firebaseapp.com",
  projectId: "studio-3775393179-5c68b",
  storageBucket: "studio-3775393179-5c68b.firebasestorage.app",
  messagingSenderId: "1063177710006",
  appId: "1:1063177710006:web:dd49e5b140e7cde7e83917",
  measurementId: "G-6N19450KS0"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, analytics };
