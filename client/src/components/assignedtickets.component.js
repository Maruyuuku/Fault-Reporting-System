import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/auth-context';

export default function AssignedTickets() {
  const [tickets, setTickets] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/reports/assigned/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching assigned tickets:', error);
      }
    };

    if (user?.id) {
      fetchAssignedTickets();
    }
  }, [user]);

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/reports/${ticketId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTickets(prev =>
        prev.map(ticket =>
          ticket._id === ticketId ? { ...ticket, status: response.data.status } : ticket
        )
      );
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  return (
    <div className="assigned-tickets container mt-3">
      <h3 className="mb-4">Your Assigned Tickets</h3>

      {tickets.length > 0 ? (
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
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket._id}>
              <td>{ticket.title}</td>
              <td>{ticket.description}</td>
              <td>{ticket.location}</td>
              <td>{ticket.severity}</td>
              <td>{ticket.status}</td>
              <td>
                {ticket.image ? (
                  <img
                    src={`http://localhost:5000/${ticket.image}`}
                    alt="ticket"
                    style={{ maxHeight: '60px', maxWidth: '60px' }}
                  />
                ) : (
                  'No image.'
                )}
              </td>
              <td>
                <button
                  className={`btn btn-sm me-2 ${
                    ticket.status === 'In Progress' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => handleStatusUpdate(ticket._id, 'In Progress')}
                >
                  In Progress
                </button>
                <button
                  className={`btn btn-sm ${
                    ticket.status === 'Resolved' ? 'btn-success' : 'btn-outline-success'
                  }`}
                  onClick={() => handleStatusUpdate(ticket._id, 'Resolved')}
                >
                  Resolved
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      ) : (
        <div className="alert alert-info">No tickets assigned to you currently.</div>
      )}
    </div>
  );
}
