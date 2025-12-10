

import { Link } from 'react-router-dom';

function ContractorProfile() {
  return (
    <div className="profile-page">
      {/* Profile layout stays the same, quote form removed */}
      <p>Contractor profile details go here.</p>
      <Link to="/contractors" className="home-button">← Back to Contractors</Link>
    </div>
  );
}

export default ContractorProfile;