const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });

// Import User model
const User = require('./models/User');

/**
 * Seed Script to Create Admin User
 * 
 * Usage: node seedAdmin.js
 * 
 * Creates an admin user with the following credentials:
 * Email: admin@sharebit.com
 * Password: Admin@123
 * 
 * You can modify these values before running
 */

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharebite', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Admin user data
    const adminData = {
      name: 'Admin User',
      email: 'admin@sharebit.com',
      password: 'Admin@123',
      location: 'ShareBit Headquarters',
      role: 'admin',
      userType: 'donor',
      rating: 5,
      foodsShared: 0,
      foodsCollected: 0,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminData.email);
      console.log('📧 Email: admin@sharebit.com');
      console.log('🔑 Password: Admin@123');
      process.exit(0);
    }

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('\n📊 Admin Credentials:');
    console.log('───────────────────────────────');
    console.log('📧 Email: admin@sharebit.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Name: Admin User');
    console.log('🏠 Location: ShareBit Headquarters');
    console.log('───────────────────────────────');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the script
createAdminUser();
