const express = require('express');
const { sendOTP, verifyOTP, cleanupExpiredOTPs, getOTPStats } = require('../controllers/otpController');

const router = express.Router();

// Public routes
router.post('/send', sendOTP);
router.post('/verify', verifyOTP);

// Admin/debugging routes (optional - add protection if needed)
router.post('/cleanup', cleanupExpiredOTPs);
router.get('/stats', getOTPStats);

module.exports = router;
