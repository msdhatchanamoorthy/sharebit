# Moodify API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "location": "New York, USA"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "location": "New York, USA",
    "rating": 5,
    "foodsShared": 0,
    "foodsCollected": 0,
    "profilePhoto": null
  }
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** (Same as register)

### Get Current User Profile
**GET** `/auth/profile`

**Headers:** ✅ Requires Authentication

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "location": "New York, USA",
    "bio": "Love sharing homemade pizzas!",
    "rating": 4.8,
    "foodsShared": 5,
    "foodsCollected": 3,
    "profilePhoto": "/uploads/profile.jpg"
  }
}
```

### Update User Profile
**PUT** `/auth/profile`

**Headers:** ✅ Requires Authentication

**Request Body:**
```json
{
  "name": "John Doe",
  "location": "Brooklyn, USA",
  "bio": "Food enthusiast and community member!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### Upload Profile Photo
**PUT** `/auth/profile-photo`

**Headers:** ✅ Requires Authentication

**Form Data:**
```
profilePhoto: <image_file>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "user": { ... }
}
```

---

## 🍲 Food Endpoints

### Get All Available Foods
**GET** `/foods`

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "count": 15,
  "foods": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Homemade Pizza",
      "description": "Delicious homemade pizza...",
      "quantity": "2 boxes",
      "image": "/uploads/pizza.jpg",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "locationName": "Central Park",
      "ownerId": {
        "id": "...",
        "name": "John Doe",
        "rating": 4.8,
        "profilePhoto": "..."
      },
      "status": "available",
      "createdAt": "2024-02-12T10:30:00Z"
    }
  ]
}
```

### Get Nearby Foods (Geospatial Search)
**GET** `/foods/nearby/search`

**Query Parameters:**
- `lat` (required): User latitude
- `lng` (required): User longitude
- `distance` (optional): Search radius in meters (default: 5000)

**Example:**
```
GET /foods/nearby/search?lat=40.7128&lng=-74.0060&distance=5000
```

**Response:**
```json
{
  "success": true,
  "count": 8,
  "searchRadius": 5,
  "foods": [
    {
      ...food_object,
      "distanceKm": 1.23
    }
  ]
}
```

### Get Food by ID
**GET** `/foods/:foodId`

**Response:**
```json
{
  "success": true,
  "food": { ...food_object }
}
```

### Get My Foods (Owned Foods)
**GET** `/foods/owner/my-foods`

**Headers:** ✅ Requires Authentication

**Response:**
```json
{
  "success": true,
  "count": 5,
  "foods": [ ...foods ]
}
```

### Create Food Listing
**POST** `/foods`

**Headers:** ✅ Requires Authentication

**Form Data:**
```
title: "Homemade Pizza"
description: "Delicious homemade pizza with fresh vegetables"
quantity: "2 boxes"
locationName: "Central Park, Manhattan"
latitude: "40.7128"
longitude: "-74.0060"
image: <image_file> (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Food listing created successfully",
  "food": { ...food_object }
}
```

### Update Food Listing
**PUT** `/foods/:foodId`

**Headers:** ✅ Requires Authentication

**Request Body:** (Same as create, all fields optional)

**Response:**
```json
{
  "success": true,
  "message": "Food updated successfully",
  "food": { ...food_object }
}
```

### Delete Food Listing
**DELETE** `/foods/:foodId`

**Headers:** ✅ Requires Authentication

**Response:**
```json
{
  "success": true,
  "message": "Food deleted successfully"
}
```

### Request Food
**POST** `/foods/:foodId/request`

**Headers:** ✅ Requires Authentication

**Request Body:** (Empty)

**Response:**
```json
{
  "success": true,
  "message": "Request sent successfully",
  "food": {
    ...food_object,
    "status": "requested",
    "requestedBy": { ...user_object }
  }
}
```

### Accept Request
**POST** `/foods/:foodId/accept`

**Headers:** ✅ Requires Authentication

**Request Body:** (Empty)

**Response:**
```json
{
  "success": true,
  "message": "Request accepted",
  "food": { ...food_object }
}
```

### Reject Request
**POST** `/foods/:foodId/reject`

**Headers:** ✅ Requires Authentication

**Request Body:** (Empty)

**Response:**
```json
{
  "success": true,
  "message": "Request rejected",
  "food": { ...food_object }
}
```

---

## 📋 Request Endpoints

### Get My Requests (Requests I Made)
**GET** `/requests/my-requests`

**Headers:** ✅ Requires Authentication

**Response:**
```json
{
  "success": true,
  "count": 3,
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "foodId": { ...food_object },
      "requesterId": { ...user_object },
      "ownerId": { ...user_object },
      "status": "pending",
      "message": "",
      "createdAt": "2024-02-12T10:30:00Z"
    }
  ]
}
```

### Get Incoming Requests (On My Food)
**GET** `/requests/incoming-requests`

**Headers:** ✅ Requires Authentication

**Response:** (Same structure as above)

### Get Request by ID
**GET** `/requests/:requestId`

**Headers:** ✅ Requires Authentication

**Response:**
```json
{
  "success": true,
  "request": { ...request_object }
}
```

### Cancel Request
**DELETE** `/requests/:requestId/cancel`

**Headers:** ✅ Requires Authentication

**Response:**
```json
{
  "success": true,
  "message": "Request cancelled successfully"
}
```

---

## 🏥 Health Check

### Server Health
**GET** `/health`

**Response:**
```json
{
  "message": "Server is running"
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "message": "Please fill all required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "message": "Internal server error"
}
```

---

## 📊 Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (donor|receiver),
  location: String,
  bio: String (max 500),
  profilePhoto: String (URL),
  latitude: Number,
  longitude: Number,
  foodsShared: Number,
  foodsCollected: Number,
  rating: Number (1-5),
  createdAt: Date,
  updatedAt: Date
}
```

### Food
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  quantity: String,
  image: String (URL),
  latitude: Number,
  longitude: Number,
  locationName: String,
  location: {
    type: String (Point),
    coordinates: [longitude, latitude]
  },
  ownerId: ObjectId (ref: User),
  status: String (available|requested|collected),
  requestedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### FoodRequest
```javascript
{
  _id: ObjectId,
  foodId: ObjectId (ref: Food),
  requesterId: ObjectId (ref: User),
  ownerId: ObjectId (ref: User),
  status: String (pending|accepted|rejected|completed),
  message: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔗 WebSocket Events

### Connection
```javascript
socket.emit('user-login', userId);
```

### Food Request Notification
```javascript
socket.on('food-requested', {
  foodId: "...",
  title: "...",
  requesterName: "...",
  message: "..."
});
```

---

## 🧪 Example Requests

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "location": "New York"
  }'
```

**Get Nearby Foods:**
```bash
curl http://localhost:5000/api/foods/nearby/search?lat=40.7128&lng=-74.0060&distance=5000
```

**Request Food:**
```bash
curl -X POST http://localhost:5000/api/foods/507f1f77bcf86cd799439011/request \
  -H "Authorization: Bearer <token>"
```

---

## 📱 Rate Limiting

- No rate limiting currently implemented
- Recommended: Add in production

## 🔒 Security Notes

- All passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- Coordinates are validated (-90 to 90 for lat, -180 to 180 for lng)
- Email must be unique per user

---

**Last Updated:** February 2024
