import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-left">
        {user ? (
          <span>Hello, {user.name}</span>
        ) : (
          <span>Welcome!</span>
        )}
      </div>
      <div className="navbar-right">
        {user ? (
          <button onClick={handleLogout} className="btn btn-outline-danger">Logout</button>
        ) : (
          <Link to="/login" className="btn btn-dark">Log In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
