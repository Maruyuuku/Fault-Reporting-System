import React from 'react';
import PriorityChart from './charts/prioritychart.component';
import StatusChart from './charts/statuschart.component';
import TypeChart from './charts/typechart.component';
import DashboardCards from './dashboardcards';

const AdminDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2 > Admin Dashboard</h2>
      <br/>
      <div className="mb-4">
        <DashboardCards role="admin" />
      </div>
      <br/><br/><br/><br/>
      <h2>Chart Analytics</h2>

      <div className="row">
        <div className="col-md-6 mb-4"><PriorityChart /></div>
        <div className="col-md-6 mb-4"><StatusChart /></div>
        <div className="col-md-12"><TypeChart /></div>
      </div>
    </div>
  );
};

export default AdminDashboard;
