import React from 'react';
import AssignedTickets from './assignedtickets.component';


export default function AllReports() {
  return (
    <div className="technician-dashboard container-fluid">
      <h2 className="mb-4">All Reports Page</h2>
      <div className="row">
        <div className="col-md-6">
          <AssignedTickets />
        </div>
      </div>
    </div>
  );
}
