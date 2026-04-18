import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // (If you are using auth later)

const firebaseConfig = {
  apiKey: "AIzaSyAKWQZHncC-EbRRO6T7h1bAg_owB5YEWdU",
  authDomain: "expenses-62ed1.firebaseapp.com",
  projectId: "expenses-62ed1",
  storageBucket: "expenses-62ed1.firebasestorage.app",
  messagingSenderId: "801358745504",
  appId: "1:801358745504:web:16117aefb4224537d25ec5",
  measurementId: "G-CET9P2E3T7",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Export the database instance so our components can use it
export const db = getFirestore(app);
