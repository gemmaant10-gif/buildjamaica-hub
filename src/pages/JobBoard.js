import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
// QuoteForm not used on this page

function JobBoard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const querySnapshot = await getDocs(collection(db, 'jobRequests'));
      const jobList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobList);
    };

    fetchJobs();
  }, []);

  return (
    <div className="job-board">
      <h2>📋 Available Jobs</h2>
      {jobs.length === 0 ? (
        <p>No jobs available right now.</p>
      ) : (
        jobs.map(job => (
          <div key={job.id} className="job-card">
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <p><strong>Parish:</strong> {job.parish}</p>
            <p><strong>Service:</strong> {job.serviceType}</p>
            <Link to={`/submit-quote/${job.id}`}>💬 Submit Quote</Link>
          </div>
        ))
      )}
    </div>
  );
}

export default JobBoard;