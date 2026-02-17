const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode}`);
  });
  next();
});

// Ensure all responses are JSON by setting Content-Type header
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Store user socket connections
const userSockets = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('user-login', (userId) => {
    userSockets[userId] = socket.id;
    console.log('User logged in:', userId);
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(userSockets).find((key) => userSockets[key] === socket.id);
    if (userId) {
      delete userSockets[userId];
      console.log('User disconnected:', userId);
    }
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  req.userSockets = userSockets;
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const otpRoutes = require('./routes/otpRoutes');

// Import error middleware
const errorHandler = require('./middleware/error');

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharebite', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/otp', otpRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// 404 Error handler - MUST come before error middleware
app.use((req, res) => {
  console.warn(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware - MUST be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
