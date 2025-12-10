import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// Call this after client registration to create a client profile in Firestore
export async function createClientProfile({ uid, email, name }) {
  await setDoc(doc(db, 'clients', uid), {
    email,
    name,
    createdAt: new Date().toISOString(),
  });
}
