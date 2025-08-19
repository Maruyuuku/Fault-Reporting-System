import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from './context/auth-context';

import Navbar from "./components/navbar.component";
import Sidebar from "./components/sidebar.component";
import UserProfile from "./components/UserProfile";

import CreateReport from "./components/createreport.component";
import GeneralUserDashboard from "./components/generaluser.component";
import TechnicianDashboard from "./components/techniciandashboard.component";
import AdminDashboard from "./components/admindashboard.component";

import ManageUsers from "./components/manageusers.component";
import EditReport from "./components/editreport.component";
import Login from "./components/login.component";

import MyReports from "./components/myreports.component";
import AllReports from "./components/allreports.component";
import ManageTechnicians from "./components/managetechnicians.component";

 
function AppContent() {
  const location = useLocation();
  const hideUI = location.pathname === '/login';

  return (
    <>
      {!hideUI && <Navbar />}
      <div className="wrapper">
        {!hideUI && <Sidebar />}
        <div id="content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<UserProfile/>} />

            {/* Dashboards */}
            <Route path="/admin-portal" element={<AdminDashboard />} />
            <Route path="/technician-portal" element={<TechnicianDashboard />} />
            <Route path="/general-portal" element={<GeneralUserDashboard />} />

            {/* Make and Create Reports */}
            <Route path="/reports/create" element={<CreateReport />} />
            <Route path="/edit/:id" element={<EditReport />} />

            {/* Admin Management */}
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/manage-technicians" element={<ManageTechnicians />} />

            {/* View Reports */}
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/all-reports" element={<AllReports />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
