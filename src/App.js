import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard'; // adjust path if needed

import Home from './pages/Home';
import PropertySearch from './pages/PropertySearch';
import Maintenance from './pages/Maintenance';
import LargeProjects from './pages/LargeProjects';
import ContractorProfile from './pages/ContractorProfile';
import ContractorDashboard from './pages/ContractorDashboard';
import ProtectedRoleRoute from './components/ProtectedRoleRoute';
import Login from './pages/Login';
import Header from './components/Header';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import JobBoard from './pages/JobBoard';
import RequestQuote from './pages/RequestQuote';
import ClientAuth from './pages/ClientAuth';
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ClientDashboard from './pages/ClientDashboard';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/property-search" element={<PropertySearch />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/large-projects" element={<LargeProjects />} />
        <Route path="/contractor/:contractorId" element={<ContractorProfile />} />
  <Route path="/dashboard/:contractorId" element={<ProtectedRoleRoute role="contractor"><ContractorDashboard /></ProtectedRoleRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/jobs" element={<JobBoard />} />
        <Route path="/request-quote" element={<RequestQuote />} /> 
  {/* <Route path="/submit-quote/:jobId" element={<SubmitQuote />} /> */}
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
  <Route path="/terms-of-service" element={<TermsOfService />} />
  <Route path="/client-auth" element={<ClientAuth />} />
  <Route path="/client-dashboard" element={<ClientDashboard />} />
     </Routes>
    </Router>
  );
}

export default App;