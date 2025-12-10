import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc } from 'firebase/firestore';

function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const { useNavigate } = require('react-router-dom');
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ trade: '', parish: '', address: '', details: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const trades = [
    'Plumbing', 'Electrical', 'Landscaping', 'Painting', 'Carpentry', 'Roofing', 'Masonry', 'Other'
  ];
  const parishes = [
    'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 'St. Mary', 'St. Ann',
    'Trelawny', 'St. James', 'Hanover', 'Westmoreland', 'St. Elizabeth',
    'Manchester', 'Clarendon', 'St. Catherine'
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check user role in Firestore by UID (avoid list queries)
          let userRole = null;
          try {
            const userRef = doc(db, 'users', u.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              userRole = userSnap.data().role;
            }
            setRole(userRole);
          } catch (err) {
            console.error('Error checking user role by UID:', err);
            setError(err && err.message ? err.message : 'Failed to check user role.');
            setCheckingRole(false);
            return;
          }
          setCheckingRole(false);
          if (userRole !== 'client') {
          navigate('/');
          return;
        }
        // Fetch this client's requests
        try {
          const q = query(collection(db, 'maintenanceRequests'), where('clientEmail', '==', u.email));
          const snap = await getDocs(q);
          setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          console.error('Error fetching client requests:', err);
          setError(err && err.message ? err.message : 'Failed to fetch requests.');
        }
      } else {
        setCheckingRole(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'maintenanceRequests'), {
        ...form,
        clientEmail: user.email,
        submittedAt: serverTimestamp(),
        status: 'open',
      });
      setForm({ trade: '', parish: '', address: '', details: '' });
      // Refresh requests
      try {
        const q = query(collection(db, 'maintenanceRequests'), where('clientEmail', '==', user.email));
        const snap = await getDocs(q);
        setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error refreshing requests after submit:', err);
        setError(err && err.message ? err.message : 'Failed to refresh requests.');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err && err.message ? err.message : 'Failed to submit request.');
    }
    setLoading(false);
  };

  if (checkingRole) return <p style={{textAlign:'center',marginTop:'3rem'}}>Checking access...</p>;
  if (!user) return <p style={{textAlign:'center',marginTop:'3rem'}}>Please log in as a client.</p>;
  if (role !== 'client') return null;

  return (
    <div style={{maxWidth:'600px',margin:'2rem auto',background:'#f3f8f6',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.07)',padding:'2rem'}}>
      <h2 style={{color:'#007b5e',marginBottom:'1.5rem',textAlign:'center'}}>Client Dashboard</h2>
      <h3 style={{color:'#007b5e',marginBottom:'1rem'}}>Submit a New Job Request</h3>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'2rem'}}>
        <select name="trade" value={form.trade} onChange={handleChange} required style={{padding:'0.7rem',borderRadius:'6px',border:'1px solid #ccc'}}>
          <option value="">Select Trade</option>
          {trades.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select name="parish" value={form.parish} onChange={handleChange} required style={{padding:'0.7rem',borderRadius:'6px',border:'1px solid #ccc'}}>
          <option value="">Select Parish</option>
          {parishes.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required style={{padding:'0.7rem',borderRadius:'6px',border:'1px solid #ccc'}} />
        <textarea name="details" value={form.details} onChange={handleChange} placeholder="Details" required style={{padding:'0.7rem',borderRadius:'6px',border:'1px solid #ccc',minHeight:'80px'}} />
        {error && <div style={{color:'#d9534f',textAlign:'center'}}>{error}</div>}
        <button type="submit" disabled={loading} style={{background:'linear-gradient(90deg,#007b5e 60%,#00c6a7 100%)',color:'white',border:'none',borderRadius:'6px',padding:'0.8rem',fontWeight:'bold',fontSize:'1rem',cursor:'pointer'}}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
      <h3 style={{color:'#007b5e',marginBottom:'1rem'}}>Your Job Requests</h3>
      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <ul style={{listStyle:'none',padding:0}}>
          {requests.map(r => (
            <li key={r.id} style={{background:'#fff',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',marginBottom:'1rem',padding:'1rem'}}>
              <strong>{r.trade}</strong> - {r.parish}<br />
              <span>{r.address}</span><br />
              <span>{r.details}</span><br />
              <span>Status: <b style={{color:'#007b5e'}}>{r.status}</b></span><br />
              <span>Submitted: {r.submittedAt && r.submittedAt.seconds ? new Date(r.submittedAt.seconds * 1000).toLocaleString() : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ClientDashboard;
