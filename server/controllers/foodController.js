const Food = require('../models/Food');
const User = require('../models/User');
const FoodRequest = require('../models/FoodRequest');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../middleware/upload');

// Create food listing
exports.createFood = async (req, res, next) => {
  try {
    const { title, description, quantity, latitude, longitude, locationName, category, price } = req.body;

    console.log('[createFood] Received data:', {
      title,
      description,
      quantity,
      latitude,
      longitude,
      locationName,
      category,
      price,
      userId: req.userId,
      hasFile: !!req.file,
    });

    // Validation
    if (!title || !description || !quantity || latitude === undefined || longitude === undefined || !locationName || !category) {
      console.error('[createFood] Missing required fields:', {
        title: !!title,
        description: !!description,
        quantity: !!quantity,
        latitude: latitude !== undefined,
        longitude: longitude !== undefined,
        locationName: !!locationName,
        category: !!category,
      });

      return res.status(400).json({ 
        success: false,
        message: 'Please fill all required fields: title, description, quantity, locationName, latitude, longitude, category' 
      });
    }

    // Validate category - CRITICAL CHECK
    const validCategories = ['Veg', 'Non-Veg', 'Snacks', 'Meals', 'Desserts'];
    if (!validCategories.includes(category)) {
      console.error('[createFood] Invalid category:', category);
      return res.status(400).json({ 
        success: false,
        message: `Category must be one of: ${validCategories.join(', ')}. Received: '${category}'` 
      });
    }

    console.log('[createFood] Category validation passed:', category);

    // Validate price
    const foodPrice = price ? parseFloat(price) : 0;
    if (foodPrice < 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Price cannot be negative' 
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid coordinates' 
      });
    }

    // Upload image if file was provided
    let imagePath = null;
    if (req.file) {
      try {
        imagePath = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      } catch (uploadErr) {
        return res.status(400).json({ 
          success: false,
          message: 'Failed to upload image: ' + uploadErr.message 
        });
      }
    }

    // Create GeoJSON location object
    const location = {
      type: 'Point',
      coordinates: [lng, lat], // [lng, lat] for GeoJSON
    };

    console.log('[createFood] Creating food with:', { title, category, ownerId: req.userId });

    // Create food
    const food = await Food.create({
      title,
      description,
      quantity,
      latitude: lat,
      longitude: lng,
      locationName,
      location,
      ownerId: req.userId,
      image: imagePath,
      status: 'available',
      category,
      price: foodPrice,
    });

    console.log('[createFood] Food created successfully:', { id: food._id, category: food.category });

    // Populate owner info
    const populatedFood = await Food.findById(food._id)
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('requestedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Food listing created successfully',
      food: populatedFood,
    });
  } catch (err) {
    console.error('[createFood] Error:', err.message);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get all available foods
exports.getAllFood = async (req, res, next) => {
  try {
    const foods = await Food.find({ status: 'available' })
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get food by ID
exports.getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('requestedBy', 'name email');

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get my foods (Owner)
exports.getMyFoods = async (req, res, next) => {
  try {
    const foods = await Food.find({ ownerId: req.userId })
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update food listing
exports.updateFood = async (req, res, next) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if user is the owner
    if (food.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this food' });
    }

    // If latitude/longitude provided, validate them
    if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
      const lat = req.body.latitude !== undefined ? parseFloat(req.body.latitude) : food.latitude;
      const lng = req.body.longitude !== undefined ? parseFloat(req.body.longitude) : food.longitude;

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ message: 'Invalid coordinates' });
      }

      // Update location object
      req.body.location = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('requestedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Food updated successfully',
      food,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete food listing
// Delete food (owner or admin only)
exports.deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      console.log('[deleteFood] Food not found:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'Food not found' 
      });
    }

    // Check if user is the owner OR an admin
    const isOwner = food.ownerId.toString() === req.userId;
    const isAdmin = req.user && req.user.role === 'admin';

    console.log('[deleteFood] User role check:', {
      userId: req.userId,
      userRole: req.user?.role,
      foodOwnerId: food.ownerId.toString(),
      isOwner,
      isAdmin,
    });

    if (!isOwner && !isAdmin) {
      console.warn('[deleteFood] Unauthorized delete attempt by user:', req.userId);
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this food' 
      });
    }

    // Delete the food
    await Food.findByIdAndDelete(req.params.id);

    console.log('[deleteFood] Food deleted successfully:', {
      foodId: req.params.id,
      deletedBy: req.userId,
      userRole: req.user?.role,
    });

    res.status(200).json({
      success: true,
      message: 'Food deleted successfully',
    });
  } catch (err) {
    console.error('[deleteFood] Error:', err.message);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get nearby foods (Geospatial search) with advanced filtering
exports.getNearbyFoods = async (req, res, next) => {
  try {
    const { lat, lng, distance = 5000, category, priceRange, availability } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Please provide latitude and longitude' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseInt(distance) || 5000; // Default 5km in meters

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Invalid coordinate range' });
    }

    // Build filter object
    let filterObj = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
      status: 'available',
    };

    // Add category filter if provided
    if (category && category !== 'All') {
      const validCategories = ['Veg', 'Non-Veg', 'Snacks', 'Meals', 'Desserts'];
      if (validCategories.includes(category)) {
        filterObj.category = category;
      }
    }

    // Add price range filter if provided
    if (priceRange) {
      if (priceRange === 'free') {
        filterObj.price = 0;
      } else if (priceRange === 'paid') {
        filterObj.price = { $gt: 0 };
      }
    }

    // Add availability filter if provided
    if (availability === 'expiring') {
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      filterObj.expiryTime = {
        $gte: now,
        $lte: twoHoursFromNow,
      };
    }

    // MongoDB geospatial query with filters
    const nearbyFoods = await Food.find(filterObj)
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('likes.userId', 'name')
      .populate('comments.userId', 'name')
      .select('+location')
      .limit(50);

    // Calculate distance for each food
    const foodsWithDistance = nearbyFoods.map((food) => {
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371; // Earth's radius in km

      const dLat = toRad(food.latitude - latitude);
      const dLng = toRad(food.longitude - longitude);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(latitude)) *
          Math.cos(toRad(food.latitude)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);

      const c = 2 * Math.asin(Math.sqrt(a));
      const distanceKm = R * c;

      return {
        ...food.toObject(),
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        likeCount: food.likes?.length || 0,
        commentCount: food.comments?.length || 0,
      };
    });

    res.status(200).json({
      success: true,
      count: foodsWithDistance.length,
      foods: foodsWithDistance,
      searchRadius: maxDistance / 1000,
      appliedFilters: {
        category: category || 'All',
        priceRange: priceRange || 'All',
        availability: availability || 'All',
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Request food
exports.requestFood = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const requesterId = req.userId;

    // Validate ObjectId format
    if (!foodId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid food ID format' 
      });
    }

    // Check if food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ 
        success: false,
        message: 'Food not found' 
      });
    }

    // Check if food is available
    if (food.status !== 'available') {
      return res.status(400).json({ 
        success: false,
        message: 'This food is no longer available' 
      });
    }

    // Prevent owner from requesting their own food
    if (food.ownerId.toString() === requesterId) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot request your own food' 
      });
    }

    // Check if user already has a pending request for this food
    const existingRequest = await FoodRequest.findOne({
      foodId: foodId,
      requesterId: requesterId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have a pending request for this food' 
      });
    }

    // Start transaction-like operation
    // 1. Create FoodRequest document
    const foodRequest = new FoodRequest({
      foodId: foodId,
      requesterId: requesterId,
      ownerId: food.ownerId,
      status: 'pending',
      message: '',
    });

    const savedRequest = await foodRequest.save();

    // 2. Create Notification document for the food owner
    const notification = new Notification({
      recipientId: food.ownerId,
      senderId: requesterId,
      foodId: foodId,
      type: 'request',
      message: `Someone requested your food: ${food.title}`,
      isRead: false,
    });

    const savedNotification = await notification.save();

    // 3. Update food status to requested
    food.status = 'requested';
    food.requestedBy = requesterId;
    await food.save();

    // 4. Populate and return the request with related data
    const populatedRequest = await FoodRequest.findById(savedRequest._id)
      .populate('requesterId', 'name email location profilePhoto profilePic')
      .populate('ownerId', 'name email location profilePhoto profilePic')
      .populate('foodId');

    // 5. Emit socket event to owner for real-time notification
    if (req.userSockets && req.io) {
      const ownerSocketId = req.userSockets[food.ownerId.toString()];
      if (ownerSocketId) {
        req.io.to(ownerSocketId).emit('food-requested', {
          requestId: savedRequest._id,
          foodId: food._id,
          title: food.title,
          requesterName: req.user?.name || 'Someone',
          message: `${req.user?.name || 'Someone'} requested your food: ${food.title}`,
          createdAt: new Date(),
        });
      }
    }

    // Return successful response
    res.status(201).json({
      success: true,
      message: 'Food requested successfully',
      request: populatedRequest,
      notification: {
        id: savedNotification._id,
        message: savedNotification.message,
        type: savedNotification.type,
      },
    });
  } catch (err) {
    console.error('Request food error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Error requesting food' 
    });
  }
};

// Accept food request (Owner marks as collected)
exports.acceptRequest = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if user is the owner
    if (food.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    if (food.status !== 'requested') {
      return res.status(400).json({ message: 'No pending request for this food' });
    }

    // Update status to collected
    food.status = 'collected';
    await food.save();

    // Update user stats
    await User.findByIdAndUpdate(food.ownerId, { $inc: { foodsShared: 1 } });
    await User.findByIdAndUpdate(food.requestedBy, { $inc: { foodsCollected: 1 } });

    const populatedFood = await Food.findById(foodId)
      .populate('ownerId', 'name email location rating profilePhoto')
      .populate('requestedBy', 'name email');

    // Emit socket event to requester
    if (req.userSockets && req.io) {
      const requesterSocketId = req.userSockets[food.requestedBy.toString()];
      if (requesterSocketId) {
        req.io.to(requesterSocketId).emit('request-accepted', {
          foodId: food._id,
          title: food.title,
          message: `Your request for ${food.title} was accepted!`,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Request accepted - Food marked as collected',
      food: populatedFood,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject food request (Owner rejects)
exports.rejectRequest = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if user is the owner
    if (food.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (food.status !== 'requested') {
      return res.status(400).json({ message: 'No pending request for this food' });
    }

    // Reset food status back to available
    food.status = 'available';
    food.requestedBy = null;
    await food.save();

    const populatedFood = await Food.findById(foodId)
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('requestedBy', 'name email');

    // Emit socket event to requester
    if (req.userSockets && req.io && food.requestedBy) {
      const requesterSocketId = req.userSockets[food.requestedBy.toString()];
      if (requesterSocketId) {
        req.io.to(requesterSocketId).emit('request-rejected', {
          foodId: food._id,
          title: food.title,
          message: `Your request for ${food.title} was rejected.`,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      food: populatedFood,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like food
exports.likeFood = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const userId = req.userId;

    const food = await Food.findById(foodId).populate('ownerId', 'name email');
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if already liked
    const alreadyLiked = food.likes.some(like => like.userId.toString() === userId);
    if (alreadyLiked) {
      return res.status(400).json({ message: 'You already liked this food' });
    }

    // Add like
    food.likes.push({ userId });
    await food.save();

    // Create notification
    const Notification = require('../models/Notification');
    const User = require('../models/User');
    
    const liker = await User.findById(userId);
    await Notification.create({
      recipientId: food.ownerId._id,
      senderId: userId,
      foodId: foodId,
      type: 'like',
      message: `${liker.name} liked your food: ${food.title}`,
    });

    const updatedFood = await Food.findById(foodId)
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('likes.userId', 'name email profilePhoto')
      .populate('comments.userId', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Food liked successfully',
      food: updatedFood,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unlike food
exports.unlikeFood = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const userId = req.userId;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Remove like
    food.likes = food.likes.filter(like => like.userId.toString() !== userId);
    await food.save();

    const updatedFood = await Food.findById(foodId)
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('likes.userId', 'name email profilePhoto')
      .populate('comments.userId', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Food unliked successfully',
      food: updatedFood,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add comment
exports.addComment = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const food = await Food.findById(foodId).populate('ownerId', 'name email');
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Add comment
    const comment = {
      _id: new (require('mongoose')).Types.ObjectId(),
      userId,
      text: text.trim(),
      createdAt: new Date(),
    };

    food.comments.push(comment);
    await food.save();

    // Create notification
    const Notification = require('../models/Notification');
    const User = require('../models/User');
    
    const commenter = await User.findById(userId);
    await Notification.create({
      recipientId: food.ownerId._id,
      senderId: userId,
      foodId: foodId,
      type: 'comment',
      message: `${commenter.name} commented on your food: ${food.title}`,
    });

    const updatedFood = await Food.findById(foodId)
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('likes.userId', 'name email profilePhoto')
      .populate('comments.userId', 'name email profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      food: updatedFood,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove comment
exports.removeComment = async (req, res, next) => {
  try {
    const { foodId, commentId } = req.params;
    const userId = req.userId;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Find and remove comment
    const comment = food.comments.find(c => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only comment owner or food owner can delete
    if (comment.userId.toString() !== userId && food.ownerId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    food.comments = food.comments.filter(c => c._id.toString() !== commentId);
    await food.save();

    const updatedFood = await Food.findById(foodId)
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('likes.userId', 'name email profilePhoto')
      .populate('comments.userId', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Comment removed successfully',
      food: updatedFood,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Bookmark food
exports.bookmarkFood = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const userId = req.userId;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if already bookmarked
    const isBookmarked = food.bookmarkedBy.includes(userId);
    if (isBookmarked) {
      return res.status(400).json({ message: 'You already bookmarked this food' });
    }

    // Add bookmark
    food.bookmarkedBy.push(userId);
    await food.save();

    res.status(200).json({
      success: true,
      message: 'Food bookmarked successfully',
      isBookmarked: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove bookmark
exports.removeBookmark = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const userId = req.userId;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Remove bookmark
    food.bookmarkedBy = food.bookmarkedBy.filter(id => id.toString() !== userId);
    await food.save();

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully',
      isBookmarked: false,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get bookmarked foods by current user
exports.getBookmarkedFoods = async (req, res, next) => {
  try {
    const userId = req.userId;

    const foods = await Food.find({ bookmarkedBy: userId })
      .populate('ownerId', 'name email location rating profilePhoto profilePic')
      .populate('likes.userId', 'name')
      .populate('comments.userId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods: foods.map(food => ({
        ...food.toObject(),
        likeCount: food.likes?.length || 0,
        commentCount: food.comments?.length || 0,
        isBookmarked: true,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update request status (for food owner)
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { foodId, requestId } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    // Get the food request
    const FoodRequest = require('../models/FoodRequest');
    const foodRequest = await FoodRequest.findById(requestId)
      .populate('foodId')
      .populate('requesterId', 'name email')
      .populate('ownerId', 'name email');

    if (!foodRequest) {
      return res.status(404).json({ message: 'Food request not found' });
    }

    // Verify current user is the food owner
    if (foodRequest.ownerId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    // Update request status
    foodRequest.status = status;
    await foodRequest.save();

    // If accepted, update food status to requested
    if (status === 'accepted') {
      await Food.findByIdAndUpdate(foodId, { 
        status: 'requested',
        requestedBy: foodRequest.requesterId._id
      });
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      request: foodRequest,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};