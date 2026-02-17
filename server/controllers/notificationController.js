const Notification = require('../models/Notification');

// Get all notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { limit = 20, skip = 0 } = req.query;

    console.log(`[getNotifications] Fetching notifications for user: ${userId}, limit: ${limit}, skip: ${skip}`);

    const notifications = await Notification.find({ recipientId: userId })
      .populate('senderId', 'name profilePhoto')
      .populate('foodId', 'title image')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Notification.countDocuments({ recipientId: userId });

    console.log(`[getNotifications] Found ${notifications.length} notifications (total: ${total})`);

    res.status(200).json({
      success: true,
      notifications,
      total,
    });
  } catch (err) {
    console.error('[getNotifications] Error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.userId;

    console.log(`[getUnreadCount] Fetching unread count for user: ${userId}`);

    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    console.log(`[getUnreadCount] Unread count: ${unreadCount}`);

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (err) {
    console.error('[getUnreadCount] Error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Only recipient can mark as read
    if (notification.recipientId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Only recipient can delete
    if (notification.recipientId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Helper function to create notifications
 * Can be used from other controllers
 * @param {String} recipientId - User ID to receive notification
 * @param {String} senderId - User ID sending notification
 * @param {String} foodId - Food ID related to notification
 * @param {String} type - Notification type (like, comment, request, etc)
 * @param {String} message - Notification message
 * @returns {Promise<Object>} Created notification document
 */
exports.createNotification = async ({
  recipientId,
  senderId,
  foodId,
  type,
  message,
}) => {
  try {
    if (!recipientId || !senderId || !foodId || !type || !message) {
      throw new Error('Missing required fields for notification');
    }

    const notification = new Notification({
      recipientId,
      senderId,
      foodId,
      type,
      message,
      isRead: false,
    });

    const savedNotification = await notification.save();
    
    // Populate relevant fields
    const populatedNotification = await Notification.findById(savedNotification._id)
      .populate('senderId', 'name profilePhoto')
      .populate('foodId', 'title image');

    return populatedNotification;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};
