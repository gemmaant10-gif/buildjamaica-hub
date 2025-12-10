import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createClientProfile } from '../utils/clientProfile';
import { useNavigate, useLocation } from 'react-router-dom';

function ClientAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (isLogin) {
      try {
        console.log('Attempting client sign-in for', email);
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        console.log('Sign-in successful, uid=', userCred.user.uid);
        // Check role in Firestore by UID (avoid list queries)
        const userRef = doc(db, 'users', userCred.user.uid);
        const userSnap = await getDoc(userRef);
        let userRole = null;
        if (userSnap.exists()) {
          userRole = userSnap.data().role;
        }
        console.log('User role from Firestore:', userRole);
        if (userRole !== 'client') {
          setError('Only clients can log in here.');
          await auth.signOut();
          setLoading(false);
          // Force immediate navigation to reset header state
          navigate('/client-auth');
          return;
        }
        navigate('/client-dashboard');
      } catch (err) {
        console.error('Client login error:', err);
        setError(err && err.message ? err.message : 'Login failed.');
      }
    } else {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          email,
          name,
          role: 'client',
          createdAt: new Date().toISOString(),
        });
        await createClientProfile({ uid: userCred.user.uid, email, name });
        navigate('/client-dashboard');
      } catch (err) {
        console.error('Client signup error:', err);
        setError(err && err.message ? err.message : 'Signup failed.');
      }
    }
    setLoading(false);
  };

  // If the header linked here with ?register=1 or ?register=true, open registration mode
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const wantsRegister = params.get('register') === '1' || params.get('register') === 'true';
      if (wantsRegister) setIsLogin(false);
    } catch (err) {
      // ignore
    }
  }, [location.search]);

  return (
    <div style={{maxWidth:'400px',margin:'3rem auto',background:'#f3f8f6',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.07)',padding:'2rem'}}>
      <h2 style={{textAlign:'center',color:'#007b5e',marginBottom:'1.5rem'}}>{isLogin ? 'Client Login' : 'Client Registration'}</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {!isLogin && (
          <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" required style={{padding:'0.7rem',borderRadius:'6px',border:'1px solid #ccc'}} />
        )}
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required style={{padding:'0.7rem',borderRadius:'6px',border:'1px solid #ccc'}} />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required style={{padding:'0.7rem',borderRadius:'6px',border:'1px solid #ccc'}} />
        {error && <div style={{color:'#d9534f',textAlign:'center'}}>{error}</div>}
        <button type="submit" disabled={loading} style={{background:'linear-gradient(90deg,#007b5e 60%,#00c6a7 100%)',color:'white',border:'none',borderRadius:'6px',padding:'0.8rem',fontWeight:'bold',fontSize:'1rem',cursor:'pointer'}}>
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <div style={{textAlign:'center',marginTop:'1.2rem'}}>
        <button onClick={()=>setIsLogin(!isLogin)} style={{background:'none',border:'none',color:'#007b5e',fontWeight:'bold',cursor:'pointer',fontSize:'1rem'}}>
          {isLogin ? 'New client? Register here' : 'Already registered? Login'}
        </button>
      </div>
    </div>
  );
}

export default ClientAuth;
