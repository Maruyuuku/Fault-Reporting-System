const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

// Middleware to authenticate the user
exports.authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    console.log("no token found");
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id); // Fetch the full user from DB
    if (!user) {
      console.log('User not found in DB');
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; //attach full user to request
    next();
  } catch (err) {
    console.log('Token invalid:', err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to authorize user roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
  };
};
