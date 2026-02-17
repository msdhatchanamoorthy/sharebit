# Local Food Sharing - Implementation Guide

## Overview

This is a complete upgrade of your Local Food Sharing React + Node.js + MongoDB project with production-ready features including:

- ✅ Google Maps integration with geolocation
- ✅ Real-time notifications with Socket.io
- ✅ Food request & acceptance system
- ✅ User profiles with photo upload
- ✅ Modern, responsive UI
- ✅ Sample data seeding

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Environment Configuration

**Backend (.env file):**
Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sharebite
JWT_SECRET=your_jwt_secret_key_change_this_in_production
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Frontend (.env file):**
Create a `.env` file in the `client` directory:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_API_URL=http://localhost:5000/api
```

### 3. Setup MongoDB

Make sure MongoDB is running:

```bash
# If using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or if MongoDB is installed locally
mongod
```

### 4. Seed Sample Data

```bash
cd server
npm run seed
```

This will:
- Create 6 sample food items with real locations
- Create a default user account (owner@sharebite.com / password123)
- Setup geospatial indexes for location-based queries

### 5. Run the Application

**Backend:**
```bash
cd server
npm run dev
```
Server runs on: http://localhost:5000

**Frontend:**
```bash
cd client
npm run dev
```
Client runs on: http://localhost:5173

## New Features Explained

### 1. **Food Listing Schema**

Every food item now includes:
- `title`: Food name
- `description`: Detailed description
- `quantity`: Amount available
- `image`: Food photo
- `latitude/longitude`: Geospatial coordinates
- `locationName`: Human-readable location
- `status`: available | requested | collected
- `ownerId`: Who shared it
- `requestedBy`: Who requested it (if applicable)

### 2. **Finding Nearby Foods**

Users can:
- View foods in a **5km radius** (customizable)
- See distance from their location
- View on Google Maps with markers
- Click markers to see food details

### 3. **Food Request System**

**When user requests food:**
1. Food status changes to "requested"
2. Owner gets real-time notification
3. Owner can accept or reject

**When owner accepts:**
1. Food status changes to "collected"
2. Requester gets notification
3. Both users' stats are updated

### 4. **Real-Time Notifications (Socket.io)**

Instant notifications for:
- Food requested
- Request accepted
- Request rejected

Notification badge shows unread count in navbar.

### 5. **User Profile Page**

Users can:
- Upload profile photo
- View their statistics:
  - Foods shared
  - Foods collected
  - Rating
- See account info

### 6. **My Requests Page**

Track all food requests user has made:
- View status (pending, accepted, rejected)
- See food details
- Cancel pending requests

### 7. **Incoming Requests Page**

Food owners can:
- See all requests for their shared foods
- Accept or reject requests
- View requester information

### 8. **Google Maps Integration**

Features:
- Auto-detect current location (for adding food)
- Click on map to set location
- View all nearby foods as markers
- Distance calculation using Haversine formula
- 5km default radius (customizable)

### 9. **Image Upload**

Users can:
- Upload food images during listing creation
- Upload profile photos on profile page
- Images stored on backend with multer

### 10. **Enhanced Navigation**

New navbar links:
- 🔍 Find Food (AvailableFood page)
- ➕ Share Food (AddFood page)
- 📚 My Foods (MyFoods page)
- 📨 My Requests (MyRequests page)
- 📥 Incoming Requests (IncomingRequests page)
- 👤 Profile (Profile page)
- 🔔 Notification badge with count

## API Endpoints

### Food Management
- `GET /api/foods` - Get all available foods
- `POST /api/foods` - Create new food listing (with image)
- `GET /api/foods/:id` - Get food by ID
- `PUT /api/foods/:id` - Update food
- `DELETE /api/foods/:id` - Delete food
- `GET /api/foods/nearby/search?lat=&lng=&distance=5000` - Find nearby foods

### Food Requests
- `POST /api/foods/:foodId/request` - Request food
- `POST /api/foods/:foodId/accept` - Accept request (mark collected)
- `POST /api/foods/:foodId/reject` - Reject request

### Request Management
- `GET /api/requests/my-requests` - Get my requests
- `GET /api/requests/incoming-requests` - Get incoming requests
- `DELETE /api/requests/:id/cancel` - Cancel request

### User/Profile
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get profile
- `PUT /auth/profile` - Update profile
- `PUT /auth/profile-photo` - Upload profile photo

## Database Models

### Food
```javascript
{
  title: String,
  description: String,
  quantity: String,
  image: String,
  latitude: Number,
  longitude: Number,
  locationName: String,
  location: GeoJSON,
  ownerId: ObjectId (ref: User),
  status: 'available' | 'requested' | 'collected',
  requestedBy: ObjectId (ref: User),
  createdAt: Date
}
```

### User
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  location: String,
  profilePhoto: String,
  latitude: Number,
  longitude: Number,
  foodsShared: Number,
  foodsCollected: Number,
  rating: Number (1-5)
}
```

### FoodRequest (deprecated - now handled in Food model)
```javascript
{
  foodId: ObjectId (ref: Food),
  requesterId: ObjectId (ref: User),
  ownerId: ObjectId (ref: User),
  status: 'pending' | 'accepted' | 'rejected',
  message: String,
  createdAt: Date
}
```

## Testing

### Test User Accounts

After running seed script:
- Email: owner@sharebite.com
- Password: password123

Sample Foods Available:
1. Fresh Biryani - T Nagar, Chennai
2. Vegetable Curry - Coimbatore Central
3. Samosas & Chutney - Madurai Market
4. Chicken Fry - Anna Nagar, Chennai
5. Dosa with Sambar - Thiruvanmiyur, Chennai
6. Homemade Pasta - Indira Nagar, Bangalore

## Troubleshooting

### Google Maps Not Showing
- Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in client .env
- Get API key from: https://console.cloud.google.com/

### Socket.io Not Connecting
- Check `CLIENT_URL` in server .env matches frontend URL
- Verify both server and client are running
- Check browser console for connection errors

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check `MONGODB_URI` in .env is correct
- For Docker: `mongodb://host.docker.internal:27017/sharebite`

### Image Upload Not Working
- Check `/uploads` directory exists
- Verify `UPLOAD_DIR` in server .env
- Check file size doesn't exceed `MAX_FILE_SIZE`

### Geolocation Not Working
- Browser must have permission granted
- Page must be HTTPS in production
- Check browser console for permission errors

## Production Deployment

### Important Changes

1. **Update environment variables:**
   - Generate strong JWT_SECRET
   - Set proper MONGODB_URI
   - Update CLIENT_URL to production domain
   - Configure VITE_GOOGLE_MAPS_API_KEY

2. **Build frontend:**
   ```bash
   cd client
   npm run build
   ```

3. **Serve static files:**
   - Copy `client/dist` to server public directory
   - Configure nginx/Apache to serve static files

4. **Enable HTTPS:**
   - Socket.io requires secure connections
   - Update CLIENT_URL to https://

5. **Database:**
   - Use MongoDB Atlas or managed service
   - Setup proper authentication
   - Enable encryption

6. **File uploads:**
   - Use cloud storage (AWS S3, Cloudinary) instead of local filesystem
   - Update multer configuration

## Performance Optimization

### Geospatial Queries
- 2dsphere index is automatically created
- Queries are optimized for location-based searches

### Image Optimization
- Frontend compresses images before upload
- Backend stores images efficiently
- Use CDN for image serving (recommended)

### Real-Time Performance
- Socket.io with efficient event handling
- Reduced notification payload
- Automatic cleanup of old notifications

## Security Considerations

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ CORS configured properly
- ✅ File upload validation
- ⚠️ Add rate limiting in production
- ⚠️ Add request validation middleware
- ⚠️ Implement API rate limiting
- ⚠️ Add XSS protection headers

## Support & Further Development

### Possible Enhancements

1. **Rating System**
   - Rate users after food collection
   - Aggregate ratings

2. **Search & Filters**
   - Search by food type
   - Filter by availability date
   - Sort by distance or freshness

3. **Messaging**
   - Direct messaging between users
   - Chat history

4. **Analytics**
   - User statistics dashboard
   - Food sharing trends
   - Community impact

5. **Mobile App**
   - React Native app
   - Offline capabilities
   - Push notifications

6. **Payment Integration**
   - Optional donations
   - Premium features

## Video Tutorial

[Link to video tutorial - coming soon]

## Contact & Issues

For issues or questions:
1. Check GitHub issues
2. Create detailed bug reports
3. Include error messages and steps to reproduce

---

**Happy Food Sharing! 🍽️**
