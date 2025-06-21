// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// src/firebase.js
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCE39eXNbGdR3QCZMW1Lh3ldc0pR9Bfeyk",
  authDomain: "cardami-57f5d.firebaseapp.com",
  projectId: "cardami-57f5d",
  storageBucket: "cardami-57f5d.firebasestorage.app",
  messagingSenderId: "603488400643",
  appId: "1:603488400643:web:58f26697ee25cf4003e536"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);