const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token and protect routes
const protect = async (req, res, next) => {
  try {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('ERROR: JWT_SECRET is not configured in .env file');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error: JWT_SECRET not set' 
      });
    }

    let token;

    // Get token from headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      console.warn(`[Auth] No token provided for ${req.method} ${req.path}`);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to access this route' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[Auth] Token verified for user: ${decoded.id}`);
    req.userId = decoded.id;
    req.userRole = decoded.role || 'user';

    // Fetch full user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized to access this route' 
    });
  }
};

// Middleware to check if user is admin - allows only admin users
const allowOnlyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Forbidden: Admin access required. Only administrators can access this resource.' 
    });
  }

  next();
};

// Middleware to check if user is a donor
const checkDonor = (req, res, next) => {
  if (req.user && req.user.userType === 'donor') {
    return next();
  }
  return res.status(403).json({ message: 'Only donors can perform this action' });
};

// Middleware to check if user is a receiver
const checkReceiver = (req, res, next) => {
  if (req.user && req.user.userType === 'receiver') {
    return next();
  }
  return res.status(403).json({ message: 'Only receivers can perform this action' });
};

module.exports = { protect, allowOnlyAdmin, checkDonor, checkReceiver };
