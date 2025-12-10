import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import ContactForm from '../components/ContactForm';

function LargeProjects() {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="large-projects-page">
      <h2 className="center-title">Large Scale Projects & Extensions</h2>
      <div className="large-projects-content">
        <p>
          Planning a major build, extension, or renovation? We specialize in managing large-scale projects from start to finish, ensuring quality, compliance, and peace of mind.
        </p>
        <ul className="large-projects-list">
          <li>Residential and commercial extensions</li>
          <li>Multi-room renovations</li>
          <li>New builds and structural additions</li>
          <li>Project management and compliance</li>
          <li>Custom solutions for unique requirements</li>
        </ul>
        <p>
          Contact us for a detailed quote or to discuss your project needs. Our experienced team will guide you every step of the way.
        </p>
      </div>
      <Link to="/" className="home-button">← Return to Home</Link>
      <button className="contact-button" onClick={() => setShowContact(true)}>Contact Us</button>
      {showContact && <ContactForm onClose={() => setShowContact(false)} />}
    </div>
  );
}

export default LargeProjects;