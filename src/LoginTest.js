import React from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

function LoginTest() {
  const handleLogin = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, 'testuser@example.com', 'yourPassword')
      .then(userCredential => {
        console.log('✅ Signed in as:', userCredential.user.email);
      })
      .catch(error => {
        console.error('❌ Login error:', error.message);
      });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login Test</h2>
      <button onClick={handleLogin}>Sign In Test User</button>
    </div>
  );
}

export default LoginTest;