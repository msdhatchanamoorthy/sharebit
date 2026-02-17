const express = require('express');
const {
  getMyRequests,
  getIncomingRequests,
  getRequestById,
  cancelRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get my requests (requests I made)
router.get('/my-requests', protect, getMyRequests);

// Get incoming requests (requests on my food)
router.get('/incoming-requests', protect, getIncomingRequests);

// Get request by ID
router.get('/:id', protect, getRequestById);

// Cancel request
router.delete('/:id/cancel', protect, cancelRequest);

module.exports = router;
