const express = require('express');
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
// IMPORTANT: Define specific routes BEFORE parameter routes
router.get('/', protect, getNotifications);
router.get('/unread/count', protect, getUnreadCount);
router.put('/:notificationId/read', protect, markAsRead);
router.delete('/:notificationId', protect, deleteNotification);

module.exports = router;
