const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      match: [/^\w+([\.\-]?\w+)*@\w+([\.\-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
      default: null,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    userType: {
      type: String,
      enum: ['donor', 'receiver'],
      default: 'receiver',
    },
    location: {
      type: String,
      required: [true, 'Please provide your location'],
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    profilePic: {
      type: String,
      default: null,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    foodsShared: {
      type: Number,
      default: 0,
    },
    foodsCollected: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash password if it's being modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
