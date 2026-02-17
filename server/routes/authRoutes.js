const express = require('express');
const { register, login, getProfile, updateProfile, uploadProfilePhoto } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Auth Routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile-photo', protect, upload.single('profilePhoto'), uploadProfilePhoto);

module.exports = router;
