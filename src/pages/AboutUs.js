import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function AboutUs() {
  return (
    <div className="aboutUs-page">
      <h2 className="center-title">About Us</h2>
      <div className="aboutUs-content">
        <p>
          Build Jamaica is your trusted main contractor and project manager.<br />
          With years of property development and project management experience in England, we now bring that expertise to Jamaica.<br />
          From small repairs to large builds, you deal only with us—we handle vetted tradespeople, oversee the work, and guarantee it’s done right, on time, every time.
        </p>
        <h3 className="aboutUs-subtitle">Our promise to you:</h3>
        <ul className="aboutUs-list">
          <li><strong>Accountability</strong> – We take full responsibility for the quality of work and delivery times.</li>
          <li><strong>One contact, one solution</strong> – You deal with us directly; we manage the tradespeople.</li>
          <li><strong>Quality control</strong> – Every contractor we send is vetted and monitored.</li>
          <li><strong>Efficiency</strong> – Jobs are completed quickly, smoothly, and reliably.</li>
        </ul>
      </div>
      <Link to="/" className="home-button">← Return to Home</Link>
    </div>
  );
}

export default AboutUs;
