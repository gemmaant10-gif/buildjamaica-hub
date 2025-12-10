import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Header.css';

function Header() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setRole(null);
      if (currentUser) {
        try {
          // Special-case the main admin email so header links appear even if no users doc exists
          if (currentUser.email === 'islandlivingenterprises@gmail.com') {
            setRole('admin');
          } else {
            const userRef = doc(db, 'users', currentUser.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              setRole(snap.data().role || null);
            } else {
              setRole(null);
            }
          }
        } catch (err) {
          console.error('Header: failed to read user role', err);
          setRole(null);
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const toggleMobile = () => setMobileOpen(v => !v);

  return (
    <header className="app-header">
      <div className="logo">🏗️ Build-Jamaica</div>
      <div className="header-nav-center">
        <Link to="/" className="nav-button">🏠 Home</Link>
        <Link to="/services" className="nav-button">🧰 Services</Link>
        <Link to="/aboutus" className="nav-button">📃 About Us</Link>
      </div>
      <nav className="nav-links">
        {/* Hamburger for small screens */}
        <button className="hamburger" onClick={toggleMobile} aria-label="Toggle menu">
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        {/* Mobile menu (visible when hamburger toggled) */}
        <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
          <Link to="/" className="mobile-link" onClick={()=>setMobileOpen(false)}>🏠 Home</Link>
          <Link to="/services" className="mobile-link" onClick={()=>setMobileOpen(false)}>🧰 Services</Link>
          <Link to="/aboutus" className="mobile-link" onClick={()=>setMobileOpen(false)}>📃 About Us</Link>
          <Link to="/login" className="mobile-link" onClick={()=>setMobileOpen(false)}>🔐 Admin Login</Link>
          <Link to="/client-auth" className="mobile-link" onClick={()=>setMobileOpen(false)}>👤 Client Login</Link>
        </div>
        {user && role === 'admin' ? (
          <>
            <Link to="/dashboard" className="nav-button">📋 Dashboard</Link>
            <button onClick={handleLogout} className="nav-button logout">🚪 Logout</button>
          </>
        ) : user && role === 'contractor' ? (
          <>
            <Link to={`/dashboard/${user.uid}`} className="nav-button">📋 Contractor Dashboard</Link>
            <button onClick={handleLogout} className="nav-button logout">🚪 Logout</button>
          </>
        ) : user && role === 'client' ? (
          <>
            <Link to="/client-dashboard" className="nav-button">📋 Client Dashboard</Link>
            <button onClick={handleLogout} className="nav-button logout">🚪 Logout</button>
          </>
        ) : (
          <>
            <div style={{display:'flex',gap:'0.7rem',alignItems:'center'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',minWidth:'120px'}}>
                <Link to="/login" className="nav-button" style={{fontSize:'0.90rem',padding:'0.25rem 0.5rem',marginBottom:'0.2rem'}}>
                  🔐 Admin Login
                </Link>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',minWidth:'120px'}}>
                <Link to="/client-auth" className="nav-button" style={{fontSize:'0.90rem',padding:'0.25rem 0.5rem',marginBottom:'0.2rem'}}>
                  👤 Client Login
                </Link>
                <Link to="/client-auth?register=1" className="nav-link" style={{fontSize:'0.70rem',textAlign:'center'}}>
                  Create Client Account
                </Link>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;