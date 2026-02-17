# Food Request Notification System - Implementation Guide

## Quick Start

### 1. Backend Setup Complete ✅

The following files have been updated:

**Backend Files Modified:**
- `server/controllers/foodController.js` - Enhanced `requestFood` function
- `server/controllers/notificationController.js` - Added helper function

**What's Already Set Up:**
- ✅ FoodRequest model exists
- ✅ Notification model exists
- ✅ Request routes configured
- ✅ Socket.io integrated
- ✅ Authentication middleware

### 2. Frontend Setup Complete ✅

**Frontend Files Updated:**
- `client/lib/api.ts` - Added request API functions
- `client/components/FoodCard.tsx` - Enhanced request handler

## Code Examples

### Backend: Create Food Request

File: `server/controllers/foodController.js`

```javascript
// Enhanced requestFood function
exports.requestFood = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const requesterId = req.userId;

    // 1. Validate ObjectId format
    if (!foodId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid food ID format' 
      });
    }

    // 2. Check if food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ 
        success: false,
        message: 'Food not found' 
      });
    }

    // 3. Check if food is available
    if (food.status !== 'available') {
      return res.status(400).json({ 
        success: false,
        message: 'This food is no longer available' 
      });
    }

    // 4. Prevent self-request
    if (food.ownerId.toString() === requesterId) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot request your own food' 
      });
    }

    // 5. Check for duplicate pending requests
    const existingRequest = await FoodRequest.findOne({
      foodId: foodId,
      requesterId: requesterId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have a pending request for this food' 
      });
    }

    // 6. Create FoodRequest document
    const foodRequest = new FoodRequest({
      foodId: foodId,
      requesterId: requesterId,
      ownerId: food.ownerId,
      status: 'pending',
    });
    const savedRequest = await foodRequest.save();

    // 7. Create Notification for food owner
    const notification = new Notification({
      recipientId: food.ownerId,
      senderId: requesterId,
      foodId: foodId,
      type: 'request',
      message: `Someone requested your food: ${food.title}`,
      isRead: false,
    });
    const savedNotification = await notification.save();

    // 8. Update food status
    food.status = 'requested';
    food.requestedBy = requesterId;
    await food.save();

    // 9. Populate response data
    const populatedRequest = await FoodRequest.findById(savedRequest._id)
      .populate('requesterId', 'name email location profilePhoto')
      .populate('ownerId', 'name email location profilePhoto')
      .populate('foodId');

    // 10. Emit real-time Socket.io event
    if (req.userSockets && req.io) {
      const ownerSocketId = req.userSockets[food.ownerId.toString()];
      if (ownerSocketId) {
        req.io.to(ownerSocketId).emit('food-requested', {
          requestId: savedRequest._id,
          foodId: food._id,
          title: food.title,
          requesterName: req.user?.name,
          createdAt: new Date(),
        });
      }
    }

    // 11. Return success response
    res.status(201).json({
      success: true,
      message: 'Food requested successfully',
      request: populatedRequest,
      notification: {
        id: savedNotification._id,
        message: savedNotification.message,
        type: savedNotification.type,
      },
    });
  } catch (err) {
    console.error('Request food error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Error requesting food' 
    });
  }
};
```

### Helper: Create Notification

File: `server/controllers/notificationController.js`

```javascript
/**
 * Helper function to create notifications
 * Reusable across different controllers
 */
exports.createNotification = async ({
  recipientId,
  senderId,
  foodId,
  type,
  message,
}) => {
  try {
    if (!recipientId || !senderId || !foodId || !type || !message) {
      throw new Error('Missing required fields for notification');
    }

    const notification = new Notification({
      recipientId,
      senderId,
      foodId,
      type,
      message,
      isRead: false,
    });

    const savedNotification = await notification.save();
    
    const populatedNotification = await Notification.findById(savedNotification._id)
      .populate('senderId', 'name profilePhoto')
      .populate('foodId', 'title image');

    return populatedNotification;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};
```

### Frontend: API Functions

File: `client/lib/api.ts`

```typescript
/**
 * Request food item
 * Creates FoodRequest and Notification
 */
export const requestFood = async (foodId: string) => {
  try {
    const response = await api.post(`/foods/${foodId}/request`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to request food');
  }
};

/**
 * Get all requests made by current user
 */
export const getMyRequests = async () => {
  const response = await api.get('/requests/my-requests');
  return response.data;
};

/**
 * Get incoming requests on current user's food
 */
export const getIncomingRequests = async () => {
  const response = await api.get('/requests/incoming-requests');
  return response.data;
};

/**
 * Cancel a pending request
 */
export const cancelRequest = async (requestId: string) => {
  try {
    const response = await api.delete(`/requests/${requestId}/cancel`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel request');
  }
};

/**
 * Accept a food request (Owner action)
 */
export const acceptRequest = async (foodId: string) => {
  try {
    const response = await api.post(`/foods/${foodId}/accept`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to accept request');
  }
};

/**
 * Reject a food request (Owner action)
 */
export const rejectRequest = async (foodId: string) => {
  try {
    const response = await api.post(`/foods/${foodId}/reject`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reject request');
  }
};
```

### Frontend: FoodCard Component

File: `client/components/FoodCard.tsx`

```typescript
const handleRequest = async (e: React.MouseEvent) => {
  e.preventDefault();
  if (isRequesting || hasRequested) return;

  try {
    setIsRequesting(true);
    setError(null);

    // 1. Verify authentication
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to request food');
      return;
    }

    // 2. Make request
    const response = await fetch(`/api/foods/${food._id}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    
    // 3. Handle errors
    if (!response.ok) {
      const errorMessage = data.message || 'Failed to request food';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    // 4. Handle success
    if (data.success) {
      setHasRequested(true);
      
      // 5. Trigger success callback and UI refresh
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

## Database Operations Flow

### Step-by-Step Process

```
1. User clicks "Request" button
   ↓
2. Frontend sends: POST /api/foods/:foodId/request
   ↓
3. Backend receives request with authenticated userId
   ↓
4. Backend validates:
   ✓ Food exists and is available
   ✓ User is not requesting own food
   ✓ No duplicate pending request
   ↓
5. Database: Create FoodRequest document
   {
     foodId: "...",
     requesterId: "...",
     ownerId: "...",
     status: "pending",
     createdAt: Date.now()
   }
   ↓
6. Database: Create Notification document
   {
     recipientId: "..." (owner),
     senderId: "..." (requester),
     foodId: "...",
     type: "request",
     message: "Someone requested your food",
     isRead: false
   }
   ↓
7. Database: Update Food document
   {
     status: "requested",
     requestedBy: "..."
   }
   ↓
8. Real-time: Emit Socket.io event to owner
   ↓
9. Frontend receives success response with:
   - Created request data
   - Notification details
   ↓
10. Frontend updates UI:
    - Mark button as "Requested"
    - Show success message
    - Trigger refresh callback
```

## Error Handling Scenarios

### Scenario 1: Food Not Found
```json
{
  "success": false,
  "message": "Food not found",
  "status": 404
}
```
**Frontend Response:** Show error toast: "Food not found or has been removed"

### Scenario 2: Food Not Available
```json
{
  "success": false,
  "message": "This food is no longer available",
  "status": 400
}
```
**Frontend Response:** Show error toast: "Sorry, this food is no longer available"

### Scenario 3: Duplicate Pending Request
```json
{
  "success": false,
  "message": "You already have a pending request for this food",
  "status": 400
}
```
**Frontend Response:** Show warning: "You already requested this food"

### Scenario 4: Self-Request
```json
{
  "success": false,
  "message": "You cannot request your own food",
  "status": 400
}
```
**Frontend Response:** Show error: "You cannot request your own food"

## Testing Checklist

- [ ] User can request available food
- [ ] FoodRequest document is created in DB
- [ ] Notification is created in DB
- [ ] Food status changes to "requested"
- [ ] Food owner receives real-time notification
- [ ] Cannot request own food
- [ ] Cannot create duplicate request
- [ ] Cannot request unavailable food
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] Success callback is triggered
- [ ] Button state updates correctly

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/foods/:foodId/request` | Create food request | ✓ |
| GET | `/api/requests/my-requests` | Get my requests | ✓ |
| GET | `/api/requests/incoming-requests` | Get incoming requests | ✓ |
| DELETE | `/api/requests/:requestId/cancel` | Cancel request | ✓ |
| POST | `/api/foods/:foodId/accept` | Accept request | ✓ |
| POST | `/api/foods/:foodId/reject` | Reject request | ✓ |

## Performance Considerations

1. **Database Indexes:** Ensure indexing on:
   - FoodRequest.foodId
   - FoodRequest.requesterId
   - FoodRequest.ownerId
   - Notification.recipientId
   - Food.status

2. **Query Optimization:** Use `.populate()` strategically
3. **Caching:** Cache user's notification count
4. **Socket.io:** Only emit to specific users, not broadcast

## Security Best Practices

✅ **Always validate:**
- User authentication (JWT)
- User authorization (owner vs requester)
- Input data (MongoDB injection prevention)
- Food existence and availability

✅ **Never expose:**
- Other users' private data
- Internal error messages to frontend
- Database structure details

✅ **Rate limiting recommendations:**
- Max requests per user per hour
- Max requests per food per day
- Implement exponential backoff

## Common Issues & Solutions

### Issue: Notification not showing to owner
**Solution:** 
- Check if owner is logged in and connected via Socket.io
- Verify Socket.io connection in browser console
- Check userSockets mapping on server

### Issue: Duplicate requests being created
**Solution:** 
- Query for existing pending requests before creating
- Add unique constraint on foodId + requesterId + status in DB

### Issue: Food status not updating
**Solution:** 
- Ensure food.save() is called after updating
- Check for transaction failures
- Validate food permissions

## Next Steps

1. **Testing:** Test all scenarios thoroughly
2. **Monitoring:** Set up logging and monitoring
3. **Analytics:** Track request metrics
4. **UI/UX:** Improve notification display
5. **Notifications:** Add email/SMS notifications
6. **History:** Create request history view

## Support & Documentation

For more details, see: `FOOD_REQUEST_NOTIFICATION_SYSTEM.md`

