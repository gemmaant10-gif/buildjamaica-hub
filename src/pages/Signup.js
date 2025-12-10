import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // adjust if needed

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [parish, setParish] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'contractors', user.uid), {
        contractorName,
        companyName,
        serviceType,
        parish,
        email,
        createdAt: new Date()
      });

      navigate('/dashboard');
    } catch (error) {
      alert('Signup failed. Try again.');
      console.error(error);
    }
  };

  return (
    <div className="signup-page">
      <h2>🆕 Create Contractor Account</h2>
      <form onSubmit={handleSignup} className="signup-form">
        <input type="text" placeholder="Contractor Name" value={contractorName} onChange={e => setContractorName(e.target.value)} required />
        <input type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
        <input type="text" placeholder="Service Type (e.g. Electrician)" value={serviceType} onChange={e => setServiceType(e.target.value)} required />
        <input type="text" placeholder="Parish" value={parish} onChange={e => setParish(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default Signup;