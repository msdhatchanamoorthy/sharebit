const express = require('express');
const {
  createFood,
  getAllFood,
  getFoodById,
  getMyFoods,
  updateFood,
  deleteFood,
  getNearbyFoods,
  requestFood,
  acceptRequest,
  rejectRequest,
  likeFood,
  unlikeFood,
  addComment,
  removeComment,
  bookmarkFood,
  removeBookmark,
  getBookmarkedFoods,
  updateRequestStatus,
} = require('../controllers/foodController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAllFood);
router.get('/nearby/search', getNearbyFoods); // Geospatial search - must be before /:id
router.get('/:id', getFoodById);

// Protected routes
router.post('/', protect, upload.single('image'), createFood);
router.get('/owner/my-foods', protect, getMyFoods); // Changed from /donor/my-foods
router.put('/:id', protect, updateFood);
router.delete('/:id', protect, deleteFood);

// Request routes
router.post('/:foodId/request', protect, requestFood);
router.post('/:foodId/accept', protect, acceptRequest);
router.post('/:foodId/reject', protect, rejectRequest);
router.put('/:foodId/request/:requestId/status', protect, updateRequestStatus);

// Like and Comment routes
router.post('/:foodId/like', protect, likeFood);
router.post('/:foodId/unlike', protect, unlikeFood);
router.post('/:foodId/comment', protect, addComment);
router.delete('/:foodId/comment/:commentId', protect, removeComment);

// Bookmark routes
router.post('/:foodId/bookmark', protect, bookmarkFood);
router.post('/:foodId/bookmark/remove', protect, removeBookmark);
router.get('/saved/all', protect, getBookmarkedFoods);

module.exports = router;
