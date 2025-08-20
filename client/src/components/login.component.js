import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/auth-context';
import { useNavigate } from 'react-router-dom';

const apiURL = process.env.NODE_ENV === 'production'
  ? 'https://fault-reporting-system.onrender.com/api/auth/login'
  : 'http://localhost:5000/api/auth/login';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/general-portal');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //console.log('Sending login request to:', apiURL, { email, password });
      const res = await axios.post(apiURL, { email, password });
      login(res.data);
      
      const role = res.data.user.role;
      if (role === 'admin') {
        navigate('/admin-portal');
      } else if (role === 'technician') {
        navigate('/technician-portal');
      } else {
        navigate('/general-portal');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url('/bazefront.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          padding: '2rem',
          borderRadius: '12px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Maintenance Portal</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group mt-3">
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-4 w-100">Login</button>
      </form>
    </div>
  );
}
