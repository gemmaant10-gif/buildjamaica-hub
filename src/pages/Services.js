import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Services() {
  return (
    <div className="services-page">
      <h2 className="center-title">Our Services</h2>
      <div className="services-content">
        <p>
          Build Jamaica offers a wide range of property services to meet your needs. Our vetted professionals deliver quality, reliability, and peace of mind for every job.
        </p>
        <h3 className="services-subtitle">Our Key Services Include:</h3>
        <ul>
          <li><strong>Residential Construction</strong> – From new builds to renovations, we handle all aspects of residential construction.</li>
          <li><strong>Commercial Projects</strong> – We have experience managing commercial builds, ensuring they are completed on time and within budget.</li>
          <li><strong>Project Management</strong> – Our team oversees every detail of your project, coordinating between tradespeople and ensuring quality control.</li>
          <li><strong>Consultation Services</strong> – Not sure where to start? We offer consultation services to help you plan your project effectively.</li>
        </ul>
        <h4 className="services-list">Service List:</h4>
        <ul>
          <li><strong>Plumbing</strong> – Repairs, installations, and emergency services.</li>
          <li><strong>Electrical</strong> – Safe wiring, lighting, and troubleshooting.</li>
          <li><strong>Landscaping</strong> – Garden design, maintenance, and beautification.</li>
          <li><strong>Painting</strong> – Interior and exterior painting for a fresh look.</li>
          <li><strong>Carpentry</strong> – Custom woodwork, repairs, and installations.</li>
          <li><strong>Roofing</strong> – Leak repairs, new roofs, and inspections.</li>
          <li><strong>Masonry</strong> – Blockwork, tiling, and concrete repairs.</li>
          <li><strong>General Maintenance</strong> – Ongoing property care and repairs.</li>
        </ul>
      </div>
      <Link to="/" className="home-button">← Return to Home</Link>
    </div>
  );
}

export default Services;
