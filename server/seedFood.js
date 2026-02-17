const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });

// Import Food model
const Food = require('./models/Food');
const User = require('./models/User');

// Sample food data with real coordinates
const sampleFoods = [
  {
    title: 'Fresh Biryani',
    description: 'Delicious homemade biryani with basmati rice and fresh spices. Perfect for families.',
    quantity: '4 servings',
    locationName: 'T Nagar, Chennai',
    latitude: 13.0449,
    longitude: 80.2407,
    image: '/uploads/sample-biryani.jpg',
    status: 'available',
  },
  {
    title: 'Vegetable Curry',
    description: 'Homemade mixed vegetable curry with coconut milk. Healthy and delicious.',
    quantity: '6 servings',
    locationName: 'Coimbatore Central',
    latitude: 11.0168,
    longitude: 76.9558,
    image: '/uploads/sample-curry.jpg',
    status: 'available',
  },
  {
    title: 'Samosas & Chutney',
    description: 'Crispy samosas with homemade mint and tamarind chutney. Great for snacks!',
    quantity: '12 pieces',
    locationName: 'Madurai Market',
    latitude: 9.9252,
    longitude: 78.1198,
    image: '/uploads/sample-samosa.jpg',
    status: 'available',
  },
  {
    title: 'Chicken Fry',
    description: 'Spicy and crispy chicken fry made with traditional masala. Perfect with rice.',
    quantity: '3 servings',
    locationName: 'Anna Nagar, Chennai',
    latitude: 13.0849,
    longitude: 80.2107,
    image: '/uploads/sample-chicken.jpg',
    status: 'available',
  },
  {
    title: 'Dosa with Sambar',
    description: 'Crispy dosa served with hot sambar and coconut chutney. South Indian classic!',
    quantity: '4 servings',
    locationName: 'Thiruvanmiyur, Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    image: '/uploads/sample-dosa.jpg',
    status: 'available',
  },
  {
    title: 'Homemade Pasta',
    description: 'Creamy tomato-based pasta with fresh herbs and garlic. Italian inspired comfort food.',
    quantity: '2 servings',
    locationName: 'Indira Nagar, Bangalore',
    latitude: 12.9716,
    longitude: 77.6412,
    image: '/uploads/sample-pasta.jpg',
    status: 'available',
  },
];

// Function to seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharebite', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if we have any users. If not, we need a default owner
    let defaultOwner = await User.findOne({ email: 'owner@sharebite.com' });

    if (!defaultOwner) {
      console.log('⚠️  No default owner found. Creating one...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      defaultOwner = await User.create({
        name: 'Food Sharer',
        email: 'owner@sharebite.com',
        password: hashedPassword,
        location: 'Chennai, Tamil Nadu',
        rating: 5,
        foodsShared: 0,
        foodsCollected: 0,
      });

      console.log('✅ Default owner created');
    }

    // Create location objects for GeoJSON
    const foodsWithLocation = sampleFoods.map((food) => ({
      ...food,
      ownerId: defaultOwner._id,
      location: {
        type: 'Point',
        coordinates: [food.longitude, food.latitude],
      },
    }));

    // Clear existing sample foods
    const deleted = await Food.deleteMany({
      locationName: {
        $in: [
          'T Nagar, Chennai',
          'Coimbatore Central',
          'Madurai Market',
          'Anna Nagar, Chennai',
          'Thiruvanmiyur, Chennai',
          'Indira Nagar, Bangalore',
        ],
      },
    });

    console.log(`🗑️  Deleted ${deleted.deletedCount} old sample foods`);

    // Insert sample foods
    const inserted = await Food.insertMany(foodsWithLocation);

    console.log(`✅ Successfully seeded ${inserted.length} food items`);
    console.log('\n📍 Seeded Locations:');
    inserted.forEach((food, index) => {
      console.log(
        `${index + 1}. ${food.title} - ${food.locationName} (Lat: ${food.latitude}, Lng: ${food.longitude})`
      );
    });

    // Verify geospatial index
    const indexes = await Food.collection.getIndexes();
    const has2dsphere = Object.keys(indexes).some((key) =>
      key.includes('location')
    );

    console.log(`\n🔍 2dsphere Index Status: ${has2dsphere ? '✅ Present' : '⚠️  Missing'}`);

    if (!has2dsphere) {
      console.log('Creating 2dsphere index...');
      await Food.collection.createIndex({ location: '2dsphere' });
      console.log('✅ 2dsphere index created');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
