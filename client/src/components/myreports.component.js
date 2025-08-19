import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/reports/mine', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setReports(res.data);
      setLoading(false);
      setError('');
    })
    .catch(() => {
      setError('Failed to load your reports.');
      setLoading(false);
    });
  };

const handleEdit = (report) => {
  if (report.status === 'Assigned' || report.status === 'Resolved' || report.status === 'In Progress') {
    alert('Report cannot be edited after being assigned.');
    return;
  }
  navigate(`/edit/${report._id}`);
};

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    const token = localStorage.getItem('token');
    console.log('Deleting report with token:', token); 
    axios.delete(`http://localhost:5000/api/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      fetchMyReports(); // Refresh list after delete
    })
    .catch(() => {
      alert('Failed to delete report');
    });
  };

  if (loading) return <p>Loading your reports...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (reports.length === 0) return <p>You have no reports submitted.</p>;

  return (
    <div className="container mt-3">
      <h2>My Reports</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th style={{backgroundColor:"black", color:"white"}}>Report ID</th>
            <th style={{backgroundColor:"black", color:"white"}}>Title</th>
            <th style={{backgroundColor:"black", color:"white"}}>Status</th>
            <th style={{backgroundColor:"black", color:"white"}}>Assigned Technician</th>
            <th style={{backgroundColor:"black", color:"white"}}>Image</th> 
            <th style={{backgroundColor:"black", color:"white"}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report._id}>
              <td>{report._id}</td>
              <td>{report.title || report.description || 'No title'}</td>
              <td>{report.status}</td>
              <td>
                {report.assignedTo?.name
                  ? `${report.assignedTo.name} (${report.assignedTo.email})`
                  : <span className="text-muted">Not yet assigned</span>}
              </td>
              <td>
                {report.image ? (
                  <img
                    src={`http://localhost:5000/${report.image}`}
                    alt="Report"
                    style={{maxHeight:'60px', maxWidth:'60px'}}
                  >
                  
                  </img>
                ) : (
                  'No image.'
                )}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => handleEdit(report)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(report._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyReport;
