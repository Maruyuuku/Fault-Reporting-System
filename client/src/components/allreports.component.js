import React from 'react';
import AssignedReports from './assignedreports.component';


export default function AllReports() {
  return (
    <div className="technician-dashboard container-fluid">
      <h2 className="mb-4">All Reports Page</h2>
      <div className="row">
        <div className="col-md-6">
          <AssignedReports />
        </div>
      </div>
    </div>
  );
}
