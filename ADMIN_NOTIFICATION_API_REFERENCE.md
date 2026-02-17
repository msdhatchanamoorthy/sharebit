# Admin & Notification API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All admin and notification endpoints require JWT token in Authorization header:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 📊 Admin Endpoints

### 1. Get Dashboard Statistics
```http
GET /admin/stats
Authorization: Bearer {ADMIN_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin stats retrieved successfully",
  "totalUsers": 42,
  "activeUsers": 38,
  "totalFood": 156,
  "totalRequests": 89,
  "averageRating": 4.65
}
```

**Roles:** Admin only  
**Status Code:** 200 OK

---

### 2. Get All Users
```http
GET /admin/users
Authorization: Bearer {ADMIN_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "location": "San Francisco, CA",
      "rating": 4.8,
      "createdAt": "2024-01-15T10:30:00Z",
      "role": "user",
      "userType": "donor"
    }
  ],
  "count": 42
}
```

**Roles:** Admin only  
**Status Code:** 200 OK

---

### 3. Delete User
```http
DELETE /admin/users/{userId}
Authorization: Bearer {ADMIN_TOKEN}

Content-Type: application/json
```

**URL Parameters:**
- `userId` (required): MongoDB ObjectId of user to delete

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "deletedUser": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "foodsDeleted": 5
}
```

**Roles:** Admin only  
**Status Code:** 200 OK  
**Error:** 404 if user not found

---

### 4. Get All Food Posts
```http
GET /admin/foods
Authorization: Bearer {ADMIN_TOKEN}
```

**Query Parameters (optional):**
- `status`: 'available' | 'requested' | 'collected'
- `page`: Page number for pagination
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "message": "Foods retrieved successfully",
  "foods": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Homemade Pizza",
      "description": "Fresh cheese pizza",
      "image": "pizza_123.jpg",
      "ownerId": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "location": "Downtown",
      "status": "available",
      "createdAt": "2024-01-20T15:45:00Z",
      "requestCount": 3
    }
  ],
  "total": 156
}
```

**Roles:** Admin only  
**Status Code:** 200 OK

---

### 5. Delete Food
```http
DELETE /admin/foods/{foodId}
Authorization: Bearer {ADMIN_TOKEN}

Content-Type: application/json
```

**URL Parameters:**
- `foodId` (required): MongoDB ObjectId of food post

**Response:**
```json
{
  "success": true,
  "message": "Food deleted successfully",
  "food": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Homemade Pizza",
    "status": "available"
  }
}
```

**Roles:** Admin only  
**Status Code:** 200 OK  
**Error:** 404 if food not found

---

### 6. Get All Requests
```http
GET /admin/requests
Authorization: Bearer {ADMIN_TOKEN}
```

**Query Parameters (optional):**
- `status`: 'pending' | 'accepted' | 'rejected' | 'completed'
- `page`: Page number for pagination

**Response:**
```json
{
  "success": true,
  "message": "Requests retrieved successfully",
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "foodId": {
        "title": "Homemade Pizza"
      },
      "requesterId": {
        "name": "Bob Johnson",
        "email": "bob@example.com"
      },
      "ownerId": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "status": "pending",
      "createdAt": "2024-01-21T09:15:00Z"
    }
  ],
  "total": 89
}
```

**Roles:** Admin only  
**Status Code:** 200 OK

---

## 🔔 Notification Endpoints

### 1. Get User Notifications
```http
GET /notifications?limit=20&skip=0
Authorization: Bearer {USER_TOKEN}

Content-Type: application/json
```

**Query Parameters (optional):**
- `limit`: Number of notifications to fetch (default: 10, max: 100)
- `skip`: Number of notifications to skip (pagination, default: 0)

**Response:**
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "recipientId": "507f1f77bcf86cd799439011",
      "senderId": {
        "_id": "507f1f77bcf86cd799439015",
        "name": "Alice Cooper",
        "email": "alice@example.com"
      },
      "foodId": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Homemade Pizza"
      },
      "type": "request",
      "message": "Someone requested your food: Homemade Pizza",
      "isRead": false,
      "createdAt": "2024-01-21T10:30:00Z"
    }
  ],
  "total": 5
}
```

**Roles:** Authenticated users  
**Status Code:** 200 OK

---

### 2. Get Unread Notification Count
```http
GET /notifications/unread/count
Authorization: Bearer {USER_TOKEN}

Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "unreadCount": 3
}
```

**Roles:** Authenticated users  
**Status Code:** 200 OK

---

### 3. Mark Notification as Read
```http
PUT /notifications/{notificationId}/read
Authorization: Bearer {USER_TOKEN}

Content-Type: application/json
```

**URL Parameters:**
- `notificationId` (required): MongoDB ObjectId of notification

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "_id": "507f1f77bcf86cd799439014",
    "isRead": true,
    "updatedAt": "2024-01-21T10:35:00Z"
  }
}
```

**Roles:** Authenticated users (owner only)  
**Status Code:** 200 OK  
**Error:** 403 if not notification owner

---

### 4. Delete Notification
```http
DELETE /notifications/{notificationId}
Authorization: Bearer {USER_TOKEN}

Content-Type: application/json
```

**URL Parameters:**
- `notificationId` (required): MongoDB ObjectId of notification

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "deletedNotification": {
    "_id": "507f1f77bcf86cd799439014",
    "message": "Someone requested your food: Homemade Pizza"
  }
}
```

**Roles:** Authenticated users (owner only)  
**Status Code:** 200 OK  
**Error:** 403 if not notification owner

---

### 5. Mark All Notifications as Read
```http
PUT /notifications/markAll/read
Authorization: Bearer {USER_TOKEN}

Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "updatedCount": 3
}
```

**Roles:** Authenticated users  
**Status Code:** 200 OK

---

## 🍕 Food Request Flow (Auto-Notification)

When a user requests food, a Notification is automatically created:

```http
POST /foods/{foodId}/request
Authorization: Bearer {USER_TOKEN}

Content-Type: application/json
```

**What Happens:**
1. FoodRequest document created
2. Notification document automatically created for food owner
3. Both have structure:
   ```json
   {
     "recipientId": "owner_user_id",
     "senderId": "requester_user_id",
     "foodId": "food_id",
     "type": "request",
     "message": "Someone requested your food: {Food Title}",
     "isRead": false
   }
   ```
4. Socket.io event emitted for real-time update
5. Owner's notification bell count updates

---

## 🔐 Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```
**Cause:** Missing or invalid JWT token

### 403 Forbidden - Admin Only
```json
{
  "success": false,
  "message": "Admin access required"
}
```
**Cause:** User role is not 'admin'

### 403 Forbidden - Owner Only
```json
{
  "success": false,
  "message": "You are not the owner of this notification"
}
```
**Cause:** User trying to modify someone else's notification

### 404 Not Found
```json
{
  "success": false,
  "message": "Notification not found"
}
```
**Cause:** Notification ID doesn't exist

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```
**Cause:** Missing required fields or invalid data format

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error message"
}
```
**Cause:** Unexpected server error

---

## 📋 HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | No token provided |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database connection failed |

---

## 🧪 Example Requests (cURL)

### Get Admin Stats
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get My Notifications
```bash
curl -X GET "http://localhost:5000/api/notifications?limit=20&skip=0" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### Mark Notification as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/507f1f77bcf86cd799439014/read \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{}"
```

### Delete a User (Admin)
```bash
curl -X DELETE http://localhost:5000/api/admin/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🔗 Related Endpoints

### Food Operations (with Notification Side Effects)
```
POST   /foods/{foodId}/request     - Creates Notification
POST   /foods/{foodId}/like         - Creates Notification
POST   /foods/{foodId}/comment      - Creates Notification
POST   /foods/{foodId}/accept       - Updates Notification
POST   /foods/{foodId}/reject       - Updates Notification
```

### Authentication
```
POST   /auth/login                 - Returns JWT with role
POST   /auth/register              - Creates user with role: 'user'
GET    /auth/profile               - Returns current user with role
```

---

## 📊 Data Types

### Notification Type
```typescript
interface Notification {
  _id: string;                    // MongoDB ObjectId
  recipientId: string;             // User ID who receives notification
  senderId: {                      // User who triggered notification
    _id: string;
    name: string;
    email: string;
  };
  foodId: {                        // Food being requested/liked/commented
    _id: string;
    title: string;
  };
  type: 'request' | 'like' | 'comment';
  message: string;                // Notification text
  isRead: boolean;                // Read status
  createdAt: Date;                // Creation timestamp
}
```

### Admin Stats Type
```typescript
interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalFood: number;
  totalRequests: number;
  averageRating: number;
}
```

---

## ⚡ Rate Limiting

Currently no rate limiting. In production, consider:
- Admin endpoints: 100 requests/minute per IP
- Notification endpoints: 1000 requests/minute per user
- Delete operations: 10 requests/minute per user

---

## 🔄 Real-Time Updates (Socket.io)

### Notification Events
```javascript
// Server emits when notification created
socket.emit('notification-received', {
  recipientId: 'user_id',
  notification: {...}
});

// Server emits when food requested
socket.emit('food-requested', {
  requestId: 'request_id',
  foodId: 'food_id',
  title: 'Food Title',
  requesterName: 'User Name'
});
```

---

## 📞 Troubleshooting API

### Issue: 401 Unauthorized
- **Check:** Token is valid and not expired
- **Fix:** Re-login to get fresh token
- **Verify:** `Authorization: Bearer {ACTUAL_TOKEN}`

### Issue: 403 Forbidden on Admin Endpoint
- **Check:** User role is 'admin' in database
- **Fix:** Update user document: `{ role: "admin" }`
- **Verify:** JWT token decodes to `{ id, role: "admin" }`

### Issue: 404 Not Found
- **Check:** Resource ID exists in database
- **Fix:** Verify ObjectId format (24 hex characters)
- **Verify:** Use correct ObjectId from database

### Issue: Empty Notifications Array
- **Check:** Notifications exist in database
- **Fix:** Create a food request to trigger notification creation
- **Verify:** Check MongoDB: `db.notifications.find()`

---

## 📚 Additional Resources

- **PHASE_5_ADMIN_NOTIFICATION_COMPLETE.md** - Full system overview
- **ADMIN_NOTIFICATION_QUICK_START.md** - Testing guide
- **README.md** - Project overview
- **API_REFERENCE_UPDATED.md** - Complete API reference

---

*Last Updated: Today*
*API Version: 1.0*
*System: ShareBit Phase 5*
