import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUBV9t03sr0_0AWg6Oh7190C7bTna5wXQ",
  authDomain: "studio-1765859177-79c1f.firebaseapp.com",
  projectId: "studio-1765859177-79c1f",
  storageBucket: "studio-1765859177-79c1f.firebasestorage.app",
  messagingSenderId: "379730264250",
  appId: "1:379730264250:web:c1ed21e36287e03d04c283"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
