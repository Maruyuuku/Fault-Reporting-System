import React from 'react';
import DashboardCards from './dashboardcards';

export default function GeneralUserDashboard() {
  return (
    <div>
      <div className="row">
        <div className="col-md-6">
          <DashboardCards role="general" />
        </div>
      </div>
    </div>
  );
}