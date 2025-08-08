import React from 'react';
import { Link } from 'react-router-dom';

//it's the ticket display for "MANAGE REPORTS"

const TicketDisplay = ({ ticket, deleteTicket }) => {
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
      Closed: 'bg-dark'
    };
    return <span className={`badge ${statusClasses[status] || 'bg-secondary'}`}>{status}</span>;
  };

  return (
    <tr>
      <td>{ticket.title}</td>
      <td>{ticket.description}</td>
      <td>{ticket.category}</td>
      <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
      <td>{getPriorityBadge(ticket.severity)}</td>
      <td>{getStatusBadge(ticket.status)}</td>
      <td>
        <div className="d-flex flex-column gap-1">
          <Link to={`/edit/${ticket._id}`} className="btn btn-sm btn-info">
            Edit
          </Link>
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this ticket?')) {
                deleteTicket(ticket._id);
              }
            }}
            className="btn btn-sm btn-danger"
          >
            Delete
          </button>
          {ticket.status !== 'Resolved' && (
            <button className="btn btn-sm btn-success">
              Mark Resolved
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TicketDisplay;