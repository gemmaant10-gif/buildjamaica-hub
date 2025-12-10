import React, { useState } from 'react';
import '../App.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

function ContactForm({ onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'contactRequests'), {
        name,
        email,
        subject,
        message,
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      alert('❌ Something went wrong: ' + error.message);
    }
  };

  if (submitted) {
    return <div className="contact-form-success">Thank you for contacting us! We'll get back to you soon.</div>;
  }

  return (
    <div className="contact-form-modal">
      <form className="contact-form" onSubmit={handleSubmit}>
        <button className="contact-form-close" onClick={onClose} aria-label="Close" type="button">×</button>
        <h2>Contact Us</h2>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="telephone"
          placeholder="Phone Number"
          value={number}
          onChange={e => setNumber(e.target.value)}
            required
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
        <textarea
          placeholder="Message (please describe your project or inquiry in detail)"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          style={{ minHeight: '180px' }}
        />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default ContactForm;
