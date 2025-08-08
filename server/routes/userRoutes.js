const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const upload = require('../middleware/multer');
const User = require('../models/user');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const path = require('path');
const fs = require('fs');


// Get current user's profile (accessible by any logged-in user)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Failed to load profile' });
  }
});

// POST /api/users/me/profile-picture
router.put('/me/profile-picture', authenticate, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });

    //delete old image
    if (user.profilePicture && user.profilePicture.startsWith('uploads/')) {
      const previousPath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(previousPath)) fs.unlinkSync(previousPath);
    }

    user.profilePicture = `uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      message: 'Profile picture updated.',
      profilePicture: user.profilePicture
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error during image upload.' });
  }
});


//for user changing their password
router.post('/me/change-password', authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect.' });

    user.password = newPassword; // goes to schema to hash btw
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } 
  
  catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error changing password.' });
  }
});


// Admin-only routes
router.use(authenticate, authorize('admin'));

// Get all users (admin only) with optional role filter
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.role) query.role = req.query.role;

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new user (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = new User({ name, email, password, role, department });
    await newUser.save();

    const userToReturn = newUser.toObject();
    delete userToReturn.password;

    res.status(201).json(userToReturn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user info (except password)
router.patch('/:id', async (req, res) => {
  try {
    const { name, email, role, department } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user password (admin only, securely hashed)
router.patch('/:id/password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ message: 'Server error updating password' });
  }
});

// Delete a user by ID (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
