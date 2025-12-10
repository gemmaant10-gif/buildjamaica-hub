import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function ProtectedRoleRoute({ children, role }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        setChecking(false);
        return;
      }
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        const userRole = snap.exists() ? snap.data().role : null;
        setAllowed(userRole === role || user.email === 'islandlivingenterprises@gmail.com');
      } catch (err) {
        console.error('ProtectedRoleRoute error:', err);
        setAllowed(false);
      }
      setChecking(false);
    });
    return () => unsub();
  }, [role]);

  if (checking) return <p style={{textAlign:'center',marginTop:'2rem'}}>Checking access...</p>;
  if (!allowed) return <Navigate to="/" />;
  return children;
}

export default ProtectedRoleRoute;
