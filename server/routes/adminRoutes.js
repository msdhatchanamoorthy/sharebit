const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, allowOnlyAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(allowOnlyAdmin);

// Get admin statistics
router.get('/stats', adminController.getStats);

// Get all foods for admin management
router.get('/foods', adminController.getAllFoods);

// Delete a food item
router.delete('/foods/:foodId', adminController.deleteFood);

// Update food status
router.put('/foods/:foodId', adminController.updateFoodStatus);

// Get all users
router.get('/users', adminController.getAllUsers);

// Delete a user
router.delete('/users/:userId', adminController.deleteUser);

// Get all requests
router.get('/requests', adminController.getAllRequests);

module.exports = router;
