const User = require('../models/User');
const Food = require('../models/Food');
const FoodRequest = require('../models/FoodRequest');

/**
 * Get Admin Statistics
 * Returns: total users, total food posts, total requests, average user rating
 */
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFood = await Food.countDocuments();
    const totalRequests = await FoodRequest.countDocuments();
    
    const users = await User.find().select('rating');
    const averageRating =
      users.length > 0
        ? (users.reduce((sum, user) => sum + user.rating, 0) / users.length).toFixed(2)
        : 0;

    const activeUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalFood,
        totalRequests,
        averageRating: parseFloat(averageRating),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get All Foods (Admin)
 * Returns: all food posts with donor information
 */
exports.getAllFoods = async (req, res, next) => {
  try {
    const foods = await Food.find()
      .populate('ownerId', 'name email location rating')
      .sort({ createdAt: -1 });

    const formattedFoods = foods.map((food) => ({
      _id: food._id,
      title: food.title || food.name,
      description: food.description,
      quantity: food.quantity,
      image: food.image,
      category: food.category,
      ownerName: food.ownerId?.name || 'Unknown',
      ownerId: food.ownerId?._id,
      location: food.location || food.locationName,
      createdAt: food.createdAt,
      status: food.status || 'available',
      price: food.price || 0,
    }));

    res.status(200).json({
      success: true,
      count: formattedFoods.length,
      foods: formattedFoods,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Delete Food (Admin)
 * Permanently deletes a food post
 */
exports.deleteFood = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findByIdAndDelete(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update Food Status (Admin)
 * Updates the status of a food post
 */
exports.updateFoodStatus = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['available', 'requested', 'collected', 'expired'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const food = await Food.findByIdAndUpdate(
      foodId,
      { status },
      { new: true, runValidators: true }
    );

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Food status updated successfully',
      food,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get All Users (Admin)
 * Returns: all users with their information (password excluded)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Delete User (Admin)
 * Permanently deletes a user account
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting yourself
    if (userId === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Also delete their food posts
    await Food.deleteMany({ ownerId: userId });

    res.status(200).json({
      success: true,
      message: 'User and their posts deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get All Requests (Admin)
 * Returns: all food requests with related information
 */
exports.getAllRequests = async (req, res, next) => {
  try {
    const requests = await FoodRequest.find()
      .populate('foodId', 'title description image category')
      .populate('requesterId', 'name email location rating')
      .populate('ownerId', 'name email location rating')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map((req) => ({
      _id: req._id,
      food: {
        _id: req.foodId?._id,
        title: req.foodId?.title,
        description: req.foodId?.description,
        image: req.foodId?.image,
      },
      requester: {
        _id: req.requesterId?._id,
        name: req.requesterId?.name,
        email: req.requesterId?.email,
        location: req.requesterId?.location,
      },
      owner: {
        _id: req.ownerId?._id,
        name: req.ownerId?.name,
        email: req.ownerId?.email,
        location: req.ownerId?.location,
      },
      status: req.status,
      message: req.message,
      createdAt: req.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedRequests.length,
      requests: formattedRequests,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
