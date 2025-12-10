import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import '../App.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Add this at the top


function ContractorDashboard() {
  const [requests, setRequests] = useState([]);
  const [contractorName, setContractorName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
      } else {
        // Verify user's role is 'contractor' in users collection
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          const userRole = userSnap.exists() ? userSnap.data().role : null;
          if (userRole !== 'contractor') {
            // Not authorized to view contractor dashboard
            console.warn('User role is not contractor:', userRole);
            navigate('/');
            return;
          }
        } catch (err) {
          console.error('Error checking user role for contractor:', err);
          navigate('/');
          return;
        }

        // Fetch contractor profile to get contractorName
        try {
          // Fetch contractor profile by UID to avoid list queries
          const contractorRef = doc(db, 'contractors', user.uid);
          const contractorSnap = await getDoc(contractorRef);
          let name = '';
          if (contractorSnap.exists()) {
            name = contractorSnap.data().contractorName;
            setContractorName(name);
          }
          // Now fetch job quotes for this contractor
          const q = query(
            collection(db, 'jobQuotes'),
            where('contractorName', '==', name)
          );
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRequests(data);
        } catch (error) {
          console.error('Error fetching contractor dashboard data:', error);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="dashboard-page" style={{maxWidth:'700px',margin:'2rem auto',background:'#f3f8f6',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.07)',padding:'2rem'}}>
      <h2 style={{color:'#007b5e',marginBottom:'1.5rem',textAlign:'center'}}>Welcome{contractorName ? `, ${contractorName}` : ''}!</h2>

      {requests.length === 0 ? (
        <div style={{textAlign:'center',padding:'2.5rem 0'}}>
          <div style={{fontSize:'3.5rem',marginBottom:'1rem'}}>📭</div>
          <h3 style={{color:'#007b5e',marginBottom:'0.7rem'}}>No job requests yet</h3>
          <p style={{fontSize:'1.08rem',color:'#555',marginBottom:'1.2rem'}}>You haven't received any job quotes yet. When a client requests a quote, it will appear here.</p>
          <Link to="/" style={{background:'linear-gradient(90deg,#007b5e 60%,#00c6a7 100%)',color:'white',border:'none',borderRadius:'6px',padding:'0.7rem 1.4rem',fontWeight:'bold',fontSize:'1.08rem',textDecoration:'none',boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}>Return to Home</Link>
        </div>
      ) : (
        <ul className="request-list">
          {requests.map((req) => (
            <li key={req.id} className="request-card" style={{background:'#fff',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',marginBottom:'1rem',padding:'1rem'}}>
              <p><strong>Name:</strong> {req.name}</p>
              <p><strong>Email:</strong> {req.email}</p>
              <p><strong>Service:</strong> {req.service}</p>
              <p><strong>Details:</strong> {req.details}</p>
              <p><strong>Submitted:</strong> {req.timestamp?.seconds ? new Date(req.timestamp.seconds * 1000).toLocaleString() : 'N/A'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ContractorDashboard;