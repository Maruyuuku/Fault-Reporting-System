import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not logged in.');
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch {
      setError('Failed to load profile data.');
    }
  };

  const handleProfileImageChange = (e) => {
    setProfileImageFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not logged in.');
      setLoading(false);
      return;
    }

    try {
      // Upload profile picture
      if (profileImageFile) {
        const formData = new FormData();
        formData.append('profilePicture', profileImageFile); // Must match Multer field name

        await axios.put('http://localhost:5000/api/users/me/profile-picture', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Password change
      if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword || !newPassword || !confirmPassword) {
          setMessage('Fill all password fields to change password.');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setMessage("New password and confirmation don't match.");
          setLoading(false);
          return;
        }

        await axios.post('http://localhost:5000/api/users/me/change-password', {
          oldPassword,
          newPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setMessage('Profile updated successfully.');
      setEditMode(false);
      setProfileImageFile(null);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchUser();


    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!user) return <p>Loading profile...</p>;

  const profileImage = user.profilePicture
    ? `http://localhost:5000/${user.profilePicture}`
    : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  return (
    <div className="user-profile-container">
      <h2 className='far fa-user-circle'> User Profile</h2>
      <div className="user-profile-card">
        <img src={profileImage} alt="Profile" className="profile-image" />
        <div className="profile-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Department:</strong> {user.department || 'N/A'}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      </div>

      <button onClick={() => setEditMode(!editMode)} style={{ marginTop: '1rem' }} className='btn btn-primary'>
        {editMode ? 'Cancel Edit' : 'Edit Profile'}
      </button>

      {editMode && (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div>
            <label>Change Profile Picture:</label><br />
            <input type="file" accept="image/*" onChange={handleProfileImageChange} />
          </div>

          <hr style={{ margin: '1rem 0' }} />

          <h4>Change Password</h4>
          <div>
            <label>Old Password:</label><br />
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Enter old password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label>New Password:</label><br />
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label>Confirm New Password:</label><br />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: '1rem' }} className='btn btn-primary'>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>

          {message && (
            <p style={{ marginTop: '1rem', color: message.includes('Failed') || message.includes('incorrect') ? 'red' : 'green' }}>
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
