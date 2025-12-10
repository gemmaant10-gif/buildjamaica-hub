import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import '../App.css';
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Redirect admin to /dashboard, contractors to /dashboard/:uid
      if (user.email === 'islandlivingenterprises@gmail.com') {
        navigate('/dashboard');
      } else {
        navigate(`/dashboard/${user.uid}`);
      }
    } catch (error) {
      alert('Login failed. Check your credentials.');
      console.error(error);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setResetMessage('Please enter your email above first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      setResetMessage('Failed to send reset email. Is your email correct?');
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <h2>🔐 Admin Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
        <button
          type="button"
          style={{
            background: 'none',
            color: '#007b5e',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginTop: '-0.5rem',
            marginBottom: '0.5rem',
            fontSize: '0.98rem',
            alignSelf: 'flex-start'
          }}
          onClick={handlePasswordReset}
        >
          Forgot password?
        </button>
        {resetMessage && (
          <div style={{ color: resetMessage.includes('sent') ? '#007b5e' : 'crimson', fontSize: '0.97rem', marginBottom: '0.5rem' }}>
            {resetMessage}
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;