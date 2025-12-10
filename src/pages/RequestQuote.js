import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
console.log('RequestQuote component loaded');

function RequestQuote() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parish, setParish] = useState('');
  const [serviceType, setServiceType] = useState('');

 const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Submitting job request...');
  try {
    const docRef = await addDoc(collection(db, 'jobRequests'), {
      title,
      description,
      parish,
      serviceType,
      postedAt: serverTimestamp(),
      status: 'open'
    });
    console.log('Document written with ID: ', docRef.id);
    alert('✅ Job request submitted!');
    setTitle('');
    setDescription('');
    setParish('');
    setServiceType('');
  } catch (error) {
    console.error('🔥 Firestore error:', error.message);
    alert('❌ Something went wrong: ' + error.message);
  }
};

  return (
    <div className="request-quote">
      {console.log('Rendering RequestQuote form')}
      <h2>📨 Request a Quote</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Job Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
        <input type="text" placeholder="Parish" value={parish} onChange={e => setParish(e.target.value)} required />
        <input type="text" placeholder="Service Type" value={serviceType} onChange={e => setServiceType(e.target.value)} required />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}

export default RequestQuote;