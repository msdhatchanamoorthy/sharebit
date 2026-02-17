const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { uploadToCloudinary, uploadProfilePhoto } = require('../middleware/upload');

// Generate JWT Token with role
const generateToken = (id, role = 'user') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Please check your .env file.');
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Register User
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, location, role } = req.body;

    // Validation
    if (!name || !email || !password || !location) {
      return res.status(400).json({ message: 'Please fill all the required fields' });
    }

    // Validate role
    const validRoles = ['user', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      location,
      role: userRole,
      foodsShared: 0,
      foodsCollected: 0,
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        rating: user.rating,
        foodsShared: user.foodsShared,
        foodsCollected: user.foodsCollected,
        profilePhoto: user.profilePhoto,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login User
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        rating: user.rating,
        foodsShared: user.foodsShared,
        foodsCollected: user.foodsCollected,
        profilePhoto: user.profilePhoto,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, location, bio, rating } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, location, bio, rating },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Phone Login / Registration
exports.phoneLogin = async (req, res, next) => {
  try {
    const { firebaseUid, phoneNumber, name, email, location } = req.body;

    // Validation
    if (!firebaseUid || !phoneNumber) {
      return res.status(400).json({ message: 'Firebase UID and phone number are required' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    console.log('[PhoneLogin] Processing phone login for:', phoneNumber, 'UID:', firebaseUid);

    // Check if user already exists by Firebase UID
    let user = await User.findOne({ firebaseUid });

    if (user) {
      console.log('[PhoneLogin] Existing user found:', user._id);
      // User exists, generate token and return
      const token = generateToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          location: user.location,
          rating: user.rating,
          foodsShared: user.foodsShared,
          foodsCollected: user.foodsCollected,
          profilePhoto: user.profilePhoto,
          role: user.role,
        },
      });
    }

    // New user registration via phone
    console.log('[PhoneLogin] Creating new user...');

    // Generate unique email from phone if not provided
    const userEmail = email || `${phoneNumber.replace(/\D/g, '')}@sharebit-phone.app`;

    // Check if email is already taken (in case email was provided)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    user = await User.create({
      name,
      phoneNumber,
      firebaseUid,
      email: userEmail,
      location: location || 'Not set',
      password: 'phone-auth', // Placeholder password for phone auth users
      role: 'user',
      foodsShared: 0,
      foodsCollected: 0,
    });

    console.log('[PhoneLogin] New user created:', user._id);

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location,
        rating: user.rating,
        foodsShared: user.foodsShared,
        foodsCollected: user.foodsCollected,
        profilePhoto: user.profilePhoto,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[PhoneLogin] Error:', err.message);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `This ${field} is already registered` });
    }
    res.status(500).json({ message: err.message });
  }
};

// Upload profile photo
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    try {
      const photoPath = await uploadProfilePhoto(req.file.buffer, req.file.originalname);

      const user = await User.findByIdAndUpdate(
        req.userId,
        { profilePic: photoPath },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Profile photo uploaded successfully',
        user,
      });
    } catch (uploadErr) {
      return res.status(400).json({ message: 'Failed to upload image: ' + uploadErr.message });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
