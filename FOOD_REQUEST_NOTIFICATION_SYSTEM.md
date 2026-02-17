# Food Request Notification System Documentation

## Overview

The Food Request Notification System enables users to request food items from other users, with automatic creation of corresponding notifications. The system includes proper error handling, validation, and real-time socket notifications.

## Architecture

### Database Schema

#### 1. **FoodRequest Model** (`server/models/FoodRequest.js`)
Stores all food requests with the following fields:

```javascript
{
  foodId: ObjectId (ref: Food),           // Food being requested
  requesterId: ObjectId (ref: User),      // User making the request
  ownerId: ObjectId (ref: User),          // Owner of the food
  status: String,                         // 'pending' | 'accepted' | 'rejected' | 'completed'
  message: String,                        // Optional message from requester
  createdAt: Date,                        // Request creation timestamp
  updatedAt: Date,                        // Last update timestamp
}
```

#### 2. **Notification Model** (`server/models/Notification.js`)
Creates notifications for food owners:

```javascript
{
  recipientId: ObjectId (ref: User),      // Food owner (receives notification)
  senderId: ObjectId (ref: User),         // User who requested (sends notification)
  foodId: ObjectId (ref: Food),           // Related food post
  type: String,                           // 'like' | 'comment' | 'request'
  message: String,                        // Notification message
  isRead: Boolean,                        // Read status (default: false)
  createdAt: Date,                        // When notification was created
  updatedAt: Date,                        // Last update
}
```

#### 3. **Food Model** (Enhanced)
The Food model is updated with:

```javascript
{
  status: 'available' | 'requested' | 'collected' | ...
  requestedBy: ObjectId (ref: User),      // User who requested
}
```

## Backend Implementation

### Endpoint: POST `/api/foods/:foodId/request`

**Protected Route** - Requires authentication

#### Request
```http
POST /api/foods/507f1f77bcf86cd799439011/request
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Response (Success - 201)
```json
{
  "success": true,
  "message": "Food requested successfully",
  "request": {
    "_id": "507f1f77bcf86cd799439012",
    "foodId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Homemade Pizza",
      "image": "url..."
    },
    "requesterId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "ownerId": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "status": "pending",
    "createdAt": "2024-02-14T10:00:00Z"
  },
  "notification": {
    "id": "507f1f77bcf86cd799439015",
    "message": "Someone requested your food: Homemade Pizza",
    "type": "request"
  }
}
```

#### Response (Error)
```json
{
  "success": false,
  "message": "Error message"
}
```

### Error Handling

| Status | Error Scenario |
|--------|----------------|
| 400 | Invalid food ID format |
| 404 | Food not found |
| 400 | Food is not available |
| 400 | User trying to request their own food |
| 400 | User already has pending request for this food |
| 500 | Server error |

### What Happens When Request is Created

1. **Validation**
   - Verify food exists and is available
   - Check user is not requesting their own food
   - Prevent duplicate pending requests

2. **Database Operations**
   - Create FoodRequest document with status "pending"
   - Create Notification for food owner
   - Update Food status to "requested"
   - Update Food requestedBy field

3. **Real-time Notification**
   - Emit Socket.io event `food-requested` to owner
   - Includes request ID, food title, requester name

4. **Response**
   - Return populated request with related data
   - Include notification details

## Frontend Implementation

### API Functions (`client/lib/api.ts`)

```typescript
// Request food
export const requestFood = async (foodId: string) => {
  try {
    const response = await api.post(`/foods/${foodId}/request`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to request food');
  }
};

// Get my requests
export const getMyRequests = async () => {
  const response = await api.get('/requests/my-requests');
  return response.data;
};

// Get incoming requests
export const getIncomingRequests = async () => {
  const response = await api.get('/requests/incoming-requests');
  return response.data;
};

// Cancel request
export const cancelRequest = async (requestId: string) => {
  try {
    const response = await api.delete(`/requests/${requestId}/cancel`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel request');
  }
};

// Accept request
export const acceptRequest = async (foodId: string) => {
  try {
    const response = await api.post(`/foods/${foodId}/accept`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to accept request');
  }
};

// Reject request
export const rejectRequest = async (foodId: string) => {
  try {
    const response = await api.post(`/foods/${foodId}/reject`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reject request');
  }
};
```

### FoodCard Component Implementation

```typescript
const handleRequest = async (e: React.MouseEvent) => {
  e.preventDefault();
  if (isRequesting || hasRequested) return;

  try {
    setIsRequesting(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to request food');
      return;
    }

    const response = await fetch(`/api/foods/${food._id}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || 'Failed to request food';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    if (data.success) {
      setHasRequested(true);
      
      // Trigger success callback
      setTimeout(() => {
        if (onRequestSuccess) {
          onRequestSuccess();
        }
      }, 1000);
    } else {
      throw new Error(data.message || 'Failed to request food');
    }
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to request food';
    setError(errorMessage);
    console.error('Request food error:', err);
  } finally {
    setIsRequesting(false);
  }
};
```

## Notification Flow

```
User clicks "Request" button
         ↓
Frontend validates & sends POST request
         ↓
Backend validates (food availability, user, duplicates)
         ↓
Create FoodRequest document (status: pending)
         ↓
Create Notification for owner
         ↓
Update Food status & requestedBy
         ↓
Emit Socket.io event to owner
         ↓
Return response with populated data
         ↓
Frontend updates UI & shows success
```

## Real-time Updates with Socket.io

### Server-side Event Emission
```javascript
// In foodController.requestFood()
if (req.userSockets && req.io) {
  const ownerSocketId = req.userSockets[food.ownerId.toString()];
  if (ownerSocketId) {
    req.io.to(ownerSocketId).emit('food-requested', {
      requestId: savedRequest._id,
      foodId: food._id,
      title: food.title,
      requesterName: req.user?.name || 'Someone',
      message: `${req.user?.name || 'Someone'} requested your food: ${food.title}`,
      createdAt: new Date(),
    });
  }
}
```

### Client-side Event Listening
```typescript
// In useEffect or socket setup
socket.on('food-requested', (data) => {
  console.log('New request received:', data);
  // Update UI with new notification
  // Show toast notification
  // Refresh notifications list
});
```

## Helper Functions

### Create Notification Helper
```javascript
// In notificationController.js
exports.createNotification = async ({
  recipientId,
  senderId,
  foodId,
  type,
  message,
}) => {
  // Validates required fields
  // Creates notification document
  // Populates sender and food info
  // Returns populated notification
};
```

This can be imported and used from other controllers:
```javascript
const { createNotification } = require('../controllers/notificationController');

await createNotification({
  recipientId: food.ownerId,
  senderId: requesterId,
  foodId: foodId,
  type: 'request',
  message: `Someone requested your food: ${food.title}`,
});
```

## Request Statuses

| Status | Meaning | Transitions |
|--------|---------|-------------|
| `pending` | Request created, awaiting owner response | → accepted, rejected |
| `accepted` | Owner accepted the request | → completed |
| `rejected` | Owner rejected the request | N/A |
| `completed` | Food was collected by requester | N/A |

## Use Cases

### 1. Request Food
**User Flow:**
1. User views available food listings
2. Click "Request" button on desired food
3. System creates request and notification
4. Food owner receives real-time notification
5. Requester sees confirmation

### 2. View My Requests
**API:** `GET /requests/my-requests`
- List all requests user has made
- Shows status of each request
- Can cancel pending requests

### 3. View Incoming Requests
**API:** `GET /requests/incoming-requests`
- Food owner views requests on their posts
- Shows requester details
- Can accept or reject requests

### 4. Accept/Reject Request
**API:** `POST /foods/:foodId/accept` or `POST /foods/:foodId/reject`
- Food owner accepts or rejects request
- Updates request status
- Updates food status

## Security & Validation

✅ **Authentication:** All endpoints require JWT token
✅ **Authorization:** Users can only act on their own data
✅ **Input Validation:** All inputs validated before processing
✅ **Rate Limiting:** Can be implemented to prevent spam
✅ **Duplicate Prevention:** Check for existing pending requests
✅ **Error Messages:** User-friendly without exposing internals

## Testing the System

### cURL Examples

**1. Request Food**
```bash
curl -X POST http://localhost:5000/api/foods/507f1f77bcf86cd799439011/request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**2. Get My Requests**
```bash
curl http://localhost:5000/api/requests/my-requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**3. Get Incoming Requests**
```bash
curl http://localhost:5000/api/requests/incoming-requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**4. Cancel Request**
```bash
curl -X DELETE http://localhost:5000/api/requests/507f1f77bcf86cd799439012/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Best Practices

1. **Error Handling:** Always use try-catch and provide meaningful error messages
2. **Validation:** Validate input on both frontend and backend
3. **Loading States:** Show loading indicators during API calls
4. **Optimistic Updates:** Update UI optimistically, then sync with server
5. **Real-time Updates:** Use Socket.io for instant notifications
6. **Logging:** Log important events for debugging
7. **Performance:** Populate only necessary fields to reduce data transfer

## Future Enhancements

- [ ] Add request expiration (auto-reject after X days)
- [ ] Implement request messaging/chat
- [ ] Add rating system for requests
- [ ] Email notifications for requests
- [ ] SMS notifications option
- [ ] Request filters (by status, date, user)
- [ ] Bulk actions on requests
- [ ] Request analytics/stats

## Troubleshooting

### Request fails with "Food not found"
- Verify food ID is correct
- Check food hasn't been deleted
- Ensure food is still available

### Request fails with "You cannot request your own food"
- Users cannot request their own food posts
- This is by design to prevent self-requests

### Request fails with "Already have pending request"
- User already requested this food
- Must wait for response or cancel existing request

### Real-time notification not received
- Check Socket.io connection status
- Verify user is logged in
- Clear browser cache

## Support

For issues or questions about the food request notification system, please refer to:
- Backend logs: `server/logs/`
- Frontend console: Browser DevTools → Console
- Database queries: MongoDB Compass

