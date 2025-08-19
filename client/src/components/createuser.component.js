import React, { Component } from 'react';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://fault-reporting-system.onrender.com'
  : 'http://localhost:5000';


const roles = [
  { value: 'general', label: 'General User' },
  { value: 'technician', label: 'Technician' },
  { value: 'admin', label: 'Administrator' }
];

export default class CreateUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      department: '',
      role: 'general',
      successMsg: '',
      errorMsg: '',
      loading: false
    };
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, password, department, role } = this.state;

    if (!name || !email || !password) {
      this.setState({ errorMsg: 'Name, email, and password are required', successMsg: '' });
      return;
    }

    this.setState({ loading: true });

    const token = localStorage.getItem('token');

    axios
      .post(
        '${API_URL}/api/users',
        { name, email, password, department, role },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("User created successfully");
        this.setState({
          name: '',
          email: '',
          password: '',
          department: '',
          role: 'general',
          successMsg: 'User created successfully',
          errorMsg: '',
          loading: false
        });
        if (this.props.onUserCreated) {
          this.props.onUserCreated(); // refresh user list or parent state
        }
      })
      .catch((error) => {
        let msg = 'Failed to create user';
        if (error.response && error.response.data && error.response.data.message) {
          msg = error.response.data.message;
        }
        this.setState({ errorMsg: msg, successMsg: '', loading: false });
      });
  };

  render() {
    const { name, email, password, department, role, successMsg, errorMsg, loading } = this.state;

    return (
      <div className="card p-3 mt-4" style={{ maxWidth: '500px', margin: 'auto' }}>
        <h4>Create New User</h4>
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        <form onSubmit={this.handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name*</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={this.handleInputChange}
              className="form-control"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email*</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={this.handleInputChange}
              className="form-control"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password*</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={this.handleInputChange}
              className="form-control"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Department</label>
            <input
              type="text"
              name="department"
              value={department}
              onChange={this.handleInputChange}
              className="form-control"
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              name="role"
              value={role}
              onChange={this.handleInputChange}
              className="form-select"
              disabled={loading}
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    );
  }
}
