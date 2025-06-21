import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCE39eXNbGdR3QCZMW1Lh3ldc0pR9Bfeyk",
  authDomain: "cardami-57f5d.firebaseapp.com",
  projectId: "cardami-57f5d",
  storageBucket: "cardami-57f5d.firebasestorage.app",
  messagingSenderId: "603488400643",
  appId: "1:603488400643:web:58f26697ee25cf4003e536"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword };