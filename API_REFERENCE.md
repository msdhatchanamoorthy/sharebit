# 📡 API Reference Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require Authorization header:
```
Authorization: Bearer <jwt_token>
```

JWT is obtained from login endpoint and stored in localStorage automatically by the frontend.

---

## 🔐 Authentication Endpoints

### 1. Register
Create a new user account.

**Endpoint:**
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "location": "New York"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1234567890abcdef12345",
    "name": "John Doe",
    "email": "john@example.com",
    "location": "New York",
    "foodsShared": 0,
    "foodsCollected": 0,
    "rating": 0
  }
}
```

**Errors:**
- 400: Email already exists
- 400: Invalid email format
- 400: Password too short

---

### 2. Login
Authenticate with email and password.

**Endpoint:**
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1234567890abcdef12345",
    "name": "John Doe",
    "email": "john@example.com",
    "location": "New York",
    "profilePhoto": "/uploads/photo_123.jpg",
    "foodsShared": 5,
    "foodsCollected": 3,
    "rating": 4.5
  }
}
```

**Errors:**
- 401: User not found
- 401: Incorrect password

---

### 3. Get Profile
Get authenticated user's profile.

**Endpoint:**
```
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "65a1234567890abcdef12345",
    "name": "John Doe",
    "email": "john@example.com",
    "location": "New York",
    "profilePhoto": "/uploads/photo_123.jpg",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "foodsShared": 5,
    "foodsCollected": 3,
    "rating": 4.5,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Update Profile
Update user information.

**Endpoint:**
```
PUT /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "location": "Los Angeles",
  "rating": 4.8
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "65a1234567890abcdef12345",
    "name": "John Doe Updated",
    "location": "Los Angeles",
    "rating": 4.8
  }
}
```

---

### 5. Upload Profile Photo
Upload user profile photo.

**Endpoint:**
```
PUT /auth/profile-photo
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
Key: profilePhoto
Value: <image file>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "user": {
    "_id": "65a1234567890abcdef12345",
    "profilePhoto": "/uploads/profile_65a1234567890abcdef12345.jpg"
  }
}
```

**Constraints:**
- Max file size: 5MB
- Allowed types: jpg, jpeg, png, gif

---

## 🍽️ Food Endpoints

### 1. Create Food
Share a new food item.

**Endpoint:**
```
POST /foods
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
title: "Homemade Pizza"
description: "Fresh from oven, with tomato and cheese"
quantity: "4 slices"
locationName: "Central Park, NYC"
latitude: 40.7829
longitude: -73.9654
image: <image file>
```

**Response (201):**
```json
{
  "success": true,
  "food": {
    "_id": "65a5678901234567890abcde",
    "title": "Homemade Pizza",
    "description": "Fresh from oven, with tomato and cheese",
    "quantity": "4 slices",
    "image": "/uploads/food_65a5678901234567890abcde.jpg",
    "latitude": 40.7829,
    "longitude": -73.9654,
    "locationName": "Central Park, NYC",
    "status": "available",
    "ownerId": "65a1234567890abcdef12345",
    "owner": {
      "_id": "65a1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "rating": 4.5
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Get All Foods
Get all available foods.

**Endpoint:**
```
GET /foods
```

**Query Parameters:**
```
?limit=10&skip=0&sort=-createdAt
```

**Response (200):**
```json
{
  "success": true,
  "count": 12,
  "foods": [
    {
      "_id": "65a5678901234567890abcde",
      "title": "Homemade Pizza",
      "description": "Fresh from oven...",
      "quantity": "4 slices",
      "image": "/uploads/food_65a5678901234567890abcde.jpg",
      "status": "available",
      "owner": {
        "name": "John Doe",
        "rating": 4.5
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Food by ID
Get details of a specific food.

**Endpoint:**
```
GET /foods/:foodId
```

**Example:**
```
GET /foods/65a5678901234567890abcde
```

**Response (200):**
```json
{
  "success": true,
  "food": {
    "_id": "65a5678901234567890abcde",
    "title": "Homemade Pizza",
    "description": "Fresh from oven, with tomato and cheese",
    "quantity": "4 slices",
    "image": "/uploads/food_65a5678901234567890abcde.jpg",
    "latitude": 40.7829,
    "longitude": -73.9654,
    "locationName": "Central Park, NYC",
    "status": "available",
    "owner": {
      "_id": "65a1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "rating": 4.5
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Get Nearby Foods
Find foods within specified radius.

**Endpoint:**
```
GET /foods/nearby/search
```

**Query Parameters:**
```
?lat=40.7128&lng=-74.0060&distance=5000
```

Parameters:
- `lat` (required): User's latitude
- `lng` (required): User's longitude  
- `distance` (optional): Max distance in meters (default: 5000 = 5km)

**Response (200):**
```json
{
  "success": true,
  "count": 8,
  "foods": [
    {
      "_id": "65a5678901234567890abcde",
      "title": "Homemade Pizza",
      "description": "Fresh from oven...",
      "quantity": "4 slices",
      "image": "/uploads/food_65a5678901234567890abcde.jpg",
      "latitude": 40.7829,
      "longitude": -73.9654,
      "locationName": "Central Park, NYC",
      "status": "available",
      "distance": 1234.5,
      "owner": {
        "name": "John Doe",
        "rating": 4.5
      }
    }
  ]
}
```

**Notes:**
- Distance in response is in meters
- Foods sorted by distance (nearest first)
- Only shows "available" status foods

---

### 5. Get My Foods
Get all foods owned by authenticated user.

**Endpoint:**
```
GET /foods/owner/my-foods
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "foods": [
    {
      "_id": "65a5678901234567890abcde",
      "title": "Homemade Pizza",
      "status": "available",
      "requestedBy": null
    },
    {
      "_id": "65a5678901234567890abcdf",
      "title": "Vegetable Curry",
      "status": "requested",
      "requestedBy": {
        "_id": "65a2345678901234567890ab",
        "name": "Jane Smith"
      }
    }
  ]
}
```

---

### 6. Update Food
Update food details.

**Endpoint:**
```
PUT /foods/:foodId
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Pizza Title",
  "description": "Updated description",
  "quantity": "6 slices",
  "locationName": "Times Square",
  "latitude": 40.7580,
  "longitude": -73.9855
}
```

**Response (200):**
```json
{
  "success": true,
  "food": {
    "_id": "65a5678901234567890abcde",
    "title": "Updated Pizza Title",
    "quantity": "6 slices"
  }
}
```

---

### 7. Delete Food
Delete a food item (only if available).

**Endpoint:**
```
DELETE /foods/:foodId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Food deleted successfully"
}
```

**Errors:**
- 403: Cannot delete requested/collected foods
- 404: Food not found
- 401: Not authorized (not owner)

---

## 📬 Food Request Endpoints

### 1. Request Food
Request a food from owner.

**Endpoint:**
```
POST /foods/:foodId/request
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Can I get this food? I'm nearby"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request sent successfully",
  "food": {
    "_id": "65a5678901234567890abcde",
    "status": "requested",
    "requestedBy": "65a2345678901234567890ab"
  }
}
```

**Socket Event Emitted:**
```javascript
socket.emit('food-requested', {
  foodId: "65a5678901234567890abcde",
  foodTitle: "Pizza",
  requesterName: "John Doe",
  message: "Can I get this food?"
})
```

---

### 2. Accept Request
Accept a food request and mark as collected.

**Endpoint:**
```
POST /foods/:foodId/accept
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request accepted",
  "food": {
    "_id": "65a5678901234567890abcde",
    "status": "collected",
    "owner": {
      "foodsShared": 6
    },
    "requestedBy": {
      "_id": "65a2345678901234567890ab",
      "foodsCollected": 3
    }
  }
}
```

**Socket Event Emitted:**
```javascript
socket.emit('request-accepted', {
  foodId: "65a5678901234567890abcde",
  foodTitle: "Pizza",
  ownerName: "John Doe"
})
```

---

### 3. Reject Request
Reject a food request.

**Endpoint:**
```
POST /foods/:foodId/reject
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request rejected",
  "food": {
    "_id": "65a5678901234567890abcde",
    "status": "available",
    "requestedBy": null
  }
}
```

**Socket Event Emitted:**
```javascript
socket.emit('request-rejected', {
  foodId: "65a5678901234567890abcde",
  foodTitle: "Pizza"
})
```

---

## 📨 Request Management Endpoints

### 1. Get My Requests
Get all requests user has made.

**Endpoint:**
```
GET /requests/my-requests
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "requests": [
    {
      "_id": "65a6789012345678901abcde",
      "foodId": {
        "_id": "65a5678901234567890abcde",
        "title": "Pizza",
        "image": "/uploads/food_xyz.jpg",
        "quantity": "4 slices"
      },
      "ownerId": {
        "_id": "65a1234567890abcdef12345",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Incoming Requests
Get all requests for foods user shared.

**Endpoint:**
```
GET /requests/incoming-requests
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "requests": [
    {
      "_id": "65a6789012345678901abcde",
      "foodId": {
        "_id": "65a5678901234567890abcde",
        "title": "Pizza",
        "description": "Homemade..."
      },
      "requesterId": {
        "_id": "65a2345678901234567890ab",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "rating": 4.2
      },
      "status": "pending",
      "message": "Can I have this?",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Request by ID
Get details of specific request.

**Endpoint:**
```
GET /requests/:requestId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "request": {
    "_id": "65a6789012345678901abcde",
    "foodId": {...},
    "requesterId": {...},
    "ownerId": {...},
    "status": "pending",
    "message": "Can I have this?",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Cancel Request
Cancel a pending request.

**Endpoint:**
```
DELETE /requests/:requestId/cancel
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request cancelled successfully"
}
```

---

## 🔌 Socket.io Events

### Client → Server

**User Login:**
```javascript
socket.emit('user-login', { userId: '65a1234567890abcdef12345' })
```

### Server → Client

**Food Requested:**
```javascript
socket.on('food-requested', {
  foodId: "65a5678901234567890abcde",
  foodTitle: "Pizza",
  requesterName: "John Doe",
  message: "Can I get this?"
})
```

**Request Accepted:**
```javascript
socket.on('request-accepted', {
  foodId: "65a5678901234567890abcde",
  foodTitle: "Pizza",
  ownerName: "John Doe"
})
```

**Request Rejected:**
```javascript
socket.on('request-rejected', {
  foodId: "65a5678901234567890abcde",
  foodTitle: "Pizza"
})
```

---

## 📊 Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not authorized for action)
- `404` - Not Found
- `500` - Server Error

---

## 🧪 cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "location": "NYC"
  }'
```

### Create Food
```bash
curl -X POST http://localhost:5000/api/foods \
  -H "Authorization: Bearer <token>" \
  -F "title=Pizza" \
  -F "description=Homemade" \
  -F "quantity=4 slices" \
  -F "locationName=NYC" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "image=@pizza.jpg"
```

### Nearby Foods
```bash
curl "http://localhost:5000/api/foods/nearby/search?lat=40.7128&lng=-74.0060&distance=5000"
```

### Request Food
```bash
curl -X POST http://localhost:5000/api/foods/65a5678901234567890abcde/request \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can I get this?"
  }'
```

---

## Headers Reference

### Standard Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Multipart Headers (for file upload)
```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>
```

---

**For more information, see [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**
