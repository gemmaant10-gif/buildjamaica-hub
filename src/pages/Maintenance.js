import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import '../App.css';

const trades = [
  'Plumbing',
  'Electrical',
  'Landscaping',
  'Painting',
  'Carpentry',
  'Roofing',
  'Masonry',
  'Other'
];

const titles = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof'];
const parishes = [
  'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 'St. Mary', 'St. Ann',
  'Trelawny', 'St. James', 'Hanover', 'Westmoreland', 'St. Elizabeth',
  'Manchester', 'Clarendon', 'St. Catherine'
];

function Maintenance() {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [form, setForm] = useState({
    title: '',
    firstName: '',
    lastName: '',
    address: '',
    parish: '',
    town: '',
    phone: '',
    otherInfo: ''
  });

  const handleTradeChange = (e) => {
    setSelectedTrade(e.target.value);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        trade: selectedTrade === 'Other' ? form.otherTrade || 'Other' : selectedTrade,
        ...form,
        submittedAt: serverTimestamp(),
        status: 'open'
      };
      await addDoc(collection(db, 'maintenanceRequests'), data);
      alert('✅ Maintenance request submitted!');
      setForm({
        title: '',
        firstName: '',
        lastName: '',
        address: '',
        parish: '',
        town: '',
        phone: '',
        otherInfo: '',
        otherTrade: ''
      });
      setSelectedTrade('');
    } catch (error) {
      console.error('🔥 Firestore error:', error.message);
      alert('❌ Something went wrong: ' + error.message);
    }
  };

  return (
    <div className="page center-title-parent">
      <h2 className="center-title">🛠️ Maintenance & Repairs 🛠️</h2>

      {!selectedTrade && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Select a trade to request service:</label>
          <select
            value={selectedTrade}
            onChange={handleTradeChange}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #007b5e',
              fontSize: '1.1rem',
              minWidth: '220px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,123,94,0.08)'
            }}
          >
            <option value="">-- Select Trade --</option>
            {trades.map(trade => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>
        </div>
      )}

      {selectedTrade && (
        <form className="maintenance-form" onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#007b5e', marginBottom: '1rem', textAlign: 'center' }}>
            {selectedTrade}
          </div>
          {selectedTrade === 'Other' && (
            <label>
              Please specify:
              <input
                type="text"
                name="otherTrade"
                value={form.otherTrade || ''}
                onChange={handleChange}
                required
              />
            </label>
          )}
          <div className="form-row">
            <label>Title:
              <select name="title" value={form.title} onChange={handleChange} required>
                <option value="">-- Select Title --</option>
                {titles.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>First Name:
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
            </label>
            <label>Last Name:
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
            </label>
          </div>
          <br />
          <label>Address:
            <input type="text" name="address" value={form.address} onChange={handleChange} required />
          </label>
          <br />
          <label>Parish:
            <select name="parish" value={form.parish} onChange={handleChange} required>
              <option value="">-- Select Parish --</option>
              {parishes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <br />
          <div className="form-row">
  <label>Town:
    <input type="text" name="town" value={form.town} onChange={handleChange} required />
  </label>
  <label>Phone Number:
    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
  </label>
</div>
          <br />
          <label>Other Information:
            <textarea name="otherInfo" value={form.otherInfo} onChange={handleChange} />
          </label>
          <br />
          <button type="submit">Submit Request</button>
        </form>
      )}

      <Link to="/" className="home-button">← Return to Home</Link>
    </div>
  );
}

export default Maintenance;