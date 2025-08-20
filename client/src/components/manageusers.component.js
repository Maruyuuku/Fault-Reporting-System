import React, { Component } from 'react';
import axios from 'axios';
import CreateUser from './createuser.component';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://fault-reporting-system.onrender.com'
  : 'http://localhost:5000';

const roles = [
  { value: 'general', label: 'General User' },
  { value: 'technician', label: 'Technician' },
  { value: 'admin', label: 'Administrator' }
];

const User = ({ user, deleteUser, onEdit }) => (
  <tr>
    <td style={{ padding: '10px' }}>{user.name}</td>
    <td>{user.email}</td>
    <td style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{user.role}</td>
    <td>
      <button onClick={() => onEdit(user)} className="action-button edit-button">Edit</button>
      <button
        onClick={() => {
          if (window.confirm('Are you sure you want to delete this user?')) deleteUser(user._id);
        }}
        className="action-button delete-button"
      >
        Delete
      </button>
    </td>
  </tr>
);

export default class ManageUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      error: '',
      editingUser: null,
      successMsg: '',
      errorMsg: '',
      counts: { total: 0, admin: 0, technician: 0, general: 0 }
    };
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = () => {
    const token = localStorage.getItem('token');
    axios
      .get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const users = res.data;
        const counts = {
          total: users.length,
          admin: users.filter(u => u.role === 'admin').length,
          technician: users.filter(u => u.role === 'technician').length,
          general: users.filter(u => u.role === 'general').length
        };

        this.setState({ users, counts, loading: false, error: '' });
      })
      .catch(() => {
        this.setState({ error: 'Failed to load users.', loading: false });
      });
  };

  deleteUser = (id) => {
    axios
      .delete(`${API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(() => this.fetchUsers())
      .catch(() => alert('Failed to delete user'));
  };

  handleEditInputChange = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      editingUser: { ...prev.editingUser, [name]: value }
    }));
  };

  submitEdit = async () => {
    const { editingUser } = this.state;
    const token = localStorage.getItem('token');

    try {
      // firstly updating the fields that arent password
      await axios.patch(
        `${API_URL}/api/users/${editingUser._id}`,
        {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          department: editingUser.department
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // check if password is filled and update password
      if (editingUser.password && editingUser.password.trim() !== '') {
        await axios.patch(
          `${API_URL}/api/users/${editingUser._id}/password`,
          { newPassword: editingUser.password },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Success handling
      this.setState({
        editingUser: null,
        successMsg: 'Updated user information',
        errorMsg: ''
      });
      this.fetchUsers();
      setTimeout(() => this.setState({ successMsg: '' }), 3000);
    } catch (err) {
      console.error('Update error:', err?.response?.data || err.message);

      this.setState({
        errorMsg: 'Unable to update user info',
        successMsg: ''
      });
      setTimeout(() => this.setState({ errorMsg: '' }), 3000);
    }
  };


  render() {
    const { users, loading, error, editingUser, successMsg, errorMsg, counts } = this.state;

    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}><u>Manage Users</u></h2>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        {/*Total user count */}
        <div className="manageusers-container">
          <div className="manageusers-main" >
            <p><strong>Total Users:</strong> {counts.total}</p>
            <p>Admins: {counts.admin}</p>
            <p>Technicians: {counts.technician}</p>
            <p>General Users: {counts.general}</p>
          </div>

          <div className="manageusers-main" style={{ flex: '2 1 500px', minWidth: '300px' }}>
            <CreateUser onUserCreated={this.fetchUsers} />
          </div>
        </div>

        <hr style={{ margin: '2rem 0' }} />

      {/* All User Tablee*/}
        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(user => (
                  <User key={user._id} user={user} deleteUser={this.deleteUser} onEdit={u => this.setState({ editingUser: u })} />
                ))
              ) : (
                <tr><td colSpan="4">No users found.</td></tr>
              )}
            </tbody>
          </table>
        )}
        
      {/*Edit user */}
        {editingUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4>Edit User</h4>
              <label>Name</label>
              <input type="text" name="name" value={editingUser.name} onChange={this.handleEditInputChange} className="modal-input" />
              <label>Email</label>
              <input type="email" name="email" value={editingUser.email} onChange={this.handleEditInputChange} className="modal-input" />
              <label>Department</label>
              <input type="text" name="department" value={editingUser.department} onChange={this.handleEditInputChange} className="modal-input" />
              <label>Role</label>
              <select name="role" value={editingUser.role} onChange={this.handleEditInputChange} className="modal-input">
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <label>New Password (must be at least 6 characters)</label>
              <input type="password" name="password" onChange={this.handleEditInputChange} className="modal-input" placeholder='Leave blank if you do not want to change password'/>
              <div className="modal-buttons">
                <button onClick={this.submitEdit} className="action-button edit-button">Update</button>
                <button onClick={() => this.setState({ editingUser: null })} className="action-button delete-button">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
