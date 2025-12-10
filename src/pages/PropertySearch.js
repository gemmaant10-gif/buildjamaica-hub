import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function PropertySearch() {
  return (
    <div className="page">
      <h2>🔍 Property Search</h2>
      <p>Search for land, homes, and investment opportunities across Jamaica.</p>

      <a
        href="https://www.realtor.com/international/jm/"
        target="_blank"
        rel="noopener noreferrer"
        className="home-button"
      >
        Visit Jamaica Property Listings
      </a>

      <Link to="/" className="home-button">← Return to Home</Link>
    </div>
  );
}

export default PropertySearch;