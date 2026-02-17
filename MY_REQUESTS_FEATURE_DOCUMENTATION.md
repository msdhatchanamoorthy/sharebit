# My Requests Feature - Implementation Documentation

## Overview

The "My Requests" feature allows users to view all food requests they've made, track their status, and cancel pending requests if needed.

## Backend Implementation

### API Endpoint

**Route:** `GET /api/requests/my-requests`  
**Authentication:** ✅ Required (JWT Token)  
**Method:** GET  
**Response Format:** JSON

### Endpoint Details

```
GET /api/requests/my-requests
Authorization: Bearer {JWT_TOKEN}
```

### Successful Response (200)

```json
{
  "success": true,
  "count": 3,
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "foodId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Homemade Pizza",
        "image": "https://cloudinary.com/.../image.jpg",
        "description": "Fresh homemade pizza with organic ingredients",
        "category": "Italian",
        "price": 250,
        "status": "requested"
      },
      "owner": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "location": "Downtown, City Center",
        "profilePhoto": "https://cloudinary.com/.../profile.jpg",
        "rating": 4.8
      },
      "status": "pending",
      "message": "",
      "createdAt": "2024-02-14T10:30:00Z",
      "requestedDate": "February 14, 2024"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "foodId": {
        "_id": "507f1f77bcf86cd799439015",
        "title": "Biryani Serving",
        "image": "https://cloudinary.com/.../biryani.jpg",
        "description": "Delicious homemade biryani",
        "category": "Indian",
        "price": 0,
        "status": "requested"
      },
      "owner": {
        "_id": "507f1f77bcf86cd799439016",
        "name": "Ahmed Khan",
        "email": "ahmed@example.com",
        "location": "North Market, City",
        "profilePhoto": "https://cloudinary.com/.../profile2.jpg",
        "rating": 4.5
      },
      "status": "accepted",
      "message": "Please pick up by 6 PM",
      "createdAt": "2024-02-13T15:45:00Z",
      "requestedDate": "February 13, 2024"
    }
  ]
}
```

### Error Response (401 - Not Authenticated)

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Error Response (500 - Server Error)

```json
{
  "success": false,
  "message": "Failed to fetch requests"
}
```

## Error Codes

| Code | Scenario | Message |
|------|----------|---------|
| 200 | Success | Returns list of user's requests |
| 401 | Not authenticated | "Authentication required" |
| 500 | Server error | "Failed to fetch requests" |

## Data Model

### Request Document Structure

```typescript
interface FoodRequest {
  _id: ObjectId;                    // Unique request ID
  foodId: {
    _id: ObjectId;
    title: string;
    image: string;
    description: string;
    category: string;
    price: number;
    status: string;
  };
  owner: {
    _id: ObjectId;
    name: string;
    email: string;
    location: string;
    profilePhoto?: string;
    rating: number;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;                  // Optional message
  createdAt: Date;                  // ISO timestamp
  requestedDate: string;            // Formatted date (e.g., "February 14, 2024")
}
```

## Frontend Implementation

### API Function

**File:** `client/lib/api.ts`

```typescript
/**
 * Get all requests made by current user
 * @returns Promise with list of requests
 */
export const getMyRequests = async () => {
  const response = await api.get('/requests/my-requests');
  return response.data;
};
```

### Usage in Component

```typescript
import { getMyRequests } from '@/lib/api';

// Basic usage
const data = await getMyRequests();

if (data.success) {
  console.log(`Loaded ${data.count} requests`);
  console.log(data.requests);
}
```

## React Component

### MyRequests Component

**File:** `client/components/MyRequests.tsx`

#### Props

```typescript
interface MyRequestsProps {
  userId?: string;              // Optional: User ID (for future use)
  onRequestsLoad?: (requests) => void;  // Optional: Callback when requests loaded
  maxItems?: number;            // Optional: Max requests to display (default: 10)
}
```

#### Features

- ✅ Displays all user requests in a grid/list
- ✅ Shows food image, title, description
- ✅ Shows owner details (name, location, rating)
- ✅ Status badge with color coding
- ✅ Requested date
- ✅ Cancel pending requests button
- ✅ Loading states
- ✅ Error handling
- ✅ Empty state message
- ✅ Refresh button
- ✅ Responsive design

#### Status Badge Colors

| Status | Color | Icon | Label |
|--------|-------|------|-------|
| pending | Yellow | Clock | Pending |
| accepted | Green | CheckCircle | Accepted |
| rejected | Red | Ban | Rejected |
| completed | Blue | CheckCircle | Completed |

### Basic Usage

```typescript
import { MyRequests } from '@/components/MyRequests';

export default function Page() {
  return (
    <div className="p-6">
      <MyRequests 
        maxItems={20}
        onRequestsLoad={(requests) => {
          console.log('Loaded:', requests);
        }}
      />
    </div>
  );
}
```

### Advanced Usage with State Management

```typescript
import { MyRequests } from '@/components/MyRequests';
import { useState } from 'react';

export default function Page() {
  const [requestCount, setRequestCount] = useState(0);

  return (
    <div className="p-6">
      <h1>My Requests ({requestCount})</h1>
      
      <MyRequests 
        maxItems={50}
        onRequestsLoad={(requests) => {
          setRequestCount(requests.length);
        }}
      />
    </div>
  );
}
```

## Backend Controller Implementation

### getMyRequests Function

**File:** `server/controllers/requestController.js`

```javascript
exports.getMyRequests = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Fetch all requests for user
    const requests = await FoodRequest.find({ requesterId: userId })
      .populate({
        path: 'foodId',
        select: 'title image description category price status'
      })
      .populate({
        path: 'ownerId',
        select: 'name email location profilePhoto profilePic rating'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Map to response format
    return res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map(req => ({
        _id: req._id,
        foodId: {
          _id: req.foodId?._id,
          title: req.foodId?.title,
          image: req.foodId?.image,
          description: req.foodId?.description,
          category: req.foodId?.category,
          price: req.foodId?.price,
          status: req.foodId?.status,
        },
        owner: {
          _id: req.ownerId?._id,
          name: req.ownerId?.name,
          email: req.ownerId?.email,
          location: req.ownerId?.location,
          profilePhoto: req.ownerId?.profilePhoto,
          rating: req.ownerId?.rating,
        },
        status: req.status,
        message: req.message,
        createdAt: req.createdAt,
        requestedDate: new Date(req.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }))
    });
  } catch (err) {
    console.error('Get my requests error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch requests'
    });
  }
};
```

## Related Functions

### Cancel Request

**Function:** `cancelRequest(requestId)`

Cancels a pending request. Only pending requests can be cancelled.

**Endpoint:** `DELETE /api/requests/:requestId/cancel`

**Response:**
```json
{
  "success": true,
  "message": "Request cancelled successfully",
  "request": { ... updated request ... }
}
```

### Get Incoming Requests (For Food Owners)

**Function:** `getIncomingRequests()`

View requests on your own food posts.

**Endpoint:** `GET /api/requests/incoming-requests`

## Usage Example - Integration

### Page Component

```typescript
// app/requests/my-requests/page.tsx
'use client';

import { MyRequests } from '@/components/MyRequests';
import { Navbar } from '@/components/Navbar';

export default function MyRequestsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">My Requests</h1>
        
        <MyRequests 
          maxItems={50}
          onRequestsLoad={(requests) => {
            console.log(`Loaded ${requests.length} requests`);
          }}
        />
      </main>
    </div>
  );
}
```

### Navbar Integration

Add link to MyRequests page in navigation:

```typescript
<Link href="/requests/my-requests" className="...">
  📋 My Requests
</Link>
```

## Performance Optimization

### Query Optimization
- Uses `.lean()` for faster queries (read-only)
- Only selects necessary fields
- Efficient population of related data

### Caching Consideration
```typescript
// Future: Add React Query for caching
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['myRequests'],
  queryFn: getMyRequests,
  staleTime: 1000 * 60 * 5, // 5 minutes
});
```

## Error Handling

### Frontend Error Handling

```typescript
try {
  const data = await getMyRequests();
  
  if (!data.success) {
    console.error('Failed:', data.message);
    // Show error toast
  } else {
    // Process requests
  }
} catch (error) {
  console.error('Fetch error:', error);
  // Show error toast
}
```

### Backend Error Handling

All errors return:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing Checklist

- [ ] Fetch requests returns correct format
- [ ] Sorting by createdAt (newest first)
- [ ] Food details are populated correctly
- [ ] Owner details are populated
- [ ] Status badge displays correctly
- [ ] Date formatting is correct (Month Day, Year)
- [ ] Cancel button works for pending requests
- [ ] Cancel button hidden for other statuses
- [ ] Loading state shows spinner
- [ ] Error state shows message and retry button
- [ ] Empty state shown when no requests
- [ ] Refresh button fetches data again
- [ ] Responsive on mobile, tablet, desktop
- [ ] Images load or emoji shows as fallback
- [ ] Authorization check works

## Future Enhancements

- [ ] Filter by status (Pending, Accepted, etc.)
- [ ] Search by food name
- [ ] Sort by date, owner rating
- [ ] Pagination for large lists
- [ ] Export request history
- [ ] Request statistics
- [ ] Email notifications on status change
- [ ] SMS notifications
- [ ] Request messaging/chat
- [ ] Rating after completion
- [ ] Dispute resolution system

## Database Indexes

Recommended indexes for performance:

```javascript
// Create indexes for faster queries
db.foodrequests.createIndex({ requesterId: 1, createdAt: -1 });
db.foodrequests.createIndex({ ownerId: 1, createdAt: -1 });
db.foodrequests.createIndex({ status: 1 });
```

## Security Considerations

✅ **Authentication:** Requires valid JWT token  
✅ **Authorization:** Users see only their own requests  
✅ **Data Privacy:** Sensitive fields are not exposed  
✅ **Input Validation:** Request ID validated before processing  

## Deployment Notes

1. Ensure MongoDB indexes are created
2. Configure JWT secret in environment
3. Set up CORS for frontend domain
4. Enable logging for debugging
5. Set up error monitoring (e.g., Sentry)

## Support & Troubleshooting

### Issue: "Authentication required" error
**Solution:** Ensure JWT token is stored in localStorage

### Issue: Empty list when requests exist
**Solution:** Check if user ID matches requesterId in database

### Issue: Requests don't load
**Solution:** Check browser console for errors, verify API endpoint

### Issue: Images not showing
**Solution:** Check image URLs are valid, images loaded correctly to cloudinary

## File Structure

```
/server
  /controllers
    requestController.js      ← getMyRequests() function
  /models
    FoodRequest.js           ← Schema
  /routes
    requestRoutes.js         ← GET /api/requests/my-requests

/client
  /lib
    api.ts                   ← getMyRequests() function
  /components
    MyRequests.tsx           ← React component
  /app
    /requests
      /my-requests
        page.tsx             ← Page component
```

