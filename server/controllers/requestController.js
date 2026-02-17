const FoodRequest = require('../models/FoodRequest');
const Food = require('../models/Food');
const User = require('../models/User');

// Get my requests (as requester)
exports.getMyRequests = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const requests = await FoodRequest.find({ requesterId: userId })
      .populate({
        path: 'foodId',
        select: 'title image description category price status'
      })
      .populate({
        path: 'ownerId',
        select: 'name email location profilePhoto profilePic rating'
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map(req => ({
        _id: req._id,
        foodId: {
          _id: req.foodId?._id,
          title: req.foodId?.title,
          image: req.foodId?.image,
          description: req.foodId?.description,
          category: req.foodId?.category,
          price: req.foodId?.price,
          status: req.foodId?.status,
        },
        owner: {
          _id: req.ownerId?._id,
          name: req.ownerId?.name,
          email: req.ownerId?.email,
          location: req.ownerId?.location,
          profilePhoto: req.ownerId?.profilePhoto,
          rating: req.ownerId?.rating,
        },
        status: req.status,
        message: req.message,
        createdAt: req.createdAt,
        requestedDate: new Date(req.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }))
    });
  } catch (err) {
    console.error('Get my requests error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch requests'
    });
  }
};

// Get incoming requests (as owner - requests on their food)
exports.getIncomingRequests = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const requests = await FoodRequest.find({ ownerId: userId })
      .populate({
        path: 'foodId',
        select: 'title image description category price status'
      })
      .populate({
        path: 'requesterId',
        select: 'name email location profilePhoto profilePic rating'
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map(req => ({
        _id: req._id,
        foodId: {
          _id: req.foodId?._id,
          title: req.foodId?.title,
          image: req.foodId?.image,
          description: req.foodId?.description,
          category: req.foodId?.category,
          price: req.foodId?.price,
          status: req.foodId?.status,
        },
        requester: {
          _id: req.requesterId?._id,
          name: req.requesterId?.name,
          email: req.requesterId?.email,
          location: req.requesterId?.location,
          profilePhoto: req.requesterId?.profilePhoto,
          rating: req.requesterId?.rating,
        },
        status: req.status,
        message: req.message,
        createdAt: req.createdAt,
        requestedDate: new Date(req.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }))
    });
  } catch (err) {
    console.error('Get incoming requests error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch incoming requests'
    });
  }
};

// Get request by ID
exports.getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format'
      });
    }

    const request = await FoodRequest.findById(id)
      .populate({
        path: 'foodId',
        select: 'title image description category price status'
      })
      .populate({
        path: 'requesterId',
        select: 'name email location profilePhoto profilePic'
      })
      .populate({
        path: 'ownerId',
        select: 'name email location profilePhoto profilePic'
      })
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    return res.status(200).json({
      success: true,
      request: {
        _id: request._id,
        foodId: request.foodId,
        requester: request.requesterId,
        owner: request.ownerId,
        status: request.status,
        message: request.message,
        createdAt: request.createdAt
      }
    });
  } catch (err) {
    console.error('Get request by ID error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch request'
    });
  }
};

// Cancel request (Requester)
exports.cancelRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format'
      });
    }

    const request = await FoodRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user is the requester
    if (request.requesterId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request'
      });
    }

    // Only pending requests can be cancelled
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${request.status} request. Only pending requests can be cancelled.`
      });
    }

    // Update request status to rejected
    const updatedRequest = await FoodRequest.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );

    // Update food status back to available
    const food = await Food.findById(request.foodId);
    if (food) {
      food.status = 'available';
      food.requestedBy = null;
      await food.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      request: updatedRequest
    });
  } catch (err) {
    console.error('Cancel request error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to cancel request'
    });
  }
};
