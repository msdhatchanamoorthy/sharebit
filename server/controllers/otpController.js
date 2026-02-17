const axios = require('axios');
const https = require('https');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Create https agent that ignores self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Store OTPs in memory (in production, use Redis or database)
// Format: { phoneNumber: { otp: '123456', expiresAt: timestamp, attempts: 0 } }
const otpStore = {};
const MAX_ATTEMPTS = 5;
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const OTP_LENGTH = 6;

// Generate JWT Token
const generateToken = (id, role = 'user') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Fast2SMS API
const sendOTPViaSMS = async (phoneNumber, otp) => {
  try {
    const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
    
    if (!fast2smsApiKey) {
      throw new Error('FAST2SMS_API_KEY is not configured in environment variables');
    }

    const message = `Your ShareBit OTP is: ${otp}. This code expires in 5 minutes. Do not share this code with anyone.`;

    console.log(`[OTP] Sending OTP to ${phoneNumber} via Fast2SMS`);
    console.log(`[OTP] API Key loaded: ${fast2smsApiKey.substring(0, 10)}...`);

    // Format: Fast2SMS expects phone number with country code (91 for India)
    const cleanNumber = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
    const formattedNumber = cleanNumber.length === 10 ? '91' + cleanNumber : cleanNumber;

    console.log(`[OTP] Formatted phone number: ${formattedNumber}`);

    // Use DLT/Regular SMS API (doesn't require OTP verification)
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: fast2smsApiKey,
        route: 'dlt', // Use DLT route instead of OTP (doesn't require verification)
        numbers: formattedNumber,
        message: message,
      },
      httpsAgent: httpsAgent, // Use agent that ignores self-signed certificates
    });

    console.log(`[OTP] Fast2SMS Response:`, response.data);
    console.log(`[OTP] SMS sent successfully to ${phoneNumber}`);
    return { success: true, messageId: response.data?.message_id };
  } catch (error) {
    console.error('[OTP] Error sending SMS:', error.response?.data || error.message);
    console.error('[OTP] Error status:', error.response?.status);
    console.error('[OTP] Full error:', JSON.stringify(error.response?.data, null, 2));
    throw new Error(`Failed to send OTP: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
    throw new Error(`Failed to send OTP: ${error.response?.data?.description || error.message}`);
  }
};

// Send OTP
exports.sendOTP = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Validate phone number format
    const phoneRegex = /^\+91[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use +91XXXXXXXXXX',
      });
    }

    console.log(`[OTP] Send OTP request for: ${phoneNumber}`);

    // Check if user is trying to send OTP too frequently
    if (otpStore[phoneNumber]) {
      const { expiresAt, attempts } = otpStore[phoneNumber];
      
      if (Date.now() < expiresAt && attempts >= MAX_ATTEMPTS) {
        return res.status(429).json({
          success: false,
          message: 'Too many attempts. Please try again later.',
        });
      }

      // If OTP hasn't expired, don't send a new one (user can resend)
      if (Date.now() < expiresAt) {
        console.log(`[OTP] OTP already exists for ${phoneNumber}, allowing resend`);
        // Clear the old OTP for resend
        delete otpStore[phoneNumber];
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY;

    console.log(`[OTP] Generated OTP for ${phoneNumber}: ${otp}`);

    // Store OTP temporarily
    otpStore[phoneNumber] = {
      otp,
      expiresAt,
      attempts: 0,
      createdAt: new Date().toISOString(),
    };

    // Send OTP via SMS
    await sendOTPViaSMS(phoneNumber, otp);

    // Set up automatic cleanup after expiry
    setTimeout(() => {
      delete otpStore[phoneNumber];
      console.log(`[OTP] OTP expired and cleaned up for ${phoneNumber}`);
    }, OTP_EXPIRY);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${phoneNumber}`,
      expiresIn: Math.round(OTP_EXPIRY / 1000), // in seconds
    });
  } catch (error) {
    console.error('[OTP] Send OTP error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

// Verify OTP and create/login user
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phoneNumber, otp, name, email, location } = req.body;

    // Validate input
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    console.log(`[OTP] Verify OTP request for: ${phoneNumber}`);

    // Check if OTP exists
    if (!otpStore[phoneNumber]) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.',
      });
    }

    const { otp: storedOTP, expiresAt, attempts } = otpStore[phoneNumber];

    // Check if OTP has expired
    if (Date.now() > expiresAt) {
      delete otpStore[phoneNumber];
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Check attempts
    if (attempts >= MAX_ATTEMPTS) {
      delete otpStore[phoneNumber];
      return res.status(429).json({
        success: false,
        message: 'Maximum attempts exceeded. Please request a new OTP.',
      });
    }

    // Verify OTP
    if (otp !== storedOTP) {
      otpStore[phoneNumber].attempts += 1;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
        attemptsLeft: MAX_ATTEMPTS - otpStore[phoneNumber].attempts,
      });
    }

    console.log(`[OTP] OTP verified successfully for ${phoneNumber}`);

    // Clear OTP from store
    delete otpStore[phoneNumber];

    // Check if user exists
    let user = await User.findOne({ phoneNumber });

    if (user) {
      console.log(`[OTP] Existing user found: ${user._id}`);
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
    console.log(`[OTP] Creating new user for ${phoneNumber}`);

    // Validate name for new user
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name is required for new users',
      });
    }

    // Generate unique email if not provided
    const userEmail = email && email.trim() ? email.trim() : `${phoneNumber.replace(/\D/g, '')}@sharebit-phone.app`;

    // Check if email is already taken
    if (email && email.trim()) {
      const existingEmail = await User.findOne({ email: userEmail });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }
    }

    // Create new user
    user = await User.create({
      name: name.trim(),
      phoneNumber,
      email: userEmail,
      location: location && location.trim() ? location.trim() : 'Not set',
      password: 'phone-auth', // Placeholder for phone auth users
      role: 'user',
      foodsShared: 0,
      foodsCollected: 0,
    });

    console.log(`[OTP] New user created: ${user._id}`);

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
  } catch (error) {
    console.error('[OTP] Verify OTP error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP',
    });
  }
};

// Cleanup function for manual OTP cleanup (optional admin endpoint)
exports.cleanupExpiredOTPs = async (req, res, next) => {
  try {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [phoneNumber, data] of Object.entries(otpStore)) {
      if (now > data.expiresAt) {
        delete otpStore[phoneNumber];
        cleanedCount++;
      }
    }

    console.log(`[OTP] Cleaned up ${cleanedCount} expired OTPs`);

    res.status(200).json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired OTPs`,
    });
  } catch (error) {
    console.error('[OTP] Cleanup error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup OTPs',
    });
  }
};

// Get OTP statistics (for debugging/monitoring)
exports.getOTPStats = async (req, res, next) => {
  try {
    const stats = {
      totalOTPsInMemory: Object.keys(otpStore).length,
      otpDetails: {},
    };

    for (const [phoneNumber, data] of Object.entries(otpStore)) {
      const expiresIn = Math.max(0, Math.round((data.expiresAt - Date.now()) / 1000));
      stats.otpDetails[phoneNumber] = {
        expiresIn,
        attempts: data.attempts,
        createdAt: data.createdAt,
      };
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[OTP] Stats error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP statistics',
    });
  }
};
