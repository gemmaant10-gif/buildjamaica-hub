import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  return (
    <div className="App">
      <header className="hero">
        <h1>🏠 Welcome to BuildJamaica Hub</h1>
        <p>
          Empowering locals and returning residents with trusted property, project management, building, and maintenance services across Jamaica.
        </p>
      </header>

      <section className="features">

        <a
          href="https://www.realtor.com/international/jm/"
          target="_blank"
          rel="noopener noreferrer"
          className="feature-card link-card"
        >
          <h2 style={{ textAlign: 'center' }}>
  <span style={{ display: 'block', fontSize: '2rem' }}>🔍</span>
  Property Search
</h2>
          <p>Find land, homes, and investment opportunities by parish, price, and amenities.</p>
        </a>


        <Link to="/maintenance" className="feature-card link-card">
          <h2 style={{ textAlign: 'center' }}>
            🛠️ <span style={{ display: 'block', textAlign: 'center' }}>Maintenance</span>
            <span style={{ display: 'block', textAlign: 'center' }}>&amp;</span>
            <span style={{ display: 'block', textAlign: 'center' }}>Repairs</span>
          </h2>
          <p>Request quotes for plumbing, electrical, landscaping, and more.</p>
        </Link>

        <Link to="/large-projects" className="feature-card link-card">
          <h2 style={{ textAlign: 'center' }}>
            🧱 <span style={{ display: 'block', textAlign: 'center' }}>Build from the ground up or add on</span>
          </h2>
          <p>Request quotes for new builds, renovations, and extensions.</p>
        </Link>
      </section>

      <footer className="footer">
        <div style={{ marginBottom: '1rem' }}>
          <strong>Contact us:</strong><br />
          <a href="mailto:info@build-jamaica.com" style={{ color: '#007b5e', textDecoration: 'none' }}>info@build-jamaica.com</a><br />
          <span>Phone: <a href="tel:+18763948595" style={{ color: '#007b5e', textDecoration: 'none' }}>+1 (876) 394-8595</a></span>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <a
            href="https://wa.me/18763948595"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#25D366',
              color: 'white',
              borderRadius: '5px',
              padding: '0.5rem 1.2rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              fontSize: '1.05rem',
              marginBottom: '0.5rem',
            }}
          >
            💬 WhatsApp Us
          </a>
        </div>
        <div style={{ marginBottom: '0.7rem' }}>
          <Link to="/privacy-policy" style={{ color: '#007b5e', marginRight: '1.2rem' }}>Privacy Policy</Link>
          <Link to="/terms-of-service" style={{ color: '#007b5e' }}>Terms of Service</Link>
        </div>
        <div style={{ fontSize: '0.98rem', color: '#555', marginBottom: '0.2rem' }}>
          <strong>Build Jamaica Limited</strong>
        </div>
        <div style={{ fontSize: '0.98rem', color: '#555' }}>
          &copy; {new Date().getFullYear()} Build Jamaica Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;