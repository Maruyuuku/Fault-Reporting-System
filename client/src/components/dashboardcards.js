import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles.css'; 

const DashboardCards = ({ role }) => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/reports/dashboard-summary', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then(res => {
      setSummary(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError('Failed to load dashboard summary.');
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-cards">
        {/*if role isnt technician{general,admin}, show submitted card (and if its not {technician}, dont display nunth)*/}
        {role !== 'technician' && (
          <div className="dashboard-card">
            <h5 className="card-label">Submitted</h5>
            <p className="card-number">{summary.submitted || 0}</p>
          </div>
        )}

        {/* Common cards (visible to both roles if needed) */}
        <div className="dashboard-card">
          <h5 className="card-label">Assigned</h5>
          <p className="card-number">{summary.assigned || 0}</p>
        </div>

        <div className="dashboard-card">
          <h5 className="card-label">In Progress</h5>
          <p className="card-number">{summary.inProgress || 0}</p>
        </div>

        <div className="dashboard-card">
          <h5 className="card-label">Resolved</h5>
          <p className="card-number">{summary.resolved || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
