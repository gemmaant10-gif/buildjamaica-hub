import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAC-FpcV1mLkW6oThAl_twQCWl4c1Vw71g",
  authDomain: "buildjamaica-8ff3f.firebaseapp.com",
  projectId: "buildjamaica-8ff3f",
  storageBucket: "buildjamaica-8ff3f.appspot.com",
  messagingSenderId: "441131528153",
  appId: "1:441131528153:web:3bee63e6d64c7dd24333c8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export { db, auth };