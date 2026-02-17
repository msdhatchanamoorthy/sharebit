# Food Request Notification System - Quick Reference

## System Overview

The food request notification system allows users to request food items and automatically notifies food owners. It includes:
- ✅ Database persistence (FoodRequest & Notification models)
- ✅ Real-time Socket.io notifications
- ✅ Complete error handling
- ✅ Authorization checks
- ✅ Duplicate prevention
- ✅ Clean JSON API responses

## Database Models

### FoodRequest
```
Fields: foodId, requesterId, ownerId, status, message, createdAt, updatedAt
Status: pending → accepted/rejected/completed
```

### Notification
```
Fields: recipientId, senderId, foodId, type, message, isRead, createdAt
Type: 'request' (also: 'like', 'comment')
```

## API Reference

### 1. Create Food Request
```
POST /api/foods/{foodId}/request
Authorization: Bearer {token}

Response (201):
{
  "success": true,
  "request": { ... FoodRequest data ... },
  "notification": { ... notification data ... }
}
```

### 2. Get My Requests
```
GET /api/requests/my-requests
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "count": 5,
  "requests": [ ... ]
}
```

### 3. Get Incoming Requests
```
GET /api/requests/incoming-requests
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "count": 3,
  "requests": [ ... ]
}
```

### 4. Cancel Request
```
DELETE /api/requests/{requestId}/cancel
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Request cancelled successfully"
}
```

### 5. Accept Request
```
POST /api/foods/{foodId}/accept
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "food": { ... }
}
```

### 6. Reject Request
```
POST /api/foods/{foodId}/reject
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "food": { ... }
}
```

## Frontend API Functions

```typescript
// From client/lib/api.ts

requestFood(foodId)                    // POST - Request food
getMyRequests()                         // GET - My requests
getIncomingRequests()                   // GET - Incoming requests
cancelRequest(requestId)                // DELETE - Cancel request
acceptRequest(foodId)                   // POST - Accept request
rejectRequest(foodId)                   // POST - Reject request
```

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Invalid food ID | Check food ID format |
| 404 | Food not found | Food may be deleted |
| 400 | Food not available | Food status is not 'available' |
| 400 | Self-request not allowed | Cannot request own food |
| 400 | Duplicate request | Cancel existing request first |
| 401 | Not authenticated | Login required |
| 403 | Not authorized | Permission denied |
| 500 | Server error | Server-side issue |

## Files Modified

### Backend
```
server/controllers/foodController.js
  - Enhanced requestFood() function
  - Added validation and notification creation
  
server/controllers/notificationController.js
  - Added createNotification() helper function
```

### Frontend
```
client/lib/api.ts
  - Added requestFood(), getMyRequests(), etc.
  
client/components/FoodCard.tsx
  - Enhanced handleRequest() function
  - Added proper error handling
```

## Request State Flow

```
User Action          Database Change      Notification        UI Update
────────────────────────────────────────────────────────────────────────
Click Request   →  Create FoodRequest  →  Send to Owner  →  Show Success
                   Create Notification
                   Update Food status

Accept Request  →  Update FoodRequest  →  Send to Requester  →  Refresh
                   Update Food status

Reject Request  →  Update FoodRequest  →  Send to Requester  →  Refresh

Cancel Request  →  Update FoodRequest  →  No notification  →  Update UI
```

## Socket.io Events

### Server → Client
```javascript
socket.on('food-requested', {
  requestId,
  foodId,
  title,
  requesterName,
  message,
  createdAt
})
```

### Client Setup
```javascript
socket.on('connect', () => {
  socket.emit('user-login', userId);
});

socket.on('food-requested', (data) => {
  // Handle notification
  // Update UI
  // Show toast
});
```

## Success Response Format

```json
{
  "success": true,
  "message": "Food requested successfully",
  "request": {
    "_id": "507f1f77bcf86cd799439012",
    "foodId": { "_id": "...", "title": "..." },
    "requesterId": { "_id": "...", "name": "..." },
    "ownerId": { "_id": "...", "name": "..." },
    "status": "pending",
    "createdAt": "2024-02-14T10:00:00Z"
  },
  "notification": {
    "id": "507f1f77bcf86cd799439015",
    "message": "Someone requested your food: ...",
    "type": "request"
  }
}
```

## Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing Quick Commands

### Using Fetch
```javascript
// Request food
fetch('http://localhost:5000/api/foods/107f1f77bcf86cd799439011/request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(r => r.json())
.then(console.log);

// Get my requests
fetch('http://localhost:5000/api/requests/my-requests', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(console.log);
```

### Using cURL
```bash
# Request food
curl -X POST http://localhost:5000/api/foods/507f1f77bcf86cd799439011/request \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get requests
curl http://localhost:5000/api/requests/my-requests \
  -H "Authorization: Bearer YOUR_TOKEN"

# Accept request
curl -X POST http://localhost:5000/api/foods/507f1f77bcf86cd799439011/accept \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Validation Rules

✅ **Frontend:**
- User must be logged in
- Token must exist in localStorage
- Food ID must be valid format

✅ **Backend:**
- Food must exist
- Food must be available status
- User cannot request own food
- No duplicate pending request
- Requester must be authenticated

## Common Workflows

### Workflow 1: User Requests Food
```
1. User views food listing
2. Clicks "Request" button
3. Frontend validates authentication
4. POST /api/foods/{foodId}/request
5. Backend creates FoodRequest + Notification + Updates Food
6. Socket.io emits to owner
7. Frontend shows success
8. Button changes to "Requested"
```

### Workflow 2: Owner Views Requests
```
1. Owner opens "Incoming Requests"
2. GET /api/requests/incoming-requests
3. Display list of requests
4. Owner clicks Accept/Reject
5. POST /api/foods/{foodId}/accept
6. Backend updates FoodRequest status
7. Food status updated
8. Requester notified
```

### Workflow 3: User Cancels Request
```
1. User views "My Requests"
2. Finds pending request
3. Clicks "Cancel" button
4. DELETE /api/requests/{requestId}/cancel
5. Backend updates FoodRequest status to rejected
6. Food status reverts to available
7. UI updates
```

## Performance Tips

- Use pagination for listing requests (limit, skip)
- Cache user's notification count
- Implement request debouncing on button
- Use selective population in queries
- Index frequently queried fields

## Debugging

### Check Backend
```bash
# Check request creation
db.foodrequests.findOne({ foodId: ObjectId("...") })

# Check notification
db.notifications.findOne({ recipientId: ObjectId("...") })

# Check food status
db.foods.findOne({ _id: ObjectId("...") })

# Check logs
tail -f server/logs/app.log
```

### Check Frontend
```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Check Socket.io connection
socket.emit('test');
```

## Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Database connection verified
- [ ] MongoDB indexes created
- [ ] Socket.io properly configured
- [ ] CORS settings correct
- [ ] JWT secret configured
- [ ] Error logging enabled
- [ ] Rate limiting implemented
- [ ] Tests passing
- [ ] API documentation updated

## Additional Resources

- Full Documentation: `FOOD_REQUEST_NOTIFICATION_SYSTEM.md`
- Implementation Guide: `FOOD_REQUEST_IMPLEMENTATION_GUIDE.md`
- Models: `server/models/FoodRequest.js`, `Notification.js`
- Controllers: `server/controllers/foodController.js`
- Frontend API: `client/lib/api.ts`

## Support

For questions or issues:
1. Check the full documentation
2. Review error messages
3. Check browser console
4. Check server logs
5. Verify database state

---
**Last Updated:** 2024-02-14
**Version:** 1.0
**Status:** Production Ready ✅

