// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFuRYTL4eyEomFR56eBDxK-WmxdJFupHM",
  authDomain: "scrapvex-a083d.firebaseapp.com",
  projectId: "scrapvex-a083d",
  storageBucket: "scrapvex-a083d.firebasestorage.app",
  messagingSenderId: "1078463966792",
  appId: "1:1078463966792:web:f60290c5c9ccbf7b2b327d",
  measurementId: "G-WDP11HTGNK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
