import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAC-FpcV1mLkW6oThAl_twQCWl4c1Vw71g",
  authDomain: "buildjamaica-8ff3f.firebaseapp.com",
  projectId: "buildjamaica-8ff3f",
  storageBucket: "buildjamaica-8ff3f.appspot.com",
  messagingSenderId: "441131528153",
  appId: "1:441131528153:web:3bee63e6d64c7dd24333c8"
};

async function run() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const uid = process.argv[2];
  if (!uid) {
    console.error('Usage: node checkUserDoc.js <uid>');
    process.exit(1);
  }
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log('No users document for uid:', uid);
    } else {
      console.log('users doc:', snap.data());
    }
  } catch (err) {
    console.error('Error fetching users doc:', err);
  }
}

run();
