const cors = require('cors');
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const { authenticate } = require('./middleware/authMiddleware');
const path = require('path');

const app = express();

app.use('/uploads', express.static('uploads'));
connectDB();


app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', authenticate, reportRoutes); 
app.use('/api/users', authenticate, userRoutes); // protected

console.log('Static path:', path.join(__dirname, '../client/build'));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Serving static files from:', path.join(__dirname, '../client/build'));

app.get('/test-catchall', (req, res) => {
  res.status(200).send('Test catchall route hit');
  console.log("catchall route hit");
});

// Dev: no static files, no catch-all for frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get(/.*/, (req, res) => {
    console.log("in app.get");
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    console.log("after sendFIle");
  });
}

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


