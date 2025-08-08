import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import { useAuth } from '../context/auth-context';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <nav className="col-md-2 d-none d-md-block bg-light sidebar" style={{ minHeight: '100vh', paddingTop: '1rem' }}>
      <center>
        <img src={logo} className="navbar-brand mb-3" width="121" alt="baze" />
      </center>
      {/*<p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>
        ROLE: {role || 'N/A'}
      </p>*/}
      <ul className="nav flex-column">
        
      {/*it checks what role you got and shows you what you can access.. based on your role */}

        {/* General User */}
        {role === 'general' && (
          <>
			<li className="nav-item">
          		<NavLink to="/general-portal" end className="nav-link">
            		<i className="fa fa-desktop"></i> Dashboard
          		</NavLink>
        	</li>
          <li className="nav-item">
              <NavLink to="/profile" className="nav-link">
                <i className="fas fa-user-alt"></i> User Profile
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/tickets/create" className="nav-link">
                <i className="fa fa-file"></i> Submit a Report
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/my-reports" className="nav-link">
                <i className="fas fa-file-alt"></i> View My Reports
              </NavLink>
            </li>
          </>
        )}

        {/* Technician */}
        {role === 'technician' && (
          <>
            <li className="nav-item">
              <NavLink to="/technician-portal" className="nav-link">
                <i className="fas fa-tools"></i> Technician Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/profile" className="nav-link">
                <i className="fas fa-user-alt"></i> User Profile
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/all-reports" className="nav-link">
                <i className="fas fa-list"></i> View All Reports
              </NavLink>
            </li>
          </>
        )}

        {/* Admin */}
        {role === 'admin' && (
          <>
            <li className="nav-item">
              <NavLink to="/admin-portal" className="nav-link">
                <i className="fas fa-user-shield"></i> Admin Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/profile" className="nav-link">
                <i className="fas fa-user-alt"></i> User Profile
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/manage-users" className="nav-link">
                <i className="fas fa-users-cog"></i> Manage Users
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/manage-technicians" className="nav-link">
                <i className="fas fa-list"></i> Manage Reports
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;
