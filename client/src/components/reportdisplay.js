import React from 'react';
import { Link } from 'react-router-dom';

//it's the report display for "MANAGE REPORTS"

const ReportDisplay = ({ report, deleteReport }) => {
  // Helper function to display priority with appropriate styling
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'Low':
        return <span className="badge bg-success">{priority}</span>;
      case 'Medium':
        return <span className="badge bg-warning text-dark">{priority}</span>;
      case 'High':
        return <span className="badge bg-danger">{priority}</span>;
      case 'Critical':
        return <span className="badge bg-dark">{priority}</span>;
      default:
        return <span className="badge bg-secondary">{priority}</span>;
    }
  };

  // Helper function for status styling
  const getStatusBadge = (status) => {
    const statusClasses = {
      Submitted: 'bg-secondary',
      Assigned: 'bg-primary',
      'In Progress': 'bg-info',
      Resolved: 'bg-success',
    };
    return <span className={`badge ${statusClasses[status] || 'bg-secondary'}`}>{status}</span>;
  };

  return (
    <tr>
      <td>{report.title}</td>
      <td>{report.description}</td>
      <td>{report.category}</td>
      <td>{report.assignedTo?.name || 'Unassigned'}</td>
      <td>{getPriorityBadge(report.severity)}</td>
      <td>{getStatusBadge(report.status)}</td>
      <td>
        <div className="d-flex flex-column gap-1">
          <Link to={`/edit/${report._id}`} className="btn btn-sm btn-info">
            Edit
          </Link>
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this report?')) {
                deleteReport(report._id);
              }
            }}
            className="btn btn-sm btn-danger"
          >
            Delete
          </button>
          {report.status !== 'Resolved' && (
            <button className="btn btn-sm btn-success">
              Mark Resolved
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ReportDisplay;