// Firebase SDK ইম্পোর্ট
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCkdHgt_cQm1Se1V6tEJrNVXp_ZyLnVDjM",
  authDomain: "itihashbid.firebaseapp.com",
  projectId: "itihashbid",
  storageBucket: "itihashbid.firebasestorage.app",
  messagingSenderId: "520503832072",
  appId: "1:520503832072:web:bde572fd37059f8a956bbd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);