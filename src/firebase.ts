import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCN7RqlelpLNVLL_W4wfiw7xE6qG5Ck8YU",
  authDomain: "mission-control5.firebaseapp.com",
  projectId: "mission-control5",
  storageBucket: "mission-control5.firebasestorage.app",
  messagingSenderId: "143590609430",
  appId: "1:143590609430:web:164c9c0823148c741bdb37",
  measurementId: "G-HR3DWXEW5F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only if supported)
export let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
