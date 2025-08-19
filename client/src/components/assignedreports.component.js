import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/auth-context';
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://fault-reporting-system.onrender.com'
  : 'http://localhost:5000';

export default function AssignedReports() {
  const [reports, setReports] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAssignedReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/api/reports/assigned/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching assigned reports:', error);
      }
    };

    if (user?.id) {
      fetchAssignedReports();
    }
  }, [user]);

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/reports/${reportId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReports(prev =>
        prev.map(report =>
          report._id === reportId ? { ...report, status: response.data.status } : report
        )
      );
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  return (
    <div className="assigned-reports container mt-3">
      <h3 className="mb-4">Your Assigned Reports</h3>
      

      {reports.length > 0 ? (
        <table className="table table-striped table-hover shadow-sm rounded">
  <thead className="table-dark">
    <tr className='table-header'>
      <th>Title</th>
      <th>Description</th>
      <th>Location</th>
      <th>Severity</th>
      <th>Status</th>
      <th>Image</th>
      <th style={{ minWidth: '160px' }}>Actions</th>
    </tr>
  </thead>
        <tbody style={{padding: '14px 20px'}}>
          {reports.map(report => (
            <tr key={report._id}>
              <td>{report.title}</td>
              <td>{report.description}</td>
              <td>{report.location}</td>
              <td>{report.severity}</td>
              <td>{report.status}</td>
              <td>
                {report.image ? (
                  <img
                    src={`${API_URL}/${report.image}`}
                    alt="report"
                    style={{ maxHeight: '60px', maxWidth: '60px' }}
                  />
                ) : (
                  'No image.'
                )}
              </td>
              <td style={{minWidth: '235px'}}>
                <button
                  className={`btn btn-sm me-2 ${
                    report.status === 'In Progress' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => handleStatusUpdate(report._id, 'In Progress')}
                >
                  In Progress
                </button>
                <button
                  className={`btn btn-sm ${
                    report.status === 'Resolved' ? 'btn-success' : 'btn-outline-success'
                  }`}
                  onClick={() => handleStatusUpdate(report._id, 'Resolved')}
                >
                  Resolved
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      ) : (
        <div className="alert alert-info">No reports assigned to you currently.</div>
      )}
    </div>
  );
}
