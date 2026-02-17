const mongoose = require('mongoose');

// Food Schema
const foodSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide food title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
    },
    quantity: {
      type: String,
      required: [true, 'Please provide quantity'],
    },
    image: {
      type: String,
      default: null,
    },
    latitude: {
      type: Number,
      required: [true, 'Please provide latitude'],
    },
    longitude: {
      type: Number,
      required: [true, 'Please provide longitude'],
    },
    locationName: {
      type: String,
      required: [true, 'Please provide location name'],
    },
    // GeoJSON format for geospatial queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'requested', 'collected'],
      default: 'available',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    expiryTime: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    },
    likes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // NEW: Category field for filtering
    category: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Snacks', 'Meals', 'Desserts'],
      required: [true, 'Please select a category'],
    },
    // NEW: Price field (Free or amount in currency)
    price: {
      type: Number,
      default: 0, // 0 means free
    },
    // NEW: Bookmark/Save feature - users who bookmarked this food
    bookmarkedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create 2dsphere index for geospatial queries
foodSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Food', foodSchema);
