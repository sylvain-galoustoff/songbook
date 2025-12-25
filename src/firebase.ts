import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAJM5nPd5kSLUosFW4aWhui6ebH1FqMI1A",
  authDomain: "songbook-97910.firebaseapp.com",
  projectId: "songbook-97910",
  storageBucket: "songbook-97910.firebasestorage.app",
  messagingSenderId: "129383390618",
  appId: "1:129383390618:web:4dc727ea15bacae1052e23",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
