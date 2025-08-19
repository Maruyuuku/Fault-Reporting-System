//incase you forget, its for hashing passwords
//also dont forget to run this from parent folder (server), not sub folder (hashpasswords) ^^
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user'); 

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Define users you want to create
  const users = [
    { name: 'Admin', email: 'admin@school.edu', password: 'admin123', role: 'admin', department: 'IT' },
    { name: 'Tech1', email: 'tech1@school.edu', password: 'techpass', role: 'technician', department: 'Maintenance' },
    { name: 'User1', email: 'user1@school.edu', password: 'userpass', role: 'general', department: 'HR' }
  ];

  for (const userData of users) {
    const userExists = await User.findOne({ email: userData.email });
    if (!userExists) {
      const user = new User(userData);
      await user.save();  
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }

  mongoose.disconnect();
}

seed().catch(console.error);
