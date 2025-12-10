import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { collection, getDocs, query, orderBy, updateDoc } from 'firebase/firestore';


const trades = [
  'Plumbing', 'Electrical', 'Landscaping', 'Painting', 'Carpentry', 'Roofing', 'Masonry', 'Other'
];
const parishes = [
  'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 'St. Mary', 'St. Ann',
  'Trelawny', 'St. James', 'Hanover', 'Westmoreland', 'St. Elizabeth',
  'Manchester', 'Clarendon', 'St. Catherine'
];

function Dashboard() {
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  // User management state
  const [users, setUsers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('contractor');
  const [userLoading, setUserLoading] = useState(false);
  // Update status handler
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingStatusId(id);
    try {
      const reqRef = doc(db, 'maintenanceRequests', id);
      await updateDoc(reqRef, { status: newStatus });
      setMaintenanceRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      alert('Failed to update status.');
      console.error(error);
    }
    setUpdatingStatusId(null);
  };
  // contractor state not used in this admin view
  // const [contractor, setContractor] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  // editing state was unused - removed to satisfy linter
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [filterParish, setFilterParish] = useState('');
  const [filterTrade, setFilterTrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchName, setSearchName] = useState('');
  const [contactRequests, setContactRequests] = useState([]);

  // Modal state
  const [modalRequest, setModalRequest] = useState(null);
  const [modalContact, setModalContact] = useState(null);
  const modalRef = useRef();

  // Close modal on outside click
  useEffect(() => {
    function handleClick(e) {
      if (modalRequest && modalRef.current && !modalRef.current.contains(e.target)) {
        setModalRequest(null);
      }
      if (modalContact && modalRef.current && !modalRef.current.contains(e.target)) {
        setModalContact(null);
      }
    }
    if (modalRequest || modalContact) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [modalRequest, modalContact]);

  // CSV Export handler
  const exportToCSV = () => {
    // Apply all filters to maintenanceRequests
    const filtered = maintenanceRequests
      .filter(req => !filterParish || req.parish === filterParish)
      .filter(req => !filterTrade || req.trade === filterTrade)
      .filter(req => !filterStatus || (req.status || 'open').toLowerCase() === filterStatus)
      .filter(req => {
        const name = (req.firstName + ' ' + req.lastName).toLowerCase();
        return !searchName || name.includes(searchName.toLowerCase());
      });
    if (filtered.length === 0) {
      alert('No requests to export.');
      return;
    }
    // Map to CSV fields
    const data = filtered.map(req => ({
      Name: req.firstName + ' ' + req.lastName,
      Trade: req.trade,
      Parish: req.parish,
      Address: req.address,
      Town: req.town,
      Phone: req.phone,
      Status: req.status || 'open',
      SubmittedAt: req.submittedAt && req.submittedAt.seconds ? new Date(req.submittedAt.seconds * 1000).toLocaleString() : '',
      OtherInfo: req.otherInfo || ''
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'maintenance_requests.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin (by email)
        if (user.email === 'islandlivingenterprises@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch users for admin
  useEffect(() => {
    async function fetchUsers() {
      if (!isAdmin) return;
      setUserLoading(true);
      try {
        // Get all users from 'users' collection (admins + contractors)
        const userSnap = await getDocs(collection(db, 'users'));
        setUsers(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setUsers([]);
      }
      setUserLoading(false);
    }
    fetchUsers();
  }, [isAdmin]);

  // Invite user handler
  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return alert('Enter an email.');
    setUserLoading(true);
    try {
      // Add user doc with role, email
      await setDoc(doc(db, 'users', inviteEmail), {
        email: inviteEmail,
        role: inviteRole,
        invitedAt: new Date().toISOString(),
      });
      setInviteEmail('');
      setInviteRole('contractor');
      // Refresh user list
      const userSnap = await getDocs(collection(db, 'users'));
      setUsers(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      alert('User invited!');
    } catch (err) {
      alert('Failed to invite user.');
    }
    setUserLoading(false);
  };

  // Remove user handler
  const handleRemoveUser = async (id) => {
    if (!window.confirm('Remove this user?')) return;
    setUserLoading(true);
    try {
      await setDoc(doc(db, 'users', id), {}, { merge: false }); // Overwrite with empty
      // Refresh user list
      const userSnap = await getDocs(collection(db, 'users'));
      setUsers(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      alert('User removed.');
    } catch (err) {
      alert('Failed to remove user.');
    }
    setUserLoading(false);
  };

  // Change user role handler
  const handleChangeUserRole = async (id, newRole) => {
    if (!window.confirm(`Change role for ${id} to ${newRole}?`)) return;
    setUserLoading(true);
    try {
      // Merge the new role into the user document
      await setDoc(doc(db, 'users', id), { role: newRole }, { merge: true });
      // Optimistically update UI
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      alert('Role updated.');
    } catch (err) {
      console.error('Failed to change role', err);
      alert('Failed to change role. Check console for details.');
    }
    setUserLoading(false);
  };

  useEffect(() => {
    async function fetchRequests() {
      // Fetch maintenance requests
      const maintSnap = await getDocs(query(collection(db, 'maintenanceRequests'), orderBy('submittedAt', 'desc')));
      setMaintenanceRequests(maintSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Fetch contact requests
      const contactSnap = await getDocs(query(collection(db, 'contactRequests'), orderBy('submittedAt', 'desc')));
      setContactRequests(contactSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchRequests();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  // handleUpdate removed (unused)
  return (
    <div className="dashboard">
      {/* Show simple greeting for admin, contractor card for others */}
      {isAdmin ? (
        <>
          <h2 style={{textAlign:'center',margin:'2rem 0 1.5rem 0',color:'#007b5e'}}>Welcome Admin</h2>
          {/* User Management Section */}
          <div style={{background:'#f3f8f6',borderRadius:'10px',padding:'1.5rem',marginBottom:'2rem',boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
            <h3 style={{marginBottom:'1rem',color:'#007b5e'}}>User Management</h3>
            <form onSubmit={handleInviteUser} style={{display:'flex',gap:'1rem',marginBottom:'1.2rem',alignItems:'center'}}>
              <input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="User email" required style={{padding:'0.5rem',borderRadius:'5px',border:'1px solid #ccc',flex:'1 1 180px'}} />
              <select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} style={{padding:'0.5rem',borderRadius:'5px',border:'1px solid #ccc'}}>
                <option value="admin">Admin</option>
                <option value="contractor">Contractor</option>
              </select>
              <button type="submit" style={{background:'linear-gradient(90deg,#007b5e 60%,#00c6a7 100%)',color:'white',border:'none',borderRadius:'6px',padding:'0.6rem 1.2rem',fontWeight:'bold',fontSize:'1rem',cursor:'pointer'}}>Invite</button>
            </form>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                <thead>
                  <tr style={{background:'#e7f6f2'}}>
                    <th style={{padding:'0.7rem',textAlign:'left'}}>Email</th>
                    <th style={{padding:'0.7rem',textAlign:'left'}}>Role</th>
                    <th style={{padding:'0.7rem',textAlign:'left'}}>Invited</th>
                    <th style={{padding:'0.7rem',textAlign:'left'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userLoading ? (
                    <tr><td colSpan={4} style={{padding:'1rem',textAlign:'center'}}>Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={4} style={{padding:'1rem',textAlign:'center'}}>No users found.</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id}>
                        <td style={{padding:'0.7rem'}}>{u.email}</td>
                        <td style={{padding:'0.7rem'}}>
                          <select
                            value={u.role || ''}
                            onChange={e => handleChangeUserRole(u.id, e.target.value)}
                            style={{padding:'0.35rem',borderRadius:'5px',border:'1px solid #ccc'}}
                            disabled={userLoading}
                          >
                            <option value="">(none)</option>
                            <option value="admin">Admin</option>
                            <option value="contractor">Contractor</option>
                            <option value="client">Client</option>
                          </select>
                        </td>
                        <td style={{padding:'0.7rem'}}>{u.invitedAt ? new Date(u.invitedAt).toLocaleString() : ''}</td>
                        <td style={{padding:'0.7rem'}}>
                          <button onClick={()=>handleRemoveUser(u.id)} style={{background:'#fff',border:'1px solid #d9534f',color:'#d9534f',borderRadius:'5px',padding:'0.3rem 0.9rem',fontWeight:'bold',cursor:'pointer'}}>Remove</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
      <hr style={{margin: '2rem 0'}} />
      <h3 style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}}>
        <span>Maintenance Requests</span>
        <button
          onClick={exportToCSV}
          style={{
            background: 'linear-gradient(90deg,#007b5e 60%,#00c6a7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.6rem 1.2rem',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            transition: 'background 0.2s',
            marginLeft: 'auto'
          }}
        >
          ⬇️ Export to CSV
        </button>
      </h3>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center',
        marginBottom: '1.2rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
      }}>
        <select value={filterParish} onChange={e => setFilterParish(e.target.value)} style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}>
          <option value="">All Parishes</option>
          {parishes.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterTrade} onChange={e => setFilterTrade(e.target.value)} style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}>
          <option value="">All Trades</option>
          {trades.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc', flex: '1 1 180px' }}
        />
      </div>
      <ul className="dashboard-list">
        {maintenanceRequests.length === 0 && <li>No maintenance requests yet.</li>}
        {maintenanceRequests
          .filter(req => !filterParish || req.parish === filterParish)
          .filter(req => !filterTrade || req.trade === filterTrade)
          .filter(req => !filterStatus || (req.status || 'open').toLowerCase() === filterStatus)
          .filter(req => {
            const name = (req.firstName + ' ' + req.lastName).toLowerCase();
            return !searchName || name.includes(searchName.toLowerCase());
          })
          .map(req => (
            <li key={req.id} className="dashboard-card">
              <strong>{req.trade}</strong> <br />
              {req.title} {req.firstName} {req.lastName}<br />
              <em>{req.address}, {req.town}, {req.parish}</em><br />
              <span>Phone: {req.phone}</span><br />
              {req.details && <span>Description: {req.details}</span>}<br />
              {req.otherInfo && <span>Other Info: {req.otherInfo}</span>}
              <div style={{marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
                <span style={{fontWeight: 'bold', color: '#007b5e'}}>Status:</span>
                <select
                  value={req.status || 'open'}
                  onChange={e => handleStatusChange(req.id, e.target.value)}
                  style={{
                    padding: '0.4rem', borderRadius: '5px', border: '1px solid #ccc', fontWeight: 'bold', color: '#007b5e', minWidth: '120px', background: updatingStatusId === req.id ? '#e0f7ef' : 'white'
                  }}
                  disabled={updatingStatusId === req.id}
                >
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {updatingStatusId === req.id && <span style={{color:'#007b5e', fontSize:'0.95rem'}}>Updating...</span>}
                <button
                  style={{
                    marginLeft: 'auto',
                    background: '#fff',
                    border: '1px solid #007b5e',
                    color: '#007b5e',
                    borderRadius: '5px',
                    padding: '0.3rem 0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => setModalRequest(req)}
                >
                  View Details
                </button>
              </div>
            </li>
          ))}
      </ul>

      {/* Request Detail Modal */}
      {modalRequest && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div ref={modalRef} style={{
            background: '#fff', borderRadius: '12px', boxShadow: '0 6px 32px rgba(0,0,0,0.18)',
            padding: '2.2rem 2.5rem', minWidth: '340px', maxWidth: '95vw', position: 'relative',
            fontSize: '1.08rem', width: '100%', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button
              onClick={() => setModalRequest(null)}
              style={{
                position: 'absolute', top: 18, right: 24, background: 'none', border: 'none', fontSize: '2.2rem', color: '#696767', cursor: 'pointer',
              }}
              aria-label="Close"
            >×</button>
            <h2 style={{color:'#007b5e',marginBottom:'1.2rem'}}>Request Details</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.7rem 1.5rem',marginBottom:'1.2rem'}}>
              <div><strong>Name:</strong> {modalRequest.title} {modalRequest.firstName} {modalRequest.lastName}</div>
              <div><strong>Trade:</strong> {modalRequest.trade}</div>
              <div><strong>Parish:</strong> {modalRequest.parish}</div>
              <div><strong>Town:</strong> {modalRequest.town}</div>
              <div><strong>Address:</strong> {modalRequest.address}</div>
              <div><strong>Phone:</strong> {modalRequest.phone}</div>
              <div><strong>Status:</strong> {modalRequest.status || 'open'}</div>
              <div><strong>Submitted:</strong> {modalRequest.submittedAt && modalRequest.submittedAt.seconds ? new Date(modalRequest.submittedAt.seconds * 1000).toLocaleString() : ''}</div>
              {modalRequest.details && <div style={{gridColumn:'1/3'}}><strong>Description:</strong> {modalRequest.details}</div>}
              {modalRequest.otherInfo && <div style={{gridColumn:'1/3'}}><strong>Other Info:</strong> {modalRequest.otherInfo}</div>}
            </div>
            <div style={{textAlign:'right'}}>
              <button
                onClick={() => setModalRequest(null)}
                style={{
                  background: 'linear-gradient(90deg,#007b5e 60%,#00c6a7 100%)',
                  color: 'white', border: 'none', borderRadius: '6px', padding: '0.6rem 1.2rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                }}
              >Close</button>
            </div>
          </div>
        </div>
      )}
      <h3>Contact Requests</h3>
      <ul className="dashboard-list">
        {contactRequests.length === 0 && <li>No contact requests yet.</li>}
        {contactRequests.map(req => (
          <li key={req.id} className="dashboard-card">
            <strong>{req.name}</strong> ({req.email})<br />
            <em>{req.subject}</em><br />
            {req.message}
            <div style={{marginTop:'0.7rem',textAlign:'right'}}>
              <button
                style={{
                  background: '#fff',
                  border: '1px solid #007b5e',
                  color: '#007b5e',
                  borderRadius: '5px',
                  padding: '0.3rem 0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'background 0.2s',
                }}
                onClick={() => setModalContact(req)}
              >
                View Details
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Contact Request Detail Modal */}
      {modalContact && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div ref={modalRef} style={{
            background: '#fff', borderRadius: '12px', boxShadow: '0 6px 32px rgba(0,0,0,0.18)',
            padding: '2.2rem 2.5rem', minWidth: '340px', maxWidth: '95vw', position: 'relative',
            fontSize: '1.08rem', width: '100%', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button
              onClick={() => setModalContact(null)}
              style={{
                position: 'absolute', top: 18, right: 24, background: 'none', border: 'none', fontSize: '2.2rem', color: '#696767', cursor: 'pointer',
              }}
              aria-label="Close"
            >×</button>
            <h2 style={{color:'#007b5e',marginBottom:'1.2rem'}}>Contact Request Details</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.7rem 1.5rem',marginBottom:'1.2rem'}}>
              <div><strong>Name:</strong> {modalContact.name}</div>
              <div><strong>Email:</strong> {modalContact.email}</div>
              <div style={{gridColumn:'1/3'}}><strong>Subject:</strong> {modalContact.subject}</div>
              <div style={{gridColumn:'1/3'}}><strong>Message:</strong> {modalContact.message}</div>
              {modalContact.submittedAt && modalContact.submittedAt.seconds && (
                <div style={{gridColumn:'1/3'}}><strong>Submitted:</strong> {new Date(modalContact.submittedAt.seconds * 1000).toLocaleString()}</div>
              )}
            </div>
            <div style={{textAlign:'right'}}>
              <button
                onClick={() => setModalContact(null)}
                style={{
                  background: 'linear-gradient(90deg,#007b5e 60%,#00c6a7 100%)',
                  color: 'white', border: 'none', borderRadius: '6px', padding: '0.6rem 1.2rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                }}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;