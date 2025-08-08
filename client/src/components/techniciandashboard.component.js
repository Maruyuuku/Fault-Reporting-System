import React from 'react';
import DashboardCards from './dashboardcards';
import { useAuth } from '../context/auth-context';

export default function TechnicianDashboard() {
  const { user } = useAuth();

  return (
    <div className="technician-dashboard container-fluid">
      <div className="row">
        <div className="col-md-6">
          <DashboardCards role="technician" />
        </div>
      </div>
    </div>
  );
}